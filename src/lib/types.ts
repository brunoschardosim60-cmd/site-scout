export type ProspectStatus =
  | "nao_contatado"
  | "primeiro_contato"
  | "aguardando_resposta"
  | "respondeu"
  | "interessado"
  | "reuniao_marcada"
  | "proposta_enviada"
  | "negociacao"
  | "cliente_fechado"
  | "cliente_perdido"
  | "sem_interesse"
  | "contatar_novamente";

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  nao_contatado: "Não contatado",
  primeiro_contato: "Primeiro contato",
  aguardando_resposta: "Aguardando resposta",
  respondeu: "Respondeu",
  interessado: "Interessado",
  reuniao_marcada: "Reunião marcada",
  proposta_enviada: "Proposta enviada",
  negociacao: "Negociação",
  cliente_fechado: "Cliente fechado",
  cliente_perdido: "Cliente perdido",
  sem_interesse: "Sem interesse",
  contatar_novamente: "Contatar novamente",
};

export const STATUS_ORDER: ProspectStatus[] = Object.keys(STATUS_LABELS) as ProspectStatus[];

export type SiteAnalysis = {
  hasSite: boolean;
  url?: string;
  reachable?: boolean;
  responsive?: boolean;
  looksUpdated?: boolean;
  https?: boolean;
  professional?: boolean;
  contactForm?: boolean;
  whatsappButton?: boolean;
  googleMaps?: boolean;
  socialLinks?: boolean;
};

export type Activity = {
  id: string;
  companyId: string;
  date: string; // ISO
  type: "contato" | "nota" | "status" | "proposta" | "followup";
  channel?: "whatsapp" | "telefone" | "email" | "instagram" | "presencial";
  user: string;
  title: string;
  note?: string;
};

export type FollowUp = {
  id: string;
  companyId: string;
  dueDate: string; // ISO date
  note: string;
  done: boolean;
};

export type Proposal = {
  id: string;
  companyId: string;
  type: "Mini Site" | "Landing Page" | "Site Institucional" | "Site Completo" | "E-commerce";
  value: number;
  deadlineDays: number;
  services: string[];
  notes?: string;
  createdAt: string;
};

export type Company = {
  id: string;
  name: string; // nome fantasia
  legalName?: string;
  cnpj?: string;
  cpf?: string;
  ownerName?: string;
  ownerRole?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address: string;
  district: string;
  city: string;
  state: string;
  zip: string;
  segment: string;
  instagram?: string;
  facebook?: string;
  mapsUrl?: string;
  notes?: string;
  createdAt: string;
  lastContactAt?: string;
  lat: number;
  lng: number;
  rating?: number;
  reviews?: number;
  brandColor: string;
  logoText: string;
  site: SiteAnalysis;
  status: ProspectStatus;
};

export type MessageTemplate = {
  id: string;
  segment: string;
  text: string;
};
