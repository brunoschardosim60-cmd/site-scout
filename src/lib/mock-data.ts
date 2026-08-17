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

const CITIES: {
  city: string;
  state: string;
  lat: number;
  lng: number;
  ddd: string;
  districts: string[];
}[] = [
  { city: "Porto Alegre", state: "RS", lat: -30.0346, lng: -51.2177, ddd: "51", districts: ["Moinhos de Vento", "Cidade Baixa", "Petrópolis", "Menino Deus", "Centro Histórico"] },
  { city: "Canoas", state: "RS", lat: -29.9177, lng: -51.1836, ddd: "51", districts: ["Centro", "Nossa Senhora das Graças", "Marechal Rondon", "Igara"] },
  { city: "São Leopoldo", state: "RS", lat: -29.7604, lng: -51.1471, ddd: "51", districts: ["Centro", "Rio Branco", "Campina"] },
  { city: "Novo Hamburgo", state: "RS", lat: -29.6783, lng: -51.1306, ddd: "51", districts: ["Centro", "Rio Branco", "Ideal"] },
  { city: "Gravataí", state: "RS", lat: -29.9444, lng: -50.9919, ddd: "51", districts: ["Centro", "Parque dos Anjos", "Bom Sucesso"] },
  { city: "Esteio", state: "RS", lat: -29.8608, lng: -51.1789, ddd: "51", districts: ["Centro", "Primavera"] },
  { city: "Caxias do Sul", state: "RS", lat: -29.1685, lng: -51.1796, ddd: "54", districts: ["Centro", "São Pelegrino", "Panazzolo"] },
  { city: "Pelotas", state: "RS", lat: -31.7654, lng: -52.3376, ddd: "53", districts: ["Centro", "Areal", "Fragata"] },
  { city: "Santa Maria", state: "RS", lat: -29.6842, lng: -53.8069, ddd: "55", districts: ["Centro", "Camobi", "Nossa Senhora de Fátima"] },
  { city: "Passo Fundo", state: "RS", lat: -28.2624, lng: -52.4069, ddd: "54", districts: ["Centro", "Boqueirão", "Petrópolis"] },
  { city: "Rio Grande", state: "RS", lat: -32.035, lng: -52.0986, ddd: "53", districts: ["Centro", "Cassino"] },
  { city: "Viamão", state: "RS", lat: -30.0811, lng: -51.0233, ddd: "51", districts: ["Centro", "Tarumã"] },
  { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333, ddd: "11", districts: ["Pinheiros", "Moema", "Tatuapé", "Santana", "Vila Mariana", "Itaim Bibi"] },
  { city: "Guarulhos", state: "SP", lat: -23.4543, lng: -46.5337, ddd: "11", districts: ["Centro", "Vila Galvão", "Macedo"] },
  { city: "Campinas", state: "SP", lat: -22.9099, lng: -47.0626, ddd: "19", districts: ["Cambuí", "Barão Geraldo", "Centro"] },
  { city: "Santo André", state: "SP", lat: -23.6639, lng: -46.5383, ddd: "11", districts: ["Centro", "Vila Assunção"] },
  { city: "São Bernardo do Campo", state: "SP", lat: -23.6939, lng: -46.565, ddd: "11", districts: ["Centro", "Rudge Ramos"] },
  { city: "Osasco", state: "SP", lat: -23.5324, lng: -46.7916, ddd: "11", districts: ["Centro", "Bela Vista"] },
  { city: "Ribeirão Preto", state: "SP", lat: -21.1775, lng: -47.8103, ddd: "16", districts: ["Centro", "Jardim Irajá"] },
  { city: "Sorocaba", state: "SP", lat: -23.5015, lng: -47.4526, ddd: "15", districts: ["Centro", "Campolim"] },
  { city: "São José dos Campos", state: "SP", lat: -23.1896, lng: -45.8841, ddd: "12", districts: ["Centro", "Jardim Aquarius"] },
  { city: "Santos", state: "SP", lat: -23.9608, lng: -46.3336, ddd: "13", districts: ["Gonzaga", "Boqueirão", "Centro"] },
  { city: "Bauru", state: "SP", lat: -22.3145, lng: -49.0606, ddd: "14", districts: ["Centro", "Vila Aviação"] },
  { city: "Piracicaba", state: "SP", lat: -22.7253, lng: -47.6492, ddd: "19", districts: ["Centro", "Nova América"] },
  { city: "Salvador", state: "BA", lat: -12.9777, lng: -38.5016, ddd: "71", districts: ["Barra", "Pituba", "Rio Vermelho", "Itaigara", "Ondina"] },
  { city: "Feira de Santana", state: "BA", lat: -12.2664, lng: -38.9663, ddd: "75", districts: ["Centro", "Kalilândia", "Muchila"] },
  { city: "Vitória da Conquista", state: "BA", lat: -14.8619, lng: -40.8444, ddd: "77", districts: ["Centro", "Candeias"] },
  { city: "Camaçari", state: "BA", lat: -12.6996, lng: -38.3242, ddd: "71", districts: ["Centro", "Gleba B"] },
  { city: "Ilhéus", state: "BA", lat: -14.788, lng: -39.0492, ddd: "73", districts: ["Centro", "Pontal"] },
  { city: "Juazeiro", state: "BA", lat: -9.4111, lng: -40.4986, ddd: "74", districts: ["Centro", "Santo Antônio"] },
  { city: "Porto Seguro", state: "BA", lat: -16.4497, lng: -39.0647, ddd: "73", districts: ["Centro", "Arraial d'Ajuda"] },
  { city: "Lauro de Freitas", state: "BA", lat: -12.8944, lng: -38.3272, ddd: "71", districts: ["Centro", "Vilas do Atlântico"] },
  { city: "Rio de Janeiro", state: "RJ", lat: -22.9068, lng: -43.1729, ddd: "21", districts: ["Copacabana", "Tijuca", "Barra da Tijuca", "Botafogo"] },
  { city: "Niterói", state: "RJ", lat: -22.8832, lng: -43.1034, ddd: "21", districts: ["Icaraí", "Centro"] },
  { city: "Belo Horizonte", state: "MG", lat: -19.9167, lng: -43.9345, ddd: "31", districts: ["Savassi", "Lourdes", "Pampulha"] },
  { city: "Uberlândia", state: "MG", lat: -18.9186, lng: -48.2772, ddd: "34", districts: ["Centro", "Santa Mônica"] },
  { city: "Juiz de Fora", state: "MG", lat: -21.7642, lng: -43.3503, ddd: "32", districts: ["Centro", "São Mateus"] },
  { city: "Curitiba", state: "PR", lat: -25.4284, lng: -49.2733, ddd: "41", districts: ["Batel", "Água Verde", "Centro"] },
  { city: "Londrina", state: "PR", lat: -23.3045, lng: -51.1696, ddd: "43", districts: ["Centro", "Gleba Palhano"] },
  { city: "Maringá", state: "PR", lat: -23.4205, lng: -51.9331, ddd: "44", districts: ["Zona 7", "Centro"] },
  { city: "Florianópolis", state: "SC", lat: -27.5949, lng: -48.5482, ddd: "48", districts: ["Centro", "Trindade", "Lagoa da Conceição"] },
  { city: "Joinville", state: "SC", lat: -26.3044, lng: -48.8456, ddd: "47", districts: ["Centro", "América"] },
  { city: "Blumenau", state: "SC", lat: -26.9194, lng: -49.0661, ddd: "47", districts: ["Centro", "Velha"] },
  { city: "Chapecó", state: "SC", lat: -27.1004, lng: -52.6152, ddd: "49", districts: ["Centro", "Passo dos Fortes"] },
  { city: "Goiânia", state: "GO", lat: -16.6869, lng: -49.2648, ddd: "62", districts: ["Setor Bueno", "Setor Marista"] },
  { city: "Brasília", state: "DF", lat: -15.7939, lng: -47.8828, ddd: "61", districts: ["Asa Sul", "Asa Norte", "Águas Claras"] },
  { city: "Recife", state: "PE", lat: -8.0476, lng: -34.877, ddd: "81", districts: ["Boa Viagem", "Espinheiro", "Casa Forte"] },
  { city: "Fortaleza", state: "CE", lat: -3.7319, lng: -38.5267, ddd: "85", districts: ["Meireles", "Aldeota", "Praia de Iracema"] },
  { city: "Natal", state: "RN", lat: -5.7945, lng: -35.211, ddd: "84", districts: ["Ponta Negra", "Tirol"] },
  { city: "João Pessoa", state: "PB", lat: -7.1195, lng: -34.845, ddd: "83", districts: ["Manaíra", "Tambaú"] },
  { city: "Maceió", state: "AL", lat: -9.6498, lng: -35.7089, ddd: "82", districts: ["Ponta Verde", "Jatiúca"] },
  { city: "Aracaju", state: "SE", lat: -10.9472, lng: -37.0731, ddd: "79", districts: ["Atalaia", "Jardins"] },
  { city: "São Luís", state: "MA", lat: -2.5307, lng: -44.3068, ddd: "98", districts: ["Renascença", "Cohama"] },
  { city: "Teresina", state: "PI", lat: -5.0892, lng: -42.8019, ddd: "86", districts: ["Jóquei", "Centro"] },
  { city: "Belém", state: "PA", lat: -1.4558, lng: -48.4902, ddd: "91", districts: ["Nazaré", "Umarizal"] },
  { city: "Manaus", state: "AM", lat: -3.119, lng: -60.0217, ddd: "92", districts: ["Adrianópolis", "Centro"] },
  { city: "Cuiabá", state: "MT", lat: -15.6014, lng: -56.0979, ddd: "65", districts: ["Centro Norte", "Jardim Itália"] },
  { city: "Campo Grande", state: "MS", lat: -20.4697, lng: -54.6201, ddd: "67", districts: ["Centro", "Jardim dos Estados"] },
  { city: "Vitória", state: "ES", lat: -20.3155, lng: -40.3128, ddd: "27", districts: ["Praia do Canto", "Jardim da Penha"] },
  { city: "Palmas", state: "TO", lat: -10.1849, lng: -48.3336, ddd: "63", districts: ["Plano Diretor Sul", "Centro"] },
  { city: "Porto Velho", state: "RO", lat: -8.7612, lng: -63.9004, ddd: "69", districts: ["Centro", "Nova Porto Velho"] },
  { city: "Rio Branco", state: "AC", lat: -9.9754, lng: -67.8249, ddd: "68", districts: ["Centro", "Bosque"] },
  { city: "Macapá", state: "AP", lat: 0.0349, lng: -51.0694, ddd: "96", districts: ["Centro", "Trem"] },
  { city: "Boa Vista", state: "RR", lat: 2.8235, lng: -60.6758, ddd: "95", districts: ["Centro", "Paraviana"] },
];

