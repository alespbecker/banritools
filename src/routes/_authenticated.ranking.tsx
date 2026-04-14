import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — BanriTools" },
      { name: "description", content: "Ranking de produção da agência" },
    ],
  }),
  component: RankingPage,
});

function RankingPage() {
  const { isAuthenticated, isLoading, signOut, profile, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar onSignOut={signOut} />
      <div className="flex flex-1 flex-col">
        <Topbar userName={profile?.name ?? null} userRole={userRole} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Ranking</h1>
            <p className="text-sm text-muted-foreground">Ranking de produção da agência</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Ranking será disponibilizado para administradores em breve</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
