import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CompanyPanel } from "@/components/CompanyPanel";
import { FilterBar, EMPTY_FILTERS, applyFilters, type Filters } from "@/components/FilterBar";
import { useStore } from "@/lib/store";
import { CITY_CENTERS } from "@/lib/geo";

const MapView = lazy(() => import("@/components/MapView"));

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de oportunidades — Prospecta" },
      {
        name: "description",
        content: "Veja empresas no mapa, filtre por cidade, bairro, CEP, segmento e raio em km.",
      },
      { property: "og:title", content: "Mapa de oportunidades — Prospecta" },
      { property: "og:description", content: "Empresas sem site e oportunidades plotadas no mapa." },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const { companies } = useStore();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const filtered = useMemo(() => applyFilters(companies, filters), [companies, filters]);
  // limite de marcadores para manter o mapa fluido com milhares de empresas
  const plotted = useMemo(() => filtered.slice(0, 600), [filtered]);
  const company = filtered.find((c) => c.id === selected) ?? companies.find((c) => c.id === selected);
  const center = filters.radiusCity
    ? CITY_CENTERS[filters.radiusCity]
    : filters.city
      ? CITY_CENTERS[filters.city]
      : undefined;

  return (
    <AppShell title="Mapa" subtitle={`${filtered.length} empresas no filtro atual`}>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr_340px]">
        <div className="space-y-3">
          <FilterBar filters={filters} onChange={setFilters} compact />
          <div className="surface-card space-y-1 p-4 text-xs text-muted-foreground">
            <p>🔴 Sem site · 🟠 Site fraco · 🟡 Moderado · 🟢 Presença forte</p>
            <p>Clique num marcador para abrir os dados da empresa.</p>
            {filtered.length > plotted.length && (
              <p>Mostrando {plotted.length} de {filtered.length} empresas — refine os filtros.</p>
            )}
          </div>
        </div>

        <div className="surface-card h-[70vh] overflow-hidden p-1">
          <Suspense
            fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Carregando mapa…</div>}
          >
            <MapView
              companies={plotted}
              selectedId={selected}
              onSelect={setSelected}
              center={center}
              radiusKm={filters.radiusKm || undefined}
            />
          </Suspense>
        </div>

        <div className="surface-card max-h-[70vh] overflow-auto p-4">
          {company ? (
            <CompanyPanel company={company} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecione uma empresa no mapa para ver telefone, WhatsApp, site, score e ações de prospecção.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
