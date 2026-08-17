import type { Company, FollowUp, MessageTemplate, Activity, ProspectStatus } from "./types";

export const SEGMENTS = [
  "Restaurantes",
  "Clínicas",
  "Dentistas",
  "Psicólogos",
  "Advogados",
  "Contadores",
  "Oficinas",
  "Autoelétricas",
  "Mecânicas",
  "Salões de beleza",
  "Barbearias",
  "Estéticas",
  "Academias",
  "Pet shops",
  "Veterinários",
  "Imobiliárias",
  "Transportadoras",
  "Eventos",
  "Fotógrafos",
  "Arquitetos",
  "Engenheiros",
  "Prestadores de serviços",
  "Lojas",
  "Autônomos",
];

const CITIES: { city: string; state: string; lat: number; lng: number; districts: string[] }[] = [
  {
    city: "Canoas",
    state: "RS",
    lat: -29.9177,
    lng: -51.1836,
    districts: ["Centro", "Nossa Senhora das Graças", "Marechal Rondon", "Igara"],
  },
  {
    city: "Porto Alegre",
    state: "RS",
    lat: -30.0346,
    lng: -51.2177,
    districts: ["Moinhos de Vento", "Cidade Baixa", "Petrópolis", "Menino Deus"],
  },
  {
    city: "São Leopoldo",
    state: "RS",
    lat: -29.7604,
    lng: -51.1471,
    districts: ["Centro", "Rio Branco", "Campina"],
  },
  {
    city: "Novo Hamburgo",
    state: "RS",
    lat: -29.6783,
    lng: -51.1306,
    districts: ["Centro", "Rio Branco", "Ideal"],
  },
  {
    city: "Gravataí",
    state: "RS",
    lat: -29.9444,
    lng: -50.9919,
    districts: ["Centro", "Parque dos Anjos", "Bom Sucesso"],
  },
  {
    city: "Esteio",
    state: "RS",
    lat: -29.8608,
    lng: -51.1789,
    districts: ["Centro", "Primavera"],
  },
];

const PREFIX: Record<string, string[]> = {
  Restaurantes: ["Cantina", "Sabor", "Bistrô", "Churrascaria"],
  Clínicas: ["Clínica", "Centro Médico", "Instituto"],
  Dentistas: ["Odonto", "Sorriso", "Clínica Dental"],
  Psicólogos: ["Espaço", "Consultório", "Núcleo"],
  Advogados: ["Advocacia", "Escritório", "Jurídico"],
  Contadores: ["Contabilidade", "Escritório Contábil"],
  Oficinas: ["Oficina", "Auto Center"],
  Autoelétricas: ["Autoelétrica", "Elétrica Auto"],
  Mecânicas: ["Mecânica", "Multi Motor"],
  "Salões de beleza": ["Salão", "Studio Hair"],
  Barbearias: ["Barbearia", "Barber Shop"],
  Estéticas: ["Estética", "Studio Bella"],
  Academias: ["Academia", "Fit Center"],
  "Pet shops": ["Pet Shop", "Mundo Pet"],
  Veterinários: ["Clínica Vet", "Vet Care"],
  Imobiliárias: ["Imobiliária", "Imóveis"],
  Transportadoras: ["Transportes", "Logística"],
  Eventos: ["Eventos", "Produções"],
  Fotógrafos: ["Studio Foto", "Fotografia"],
  Arquitetos: ["Arquitetura", "Atelier"],
  Engenheiros: ["Engenharia", "Projetos"],
  "Prestadores de serviços": ["Serviços", "Multi Serviços"],
  Lojas: ["Loja", "Casa"],
  Autônomos: ["Studio", "Espaço"],
};

const SUFFIX = [
  "Aurora",
  "Bela Vista",
  "Central",
  "Prime",
  "Nova Era",
  "Real",
  "Vitória",
  "Horizonte",
  "Alvorada",
  "Bom Fim",
  "São Jorge",
  "Estrela",
  "Primavera",
  "Ipanema",
  "Vale Verde",
];

const OWNERS = [
  "Ana Paula",
  "Carlos Eduardo",
  "Marina Souza",
  "Rafael Lima",
  "Juliana Reis",
  "Fernando Alves",
  "Patrícia Gomes",
  "Diego Martins",
];

const COLORS = [
  "#0f766e",
  "#b45309",
  "#1d4ed8",
  "#be123c",
  "#15803d",
  "#7c2d12",
  "#0369a1",
  "#a16207",
];

