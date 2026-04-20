import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/StatCard";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, TrendingUp, DollarSign, BarChart3, Calendar, Award, Shield,
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — BanriTools" },
      { name: "description", content: "Painel administrativo da agência" },
    ],
  }),
  component: AdminDashboardPage,
});

type AgencyReport = {
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

type ProfileLite = { id: string; name: string | null; email: string | null };

function fmtBRL(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getMonthRange(offset: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return {
    start: d.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
    monthFirst: d.toISOString().split("T")[0],
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

const chartConfig: ChartConfig = {
  total: { label: "Pontos", color: "hsl(var(--primary))" },
};

function AdminDashboardPage() {
  const { userRole, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<AgencyReport[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [ranking, setRanking] = useState<{ user_id: string; points: number; position: number }[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset]);

  // Guard: only admins
  useEffect(() => {
    if (!isLoading && userRole && userRole !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [isLoading, userRole, navigate]);

  const agencyId = profile?.agency_id ?? null;

  const fetchAll = useCallback(() => {
    if (!agencyId) return;

    supabase
      .from("daily_reports")
      .select("user_id, report_date, seguro_vida, seguro_ap_smart, capitalizacao, seguro_vida_valor, seguro_ap_smart_valor, capitalizacao_valor, credito_minuto_aumento, consignado_volume, credito_fidelidade_volume, recuperacao_estagio_2, recuperacao_estagio_3, pj_conta_empresarial, pj_maquina_vero")
      .eq("agency_id", agencyId)
      .gte("report_date", monthRange.start)
      .lte("report_date", monthRange.end)
      .then(({ data }) => setReports((data as AgencyReport[]) ?? []));

    supabase
      .from("profiles")
      .select("id, name, email")
      .eq("agency_id", agencyId)
      .then(({ data }) => setProfiles((data as ProfileLite[]) ?? []));

    supabase
      .from("ranking_monthly")
      .select("user_id, points, position")
      .eq("agency_id", agencyId)
      .eq("month", monthRange.monthFirst)
      .order("position")
      .then(({ data }) => setRanking((data as { user_id: string; points: number; position: number }[]) ?? []));
  }, [agencyId, monthRange.start, monthRange.end, monthRange.monthFirst]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime sync
  useEffect(() => {
    if (!agencyId) return;
    const channel = supabase
      .channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_reports" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "ranking_monthly" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [agencyId, fetchAll]);

  // Manual sync event
  useEffect(() => {
    const handler = () => fetchAll();
    window.addEventListener("banritools:sync", handler);
    return () => window.removeEventListener("banritools:sync", handler);
  }, [fetchAll]);

  const profileMap = useMemo(() => {
    const m = new Map<string, ProfileLite>();
    for (const p of profiles) m.set(p.id, p);
    return m;
  }, [profiles]);

  const stats = useMemo(() => {
    const totalUnits = reports.reduce(
      (s, r) =>
        s + (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0) +
        (r.credito_minuto_aumento ?? 0) + (r.pj_conta_empresarial ?? 0) + (r.pj_maquina_vero ?? 0), 0
    );
    const volFinanceiro = reports.reduce(
      (s, r) => s + Number(r.consignado_volume ?? 0) + Number(r.credito_fidelidade_volume ?? 0), 0
    );
    const recuperado = reports.reduce(
      (s, r) => s + Number(r.recuperacao_estagio_2 ?? 0) + Number(r.recuperacao_estagio_3 ?? 0), 0
    );
    const segurosValor = reports.reduce(
      (s, r) => s + Number(r.seguro_vida_valor ?? 0) + Number(r.seguro_ap_smart_valor ?? 0) + Number(r.capitalizacao_valor ?? 0), 0
    );
    const activeUsers = new Set(reports.map((r) => r.user_id)).size;
    return { totalUnits, volFinanceiro, recuperado, segurosValor, activeUsers };
  }, [reports]);

  // Per-user aggregation
  const perUser = useMemo(() => {
    const map = new Map<string, {
      user_id: string;
      units: number;
      volume: number;
      recuperado: number;
      seguros: number;
      dias: Set<string>;
    }>();
    for (const r of reports) {
      const cur = map.get(r.user_id) ?? {
        user_id: r.user_id, units: 0, volume: 0, recuperado: 0, seguros: 0, dias: new Set<string>(),
      };
      cur.units += (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0) +
        (r.credito_minuto_aumento ?? 0) + (r.pj_conta_empresarial ?? 0) + (r.pj_maquina_vero ?? 0);
      cur.volume += Number(r.consignado_volume ?? 0) + Number(r.credito_fidelidade_volume ?? 0);
      cur.recuperado += Number(r.recuperacao_estagio_2 ?? 0) + Number(r.recuperacao_estagio_3 ?? 0);
      cur.seguros += (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0);
      cur.dias.add(r.report_date);
      map.set(r.user_id, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.units - a.units);
  }, [reports]);

  // Inactive members (no reports in period)
  const inactives = useMemo(() => {
    const activeIds = new Set(perUser.map((u) => u.user_id));
    return profiles.filter((p) => !activeIds.has(p.id));
  }, [profiles, perUser]);

  const rankingChart = useMemo(() => {
    return ranking.slice(0, 10).map((r) => ({
      name: profileMap.get(r.user_id)?.name?.split(" ")[0] ?? "—",
      total: r.points,
    }));
  }, [ranking, profileMap]);

  if (isLoading || (userRole && userRole !== "admin")) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Verificando permissão...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Painel Administrativo
          </h1>
          <p className="text-sm text-muted-foreground">{monthRange.label} • Visão completa da agência</p>
        </div>
        <Select value={String(monthOffset)} onValueChange={(v) => setMonthOffset(Number(v))}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Mês Atual</SelectItem>
            <SelectItem value="-1">Mês Anterior</SelectItem>
            <SelectItem value="-2">{getMonthRange(-2).label}</SelectItem>
            <SelectItem value="-3">{getMonthRange(-3).label}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agency KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Colaboradores Ativos" value={`${stats.activeUsers}/${profiles.length}`} icon={Users} description="Com produção" />
        <StatCard title="Produção Total" value={stats.totalUnits} icon={BarChart3} description="Unidades agência" />
        <StatCard title="Vol. Financeiro" value={fmtBRL(stats.volFinanceiro)} icon={DollarSign} description="Toda agência" />
        <StatCard title="Recuperação" value={fmtBRL(stats.recuperado)} icon={TrendingUp} description="Est. 2 + 3" />
      </div>

      {/* Top performers chart */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Award className="h-5 w-5 text-primary" />
          Top 10 — Pontuação do Mês
        </h2>
        {rankingChart.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Sem dados de ranking para o período
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart data={rankingChart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </div>

      {/* Detailed per-user table */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">Performance por Colaborador</h2>
        {perUser.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma produção registrada no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-3 font-medium text-muted-foreground">Colaborador</th>
                  <th className="pb-2 pr-3 font-medium text-muted-foreground text-right">Unidades</th>
                  <th className="pb-2 pr-3 font-medium text-muted-foreground text-right">Seguros</th>
                  <th className="pb-2 pr-3 font-medium text-muted-foreground text-right">Vol. Crédito</th>
                  <th className="pb-2 pr-3 font-medium text-muted-foreground text-right">Recuperação</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Dias</th>
                </tr>
              </thead>
              <tbody>
                {perUser.map((u) => {
                  const prof = profileMap.get(u.user_id);
                  return (
                    <tr key={u.user_id} className="border-b border-border/50">
                      <td className="py-2.5 pr-3">
                        <div className="text-foreground">{prof?.name ?? "Sem nome"}</div>
                        <div className="text-xs text-muted-foreground">{prof?.email}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-right text-foreground">{u.units}</td>
                      <td className="py-2.5 pr-3 text-right text-foreground">{u.seguros}</td>
                      <td className="py-2.5 pr-3 text-right text-foreground">{fmtBRL(u.volume)}</td>
                      <td className="py-2.5 pr-3 text-right text-foreground">{fmtBRL(u.recuperado)}</td>
                      <td className="py-2.5 text-right text-foreground">{u.dias.size}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inactive members */}
      {inactives.length > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
            <Calendar className="h-4 w-4 text-destructive" />
            Sem produção no período ({inactives.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {inactives.map((p) => (
              <span key={p.id} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                {p.name ?? p.email ?? "Sem nome"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
