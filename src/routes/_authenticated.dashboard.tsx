import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
// Dashboard pessoal — disponível para TODOS (admins e usuários).
// Visão de time / ranking-da-agência fica em /admin (apenas admins).
import { StatCard } from "@/components/StatCard";
import { GamificationWidgets } from "@/components/GamificationWidgets";
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp, DollarSign, BarChart3, Calendar,
  CreditCard, User,
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

import { PageSkeleton, DataGate } from "@/components/PageSkeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BanriTools" },
      { name: "description", content: "Painel de produtividade BanriTools" },
    ],
  }),
  component: DashboardPage,
  pendingComponent: () => <PageSkeleton kpis={4} rows={6} />,
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
  total: { label: "Unidades", color: "hsl(var(--primary))" },
};

const lineChartConfig: ChartConfig = {
  total: { label: "Produção Total", color: "hsl(var(--primary))" },
};

function DashboardPage() {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [gamificationReady, setGamificationReady] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset]);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", user.id)
      .gte("report_date", monthRange.start)
      .lte("report_date", monthRange.end)
      .order("report_date");
    setReports((data as Report[]) ?? []);
    setLoading(false);
  }, [user, monthRange.start, monthRange.end]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Realtime + manual sync — agrupado num único listener
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("dashboard-reports")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "daily_reports", filter: `user_id=eq.${user.id}` },
        () => fetchReports()
      )
      .subscribe();
    const handler = () => fetchReports();
    window.addEventListener("banritools:sync", handler);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("banritools:sync", handler);
    };
  }, [user, fetchReports]);

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
    const consignadoTotal = reports.reduce((s, r) => s + Number(r.consignado_volume ?? 0), 0);
    const recup2Total = reports.reduce((s, r) => s + Number(r.recuperacao_estagio_2 ?? 0), 0);
    const recup3Total = reports.reduce((s, r) => s + Number(r.recuperacao_estagio_3 ?? 0), 0);

    return {
      totalUnits, volumeFinanceiro, totalRecuperacao, diasRegistrados: reports.length,
      totalSeguros, totalCredito: volumeFinanceiro, consignadoTotal, recup2Total, recup3Total,
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

  // Mostra skeleton de página inteira na primeira carga, esperando TANTO
  // os reports quanto a gamificação — evita pop-in de cards/ranking depois
  // do conteúdo principal já estar visível.
  const initialLoading = (loading && reports.length === 0) || !gamificationReady;

  return (
    <DataGate
      loading={initialLoading}
      skeleton={<PageSkeleton kpis={4} rows={6} />}
    >
      <div className="space-y-7">
        {/* Header + Month Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
                title="Esta visão mostra apenas a sua produção pessoal"
              >
                <User className="h-3 w-3" aria-hidden="true" />
                Pessoal
              </span>
              <p className="text-xs text-muted-foreground">{monthRange.label}</p>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Olá{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Aqui está o resumo da sua produção no período.
            </p>
          </div>
          <Select value={String(monthOffset)} onValueChange={(v) => setMonthOffset(Number(v))}>
            <SelectTrigger
              className="w-48"
              aria-label="Selecionar mês de referência do dashboard"
              title="Trocar o período exibido"
            >
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

        {/* Top Summary KPIs — visão geral */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard tone="primary" title="Produção Total" value={stats.totalUnits} icon={BarChart3} description="Unidades" hint="Soma de todas as unidades vendidas no período" />
          <StatCard tone="success" title="Vol. Financeiro" value={formatCurrency(stats.volumeFinanceiro)} icon={DollarSign} description="Consignado" hint="Volume total de crédito gerado" />
          <StatCard tone="teal"    title="Total Recuperado" value={formatCurrency(stats.totalRecuperacao)} icon={TrendingUp} description="Est. 2 + Est. 3" hint="Valores recuperados nos estágios 2 e 3" />
          <StatCard tone="violet"  title="Dias Registrados" value={stats.diasRegistrados} icon={Calendar} description="Com produção" hint="Quantos dias do mês tiveram lançamentos" />
        </div>

        {/* Gamification — pontos, nível, badges */}
        {user && (
          <GamificationWidgets
            userId={user.id}
            agencyId={profile?.agency_id ?? null}
            monthStart={monthRange.start}
            onReady={() => setGamificationReady(true)}
          />
        )}

        {/* Recuperação detalhada — desdobra o KPI Total Recuperado */}
        <section aria-label="Recuperação detalhada por estágio">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recuperação detalhada
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <StatCard tone="primary"     title="Consignado"    value={formatCurrency(stats.consignadoTotal)} icon={CreditCard} hint="Volume total de crédito consignado" />
            <StatCard tone="warning"     title="Recup. Est. 2" value={formatCurrency(stats.recup2Total)}     icon={TrendingUp} hint="Recuperação no estágio 2" />
            <StatCard tone="destructive" title="Recup. Est. 3" value={formatCurrency(stats.recup3Total)}     icon={TrendingUp} hint="Recuperação no estágio 3" />
          </div>
        </section>

        {/* Product Performance Bar Chart */}
        <section
          className="card-hover rounded-xl border border-border bg-card p-5 sm:p-6"
          aria-label="Distribuição de produtos vendidos no período"
        >
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Produtos Vendidos</h2>
          {reports.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Nenhum dado para o período
            </div>
          ) : (
            <ChartContainer config={barChartConfig} className="h-72 w-full">
              <BarChart data={productBarData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </section>

        {/* Line Chart */}
        <section
          className="card-hover animate-fade-in-up rounded-xl border border-border bg-card p-5 sm:p-6"
          aria-label="Produção total ao longo do mês"
        >
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Produção ao Longo do Mês</h2>
          {lineData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Nenhum dado para o período
            </div>
          ) : (
            <ChartContainer config={lineChartConfig} className="h-72 w-full">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          )}
        </section>
      </div>
    </DataGate>
  );
}
