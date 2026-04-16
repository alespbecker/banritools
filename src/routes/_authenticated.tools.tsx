import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({
    meta: [
      { title: "Ferramentas — BanriTools" },
      { name: "description", content: "Ferramentas internas de produtividade" },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("tools").select("*").eq("enabled", true).then(({ data }) => setTools(data ?? []));
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Ferramentas</h1>
        <p className="text-sm text-muted-foreground">Acesse as ferramentas internas disponíveis</p>
      </div>
      {tools.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhuma ferramenta disponível ainda.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold text-card-foreground">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
