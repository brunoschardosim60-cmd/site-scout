import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { ScoreBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { opportunityOf, scoreCompany } from "@/lib/scoring";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Prospecta CRM de Sites" },
      {
        name: "description",
        content:
          "Painel de prospecção com empresas sem site, oportunidades por score, mapa e follow-ups em um só lugar.",
      },
      { property: "og:title", content: "Dashboard — Prospecta CRM de Sites" },
      {
        property: "og:description",
        content: "Encontre empresas sem site e transforme oportunidades em clientes.",
      },
    ],
  }),
  component: Dashboard,
});

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Dashboard() {
  const { companies, activities } = useStore();

  const stats = useMemo(() => {
    const total = companies.length;
    const semSite = companies.filter((c) => !c.site.hasSite).length;
    const comSite = total - semSite;
    const desatualizado = companies.filter((c) => c.site.hasSite && !c.site.looksUpdated).length;
    const contatadas = companies.filter((c) => c.status !== "nao_contatado").length;
    const interessadas = companies.filter((c) =>
      ["interessado", "reuniao_marcada", "proposta_enviada", "negociacao"].includes(c.status),
    ).length;
    const fechados = companies.filter((c) => c.status === "cliente_fechado").length;
    const bySegment = Object.entries(
      companies.reduce<Record<string, number>>((acc, c) => {
        acc[c.segment] = (acc[c.segment] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    const byCity = Object.entries(
      companies.reduce<Record<string, number>>((acc, c) => {
        const k = `${c.city}/${c.state}`;
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));
    const opp = ["alta", "boa", "moderada", "baixa"].map((o) => ({
      name: o,
      value: companies.filter((c) => opportunityOf(c) === o).length,
    }));
    return {
      total,
      semSite,
      comSite,
      desatualizado,
      contatadas,
      naoContatadas: total - contatadas,
      interessadas,
      fechados,
      conversao: contatadas ? Math.round((fechados / contatadas) * 100) : 0,
      bySegment,
      byCity,
      opp,
    };
  }, [companies]);

  const top = useMemo(
    () =>
      [...companies]
        .map((c) => ({ c, ...scoreCompany(c) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [companies],
  );

  const recent = useMemo(
    () =>
      [...activities]
        .filter((a) => a.type === "contato")
        .sort((a, b) => +new Date(b.date) - +new Date(a.date))
        .slice(0, 6),
    [activities],
  );

  const oppColors = ["var(--score-high)", "var(--score-mid)", "var(--score-low)", "var(--score-none)"];

  return (
    <AppShell
      title="Dashboard"
      subtitle="Visão geral da sua máquina de prospecção"
      actions={
        <Button asChild variant="brand" size="sm">
          <Link to="/mapa">Abrir mapa</Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Empresas" value={stats.total} hint="cadastradas / encontradas" />
        <Kpi label="Sem site" value={stats.semSite} hint="alta oportunidade" />
        <Kpi label="Com site" value={stats.comSite} hint={`${stats.desatualizado} desatualizados`} />
        <Kpi label="Taxa de conversão" value={`${stats.conversao}%`} hint="fechados / contatados" />
        <Kpi label="Contatadas" value={stats.contatadas} />
        <Kpi label="Não contatadas" value={stats.naoContatadas} />
        <Kpi label="Interessadas" value={stats.interessadas} />
        <Kpi label="Clientes fechados" value={stats.fechados} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Empresas por segmento</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bySegment}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={50} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold">Oportunidade de site</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.opp} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                  {stats.opp.map((_, i) => (
                    <Cell key={i} fill={oppColors[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold">Empresas por cidade</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {stats.byCity.map((c) => (
              <li key={c.name} className="flex items-center justify-between">
                <span className="text-muted-foreground">{c.name}</span>
                <span className="font-medium tabular-nums">{c.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold">Melhores oportunidades</h2>
          <ul className="mt-3 space-y-3">
            {top.map(({ c, reasons }) => (
              <li key={c.id} className="flex items-start gap-3">
                <ScoreBadge company={c} />
                <div className="min-w-0">
                  <Link
                    to="/empresas/$id"
                    params={{ id: c.id }}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    ⭐ {c.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{reasons.slice(0, 2).join(" · ")}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold">Últimos contatos</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {recent.map((a) => {
              const c = companies.find((x) => x.id === a.companyId);
              if (!c) return null;
              return (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.date).toLocaleDateString("pt-BR")} — {a.title}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
