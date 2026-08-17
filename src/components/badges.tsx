import { cn } from "@/lib/utils";
import { OPPORTUNITY_META, opportunityOf, scoreCompany, scoreTone } from "@/lib/scoring";
import { STATUS_LABELS, type Company, type ProspectStatus } from "@/lib/types";

export function ScoreBadge({ company, className }: { company: Company; className?: string }) {
  const { score } = scoreCompany(company);
  const tone = scoreTone(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-display text-xs font-bold tabular-nums",
        tone.className,
        className,
      )}
      title={tone.label}
    >
      {score}
    </span>
  );
}

export function OpportunityBadge({ company }: { company: Company }) {
  const meta = OPPORTUNITY_META[opportunityOf(company)];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
      <span aria-hidden>{meta.dot}</span>
      {meta.label}
    </span>
  );
}

const STATUS_TONE: Partial<Record<ProspectStatus, string>> = {
  nao_contatado: "bg-muted text-muted-foreground",
  interessado: "bg-success/15 text-success",
  cliente_fechado: "bg-success/20 text-success",
  cliente_perdido: "bg-destructive/15 text-destructive",
  sem_interesse: "bg-destructive/10 text-destructive",
  proposta_enviada: "bg-warning/15 text-warning",
  negociacao: "bg-warning/20 text-warning",
};

export function StatusBadge({ status }: { status: ProspectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_TONE[status] ?? "bg-accent text-accent-foreground",
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
