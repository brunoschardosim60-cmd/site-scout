import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Activity, Company, FollowUp, MessageTemplate, Proposal, ProspectStatus } from "./types";
import { buildActivities, buildCompanies, buildFollowUps, buildTemplates, SEGMENTS } from "./mock-data";

const KEY = "prospecta.state.v1";

type State = {
  companies: Company[];
  activities: Activity[];
  followups: FollowUp[];
  proposals: Proposal[];
  templates: MessageTemplate[];
  segments: string[];
  seller: string;
};

function seed(): State {
  const companies = buildCompanies();
  return {
    companies,
    activities: buildActivities(companies),
    followups: buildFollowUps(companies),
    proposals: [],
    templates: buildTemplates(),
    segments: SEGMENTS,
    seller: "Bruno",
  };
}

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
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => seed());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState((s) => ({ ...s, ...(JSON.parse(raw) as State) }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const patchCompany = useCallback((id: string, patch: Partial<Company>) => {
    setState((s) => ({
      ...s,
      companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
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
      reset: () => setState(seed()),
    }),
    [state, patchCompany, pushActivity],
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
