import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { haversineKm, scoreCompany } from "@/lib/scoring";
import type { Company } from "@/lib/types";
import { CITY_CENTERS } from "@/lib/geo";

export type Filters = {
  q: string;
  state: string;
  city: string;
  district: string;
  zip: string;
  segment: string;
  site: "todos" | "com" | "sem" | "desatualizado";
  whatsapp: boolean;
  contact: "todos" | "contatados" | "nao_contatados" | "interessados";
  minScore: number;
  radiusKm: number;
  radiusCity: string;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  state: "",
  city: "",
  district: "",
  zip: "",
  segment: "",
  site: "todos",
  whatsapp: false,
  contact: "todos",
  minScore: 0,
  radiusKm: 0,
  radiusCity: "",
};

export function applyFilters(companies: Company[], f: Filters): Company[] {
  const center = f.radiusKm > 0 && f.radiusCity ? CITY_CENTERS[f.radiusCity] : undefined;
  return companies.filter((c) => {
    const q = f.q.trim().toLowerCase();
    if (
      q &&
      ![c.name, c.legalName, c.cnpj, c.cpf, c.segment, c.city, c.district, c.zip, c.ownerName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
      return false;
    if (f.state && c.state !== f.state) return false;
    if (f.city && c.city !== f.city) return false;
    if (f.district && !c.district.toLowerCase().includes(f.district.toLowerCase())) return false;
    if (f.zip && !c.zip.startsWith(f.zip)) return false;
    if (f.segment && c.segment !== f.segment) return false;
    if (f.site === "com" && !c.site.hasSite) return false;
    if (f.site === "sem" && c.site.hasSite) return false;
    if (f.site === "desatualizado" && !(c.site.hasSite && !c.site.looksUpdated)) return false;
    if (f.whatsapp && !c.whatsapp) return false;
    if (f.contact === "contatados" && c.status === "nao_contatado") return false;
    if (f.contact === "nao_contatados" && c.status !== "nao_contatado") return false;
    if (
      f.contact === "interessados" &&
      !["interessado", "reuniao_marcada", "proposta_enviada", "negociacao"].includes(c.status)
    )
      return false;
    if (f.minScore > 0 && scoreCompany(c).score < f.minScore) return false;
    if (center && haversineKm(center, c) > f.radiusKm) return false;
    return true;
  });
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FilterBar({
  filters,
  onChange,
  compact,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  compact?: boolean;
}) {
  const { companies, segments } = useStore();
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...filters, [k]: v });
  const cities = [...new Set(companies.map((c) => c.city))].sort();
  const states = [...new Set(companies.map((c) => c.state))].sort();

  return (
    <div className="surface-card space-y-3 p-4">
      <Input
        placeholder="Buscar por empresa, CNPJ, responsável, segmento, cidade, CEP…"
        value={filters.q}
        onChange={(e) => set("q", e.target.value)}
      />
      <div className={compact ? "grid gap-2" : "grid gap-2 md:grid-cols-3 xl:grid-cols-4"}>
        <Select
          value={filters.state}
          onChange={(v) => set("state", v)}
          options={states.map((s) => ({ value: s, label: s }))}
          placeholder="Estado"
        />
        <Select
          value={filters.city}
          onChange={(v) => set("city", v)}
          options={cities.map((s) => ({ value: s, label: s }))}
          placeholder="Cidade"
        />
        <Input
          placeholder="Bairro"
          value={filters.district}
          onChange={(e) => set("district", e.target.value)}
        />
        <Input placeholder="CEP" value={filters.zip} onChange={(e) => set("zip", e.target.value)} />
        <Select
          value={filters.segment}
          onChange={(v) => set("segment", v)}
          options={segments.map((s) => ({ value: s, label: s }))}
          placeholder="Segmento"
        />
        <Select
          value={filters.site}
          onChange={(v) => set("site", v as Filters["site"])}
          options={[
            { value: "com", label: "Possui site" },
            { value: "sem", label: "Não possui site" },
            { value: "desatualizado", label: "Site desatualizado" },
          ]}
          placeholder="Situação do site"
        />
        <Select
          value={filters.contact}
          onChange={(v) => set("contact", v as Filters["contact"])}
          options={[
            { value: "contatados", label: "Já contatados" },
            { value: "nao_contatados", label: "Nunca contatados" },
            { value: "interessados", label: "Interessados" },
          ]}
          placeholder="Prospecção"
        />
        <Select
          value={filters.radiusCity}
          onChange={(v) => set("radiusCity", v)}
          options={Object.keys(CITY_CENTERS).map((s) => ({ value: s, label: `Raio a partir de ${s}` }))}
          placeholder="Centro do raio"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label className="text-xs text-muted-foreground">Score mínimo: {filters.minScore}</Label>
          <Slider
            value={[filters.minScore]}
            max={100}
            step={5}
            onValueChange={([v]) => set("minScore", v ?? 0)}
            className="mt-2"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">
            Raio: {filters.radiusKm ? `${filters.radiusKm} km` : "sem limite"}
          </Label>
          <Slider
            value={[filters.radiusKm]}
            max={60}
            step={5}
            onValueChange={([v]) => set("radiusKm", v ?? 0)}
            className="mt-2"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant={filters.whatsapp ? "brand" : "outline"}
            size="sm"
            onClick={() => set("whatsapp", !filters.whatsapp)}
          >
            Com WhatsApp
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}
