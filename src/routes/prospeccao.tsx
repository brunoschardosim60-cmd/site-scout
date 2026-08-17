import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { ScoreBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { scoreCompany } from "@/lib/scoring";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/types";

export const Route = createFileRoute("/prospeccao")({
  head: () => ({
    meta: [
      { title: "Prospecção — Prospecta" },
      {
        name: "description",
        content: "Funil de prospecção por status e ranking automático das melhores oportunidades.",
      },
      { property: "og:title", content: "Prospecção — Prospecta" },
      { property: "og:description", content: "Saiba quem abordar primeiro e acompanhe o funil." },
    ],
  }),
  component: ProspeccaoPage,
});

function ProspeccaoPage() {
  const { companies } = useStore();
  const ranked = useMemo(
    () =>
      companies
        .map((c) => ({ c, ...scoreCompany(c) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 12),
    [companies],
  );

  return (
    <AppShell title="Prospecção" subtitle="Funil e priorização inteligente">
      <div className="surface-card p-4">
        <h2 className="text-sm font-semibold">⭐ Melhores oportunidades</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ranked.map(({ c, reasons }) => (
            <div key={c.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <ScoreBadge company={c} />
                <Link to="/empresas/$id" params={{ id: c.id }} className="truncate font-medium hover:underline">
                  {c.name}
                </Link>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.segment} · {c.city}
              </p>
              <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                {reasons.slice(0, 3).map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
              <Button asChild size="sm" variant="brand" className="mt-3 w-full">
                <Link to="/empresas/$id" params={{ id: c.id }}>
                  Abrir cadastro
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
        {STATUS_ORDER.map((s) => {
          const list = companies.filter((c) => c.status === s);
          return (
            <div key={s} className="surface-card p-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={s} />
                <span className="text-xs tabular-nums text-muted-foreground">{list.length}</span>
              </div>
              <ul className="mt-2 space-y-1">
                {list.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/empresas/$id"
                      params={{ id: c.id }}
                      className="block truncate rounded px-2 py-1 text-xs hover:bg-accent"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
                {list.length === 0 && (
                  <li className="px-2 py-1 text-xs text-muted-foreground">Sem empresas em {STATUS_LABELS[s]}</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
