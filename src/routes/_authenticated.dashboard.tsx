import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
// Personal dashboard — focused on user's own production + agency ranking summary.
// Admin-wide overview lives at /admin.
import { StatCard } from "@/components/StatCard";
import { GamificationWidgets } from "@/components/GamificationWidgets";
import { useEffect, useState, useMemo, useCallback } from "react";
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
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);

  const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset]);

  // Admins land on /admin by default
  useEffect(() => {
    if (userRole === "admin") {
      navigate({ to: "/admin" });
    }
  }, [userRole, navigate]);

  const fetchReports = useCallback(() => {
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

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("dashboard-reports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_reports" },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchReports]);

  // Manual sync
  useEffect(() => {
    const handler = () => fetchReports();
    window.addEventListener("banritools:sync", handler);
    return () => window.removeEventListener("banritools:sync", handler);
  }, [fetchReports]);

  const stats = useMemo(() => {
    const totalUnits = reports.reduce(
      (s, r) =>
        s + (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0) +
        (r.credito_minuto_aumento ?? 0) + (r.pj_conta_empresarial ?? 0) + (r.pj_maquina_vero ?? 0),
      0
    );
    const volumeFinanceiro = reports.reduce(
      (s, r) => s + Number(r.consignado_volume ?? 0), 0
    );
    const totalRecuperacao = reports.reduce(
      (s, r) => s + Number(r.recuperacao_estagio_2 ?? 0) + Number(r.recuperacao_estagio_3 ?? 0), 0
    );
    const totalSeguros = reports.reduce(
      (s, r) => s + (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0), 0
    );
    const totalCredito = volumeFinanceiro;
    const consignadoTotal = reports.reduce((s, r) => s + Number(r.consignado_volume ?? 0), 0);
    const recup2Total = reports.reduce((s, r) => s + Number(r.recuperacao_estagio_2 ?? 0), 0);
    const recup3Total = reports.reduce((s, r) => s + Number(r.recuperacao_estagio_3 ?? 0), 0);

    return {
      totalUnits, volumeFinanceiro, totalRecuperacao, diasRegistrados: reports.length,
      totalSeguros, totalCredito, consignadoTotal, recup2Total, recup3Total,
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

  return (
    <div className="space-y-6">
      {/* Header + Month Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Meu Dashboard</h1>
          <p className="text-sm text-muted-foreground">{monthRange.label} • Sua produção pessoal</p>
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Produção Total" value={stats.totalUnits} icon={BarChart3} description="Unidades" />
        <StatCard title="Vol. Financeiro" value={formatCurrency(stats.volumeFinanceiro)} icon={DollarSign} description="Consig. + Fidel." />
        <StatCard title="Total Recuperado" value={formatCurrency(stats.totalRecuperacao)} icon={TrendingUp} description="Est. 2 + Est. 3" />
        <StatCard title="Dias Registrados" value={stats.diasRegistrados} icon={Calendar} description="Com produção" />
      </div>

      {/* Gamification */}
      {user && (
        <GamificationWidgets
          userId={user.id}
          agencyId={profile?.agency_id ?? null}
          monthStart={monthRange.start}
        />
      )}

      {/* Product Performance Bar Chart */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">Produtos Vendidos</h2>
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

      {/* Line Chart */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
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
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <StatCard title="Consignado" value={formatCurrency(stats.consignadoTotal)} icon={CreditCard} />
          <StatCard title="Recup. Est. 2" value={formatCurrency(stats.recup2Total)} icon={TrendingUp} />
          <StatCard title="Recup. Est. 3" value={formatCurrency(stats.recup3Total)} icon={TrendingUp} />
        </div>
      </div>

      {/* Performance Summary */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Minha Performance
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
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
    </div>
  );
}
