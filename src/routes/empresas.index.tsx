import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, Map as MapIcon, Globe, Eye } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FilterBar, EMPTY_FILTERS, applyFilters, type Filters } from "@/components/FilterBar";
import { ScoreBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { scoreCompany } from "@/lib/scoring";
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

type Sort = "score_desc" | "score_asc" | "cidade" | "segmento" | "recentes" | "nunca_contatados";

function EmpresasPage() {
  const { companies, logContact } = useStore();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<Sort>("score_desc");

  const rows = useMemo(() => {
    const list = applyFilters(companies, filters);
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
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
            <option value="score_desc">Maior score</option>
            <option value="score_asc">Menor score</option>
            <option value="cidade">Cidade</option>
            <option value="segmento">Segmento</option>
            <option value="recentes">Mais recentes</option>
            <option value="nunca_contatados">Nunca contatados</option>
          </select>
        </div>

        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Empresa</th>
                <th className="p-3">Segmento</th>
                <th className="p-3">Cidade</th>
                <th className="p-3">Site</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Último contato</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
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
        </div>
      </div>
    </AppShell>
  );
}
