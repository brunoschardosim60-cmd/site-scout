import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, Map as MapIcon, Globe, Eye, Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FilterBar, EMPTY_FILTERS, applyFilters, type Filters } from "@/components/FilterBar";
import { ScoreBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { CompanyLogoCell } from "@/components/CompanyLogo";
import { downloadLogosZip } from "@/lib/nexa";
import { useStore } from "@/lib/store";
import { completeness, scoreCompany } from "@/lib/scoring";
import { toast } from "sonner";

export const Route = createFileRoute("/empresas/")({
  head: () => ({
    meta: [
      { title: "Empresas — Prospecta" },
      {
        name: "description",
        content: "Lista completa de empresas com score de oportunidade, site, WhatsApp e status.",
      },
      { property: "og:title", content: "Empresas — Prospecta" },
      { property: "og:description", content: "Filtre, ordene e prospecte empresas em segundos." },
    ],
  }),
  component: EmpresasPage,
});

type Sort =
  | "simples_completa"
  | "completa_simples"
  | "avaliacao_asc"
  | "avaliacao_desc"
  | "score_desc"
  | "score_asc"
  | "cidade"
  | "segmento"
  | "recentes"
  | "nunca_contatados";

function EmpresasPage() {
  const { companies, logContact } = useStore();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<Sort>("simples_completa");
  const [limit, setLimit] = useState(200);
  const [zipping, setZipping] = useState(false);

  const rows = useMemo(() => {
    const list = applyFilters(companies, filters);
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "simples_completa":
          return completeness(a) - completeness(b) || (a.rating ?? 0) - (b.rating ?? 0);
        case "completa_simples":
          return completeness(b) - completeness(a) || (b.rating ?? 0) - (a.rating ?? 0);
        case "avaliacao_asc":
          return (a.rating ?? 0) - (b.rating ?? 0) || (a.reviews ?? 0) - (b.reviews ?? 0);
        case "avaliacao_desc":
          return (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0);
        case "score_asc":
          return scoreCompany(a).score - scoreCompany(b).score;
        case "cidade":
          return a.city.localeCompare(b.city);
        case "segmento":
          return a.segment.localeCompare(b.segment);
        case "recentes":
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "nunca_contatados":
          return Number(a.status !== "nao_contatado") - Number(b.status !== "nao_contatado");
        default:
          return scoreCompany(b).score - scoreCompany(a).score;
      }
    });
    return sorted;
  }, [companies, filters, sort]);

  const visible = useMemo(() => rows.slice(0, limit), [rows, limit]);

  return (
    <AppShell title="Empresas" subtitle={`${rows.length} resultados`}>
      <div className="space-y-4">
        <FilterBar filters={filters} onChange={setFilters} />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ordenar por</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="simples_completa">Da mais simples à mais completa</option>
            <option value="completa_simples">Da mais completa à mais simples</option>
            <option value="avaliacao_asc">Menor avaliação → maior</option>
            <option value="avaliacao_desc">Maior avaliação → menor</option>
            <option value="score_desc">Maior score</option>
            <option value="score_asc">Menor score</option>
            <option value="cidade">Cidade</option>
            <option value="segmento">Segmento</option>
            <option value="recentes">Mais recentes</option>
            <option value="nunca_contatados">Nunca contatados</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={zipping}
            onClick={async () => {
              const batch = rows.slice(0, 500);
              setZipping(true);
              toast.info(`Gerando .zip com ${batch.length} logos…`);
              try {
                await downloadLogosZip(batch, "logos-empresas.zip");
                toast.success("Logos baixadas");
              } catch {
                toast.error("Não foi possível gerar o .zip");
              } finally {
                setZipping(false);
              }
            }}
          >
            <Download className="size-4" /> {zipping ? "Gerando…" : "Baixar logos (até 500)"}
          </Button>
        </div>

        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Logo</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Segmento</th>
                <th className="p-3">Cidade</th>
                <th className="p-3">Site</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Avaliação</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Último contato</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="p-3">
                    <CompanyLogoCell company={c} />
                  </td>
                  <td className="p-3">
                    <Link to="/empresas/$id" params={{ id: c.id }} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.district}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">{c.segment}</td>
                  <td className="p-3 text-muted-foreground">
                    {c.city}/{c.state}
                  </td>
                  <td className="p-3">
                    {c.site.hasSite ? (
                      c.site.looksUpdated ? (
                        <span className="text-xs text-muted-foreground">Ok</span>
                      ) : (
                        <span className="text-xs text-score-mid">Desatualizado</span>
                      )
                    ) : (
                      <span className="text-xs text-score-high">Sem site</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{c.whatsapp ? "Sim" : "—"}</td>
                  <td className="p-3 text-xs tabular-nums text-muted-foreground">
                    {c.rating ? `${c.rating.toFixed(1)} (${c.reviews ?? 0})` : "—"}
                  </td>
                  <td className="p-3">
                    <ScoreBadge company={c} />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {c.lastContactAt ? new Date(c.lastContactAt).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="icon" variant="ghost" title="Visualizar">
                        <Link to="/empresas/$id" params={{ id: c.id }}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      {c.whatsapp && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="WhatsApp"
                          onClick={() => {
                            window.open(
                              `https://wa.me/${c.whatsapp!.replace(/\D/g, "")}`,
                              "_blank",
                              "noopener",
                            );
                            logContact(c.id, { channel: "whatsapp", status: "primeiro_contato" });
                            toast.success("Contato registrado");
                          }}
                        >
                          <MessageCircle className="size-4" />
                        </Button>
                      )}
                      {c.mapsUrl && (
                        <Button asChild size="icon" variant="ghost" title="Abrir mapa">
                          <a href={c.mapsUrl} target="_blank" rel="noreferrer">
                            <MapIcon className="size-4" />
                          </a>
                        </Button>
                      )}
                      {c.site.url && (
                        <Button asChild size="icon" variant="ghost" title="Abrir site">
                          <a href={c.site.url} target="_blank" rel="noreferrer">
                            <Globe className="size-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma empresa com esses filtros.</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 p-4">
            <span className="text-xs text-muted-foreground">
              Mostrando {visible.length} de {rows.length} · {companies.length.toLocaleString("pt-BR")} carregadas
              (carregando 100 em 100)
            </span>
            {visible.length < rows.length && (
              <Button variant="secondary" size="sm" onClick={() => setLimit((l) => l + 200)}>
                Carregar mais 200
              </Button>
            )}
            {companies.length >= cap && cap < totalAvailable && (
              <Button variant="outline" size="sm" onClick={loadMoreCompanies}>
                Carregar mais empresas na memória
              </Button>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
