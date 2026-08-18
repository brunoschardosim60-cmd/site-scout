export type SiteAudit = {
  hasSite: boolean;
  url?: string | undefined;
  reachable?: boolean;
  https?: boolean;
  responsive?: boolean;
  looksUpdated?: boolean;
  professional?: boolean;
  contactForm?: boolean;
  whatsappButton?: boolean;
  googleMaps?: boolean;
  socialLinks?: boolean;
};

/** Baixa a home do site e faz uma análise heurística da presença digital. */
export async function auditSite(url?: string | undefined): Promise<SiteAudit> {
  if (!url) return { hasSite: false };

  const audit: SiteAudit = { hasSite: true, url, https: url.startsWith("https://") };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; ProspectaBot/1.0)" },
    });
    clearTimeout(timer);

    audit.reachable = res.ok;
    if (!res.ok) return audit;

    const html = (await res.text()).slice(0, 400000);
    const lower = html.toLowerCase();

    audit.responsive = /name=["']viewport["']/.test(lower);
    audit.contactForm = /<form/.test(lower) || /contato/.test(lower);
    audit.whatsappButton = /wa\.me|api\.whatsapp\.com|whatsapp/.test(lower);
    audit.googleMaps = /google\.com\/maps|maps\.google|goo\.gl\/maps/.test(lower);
    audit.socialLinks = /instagram\.com|facebook\.com|linkedin\.com/.test(lower);
    audit.looksUpdated = new RegExp(`20(2[4-9]|3\\d)`).test(lower) || /tailwind|next\.js|wp-content\/themes/.test(lower);
    audit.professional =
      Boolean(audit.responsive) && Boolean(audit.https) && (Boolean(audit.contactForm) || Boolean(audit.socialLinks));
  } catch {
    audit.reachable = false;
  }

  return audit;
}

/** Score de oportunidade 0-100: quanto pior a presença digital, maior a chance de venda. */
export function scoreFromAudit(a: SiteAudit): number {
  let score = 25;
  if (!a.hasSite) {
    score += 45;
  } else {
    if (a.reachable === false) score += 25;
    if (!a.https) score += 8;
    if (!a.responsive) score += 14;
    if (!a.looksUpdated) score += 10;
    if (!a.professional) score += 8;
    if (!a.contactForm) score += 5;
    if (!a.whatsappButton) score += 7;
    if (!a.socialLinks) score += 4;
  }
  return Math.max(0, Math.min(100, score));
}
