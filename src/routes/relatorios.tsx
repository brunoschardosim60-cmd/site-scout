import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { scoreCompany } from "@/lib/scoring";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/types";
import { download } from "@/lib/nexa";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Prospecta" },
      { name: "description", content: "Indicadores de prospecção por status, cidade e faixa de score." },
      { property: "og:title", content: "Relatórios — Prospecta" },
      { property: "og:description", content: "Acompanhe desempenho da prospecção e exporte dados." },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { companies, activities, proposals } = useStore();

  const byStatus = useMemo(
    () =>
      STATUS_ORDER.map((s) => ({
        name: STATUS_LABELS[s],
        value: companies.filter((c) => c.status === s).length,
      })),
    [companies],
  );

  const byScore = useMemo(() => {
    const buckets = [0, 20, 40, 60, 80];
    return buckets.map((b, i) => {
      const max = buckets[i + 1] ?? 101;
      return {
        name: `${b}-${max === 101 ? 100 : max - 1}`,
        value: companies.filter((c) => {
          const s = scoreCompany(c).score;
          return s >= b && s < max;
        }).length,
      };
    });
  }, [companies]);

  return (
    <AppShell
      title="Relatórios"
      subtitle="Desempenho da prospecção"
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const header = "nome,segmento,cidade,estado,site,whatsapp,score,status";
            const rows = companies.map((c) =>
              [
                c.name,
                c.segment,
                c.city,
                c.state,
                c.site.url ?? "",
                c.whatsapp ?? "",
                scoreCompany(c).score,
                c.status,
              ].join(","),
            );
            download("empresas.csv", [header, ...rows].join("\n"), "text/csv");
            toast.success("CSV exportado");
          }}
        >
          Exportar CSV
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold">Empresas por status</h2>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold">Distribuição de score</h2>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byScore}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="var(--score-mid)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold">Resumo</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Atividades registradas: {activities.length}</li>
            <li>Propostas criadas: {proposals.length}</li>
            <li>
              Valor potencial em propostas: R${" "}
              {proposals.reduce((a, p) => a + p.value, 0).toLocaleString("pt-BR")}
            </li>
            <li>Empresas sem site: {companies.filter((c) => !c.site.hasSite).length}</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