export const ALL_CITIES = CITIES;
export const STATES = Array.from(new Set(CITIES.map((c) => c.state))).sort();

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

export const PER_CITY = 10000;
export const CITY_COUNT = CITIES.length;

/** Cria UMA empresa determinística a partir do índice global. */
function makeCompany(i: number, cityIndex: number): Company {
  const loc = CITIES[cityIndex]!;
  const rnd = mulberry32(20260817 + cityIndex * 7919 + i * 2654435761);
  const list: Company[] = [];
  {
    {
    const seg = pick(SEGMENTS, rnd());
    const district = pick(loc.districts, rnd());
    const name = `${pick(PREFIX[seg] ?? ["Empresa"], rnd())} ${pick(SUFFIX, rnd())}`;
    const hasSite = rnd() > 0.42;
    const quality = rnd();
    const status = pick(STATUSES, rnd());
    const contacted = status !== "nao_contatado";
    const slug = `${name} ${loc.city}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]+/g, "");
    const whatsapp = rnd() > 0.18 ? `55${loc.ddd}9${String(80000000 + i * 137).slice(0, 8)}` : undefined;
    const instagram = rnd() > 0.3 ? `@${slug}` : undefined;
    const facebook = rnd() > 0.6 ? `/${slug}` : undefined;
    const lastContactAt = contacted
      ? new Date(NOW - Math.floor(rnd() * 40) * DAY).toISOString()
      : undefined;
    list.push({
      ...(whatsapp ? { whatsapp } : {}),
      ...(instagram ? { instagram } : {}),
      ...(facebook ? { facebook } : {}),
      ...(lastContactAt ? { lastContactAt } : {}),
      id: `c${i + 1}`,
      name,
      legalName: `${name} Ltda`,
      cnpj: `${10 + (i % 80)}.${String(100 + i).slice(0, 3)}.${String(200 + i).slice(0, 3)}/0001-${String(10 + (i % 80))}`,
      ownerName: pick(OWNERS, rnd()),
      ownerRole: "Proprietário(a)",
      phone: `(${loc.ddd}) 3${String(1000 + i).slice(0, 3)}-${String(1000 + i * 7).slice(0, 4)}`,
      email: `contato@${slug}.com.br`,
      address: `Rua ${pick(SUFFIX, rnd())}, ${100 + Math.floor(rnd() * 1800)}`,
      district,
      city: loc.city,
      state: loc.state,
      zip: `${String(10 + (i % 89))}${String(100 + (i % 900)).slice(0, 3)}-${String(100 + (i % 800)).slice(0, 3)}`,
      segment: seg,
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(name + " " + loc.city)}`,
      createdAt: new Date(NOW - Math.floor(rnd() * 120) * DAY).toISOString(),
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
  }
  return list;
}

/** Gera `perCity` empresas para CADA cidade (uso: geração completa de uma vez). */
export function buildCompanies(perCity = PER_CITY): Company[] {
  const out: Company[] = [];
  for (let i = 0; i < CITIES.length; i++) out.push(...buildCityCompanies(i, perCity));
  return out;
}

/** Histórico só das primeiras `max` empresas — evita milhões de objetos em memória. */
export function buildActivities(companies: Company[], max = 4000): Activity[] {
  const acts: Activity[] = [];
  companies.slice(0, max).forEach((c, i) => {
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

export function buildFollowUps(companies: Company[], max = 4000): FollowUp[] {
  const rnd = mulberry32(7);
  const out: FollowUp[] = [];
  companies.slice(0, max).forEach((c, i) => {
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
