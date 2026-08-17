import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { NEXA_DEFAULT, NEXA_KEY, NEXA_PATHS, getNexaBase } from "@/lib/nexa";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Prospecta" },
      { name: "description", content: "Ajuste vendedor, integração com o gerador de mini sites e dados demo." },
      { property: "og:title", content: "Configurações — Prospecta" },
      { property: "og:description", content: "Preferências e integrações da plataforma de prospecção." },
    ],
  }),
  component: ConfigPage,
});

function ConfigPage() {
  const { seller, setSeller, reset } = useStore();
  const [nexa, setNexa] = useState(NEXA_DEFAULT);

  useEffect(() => setNexa(getNexaBase()), []);

  return (
    <AppShell title="Configurações" subtitle="Conta, integrações e dados">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card space-y-3 p-4">
          <h2 className="text-sm font-semibold">Perfil</h2>
          <div>
            <Label htmlFor="seller">Nome do vendedor</Label>
            <Input id="seller" value={seller} onChange={(e) => setSeller(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div className="surface-card space-y-3 p-4">
          <h2 className="text-sm font-semibold">Integração — gerador de mini sites (Nexa)</h2>
          <p className="text-xs text-muted-foreground">
            URL de criação para onde o botão "Criar mini site" envia os dados do cliente selecionado.
          </p>
          <Input value={nexa} onChange={(e) => setNexa(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {NEXA_PATHS.map((o) => (
              <Button key={o.value} size="sm" variant={nexa === o.value ? "secondary" : "outline"} onClick={() => setNexa(o.value)}>
                {o.label}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => {
              localStorage.setItem(NEXA_KEY, nexa);
              toast.success("Integração salva");
            }}
          >
            Salvar
          </Button>
        </div>

        <div className="surface-card space-y-3 p-4">
          <h2 className="text-sm font-semibold">Dados</h2>
          <p className="text-xs text-muted-foreground">
            Esta demonstração usa dados fictícios salvos no navegador. Ao conectar o Supabase, a mesma
            estrutura (users, companies, contacts, prospecting, messages, followups, proposals, activities,
            regions, segments) passa a ser persistida no banco com autenticação e RLS.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              reset();
              toast.success("Dados de demonstração restaurados");
            }}
          >
            Restaurar dados de demonstração
          </Button>
        </div>

        <div className="surface-card space-y-2 p-4">
          <h2 className="text-sm font-semibold">Privacidade e LGPD</h2>
          <p className="text-xs text-muted-foreground">
            Utilize somente dados públicos e de fontes permitidas. As análises de site e o score são
            estimativas geradas a partir de sinais disponíveis, não conclusões definitivas.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
