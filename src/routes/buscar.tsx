import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, RefreshCw, MessageCircle, Building2, Star } from "lucide-react";
import {
  buscarEmpresasReais,
  listarEmpresasReais,
  atualizarEmpresaReal,
  enriquecerCnpj,
} from "@/lib/real-companies.functions";
import { SEGMENTS, ALL_CITIES } from "@/lib/mock-data";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Buscar empresas reais | Prospecta" },
      {
        name: "description",
        content:
          "Busque empresas reais no Google Places por nicho e cidade, analise a presença digital e salve na sua base de prospecção.",
      },
      { property: "og:title", content: "Buscar empresas reais | Prospecta" },
      {
        property: "og:description",
        content: "Empresas reais do Google Places com análise de site e dados da Receita Federal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuscarPage,
});

type Row = {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  reviews: number | null;
  maps_url: string | null;
  segment: string | null;
  status: string | null;
  score: number | null;
  cnpj: string | null;
  legal_name: string | null;
  last_contact_at: string | null;
};

function BuscarPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [segmento, setSegmento] = useState(SEGMENTS[0] ?? "Restaurantes");
  const [cidade, setCidade] = useState("Porto Alegre");
  const [limite, setLimite] = useState(20);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [filtro, setFiltro] = useState("");

  const buscar = useServerFn(buscarEmpresasReais);
  const listar = useServerFn(listarEmpresasReais);
  const atualizar = useServerFn(atualizarEmpresaReal);
  const cnpjFn = useServerFn(enriquecerCnpj);

  const uf = useMemo(() => ALL_CITIES.find((c) => c.city === cidade)?.state ?? "RS", [cidade]);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  async function carregar() {
    try {
      const data = await listar({ data: { limite: 200 } });
      setRows(data as Row[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar base");
    }
  }

  useEffect(() => {
    if (signedIn) void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  async function rodarBusca() {
    setLoading(true);
    try {
      const res = await buscar({ data: { segmento, cidade, uf, limite, analisarSites: true } });
      toast.success(`${res.salvas} empresas reais salvas na sua base`);
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na busca");
    } finally {
      setLoading(false);
    }
  }

  const visiveis = rows.filter((r) =>
    filtro ? `${r.name} ${r.city ?? ""} ${r.segment ?? ""}`.toLowerCase().includes(filtro.toLowerCase()) : true,
  );

  if (signedIn === false) {
    return (
      <AppShell title="Buscar empresas reais" subtitle="Entre para acessar a base real">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Para buscar e salvar empresas reais você precisa entrar na sua conta.
          </p>
          <Button className="mt-4" asChild>
            <a href="/auth">Entrar / criar conta</a>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Buscar empresas reais"
      subtitle="Google Places + análise de site + Receita Federal"
      actions={
        <Button variant="outline" size="sm" onClick={() => void carregar()}>
          <RefreshCw className="size-4" /> Atualizar
        </Button>
      }
    >
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
        <label className="text-xs text-muted-foreground">
          Nicho
          <select
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            {SEGMENTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          Cidade
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm text-foreground"
          >
            {ALL_CITIES.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} / {c.state}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          Quantidade
          <Input
            type="number"
            min={1}
            max={60}
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className="mt-1"
          />
        </label>
        <div className="flex items-end">
          <Button className="w-full" disabled={loading} onClick={() => void rodarBusca()}>
            <Search className="size-4" /> {loading ? "Buscando..." : "Buscar empresas reais"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Input
          placeholder="Filtrar base salva..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-xs"
        />
        <span className="text-xs text-muted-foreground">{visiveis.length} empresas reais salvas</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Empresa</th>
              <th className="px-3 py-2">Contato</th>
              <th className="px-3 py-2">Site</th>
              <th className="px-3 py-2">Avaliação</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-3 py-2">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.segment} · {r.city}/{r.state}
                  </div>
                  {r.legal_name ? (
                    <div className="text-xs text-muted-foreground">
                      {r.legal_name} · {r.cnpj}
                    </div>
                  ) : null}
                  <div className="text-xs text-muted-foreground">{r.address}</div>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.phone ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {r.website ? (
                    <a href={r.website} target="_blank" rel="noreferrer" className="underline">
                      site
                    </a>
                  ) : (
                    <span className="text-destructive">sem site</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3" /> {r.rating ?? "—"} ({r.reviews ?? 0})
                  </span>
                </td>
                <td className="px-3 py-2 text-xs font-semibold text-foreground">{r.score ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {r.whatsapp ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(`https://wa.me/${r.whatsapp}`, "_blank");
                          void atualizar({ data: { id: r.id, registrarContato: true, canal: "whatsapp" } }).then(
                            carregar,
                          );
                        }}
                      >
                        <MessageCircle className="size-4" /> WhatsApp
                      </Button>
                    ) : null}
                    {r.maps_url ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={r.maps_url} target="_blank" rel="noreferrer">
                          Maps
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const cnpj = window.prompt(`CNPJ da ${r.name} (só números):`);
                        if (!cnpj) return;
                        void cnpjFn({ data: { id: r.id, cnpj } })
                          .then(() => {
                            toast.success("Dados da Receita Federal adicionados");
                            return carregar();
                          })
                          .catch((e: unknown) =>
                            toast.error(e instanceof Error ? e.message : "CNPJ não encontrado"),
                          );
                      }}
                    >
                      <Building2 className="size-4" /> CNPJ
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {visiveis.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma empresa real salva ainda. Faça uma busca acima.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
