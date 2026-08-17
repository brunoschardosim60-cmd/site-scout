import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, MessageCircle, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { NexaActions } from "@/components/CompanyPanel";
import { OpportunityBadge, ScoreBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { renderTemplate, scoreCompany } from "@/lib/scoring";
import { STATUS_LABELS, STATUS_ORDER, type ProspectStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/empresas/$id")({
  head: () => ({
    meta: [
      { title: "Perfil da empresa — Prospecta" },
      {
        name: "description",
        content:
          "Dados de contato, análise de presença digital, score, histórico, follow-ups e propostas da empresa.",
      },
      { property: "og:title", content: "Perfil da empresa — Prospecta" },
      { property: "og:description", content: "Tudo sobre a empresa prospectada em uma página." },
    ],
  }),
  component: CompanyProfile,
});

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}

function Flag({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? <Check className="size-4 text-success" /> : <X className="size-4 text-destructive" />}
      <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

function CompanyProfile() {
  const { id } = useParams({ from: "/empresas/$id" });
  const store = useStore();
  const company = store.companies.find((c) => c.id === id);
  const [note, setNote] = useState("");
  const [followDate, setFollowDate] = useState("");
  const [followNote, setFollowNote] = useState("Retomar contato");
  const [proposal, setProposal] = useState({
    type: "Mini Site" as const,
    value: 1200,
    deadlineDays: 7,
    services: "Layout exclusivo, domínio, formulário, WhatsApp, SEO básico",
    notes: "",
  });

  const timeline = useMemo(
    () =>
      store.activities
        .filter((a) => a.companyId === id)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [store.activities, id],
  );

  if (!company) {
    return (
      <AppShell title="Empresa não encontrada">
        <Button asChild variant="outline">
          <Link to="/empresas">Voltar para a lista</Link>
        </Button>
      </AppShell>
    );
  }

  const { score, reasons } = scoreCompany(company);
  const template =
    store.templates.find((t) => t.segment === company.segment)?.text ??
    "Olá {nome_responsavel}, sou {nome_vendedor} e crio sites para empresas como a {nome_empresa}.";
  const message = renderTemplate(template, {
    nome_empresa: company.name,
    nome_responsavel: company.ownerName ?? "",
    segmento: company.segment,
    cidade: company.city,
    nome_vendedor: store.seller,
  });

  const openWhats = () => {
    if (!company.whatsapp) return;
    window.open(
      `https://wa.me/${company.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener",
    );
    store.logContact(company.id, { channel: "whatsapp", message, status: "primeiro_contato" });
    toast.success("WhatsApp aberto e contato registrado");
  };

  return (
    <AppShell
      title={company.name}
      subtitle={`${company.segment} · ${company.city}/${company.state}`}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/empresas">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="surface-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex size-14 items-center justify-center rounded-xl font-display text-xl font-bold text-primary-foreground"
                style={{ backgroundColor: company.brandColor }}
              >
                {company.logoText}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{company.name}</h2>
                <div className="mt-1 flex flex-wrap gap-2">
                  <ScoreBadge company={company} />
                  <OpportunityBadge company={company} />
                  <StatusBadge status={company.status} />
                </div>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                {company.whatsapp && (
                  <Button variant="brand" onClick={openWhats}>
                    <MessageCircle className="size-4" /> Conversar no WhatsApp
                  </Button>
                )}
                <select
                  value={company.status}
                  onChange={(e) => {
                    store.setStatus(company.id, e.target.value as ProspectStatus);
                    toast.success("Status atualizado");
                  }}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Razão social" value={company.legalName} />
              <Field label="CNPJ" value={company.cnpj} />
              <Field label="Responsável" value={company.ownerName} />
              <Field label="Cargo" value={company.ownerRole} />
              <Field label="Telefone" value={company.phone} />
              <Field label="WhatsApp" value={company.whatsapp} />
              <Field label="E-mail" value={company.email} />
              <Field label="Endereço" value={company.address} />
              <Field label="Bairro" value={company.district} />
              <Field label="Cidade/UF" value={`${company.city}/${company.state}`} />
              <Field label="CEP" value={company.zip} />
              <Field label="Segmento" value={company.segment} />
              <Field label="Site" value={company.site.url ?? "Sem site"} />
              <Field label="Instagram" value={company.instagram} />
              <Field label="Facebook" value={company.facebook} />
              <Field label="Cadastro" value={new Date(company.createdAt).toLocaleDateString("pt-BR")} />
              <Field
                label="Último contato"
                value={company.lastContactAt ? new Date(company.lastContactAt).toLocaleDateString("pt-BR") : "—"}
              />
              <Field label="Google" value={`${company.rating ?? "—"} ★ (${company.reviews ?? 0})`} />
            </div>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-sm font-semibold">Criar mini site com os dados deste cliente</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Abre o Nexa já na etapa de criação, com nome, contatos, endereço, redes, cor da marca e logo
              gerada a partir da identidade da empresa.
            </p>
            <div className="mt-3">
              <NexaActions company={company} />
            </div>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-sm font-semibold">Análise de presença digital (estimativa)</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              <Flag ok={company.site.hasSite} label="Possui site" />
              <Flag ok={company.site.reachable} label="Site acessível" />
              <Flag ok={company.site.responsive} label="Site responsivo" />
              <Flag ok={company.site.looksUpdated} label="Aparenta estar atualizado" />
              <Flag ok={company.site.https} label="HTTPS" />
              <Flag ok={company.site.professional} label="Aparência profissional" />
              <Flag ok={company.site.contactForm} label="Formulário de contato" />
              <Flag ok={company.site.whatsappButton} label="Botão de WhatsApp" />
              <Flag ok={company.site.googleMaps} label="Google Maps no site" />
              <Flag ok={Boolean(company.instagram || company.facebook)} label="Redes sociais" />
            </ul>
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
              <p className="font-display text-sm font-bold">SCORE {score}/100</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Estimativa baseada nos dados disponíveis — não é uma conclusão definitiva.
              </p>
            </div>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-sm font-semibold">Histórico</h3>
            <div className="mt-3 space-y-3">
              {timeline.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>}
              {timeline.map((a) => (
                <div key={a.id} className="border-l-2 border-border pl-3">
                  <p className="text-sm font-medium">
                    {new Date(a.date).toLocaleDateString("pt-BR")} — {a.title}
                  </p>
                  {a.note && <p className="text-xs text-muted-foreground">{a.note}</p>}
                  <p className="text-xs text-muted-foreground">por {a.user}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="note">Adicionar observação</Label>
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              <Button
                size="sm"
                onClick={() => {
                  if (!note.trim()) return;
                  store.addNote(company.id, note.trim());
                  setNote("");
                  toast.success("Observação registrada");
                }}
              >
                Salvar observação
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-4">
            <h3 className="text-sm font-semibold">Mensagem para {company.segment}</h3>
            <Textarea readOnly value={message} rows={6} className="mt-2 text-xs" />
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(message);
                  toast.success("Mensagem copiada");
                }}
              >
                Copiar
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/mensagens">Editar modelos</Link>
              </Button>
            </div>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-sm font-semibold">Criar follow-up</h3>
            <div className="mt-2 space-y-2">
              <Input type="date" value={followDate} onChange={(e) => setFollowDate(e.target.value)} />
              <Input value={followNote} onChange={(e) => setFollowNote(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                {[3, 7, 15].map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setFollowDate(new Date(Date.now() + d * 86400000).toISOString().slice(0, 10))
                    }
                  >
                    +{d} dias
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant="brand"
                onClick={() => {
                  if (!followDate) return toast.error("Escolha uma data");
                  store.addFollowUp(company.id, followDate, followNote);
                  toast.success("Follow-up agendado");
                }}
              >
                Agendar
              </Button>
            </div>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-sm font-semibold">Criar proposta</h3>
            <div className="mt-2 space-y-2">
              <select
                value={proposal.type}
                onChange={(e) => setProposal({ ...proposal, type: e.target.value as typeof proposal.type })}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {["Mini Site", "Landing Page", "Site Institucional", "Site Completo", "E-commerce"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <Input
                type="number"
                value={proposal.value}
                onChange={(e) => setProposal({ ...proposal, value: Number(e.target.value) })}
                placeholder="Valor"
              />
              <Input
                type="number"
                value={proposal.deadlineDays}
                onChange={(e) => setProposal({ ...proposal, deadlineDays: Number(e.target.value) })}
                placeholder="Prazo (dias)"
              />
              <Textarea
                rows={3}
                value={proposal.services}
                onChange={(e) => setProposal({ ...proposal, services: e.target.value })}
              />
              <Button
                size="sm"
                variant="brand"
                onClick={() => {
                  store.addProposal({
                    companyId: company.id,
                    type: proposal.type,
                    value: proposal.value,
                    deadlineDays: proposal.deadlineDays,
                    services: proposal.services.split(",").map((s) => s.trim()).filter(Boolean),
                    notes: proposal.notes,
                  });
                  toast.success("Proposta criada");
                }}
              >
                Gerar proposta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
