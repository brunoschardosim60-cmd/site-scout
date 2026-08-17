import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Send, Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { renderTemplate, scoreCompany } from "@/lib/scoring";
import { download } from "@/lib/nexa";
import { CITIES_BY_STATE, STATE_LIST } from "@/lib/geo";
import type { Company } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/disparo")({
  head: () => ({
    meta: [
      { title: "Disparo por nichos — Prospecta" },
      {
        name: "description",
        content:
          "Selecione vários nichos de uma vez e envie a abordagem no WhatsApp com a mensagem do segmento ou uma mensagem igual para todos.",
      },
      { property: "og:title", content: "Disparo por nichos — Prospecta" },
      {
        property: "og:description",
        content: "Envio em massa por segmento, cidade e score, com registro automático de contato.",
      },
    ],
  }),
  component: DisparoPage,
});

type Mode = "por_nicho" | "mesma";

function DisparoPage() {
  const { companies, segments, templates, seller, logContact } = useStore();
  const [picked, setPicked] = useState<string[]>([]);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [minScore, setMinScore] = useState(60);
  const [onlyNoContact, setOnlyNoContact] = useState(true);
  const [limit, setLimit] = useState(30);
  const [mode, setMode] = useState<Mode>("por_nicho");
  const [sameText, setSameText] = useState(
    "Olá {nome_responsavel}, tudo bem? Sou o {nome_vendedor}. Encontrei a {nome_empresa} em {cidade} e tenho uma ideia de site que pode trazer mais clientes para o seu negócio de {segmento}. Posso te mostrar?",
  );
  const [sending, setSending] = useState(false);

  const targets = useMemo(() => {
    const list = companies.filter((c) => {
      if (picked.length && !picked.includes(c.segment)) return false;
      if (state && c.state !== state) return false;
      if (city && c.city !== city) return false;
      if (!c.whatsapp) return false;
      if (onlyNoContact && c.status !== "nao_contatado") return false;
      return scoreCompany(c).score >= minScore;
    });
    return list
      .sort((a, b) => scoreCompany(b).score - scoreCompany(a).score)
      .slice(0, Math.max(1, limit));
  }, [companies, picked, state, city, minScore, onlyNoContact, limit]);

  const messageFor = (c: Company) => {
    const base =
      mode === "mesma" ? sameText : (templates.find((t) => t.segment === c.segment)?.text ?? sameText);
    return renderTemplate(base, {
      nome_empresa: c.name,
      nome_responsavel: c.ownerName ?? "tudo bem",
      segmento: c.segment,
      cidade: c.city,
      nome_vendedor: seller,
    });
  };

  const send = async () => {
    if (!targets.length) return;
    setSending(true);
    for (const c of targets) {
      const url = `https://wa.me/${c.whatsapp!.replace(/\D/g, "")}?text=${encodeURIComponent(messageFor(c))}`;
      window.open(url, "_blank", "noopener");
      logContact(c.id, { channel: "whatsapp", status: "primeiro_contato", message: messageFor(c) });
      await new Promise((r) => setTimeout(r, 900));
    }
    setSending(false);
    toast.success(`${targets.length} conversas abertas e registradas`);
  };

  return (
    <AppShell title="Disparo por nichos" subtitle={`${targets.length} empresas na fila de envio`}>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="surface-card p-4">
            <h2 className="text-sm font-semibold">Nichos (selecione vários)</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {segments.map((s) => {
                const on = picked.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setPicked((p) => (on ? p.filter((x) => x !== s) : [...p, s]))
                    }
                    className={
                      on
                        ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                        : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPicked(segments)}>
                Todos
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPicked([])}>
                Limpar
              </Button>
            </div>
          </div>

          <div className="surface-card space-y-3 p-4">
            <h2 className="text-sm font-semibold">Filtros</h2>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setCity("");
                }}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">Todos estados</option>
                {STATE_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">Todas cidades</option>
                {(state ? (CITIES_BY_STATE[state] ?? []) : []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <label className="block text-xs text-muted-foreground">
              Score mínimo: {minScore}
              <input
                type="range"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={onlyNoContact}
                onChange={(e) => setOnlyNoContact(e.target.checked)}
              />
              Somente ainda não contatados
            </label>
            <label className="block text-xs text-muted-foreground">
              Máximo de envios nesta rodada
              <Input
                type="number"
                min={1}
                max={200}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1"
              />
            </label>
          </div>

          <div className="surface-card space-y-2 p-4">
            <h2 className="text-sm font-semibold">Mensagem</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={mode === "por_nicho" ? "brand" : "outline"}
                onClick={() => setMode("por_nicho")}
              >
                Modelo de cada nicho
              </Button>
              <Button
                size="sm"
                variant={mode === "mesma" ? "brand" : "outline"}
                onClick={() => setMode("mesma")}
              >
                Mesma para todos
              </Button>
            </div>
            {mode === "mesma" && (
              <Textarea rows={6} value={sameText} onChange={(e) => setSameText(e.target.value)} />
            )}
            <p className="text-[11px] text-muted-foreground">
              Variáveis: {"{nome_empresa}"} {"{nome_responsavel}"} {"{segmento}"} {"{cidade}"}{" "}
              {"{nome_vendedor}"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="surface-card flex flex-wrap items-center gap-2 p-4">
            <Button variant="brand" disabled={sending || !targets.length} onClick={() => void send()}>
              <Send className="size-4" /> {sending ? "Enviando…" : `Enviar para ${targets.length}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(targets.map((c) => `${c.name} — ${c.whatsapp}\n${messageFor(c)}`).join("\n\n"))
                  .catch(() => undefined);
                toast.success("Mensagens copiadas");
              }}
            >
              <Copy className="size-4" /> Copiar mensagens
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const csv = [
                  "empresa;segmento;cidade;whatsapp;mensagem",
                  ...targets.map((c) =>
                    [c.name, c.segment, `${c.city}/${c.state}`, c.whatsapp ?? "", messageFor(c).replace(/\n/g, " ")]
                      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                      .join(";"),
                  ),
                ].join("\n");
                download("disparo-nichos.csv", csv, "text/csv");
                toast.success("Lista exportada");
              }}
            >
              <Download className="size-4" /> Exportar CSV
            </Button>
            <p className="text-xs text-muted-foreground">
              O navegador pode pedir permissão para abrir várias abas do WhatsApp.
            </p>
          </div>

          <div className="surface-card max-h-[62vh] space-y-3 overflow-auto p-4">
            {targets.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {c.name} <span className="text-xs text-muted-foreground">· {c.segment} · {c.city}/{c.state}</span>
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      window.open(
                        `https://wa.me/${c.whatsapp!.replace(/\D/g, "")}?text=${encodeURIComponent(messageFor(c))}`,
                        "_blank",
                        "noopener",
                      );
                      logContact(c.id, { channel: "whatsapp", status: "primeiro_contato" });
                    }}
                  >
                    Enviar
                  </Button>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{messageFor(c)}</p>
              </div>
            ))}
            {!targets.length && (
              <p className="text-sm text-muted-foreground">
                Nenhuma empresa com WhatsApp nesses nichos e filtros. Reduza o score mínimo ou selecione mais nichos.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