function pick<T>(arr: readonly T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length] as T;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATUSES: ProspectStatus[] = [
  "nao_contatado",
  "nao_contatado",
  "nao_contatado",
  "primeiro_contato",
  "aguardando_resposta",
  "respondeu",
  "interessado",
  "reuniao_marcada",
  "proposta_enviada",
  "negociacao",
  "cliente_fechado",
  "sem_interesse",
  "contatar_novamente",
];

const NOW = new Date("2026-08-17T12:00:00Z").getTime();
const DAY = 86400000;

export function buildCompanies(count = 96): Company[] {
  const rnd = mulberry32(20260817);
  const list: Company[] = [];
  for (let i = 0; i < count; i++) {
    const seg = pick(SEGMENTS, rnd());
    const loc = pick(CITIES, rnd());
    const district = pick(loc.districts, rnd());
    const name = `${pick(PREFIX[seg] ?? ["Empresa"], rnd())} ${pick(SUFFIX, rnd())}`;
    const hasSite = rnd() > 0.42;
    const quality = rnd();
    const status = pick(STATUSES, rnd());
    const contacted = status !== "nao_contatado";
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]+/g, "");
    list.push({
      id: `c${i + 1}`,
      name,
      legalName: `${name} Ltda`,
      cnpj: `${10 + (i % 80)}.${String(100 + i).slice(0, 3)}.${String(200 + i).slice(0, 3)}/0001-${String(10 + (i % 80))}`,
      ownerName: pick(OWNERS, rnd()),
      ownerRole: "Proprietário(a)",
      phone: `(51) 3${String(1000 + i).slice(0, 3)}-${String(1000 + i * 7).slice(0, 4)}`,
      whatsapp: rnd() > 0.18 ? `55519${String(80000000 + i * 137).slice(0, 8)}` : undefined,
      email: `contato@${slug}.com.br`,
      address: `Rua ${pick(SUFFIX, rnd())}, ${100 + Math.floor(rnd() * 1800)}`,
      district,
      city: loc.city,
      state: loc.state,
      zip: `9${String(2000 + i).slice(0, 4)}-${String(100 + (i % 800)).slice(0, 3)}`,
      segment: seg,
      instagram: rnd() > 0.3 ? `@${slug}` : undefined,
      facebook: rnd() > 0.6 ? `/${slug}` : undefined,
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(name + " " + loc.city)}`,
      createdAt: new Date(NOW - Math.floor(rnd() * 120) * DAY).toISOString(),
      lastContactAt: contacted
        ? new Date(NOW - Math.floor(rnd() * 40) * DAY).toISOString()
        : undefined,
      lat: loc.lat + (rnd() - 0.5) * 0.06,
      lng: loc.lng + (rnd() - 0.5) * 0.06,
      rating: Math.round((3.4 + rnd() * 1.6) * 10) / 10,
      reviews: Math.floor(rnd() * 480),
      brandColor: pick(COLORS, rnd()),
      logoText: name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      status,
      site: hasSite
        ? {
            hasSite: true,
            url: `https://www.${slug}.com.br`,
            reachable: rnd() > 0.08,
            responsive: quality > 0.45,
            looksUpdated: quality > 0.62,
            https: quality > 0.2,
            professional: quality > 0.55,
            contactForm: quality > 0.5,
            whatsappButton: quality > 0.4,
            googleMaps: quality > 0.35,
            socialLinks: quality > 0.3,
          }
        : { hasSite: false },
    });
  }
  return list;
}

export function buildActivities(companies: Company[]): Activity[] {
  const acts: Activity[] = [];
  companies.forEach((c, i) => {
    if (!c.lastContactAt) return;
    const base = new Date(c.lastContactAt).getTime();
    acts.push({
      id: `a${i}-1`,
      companyId: c.id,
      date: new Date(base - 3 * DAY).toISOString(),
      type: "contato",
      channel: "whatsapp",
      user: "Bruno",
      title: "Primeiro contato via WhatsApp",
    });
    if (["respondeu", "interessado", "proposta_enviada", "negociacao", "cliente_fechado"].includes(c.status)) {
      acts.push({
        id: `a${i}-2`,
        companyId: c.id,
        date: new Date(base - 1 * DAY).toISOString(),
        type: "nota",
        user: "Bruno",
        title: "Cliente respondeu",
        note: "Pediu mais informações sobre valores.",
      });
    }
    if (["proposta_enviada", "negociacao", "cliente_fechado"].includes(c.status)) {
      acts.push({
        id: `a${i}-3`,
        companyId: c.id,
        date: new Date(base).toISOString(),
        type: "proposta",
        user: "Bruno",
        title: "Proposta enviada",
      });
    }
  });
  return acts;
}

