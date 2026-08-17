import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { download, slugify } from "@/lib/nexa";
import { toast } from "sonner";

export const Route = createFileRoute("/propostas")({
  head: () => ({
    meta: [
      { title: "Propostas — Prospecta" },
      { name: "description", content: "Propostas de mini site, landing page e site institucional geradas no CRM." },
      { property: "og:title", content: "Propostas — Prospecta" },
      { property: "og:description", content: "Gere e acompanhe propostas comerciais de sites." },
    ],
  }),
  component: PropostasPage,
});

function PropostasPage() {
  const { proposals, companies, seller } = useStore();

  return (
    <AppShell title="Propostas" subtitle={`${proposals.length} propostas criadas`}>
      {proposals.length === 0 && (
        <div className="surface-card p-6 text-sm text-muted-foreground">
          Nenhuma proposta ainda. Abra o perfil de uma empresa e use "Criar proposta".
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {proposals.map((p) => {
          const c = companies.find((x) => x.id === p.companyId);
          if (!c) return null;
          const html = `Proposta ${p.type}\nCliente: ${c.name} — ${c.city}/${c.state}\nValor: R$ ${p.value.toLocaleString("pt-BR")}\nPrazo: ${p.deadlineDays} dias\nServiços: ${p.services.join(", ")}\nConsultor: ${seller}`;
          return (
            <div key={p.id} className="surface-card overflow-hidden">
              <div className="brand-gradient px-5 py-4 text-primary-foreground">
                <p className="text-xs uppercase tracking-wide opacity-80">Proposta comercial</p>
                <h2 className="font-display text-lg font-bold">{p.type}</h2>
                <p className="text-sm opacity-90">{c.name}</p>
              </div>
              <div className="space-y-2 p-5 text-sm">
                <p className="text-muted-foreground">
                  {c.segment} · {c.city}/{c.state}
                </p>
                <p className="font-display text-2xl font-bold">
                  R$ {p.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-muted-foreground">Entrega em {p.deadlineDays} dias</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {p.services.map((s) => (
                    <li key={s}>✓ {s}</li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/empresas/$id" params={{ id: c.id }}>
                      Ver empresa
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      download(`proposta-${slugify(c.name)}.txt`, html, "text/plain");
                      toast.success("Proposta baixada");
                    }}
                  >
                    Baixar
                  </Button>
                </div>
                <p className="pt-2 text-xs text-muted-foreground">
                  Criada em {new Date(p.createdAt).toLocaleDateString("pt-BR")} por {seller}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
