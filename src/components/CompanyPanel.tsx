import { Link } from "@tanstack/react-router";
import {
  Globe,
  MapPin,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityBadge, ScoreBadge, StatusBadge } from "@/components/badges";
import { scoreCompany } from "@/lib/scoring";
import type { Company } from "@/lib/types";
import { useStore } from "@/lib/store";
import { download, logoSvg, nexaPayload, nexaUrl, slugify } from "@/lib/nexa";
import { toast } from "sonner";

export function NexaActions({ company }: { company: Company }) {
  const { seller } = useStore();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button
        variant="brand"
        onClick={() => {
          const dados = [
            `Empresa: ${company.name}`,
            `Responsável: ${company.ownerName ?? "-"}`,
            `WhatsApp: ${company.whatsapp ?? company.phone ?? "-"}`,
            `E-mail: ${company.email ?? "-"}`,
            `Segmento: ${company.segment}`,
            `Endereço: ${company.address}, ${company.district} — ${company.city}/${company.state}`,
            `Instagram: ${company.instagram ?? "-"}`,
            `Cor da marca: ${company.brandColor} · Iniciais: ${company.logoText}`,
          ].join("\n");
          navigator.clipboard?.writeText(dados).catch(() => undefined);
          window.open(nexaUrl(company, seller), "_blank", "noopener");
          toast.success("Abrindo criação no Nexa — dados do cliente copiados");
        }}
      >
        <Sparkles className="size-4" /> Criar mini site no Nexa
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          download(`${slugify(company.name)}-logo.svg`, logoSvg(company), "image/svg+xml");
          download(`${slugify(company.name)}-dados.json`, JSON.stringify(nexaPayload(company, seller), null, 2));
          toast.success("Logo e dados do cliente baixados");
        }}
      >
        <Download className="size-4" /> Baixar logo + dados
      </Button>
    </div>
  );
}

export function CompanyPanel({ company }: { company: Company }) {
  const { setStatus, logContact } = useStore();
  const { score, reasons } = scoreCompany(company);
  const wa = company.whatsapp
    ? `https://wa.me/${company.whatsapp.replace(/\D/g, "")}`
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl font-display text-base font-bold text-primary-foreground"
          style={{ backgroundColor: company.brandColor }}
        >
          {company.logoText}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{company.name}</h3>
          <p className="text-xs text-muted-foreground">
            {company.segment} · {company.district}, {company.city}/{company.state}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ScoreBadge company={company} />
            <OpportunityBadge company={company} />
            <StatusBadge status={company.status} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" /> {company.address} — CEP {company.zip}
        </p>
        {company.phone && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 shrink-0" /> {company.phone}
          </p>
        )}
        {company.email && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 shrink-0" /> {company.email}
          </p>
        )}
        {company.instagram && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Instagram className="size-4 shrink-0" /> {company.instagram}
          </p>
        )}
        <p className="flex items-center gap-2 text-muted-foreground">
          <Globe className="size-4 shrink-0" />
          {company.site.hasSite ? (
            <a className="underline" href={company.site.url} target="_blank" rel="noreferrer">
              {company.site.url}
            </a>
          ) : (
            "Sem site identificado"
          )}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Score {score}/100 — estimativa
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {reasons.slice(0, 5).map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {wa && (
          <Button
            variant="brand"
            onClick={() => {
              window.open(wa, "_blank", "noopener");
              logContact(company.id, { channel: "whatsapp", status: "primeiro_contato" });
              toast.success("Contato registrado");
            }}
          >
            <MessageCircle className="size-4" /> Conversar no WhatsApp
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => {
            setStatus(company.id, "primeiro_contato");
            toast.success("Marcado como contatado");
          }}
        >
          Marcar como contatado
        </Button>
      </div>

      <NexaActions company={company} />

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link to="/empresas/$id" params={{ id: company.id }}>
            Ver perfil completo
          </Link>
        </Button>
        {company.mapsUrl && (
          <Button asChild variant="ghost" size="sm">
            <a href={company.mapsUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> Google Maps
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