export function buildFollowUps(companies: Company[]): FollowUp[] {
  const rnd = mulberry32(7);
  const out: FollowUp[] = [];
  companies.forEach((c, i) => {
    if (c.status === "nao_contatado" || c.status === "cliente_fechado") return;
    if (rnd() > 0.35) return;
    const offset = Math.floor(rnd() * 8) - 3;
    out.push({
      id: `f${i}`,
      companyId: c.id,
      dueDate: new Date(NOW + offset * DAY).toISOString().slice(0, 10),
      note: offset <= 0 ? "Retomar contato — sem resposta" : "Enviar proposta de mini site",
      done: false,
    });
  });
  return out;
}

const DEFAULT_MSG =
  "Olá, tudo bem? Meu nome é {nome_vendedor}, trabalho com criação de sites e soluções digitais para empresas. Encontrei a {nome_empresa} em {cidade} e percebi que vocês poderiam ter uma presença digital ainda mais profissional. Posso te mostrar uma ideia de site que ajudaria a receber mais clientes?";

const CUSTOM: Record<string, string> = {
  Restaurantes:
    "Olá, tudo bem? Sou o {nome_vendedor}, crio sites para restaurantes. Vi o {nome_empresa} em {cidade} e pensei num site com cardápio digital, fotos dos pratos e botão de pedidos no WhatsApp. Posso te mostrar uma ideia?",
  Clínicas:
    "Olá {nome_responsavel}, tudo bem? Sou o {nome_vendedor}, crio sites para clínicas. Encontrei a {nome_empresa} em {cidade} e tenho uma ideia de site com agendamento online e página de especialidades. Posso te enviar?",
  Dentistas:
    "Olá, tudo bem? Sou o {nome_vendedor}. Crio sites para consultórios odontológicos. Vi a {nome_empresa} e imaginei um site com antes/depois, tratamentos e agendamento pelo WhatsApp. Quer ver um exemplo?",
  Barbearias:
    "Fala! Sou o {nome_vendedor}, faço sites para barbearias. Vi a {nome_empresa} em {cidade} e pensei num site com tabela de serviços, galeria de cortes e agendamento direto no WhatsApp. Te mostro?",
  "Salões de beleza":
    "Oi, tudo bem? Sou o {nome_vendedor}, crio sites para salões. Vi o {nome_empresa} e imaginei um site com serviços, galeria e agendamento online. Posso te mostrar uma prévia?",
  Oficinas:
    "Olá, tudo bem? Sou o {nome_vendedor}, crio sites para oficinas. Encontrei a {nome_empresa} em {cidade} e pensei num site com serviços, localização e orçamento pelo WhatsApp. Quer ver?",
  Transportadoras:
    "Olá, tudo bem? Sou o {nome_vendedor}, faço sites para transportadoras. Vi a {nome_empresa} e imaginei um site institucional com rotas, frota e solicitação de cotação. Posso te mostrar?",
  Imobiliárias:
    "Olá, tudo bem? Sou o {nome_vendedor}, crio sites para imobiliárias. Vi a {nome_empresa} em {cidade} e pensei num site com vitrine de imóveis e filtros de busca. Te envio um exemplo?",
  Advogados:
    "Olá {nome_responsavel}, sou o {nome_vendedor}. Crio sites institucionais para escritórios de advocacia. Vi a {nome_empresa} e tenho uma ideia de site com áreas de atuação e captação de casos. Posso apresentar?",
  Contadores:
    "Olá, tudo bem? Sou o {nome_vendedor}, crio sites para escritórios contábeis. Vi a {nome_empresa} em {cidade} e pensei num site com serviços, planos e contato rápido. Quer ver a ideia?",
  Academias:
    "Fala! Sou o {nome_vendedor}, crio sites para academias. Vi a {nome_empresa} e imaginei um site com planos, horários das aulas e matrícula pelo WhatsApp. Posso te mostrar?",
  "Pet shops":
    "Oi, tudo bem? Sou o {nome_vendedor}, faço sites para pet shops. Vi a {nome_empresa} em {cidade} e pensei num site com serviços de banho e tosa e agendamento. Te mostro uma ideia?",
  Lojas:
    "Olá, tudo bem? Sou o {nome_vendedor}, crio sites e lojas virtuais. Encontrei a {nome_empresa} em {cidade} e tenho uma ideia de vitrine online integrada ao WhatsApp. Posso te mostrar?",
  "Prestadores de serviços":
    "Olá, tudo bem? Sou o {nome_vendedor}, crio sites para prestadores de serviço. Vi a {nome_empresa} e pensei numa landing page que gera orçamentos direto no seu WhatsApp. Quer ver?",
};

export function buildTemplates(): MessageTemplate[] {
  return SEGMENTS.map((s) => ({ id: s, segment: s, text: CUSTOM[s] ?? DEFAULT_MSG }));
}
