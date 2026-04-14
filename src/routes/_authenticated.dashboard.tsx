import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
import { StatCard } from "@/components/StatCard";
import { GamificationWidgets } from "@/components/GamificationWidgets";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp, DollarSign, BarChart3, Calendar,
  CreditCard, Award,
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BanriTools" },
      { name: "description", content: "Painel de produtividade BanriTools" },
    ],
  }),
  component: DashboardPage,
});

type Report = {
  id: string;
  user_id: string;
  report_date: string;
  seguro_vida: number | null;
  seguro_ap_smart: number | null;
  capitalizacao: number | null;
  seguro_vida_valor: number | null;
  seguro_ap_smart_valor: number | null;
  capitalizacao_valor: number | null;
  credito_minuto_aumento: number | null;
  consignado_volume: number | null;
  credito_fidelidade_volume: number | null;
  recuperacao_estagio_2: number | null;
  recuperacao_estagio_3: number | null;
  pj_conta_empresarial: number | null;
  pj_maquina_vero: number | null;
};

function formatCurrency(v: number): string {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getMonthRange(offset: number): { start: string; end: string; label: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return {
    start: d.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

const barChartConfig: ChartConfig = {
  seguro_vida: { label: "Seguro Vida", color: "hsl(var(--primary))" },
  seguro_ap_smart: { label: "AP Smart", color: "hsl(210, 80%, 60%)" },
  capitalizacao: { label: "Capitalização", color: "hsl(190, 80%, 50%)" },
  credito_minuto_aumento: { label: "Créd. Minuto", color: "hsl(150, 70%, 50%)" },
  pj_conta_empresarial: { label: "PJ Conta", color: "hsl(40, 80%, 55%)" },
  pj_maquina_vero: { label: "PJ Vero", color: "hsl(20, 80%, 55%)" },
};

const lineChartConfig: ChartConfig = {
  total: { label: "Produção Total", color: "hsl(var(--primary))" },
};

function DashboardPage() {
  const { user, isAuthenticated, isLoading, signOut, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);

  const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", user.id)
      .gte("report_date", monthRange.start)
      .lte("report_date", monthRange.end)
      .order("report_date")
      .then(({ data }) => {
        setReports((data as Report[]) ?? []);
      });
  }, [user, monthRange.start, monthRange.end]);

  const stats = useMemo(() => {
    const totalUnits = reports.reduce(
      (s, r) =>
        s + (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0) +
        (r.credito_minuto_aumento ?? 0) + (r.pj_conta_empresarial ?? 0) + (r.pj_maquina_vero ?? 0),
      0
    );
    const volumeFinanceiro = reports.reduce(
      (s, r) => s + Number(r.consignado_volume ?? 0) + Number(r.credito_fidelidade_volume ?? 0), 0
    );
    const totalRecuperacao = reports.reduce(
      (s, r) => s + Number(r.recuperacao_estagio_2 ?? 0) + Number(r.recuperacao_estagio_3 ?? 0), 0
    );
    const totalSeguros = reports.reduce(
      (s, r) => s + (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0), 0
    );
    const totalCredito = volumeFinanceiro;
    const consignadoTotal = reports.reduce((s, r) => s + Number(r.consignado_volume ?? 0), 0);
    const fidelidadeTotal = reports.reduce((s, r) => s + Number(r.credito_fidelidade_volume ?? 0), 0);
    const recup2Total = reports.reduce((s, r) => s + Number(r.recuperacao_estagio_2 ?? 0), 0);
    const recup3Total = reports.reduce((s, r) => s + Number(r.recuperacao_estagio_3 ?? 0), 0);

    return {
      totalUnits, volumeFinanceiro, totalRecuperacao, diasRegistrados: reports.length,
      totalSeguros, totalCredito, consignadoTotal, fidelidadeTotal, recup2Total, recup3Total,
    };
  }, [reports]);

  const productBarData = useMemo(() => {
    const totals: Record<string, number> = {
      "Seguro Vida": 0, "AP Smart": 0, "Capitalização": 0,
      "Créd. Minuto": 0, "PJ Conta": 0, "PJ Vero": 0,
    };
    for (const r of reports) {
      totals["Seguro Vida"] += r.seguro_vida ?? 0;
      totals["AP Smart"] += r.seguro_ap_smart ?? 0;
      totals["Capitalização"] += r.capitalizacao ?? 0;
      totals["Créd. Minuto"] += r.credito_minuto_aumento ?? 0;
      totals["PJ Conta"] += r.pj_conta_empresarial ?? 0;
      totals["PJ Vero"] += r.pj_maquina_vero ?? 0;
    }
    return Object.entries(totals).map(([name, total]) => ({ name, total }));
  }, [reports]);

  const lineData = useMemo(() => {
    return reports.map((r) => ({
      date: new Date(r.report_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      total:
        (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0) +
        (r.credito_minuto_aumento ?? 0) + (r.pj_conta_empresarial ?? 0) + (r.pj_maquina_vero ?? 0),
    }));
  }, [reports]);

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
        <main className="flex-1 space-y-6 p-6">
          {/* Header + Month Filter */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">{monthRange.label}</p>
            </div>
            <Select value={String(monthOffset)} onValueChange={(v) => setMonthOffset(Number(v))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Mês Atual</SelectItem>
                <SelectItem value="-1">Mês Anterior</SelectItem>
                <SelectItem value="-2">{getMonthRange(-2).label}</SelectItem>
                <SelectItem value="-3">{getMonthRange(-3).label}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Top Summary KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Produção Total do Mês" value={stats.totalUnits} icon={BarChart3} description="Unidades de produtos" />
            <StatCard title="Volume Financeiro" value={formatCurrency(stats.volumeFinanceiro)} icon={DollarSign} description="Consignado + Fidelidade" />
            <StatCard title="Total Recuperado" value={formatCurrency(stats.totalRecuperacao)} icon={TrendingUp} description="Estágio 2 + Estágio 3" />
            <StatCard title="Dias Registrados" value={stats.diasRegistrados} icon={Calendar} description="Dias com produção" />
          </div>

          {/* Gamification: Level, Badges, Ranking, Insights */}
          {user && (
            <GamificationWidgets
              userId={user.id}
              agencyId={profile?.agency_id ?? null}
              monthStart={monthRange.start}
            />
          )}

          {/* Product Performance Bar Chart */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Produtos Vendidos no Mês</h2>
            {reports.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Nenhum dado para o período</div>
            ) : (
              <ChartContainer config={barChartConfig} className="h-72 w-full">
                <BarChart data={productBarData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </div>

          {/* Production Over Time Line Chart */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Produção ao Longo do Mês</h2>
            {lineData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Nenhum dado para o período</div>
            ) : (
              <ChartContainer config={lineChartConfig} className="h-72 w-full">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ChartContainer>
            )}
          </div>

          {/* Financial Volume */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Volume Financeiro</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Consignado" value={formatCurrency(stats.consignadoTotal)} icon={CreditCard} />
              <StatCard title="Crédito Fidelidade" value={formatCurrency(stats.fidelidadeTotal)} icon={CreditCard} />
              <StatCard title="Recuperação Est. 2" value={formatCurrency(stats.recup2Total)} icon={TrendingUp} />
              <StatCard title="Recuperação Est. 3" value={formatCurrency(stats.recup3Total)} icon={TrendingUp} />
            </div>
          </div>

          {/* Performance Summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Minha Performance
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-background p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{stats.totalSeguros}</p>
                <p className="text-xs text-muted-foreground">Seguros vendidos</p>
              </div>
              <div className="rounded-md border border-border bg-background p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCredito)}</p>
                <p className="text-xs text-muted-foreground">Crédito gerado</p>
              </div>
              <div className="rounded-md border border-border bg-background p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRecuperacao)}</p>
                <p className="text-xs text-muted-foreground">Recuperação realizada</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
