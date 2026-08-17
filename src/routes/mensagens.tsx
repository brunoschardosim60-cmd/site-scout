import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/mensagens")({
  head: () => ({
    meta: [
      { title: "Mensagens por nicho — Prospecta" },
      {
        name: "description",
        content: "Modelos de abordagem no WhatsApp para cada segmento, com variáveis personalizáveis.",
      },
      { property: "og:title", content: "Mensagens por nicho — Prospecta" },
      { property: "og:description", content: "Abordagens prontas para restaurantes, clínicas, oficinas e mais." },
    ],
  }),
  component: MensagensPage,
});

function MensagensPage() {
  const { templates, segments, updateTemplate, addSegment, seller, setSeller } = useStore();
  const [newSegment, setNewSegment] = useState("");

  return (
    <AppShell title="Mensagens" subtitle="Modelos de abordagem por segmento">
      <div className="surface-card mb-4 grid gap-3 p-4 md:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Nome do vendedor (variável {"{nome_vendedor}"})</p>
          <Input value={seller} onChange={(e) => setSeller(e.target.value)} className="mt-1" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Adicionar segmento personalizado</p>
          <div className="mt-1 flex gap-2">
            <Input value={newSegment} onChange={(e) => setNewSegment(e.target.value)} placeholder="Ex.: Cafeterias" />
            <Button
              onClick={() => {
                if (!newSegment.trim()) return;
                addSegment(newSegment.trim());
                updateTemplate(
                  newSegment.trim(),
                  "Olá, tudo bem? Sou o {nome_vendedor} e crio sites para empresas de {segmento}. Encontrei a {nome_empresa} em {cidade} e tenho uma ideia que pode trazer mais clientes. Posso te mostrar?",
                );
                setNewSegment("");
                toast.success("Segmento criado");
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground md:col-span-2">
          Variáveis disponíveis: {"{nome_empresa}"} {"{nome_responsavel}"} {"{segmento}"} {"{cidade}"}{" "}
          {"{nome_vendedor}"}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {segments.map((s) => {
          const t = templates.find((x) => x.segment === s);
          return (
            <div key={s} className="surface-card p-4">
              <h2 className="text-sm font-semibold">{s}</h2>
              <Textarea
                rows={5}
                className="mt-2 text-sm"
                value={t?.text ?? ""}
                onChange={(e) => updateTemplate(s, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
