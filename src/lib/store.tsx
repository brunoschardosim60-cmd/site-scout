import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Activity, Company, FollowUp, MessageTemplate, Proposal, ProspectStatus } from "./types";
import {
  buildActivities,
  buildCompaniesRange,
  buildFollowUps,
  buildTemplates,
  SEGMENTS,
  TOTAL_COMPANIES,
} from "./mock-data";

const KEY = "prospecta.state.v6";

/** Carregamento em etapas: 100 empresas por vez, com teto de memória. */
const CHUNK = 100;
const INITIAL = 300;
const DEFAULT_CAP = 5000;
const CAP_STEP = 5000;
const MAX_CAP = 50000;

type State = {
  companies: Company[];
  activities: Activity[];
  followups: FollowUp[];
  proposals: Proposal[];
  templates: MessageTemplate[];
  segments: string[];
  seller: string;
  /** Alterações feitas pelo usuário nas empresas (as empresas em si não vão pro localStorage). */
  patches: Record<string, Partial<Company>>;
};

/** Lote inicial leve (renderiza rápido); o restante entra em background, 100 em 100. */
function seed(): State {
  const companies = buildCompaniesRange(0, INITIAL);
  return {
    companies,
    activities: buildActivities(companies),
    followups: buildFollowUps(companies),
    proposals: [],
    templates: buildTemplates(),
    segments: SEGMENTS,
    seller: "Bruno",
    patches: {},
  };
}

/** O que realmente vai para o localStorage (empresas/atividades em massa ficam só em memória). */
type Persisted = Pick<State, "proposals" | "templates" | "segments" | "seller" | "patches"> & {
  followups: FollowUp[];
};


type Ctx = State & {
  setStatus: (companyId: string, status: ProspectStatus) => void;
  logContact: (
    companyId: string,
    data: { channel: Activity["channel"]; note?: string; message?: string; status?: ProspectStatus },
  ) => void;
  addNote: (companyId: string, note: string) => void;
  addFollowUp: (companyId: string, dueDate: string, note: string) => void;
  toggleFollowUp: (id: string) => void;
  snoozeFollowUp: (id: string, days: number) => void;
  addProposal: (p: Omit<Proposal, "id" | "createdAt">) => Proposal;
  updateTemplate: (segment: string, text: string) => void;
  addSegment: (name: string) => void;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  setSeller: (name: string) => void;
  /** Total teórico disponível na base gerada. */
  totalAvailable: number;
  /** Teto atual de empresas carregadas em memória. */
  cap: number;
  /** Aumenta o teto (carrega mais 5.000, 100 em 100). */
  loadMoreCompanies: () => void;
  reset: () => void;

};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => seed());
  const [cap, setCap] = useState(DEFAULT_CAP);
  const capRef = useRef(cap);
  capRef.current = cap;


  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Persisted>;
      setState((s) => {
        const patches = saved.patches ?? {};
        return {
          ...s,
          ...saved,
          patches,
          companies: s.companies.map((c) => (patches[c.id] ? { ...c, ...patches[c.id] } : c)),
        };
      });
    } catch {
      /* ignore */
    }
  }, []);

  /** Carrega as empresas em etapas de 100, até o teto atual (evita estourar a memória). */
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const step = () => {
      if (cancelled) return;
      setState((s) => {
        const start = s.companies.length;
        const limit = Math.min(capRef.current, TOTAL_COMPANIES);
        if (start >= limit) return s;
        const batch = buildCompaniesRange(start, Math.min(CHUNK, limit - start));
        const patched = batch.map((c) => (s.patches[c.id] ? { ...c, ...s.patches[c.id] } : c));
        return { ...s, companies: [...s.companies, ...patched] };
      });
      timer = setTimeout(step, 60);
    };
    timer = setTimeout(step, 300);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);


  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const persisted: Persisted = {
          proposals: state.proposals,
          templates: state.templates,
          segments: state.segments,
          seller: state.seller,
          patches: state.patches,
          followups: state.followups,
        };
        localStorage.setItem(KEY, JSON.stringify(persisted));
      } catch {
        /* quota excedida — segue em memória */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [state]);

  const patchCompany = useCallback((id: string, patch: Partial<Company>) => {
    setState((s) => ({
      ...s,
      companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      patches: { ...s.patches, [id]: { ...(s.patches[id] ?? {}), ...patch } },
    }));
  }, []);

  const pushActivity = useCallback((a: Omit<Activity, "id">) => {
    setState((s) => ({ ...s, activities: [{ ...a, id: crypto.randomUUID() }, ...s.activities] }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      updateCompany: patchCompany,
      setSeller: (seller) => setState((s) => ({ ...s, seller })),
      setStatus: (companyId, status) => {
        patchCompany(companyId, { status });
        pushActivity({
          companyId,
          date: new Date().toISOString(),
          type: "status",
          user: state.seller,
          title: `Status alterado para "${status}"`,
        });
      },
      logContact: (companyId, data) => {
        const now = new Date().toISOString();
        patchCompany(companyId, {
          lastContactAt: now,
          ...(data.status ? { status: data.status } : {}),
        });
        pushActivity({
          companyId,
          date: now,
          type: "contato",
          ...(data.channel ? { channel: data.channel } : {}),
          user: state.seller,
          title: `Contato registrado via ${data.channel ?? "outro canal"}`,
          ...(data.note || data.message ? { note: data.note || data.message } : {}),
        });
      },
      addNote: (companyId, note) =>
        pushActivity({
          companyId,
          date: new Date().toISOString(),
          type: "nota",
          user: state.seller,
          title: "Observação adicionada",
          note,
        }),
      addFollowUp: (companyId, dueDate, note) =>
        setState((s) => ({
          ...s,
          followups: [{ id: crypto.randomUUID(), companyId, dueDate, note, done: false }, ...s.followups],
        })),
      toggleFollowUp: (id) =>
        setState((s) => ({
          ...s,
          followups: s.followups.map((f) => (f.id === id ? { ...f, done: !f.done } : f)),
        })),
      snoozeFollowUp: (id, days) =>
        setState((s) => ({
          ...s,
          followups: s.followups.map((f) =>
            f.id === id
              ? {
                  ...f,
                  dueDate: new Date(new Date(f.dueDate).getTime() + days * 86400000)
                    .toISOString()
                    .slice(0, 10),
                }
              : f,
          ),
        })),
      addProposal: (p) => {
        const proposal: Proposal = { ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        setState((s) => ({ ...s, proposals: [proposal, ...s.proposals] }));
        pushActivity({
          companyId: p.companyId,
          date: proposal.createdAt,
          type: "proposta",
          user: state.seller,
          title: `Proposta criada — ${p.type}`,
        });
        return proposal;
      },
      updateTemplate: (segment, text) =>
        setState((s) => ({
          ...s,
          templates: s.templates.some((t) => t.segment === segment)
            ? s.templates.map((t) => (t.segment === segment ? { ...t, text } : t))
            : [...s.templates, { id: segment, segment, text }],
        })),
      addSegment: (name) =>
        setState((s) =>
          s.segments.includes(name) ? s : { ...s, segments: [...s.segments, name].sort() },
        ),
      totalAvailable: TOTAL_COMPANIES,
      cap,
      loadMoreCompanies: () => setCap((c) => Math.min(c + CAP_STEP, MAX_CAP, TOTAL_COMPANIES)),
      reset: () => setState(seed()),
    }),
    [state, cap, patchCompany, pushActivity],
  );


  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useCompany(id: string) {
  const { companies } = useStore();
  return companies.find((c) => c.id === id);
}
