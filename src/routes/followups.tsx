import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/followups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — Prospecta" },
      { name: "description", content: "Lembretes de retorno: quem contatar hoje, atrasados e próximos dias." },
      { property: "og:title", content: "Follow-ups — Prospecta" },
      { property: "og:description", content: "Nunca perca o timing de um retorno de prospecção." },
    ],
  }),
  component: FollowUpsPage,
});

function FollowUpsPage() {
  const { followups, companies, toggleFollowUp, snoozeFollowUp, logContact } = useStore();
  const today = new Date().toISOString().slice(0, 10);

  const groups = useMemo(() => {
    const open = followups.filter((f) => !f.done);
    return {
      atrasados: open.filter((f) => f.dueDate < today),
      hoje: open.filter((f) => f.dueDate === today),
      proximos: open.filter((f) => f.dueDate > today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      concluidos: followups.filter((f) => f.done),
    };
  }, [followups, today]);

  const Section = ({ title, items }: { title: string; items: typeof followups }) => (
    <div className="surface-card p-4">
      <h2 className="text-sm font-semibold">
        {title} <span className="text-muted-foreground">({items.length})</span>
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((f) => {
          const c = companies.find((x) => x.id === f.companyId);
          if (!c) return null;
          return (
            <li key={f.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <Link to="/empresas/$id" params={{ id: c.id }} className="font-medium hover:underline">
                  {c.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {new Date(f.dueDate).toLocaleDateString("pt-BR")} — {f.note}
                </p>
              </div>
              <StatusBadge status={c.status} />
              {c.whatsapp && (
                <Button
                  size="sm"
                  variant="brand"
                  onClick={() => {
                    window.open(`https://wa.me/${c.whatsapp!.replace(/\D/g, "")}`, "_blank", "noopener");
                    logContact(c.id, { channel: "whatsapp" });
                  }}
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => toggleFollowUp(f.id)}>
                {f.done ? "Reabrir" : "Concluir"}
              </Button>
              {!f.done && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    snoozeFollowUp(f.id, 3);
                    toast.success("Adiado por 3 dias");
                  }}
                >
                  Adiar 3d
                </Button>
              )}
            </li>
          );
        })}
        {items.length === 0 && <li className="text-sm text-muted-foreground">Nada por aqui.</li>}
      </ul>
    </div>
  );

  return (
    <AppShell title="Follow-ups" subtitle="Seus retornos programados">
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Atrasados" items={groups.atrasados} />
        <Section title="Follow-ups de hoje" items={groups.hoje} />
        <Section title="Próximos" items={groups.proximos} />
        <Section title="Concluídos" items={groups.concluidos} />
      </div>
    </AppShell>
  );
}
