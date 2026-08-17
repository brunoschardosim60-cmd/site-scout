import type { Company } from "./types";

export type Opportunity = "alta" | "boa" | "moderada" | "baixa";

export const OPPORTUNITY_META: Record<Opportunity, { label: string; dot: string; desc: string }> = {
  alta: { label: "Alta oportunidade", dot: "🔴", desc: "Empresa sem site identificado." },
  boa: { label: "Boa oportunidade", dot: "🟠", desc: "Site antigo ou com problemas." },
  moderada: { label: "Oportunidade moderada", dot: "🟡", desc: "Site razoável, pode ser modernizado." },
  baixa: { label: "Baixa oportunidade", dot: "🟢", desc: "Presença digital já é forte." },
};

const HIGH_DEMAND = [
  "Restaurantes",
  "Clínicas",
  "Dentistas",
  "Advogados",
  "Imobiliárias",
  "Academias",
  "Estéticas",
  "Barbearias",
  "Salões de beleza",
];

export function scoreCompany(c: Company): { score: number; reasons: string[]; opportunity: Opportunity } {
  const reasons: string[] = [];
  let score = 25;
  const s = c.site;

  if (!s.hasSite) {
    score += 35;
    reasons.push("Não possui site");
  } else {
    if (s.reachable === false) {
      score += 22;
      reasons.push("Site fora do ar ou instável");
    }
    if (!s.responsive) {
      score += 12;
      reasons.push("Site não responsivo");
    }
    if (!s.looksUpdated) {
      score += 10;
      reasons.push("Site aparentemente desatualizado");
    }
    if (!s.https) {
      score += 8;
      reasons.push("Site sem HTTPS");
    }
    if (!s.professional) {
      score += 6;
      reasons.push("Aparência pouco profissional");
    }
    if (!s.contactForm) {
      score += 3;
      reasons.push("Sem formulário de contato");
    }
    if (!s.whatsappButton) {
      score += 3;
      reasons.push("Sem botão de WhatsApp");
    }
  }

  if (c.whatsapp) {
    score += 8;
    reasons.push("Possui WhatsApp");
  }
  if (c.phone) score += 2;
  if (c.instagram) {
    score += 5;
    reasons.push("Possui Instagram");
  }
  if (HIGH_DEMAND.includes(c.segment)) {
    score += 6;
    reasons.push("Segmento com alta demanda por sites");
  }
  if ((c.reviews ?? 0) > 150) {
    score += 6;
    reasons.push("Muitas avaliações no Google");
  } else if ((c.reviews ?? 0) > 40) {
    score += 3;
  }
  if ((c.rating ?? 0) >= 4.3) {
    score += 4;
    reasons.push("Boa avaliação no Google");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, reasons, opportunity: opportunityOf(c) };
}

export function opportunityOf(c: Company): Opportunity {
  const s = c.site;
  if (!s.hasSite) return "alta";
  const flags = [s.responsive, s.looksUpdated, s.https, s.professional, s.contactForm, s.whatsappButton];
  const good = flags.filter(Boolean).length;
  if (s.reachable === false || good <= 2) return "boa";
  if (good <= 4) return "moderada";
  return "baixa";
}

export function scoreTone(score: number) {
  if (score >= 85) return { label: "Excelente oportunidade", className: "text-score-high" };
  if (score >= 65) return { label: "Boa oportunidade", className: "text-score-mid" };
  if (score >= 45) return { label: "Oportunidade moderada", className: "text-score-low" };
  return { label: "Baixa prioridade", className: "text-muted-foreground" };
}

export function renderTemplate(
  text: string,
  vars: { nome_empresa: string; nome_responsavel: string; segmento: string; cidade: string; nome_vendedor: string },
) {
  return text
    .replaceAll("{nome_empresa}", vars.nome_empresa)
    .replaceAll("{nome_responsavel}", vars.nome_responsavel)
    .replaceAll("{segmento}", vars.segmento)
    .replaceAll("{cidade}", vars.cidade)
    .replaceAll("{nome_vendedor}", vars.nome_vendedor);
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
