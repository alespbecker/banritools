import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
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
  const { isAuthenticated, isLoading, signOut, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    supabase.from("tools").select("*").eq("enabled", true).then(({ data }) => setTools(data ?? []));
  }, []);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar onSignOut={signOut} />
      <div className="flex flex-1 flex-col">
        <Topbar userName={profile?.name ?? null} userRole={userRole} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Ferramentas</h1>
            <p className="text-sm text-muted-foreground">Acesse as ferramentas internas disponíveis</p>
          </div>
          {tools.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-muted-foreground">Nenhuma ferramenta disponível ainda. Em breve novas ferramentas serão adicionadas.</p>
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
        </main>
      </div>
    </div>
  );
}
