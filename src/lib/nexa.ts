import type { Company } from "./types";
import { opportunityOf, scoreCompany } from "./scoring";

export const NEXA_KEY = "prospecta.nexa.baseurl";
export const NEXA_DEFAULT = "https://nexa-xi-puce.vercel.app/painel/novo";

/** Caminhos válidos conhecidos no gerador Nexa. */
export const NEXA_PATHS = [
  { value: "https://nexa-xi-puce.vercel.app/painel/novo", label: "Criar novo mini-site" },
  { value: "https://nexa-xi-puce.vercel.app/painel", label: "Painel" },
  { value: "https://nexa-xi-puce.vercel.app/painel/clientes", label: "Clientes" },
  { value: "https://nexa-xi-puce.vercel.app/painel/modelos", label: "Modelos" },
];

export function getNexaBase() {
  if (typeof localStorage === "undefined") return NEXA_DEFAULT;
  const saved = localStorage.getItem(NEXA_KEY);
  // "/criar" não existe no Nexa (404) — corrige valores antigos salvos no navegador.
  // "/criar" não existe (404) e "/painel" abre só o painel — força a tela de criação.
  if (!saved || /\/criar\/?$/.test(saved) || /\/painel\/?$/.test(saved)) return NEXA_DEFAULT;
  return saved;
}

/** Payload enviado ao gerador de mini sites (Nexa). */
export function nexaPayload(company: Company, seller: string) {
  const { score, reasons } = scoreCompany(company);
  return {
    origem: "prospecta-crm",
    vendedor: seller,
    empresa: {
      id: company.id,
      nome: company.name,
      razao_social: company.legalName ?? "",
      cnpj: company.cnpj ?? "",
      responsavel: company.ownerName ?? "",
      cargo: company.ownerRole ?? "",
      telefone: company.phone ?? "",
      whatsapp: company.whatsapp ?? "",
      email: company.email ?? "",
      endereco: company.address,
      bairro: company.district,
      cidade: company.city,
      estado: company.state,
      cep: company.zip,
      segmento: company.segment,
      site_atual: company.site.url ?? "",
      instagram: company.instagram ?? "",
      facebook: company.facebook ?? "",
      google_maps: company.mapsUrl ?? "",
      lat: company.lat,
      lng: company.lng,
      avaliacao: company.rating ?? null,
      avaliacoes: company.reviews ?? 0,
    },
    marca: {
      cor_primaria: company.brandColor,
      iniciais: company.logoText,
      logo_svg: logoSvg(company),
    },
    prospeccao: {
      score,
      oportunidade: opportunityOf(company),
      motivos: reasons,
      status: company.status,
    },
  };
}

function b64(str: string) {
  if (typeof window === "undefined") return "";
  return window.btoa(unescape(encodeURIComponent(str)));
}

export function nexaUrl(company: Company, seller: string) {
  const payload = nexaPayload(company, seller);
  const base = getNexaBase();
  const url = new URL(base);
  url.searchParams.set("empresa", company.name);
  url.searchParams.set("nome", company.name);
  if (company.ownerName) url.searchParams.set("responsavel", company.ownerName);
  url.searchParams.set("segmento", company.segment);
  url.searchParams.set("cidade", company.city);
  url.searchParams.set("estado", company.state);
  url.searchParams.set("bairro", company.district);
  url.searchParams.set("endereco", company.address);
  url.searchParams.set("cep", company.zip);
  if (company.phone) url.searchParams.set("telefone", company.phone);
  if (company.whatsapp) url.searchParams.set("whatsapp", company.whatsapp);
  if (company.email) url.searchParams.set("email", company.email);
  if (company.instagram) url.searchParams.set("instagram", company.instagram);
  if (company.facebook) url.searchParams.set("facebook", company.facebook);
  if (company.mapsUrl) url.searchParams.set("maps", company.mapsUrl);
  url.searchParams.set("cor", company.brandColor);
  url.searchParams.set("iniciais", company.logoText);
  url.searchParams.set("template", "mini-site");
  url.searchParams.set("logo", logoDataUrl(company));
  url.searchParams.set("slug", slugify(company.name));
  url.searchParams.set("data", b64(JSON.stringify(payload)));
  return url.toString();
}

/** Logo SVG gerada com a cor e iniciais da empresa (data URL, pronto para download). */
export function logoSvg(company: Company) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${company.brandColor}"/><stop offset="100%" stop-color="${company.brandColor}bb"/></linearGradient></defs><rect width="512" height="512" rx="96" fill="url(#g)"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Space Grotesk, Arial, sans-serif" font-size="200" font-weight="700" fill="#ffffff">${company.logoText}</text></svg>`;
}

export function logoDataUrl(company: Company) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg(company))}`;
}

export function download(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Baixa as logos (SVG + PNG) de várias empresas num único .zip. */
export async function downloadLogosZip(companies: Company[], filename = "logos-empresas.zip") {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const c of companies) {
    const slug = slugify(c.name);
    zip.file(`${slug}/${slug}-logo.svg`, logoSvg(c));
    zip.file(`${slug}/${slug}-dados.json`, JSON.stringify(nexaPayload(c, "-"), null, 2));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Converte a logo SVG em PNG (512px) e baixa. */
export async function downloadLogoPng(company: Company) {
  const img = new Image();
  img.src = logoDataUrl(company);
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  canvas.getContext("2d")?.drawImage(img, 0, 0, 512, 512);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `${slugify(company.name)}-logo.png`;
  a.click();
}
