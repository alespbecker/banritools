import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
import { StatCard } from "@/components/StatCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BanriTools" },
      { name: "description", content: "Painel de produtividade BanriTools" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated, isLoading, signOut, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReports: 0,
    totalSeguros: 0,
    totalVolume: 0,
    totalRecuperacao: 0,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

    supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", user.id)
      .gte("report_date", startOfMonth)
      .then(({ data }) => {
        if (!data) return;
        setStats({
          totalReports: data.length,
          totalSeguros: data.reduce(
            (sum, r) => sum + (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0),
            0
          ),
          totalVolume: data.reduce(
            (sum, r) => sum + Number(r.consignado_volume ?? 0) + Number(r.credito_fidelidade_volume ?? 0),
            0
          ),
          totalRecuperacao: data.reduce(
            (sum, r) => sum + Number(r.recuperacao_estagio_2 ?? 0) + Number(r.recuperacao_estagio_3 ?? 0),
            0
          ),
        });
      });
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar onSignOut={signOut} />
      <div className="flex flex-1 flex-col">
        <Topbar userName={profile?.name ?? null} userRole={userRole} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Resumo da sua produção mensal</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Relatórios do Mês"
              value={stats.totalReports}
              icon={BarChart3}
              description="Dias registrados"
            />
            <StatCard
              title="Total Seguros"
              value={stats.totalSeguros}
              icon={Shield}
              description="Vida + AP Smart + Capitalização"
            />
            <StatCard
              title="Volume Crédito"
              value={`R$ ${stats.totalVolume.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              description="Consignado + Fidelidade"
            />
            <StatCard
              title="Recuperação"
              value={`R$ ${stats.totalRecuperacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              description="Estágio 2 + Estágio 3"
            />
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">Gráficos de Produção</h2>
            <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Gráficos serão adicionados em breve</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
