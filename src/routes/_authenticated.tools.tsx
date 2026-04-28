import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wrench } from "lucide-react";
import { PageSkeleton, DataGate } from "@/components/PageSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({
    meta: [
      { title: "Ferramentas — BanriTools" },
      { name: "description", content: "Ferramentas internas de produtividade" },
    ],
  }),
  component: ToolsPage,
  pendingComponent: () => <PageSkeleton kpis={0} rows={4} />,
});

type Tool = { id: string; name: string; description: string | null; route: string | null };

function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("tools").select("*").eq("enabled", true).then(({ data }) => {
      setTools((data as Tool[]) ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Wrench className="h-5 w-5 text-[var(--brand-teal)]" aria-hidden="true" />
          Ferramentas
        </h1>
        <p className="text-sm text-muted-foreground">Acesse as ferramentas internas disponíveis</p>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-48" />
              <Skeleton className="mt-2 h-3 w-36" />
            </div>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhuma ferramenta disponível ainda.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <div key={t.id} className="card-hover rounded-lg border border-border bg-card p-5" title={t.description ?? t.name}>
              <h3 className="font-semibold text-card-foreground">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
