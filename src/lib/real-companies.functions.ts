import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";
import { auditSite, scoreFromAudit, type SiteAudit } from "./site-audit.server";

const buscaSchema = z.object({
  segmento: z.string().min(2),
  cidade: z.string().min(2),
  uf: z.string().min(2).max(2),
  limite: z.number().min(1).max(60).default(20),
  analisarSites: z.boolean().default(true),
});

type PlaceResult = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  location?: { latitude?: number; longitude?: number };
  addressComponents?: { longText?: string; shortText?: string; types?: string[] }[];
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.location",
  "nextPageToken",
].join(",");

function component(p: PlaceResult, type: string) {
  return p.addressComponents?.find((c) => c.types?.includes(type))?.longText ?? null;
}

function onlyDigits(v: string) {
  return v.replace(/\D+/g, "");
}

/** Busca empresas reais no Google Places e salva na base do usuário. */
export const buscarEmpresasReais = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => buscaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "GOOGLE_PLACES_API_KEY não configurada. Adicione a chave do Google Places para buscar empresas reais.",
      );
    }

    const results: PlaceResult[] = [];
    let pageToken: string | undefined;

    while (results.length < data.limite) {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify({
          textQuery: `${data.segmento} em ${data.cidade}, ${data.uf}, Brasil`,
          languageCode: "pt-BR",
          regionCode: "BR",
          pageSize: Math.min(20, data.limite - results.length),
          ...(pageToken ? { pageToken } : {}),
        }),
      });

      const body = (await res.json()) as {
        places?: PlaceResult[];
        nextPageToken?: string;
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(`Google Places [${res.status}]: ${body.error?.message ?? "falha na busca"}`);
      }
      results.push(...(body.places ?? []));
      pageToken = body.nextPageToken;
      if (!pageToken) break;
    }

    const slice = results.slice(0, data.limite);

    const audits = new Map<string, SiteAudit>();
    if (data.analisarSites) {
      await Promise.all(
        slice.map(async (p) => {
          audits.set(p.id, await auditSite(p.websiteUri));
        }),
      );
    }

    const rows = slice.map((p) => {
      const audit = audits.get(p.id) ?? { hasSite: Boolean(p.websiteUri), url: p.websiteUri };
      const phone = p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? null;
      const intl = p.internationalPhoneNumber ? onlyDigits(p.internationalPhoneNumber) : "";
      return {
        user_id: context.userId,
        place_id: p.id,
        name: p.displayName?.text ?? "Sem nome",
        phone,
        whatsapp: intl.length >= 12 ? intl : null,
        website: p.websiteUri ?? null,
        address: p.formattedAddress ?? null,
        district: component(p, "sublocality_level_1") ?? component(p, "sublocality"),
        city: component(p, "administrative_area_level_2") ?? data.cidade,
        state: p.addressComponents?.find((c) => c.types?.includes("administrative_area_level_1"))?.shortText ?? data.uf,
        zip: component(p, "postal_code"),
        lat: p.location?.latitude ?? null,
        lng: p.location?.longitude ?? null,
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? null,
        maps_url: p.googleMapsUri ?? null,
        segment: data.segmento,
        site_audit: JSON.parse(JSON.stringify(audit)) as Json,
        score: scoreFromAudit(audit),
      };
    });

    if (rows.length === 0) return { salvas: 0, encontradas: 0 };

    const { error } = await context.supabase
      .from("empresas")
      .upsert(rows, { onConflict: "user_id,place_id", ignoreDuplicates: false });
    if (error) throw new Error(error.message);

    return { salvas: rows.length, encontradas: results.length };
  });

/** Lista as empresas reais salvas do usuário. */
export const listarEmpresasReais = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        cidade: z.string().optional(),
        segmento: z.string().optional(),
        busca: z.string().optional(),
        limite: z.number().min(1).max(500).default(200),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("empresas")
      .select(
        "id, name, phone, whatsapp, website, address, district, city, state, rating, reviews, maps_url, segment, status, score, cnpj, legal_name, site_audit, last_contact_at",
      )
      .order("score", { ascending: false })
      .limit(data.limite);

    if (data.cidade) q = q.eq("city", data.cidade);
    if (data.segmento) q = q.eq("segment", data.segmento);
    if (data.busca) q = q.ilike("name", `%${data.busca}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Registra contato / muda status de uma empresa real. */
export const atualizarEmpresaReal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.string().optional(),
        registrarContato: z.boolean().default(false),
        canal: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: { status?: string; last_contact_at?: string } = {};
    if (data.status) patch.status = data.status;
    if (data.registrarContato) patch.last_contact_at = new Date().toISOString();

    if (Object.keys(patch).length > 0) {
      const { error } = await context.supabase.from("empresas").update(patch).eq("id", data.id);
      if (error) throw new Error(error.message);
    }

    if (data.registrarContato) {
      await context.supabase.from("atividades").insert({
        user_id: context.userId,
        empresa_id: data.id,
        type: "contato",
        channel: data.canal ?? "whatsapp",
        title: "Contato registrado",
      });
    }
    return { ok: true };
  });

/** Enriquece uma empresa com os dados oficiais da Receita Federal a partir do CNPJ. */
export const enriquecerCnpj = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), cnpj: z.string().min(11) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const cnpj = onlyDigits(data.cnpj);
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(`Receita/BrasilAPI [${res.status}]: ${String(body["message"] ?? "CNPJ não encontrado")}`);
    }

    const patch = {
      cnpj,
      legal_name: (body["razao_social"] as string) ?? null,
      situacao_cadastral: (body["descricao_situacao_cadastral"] as string) ?? null,
      email: (body["email"] as string) ?? null,
      zip: (body["cep"] as string) ?? null,
    };
    const { error } = await context.supabase.from("empresas").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return patch;
  });
