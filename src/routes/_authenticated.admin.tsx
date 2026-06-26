import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/StatCard";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Award, Shield, Trophy, Target, Activity, Gauge,
  Search, SlidersHorizontal, X, Pencil, Check,
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportDialog, type ExportColumn } from "@/components/ExportDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSkeleton, DataGate } from "@/components/PageSkeleton";
import { Users2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/features/audit/log";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — BanriTools" },
      { name: "description", content: "Painel administrativo da agência" },
    ],
  }),
  component: AdminDashboardPage,
  pendingComponent: () => <PageSkeleton kpis={4} rows={8} />,
});

type ProfileLite = { id: string; name: string | null; email: string | null; agency_id: string | null };
type AgencyRow = { id: string; name: string };
type EntryRow = {
  user_id: string;
  entry_date: string;
  quantity: number | null;
  amount: number | null;
  products: { name: string | null; slug: string | null; category: string | null; points_per_unit: number | null } | null;
};

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
  const { userRole, profile, user, isLoading } = useAuth();
  const navigate = useNavigate();
  // Fonte única: production_entries (modelo v3). daily_reports foi descontinuado.
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [roles, setRoles] = useState<Map<string, "admin" | "user">>(new Map());
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [ranking, setRanking] = useState<{ user_id: string; points: number; position: number }[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset]);

  // Search & advanced filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [productFilter, setProductFilter] = useState<"all" | "seguros" | "credito" | "recuperacao" | "pj">("all");
  const [minUnits, setMinUnits] = useState<string>("");
  const [minVolume, setMinVolume] = useState<string>("");
  const [minPoints, setMinPoints] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const clearFilters = () => {
    setSearch(""); setStatusFilter("all"); setProductFilter("all");
    setMinUnits(""); setMinVolume(""); setMinPoints("");
  };
  const activeFilterCount =
    (search ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (productFilter !== "all" ? 1 : 0) +
    (minUnits ? 1 : 0) + (minVolume ? 1 : 0) + (minPoints ? 1 : 0);

  // Guard: only admins
  useEffect(() => {
    if (!isLoading && userRole && userRole !== "admin") {
      navigate({ to: "/dashboard-v3" });
    }
  }, [isLoading, userRole, navigate]);

  const agencyId = profile?.agency_id ?? null;
  const isAdmin = userRole === "admin";

  const fetchAll = useCallback(async (showLoader = false) => {
    // Guard: não dispara nenhum fetch enquanto a role ainda não foi resolvida
    // ou se o usuário não é admin (o redirect logo abaixo cuida da saída).
    if (!agencyId || !isAdmin) { setLoading(false); return; }
    if (showLoader) setLoading(true);
    // 1) Buscar profiles da agência primeiro (rápido) para poder filtrar user_roles
    const profilesPromise = supabase
      .from("profiles")
      .select("id, name, email, agency_id")
      .eq("agency_id", agencyId)
      .order("name");

    // Em paralelo, dispara o resto que não depende dos profiles
    const [entriesRes, agenciesRes, rankingRes, profilesRes] = await Promise.all([
      supabase
        .from("production_entries")
        .select("user_id, entry_date, quantity, amount, products(name, slug, category, points_per_unit)")
        .eq("agency_id", agencyId)
        .eq("status", "confirmed")
        .gte("entry_date", monthRange.start)
        .lte("entry_date", monthRange.end),
      supabase.from("agencies").select("id, name").order("name"),
      supabase.from("ranking_monthly").select("user_id, points, position").eq("agency_id", agencyId).eq("month", monthRange.monthFirst).order("position"),
      profilesPromise,
    ]);

    const profilesData = (profilesRes.data as ProfileLite[]) ?? [];
    const profileIds = profilesData.map((p) => p.id);

    // user_roles: filtrar apenas pelos usuários da agência (antes buscava o banco inteiro)
    const rolesRes = profileIds.length > 0
      ? await supabase.from("user_roles").select("user_id, role").in("user_id", profileIds)
      : { data: [] as { user_id: string; role: "admin" | "user" }[] };

    setEntries((entriesRes.data as unknown as EntryRow[]) ?? []);
    setProfiles(profilesData);
    const m = new Map<string, "admin" | "user">();
    for (const r of (rolesRes.data as { user_id: string; role: "admin" | "user" }[]) ?? []) m.set(r.user_id, r.role);
    setRoles(m);
    setAgencies((agenciesRes.data as AgencyRow[]) ?? []);
    setRanking((rankingRes.data as { user_id: string; points: number; position: number }[]) ?? []);
    setLoading(false);
  }, [agencyId, isAdmin, monthRange.start, monthRange.end, monthRange.monthFirst]);

  useEffect(() => { fetchAll(true); }, [fetchAll]);

  // Realtime sync — coalesce eventos em rajada (fechamento de mês pode disparar
  // dezenas de mudanças/segundo em 4 tabelas; sem debounce isso refaria o
  // fetchAll a cada evento individual).
  useEffect(() => {
    if (!agencyId || !isAdmin) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefetch = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; fetchAll(); }, 500);
    };
    const channel = supabase
      .channel(`admin-dashboard-${user?.id ?? "anon"}`)
      
      .on("postgres_changes", { event: "*", schema: "public", table: "production_entries" }, scheduleRefetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "ranking_monthly" }, scheduleRefetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, scheduleRefetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, scheduleRefetch)
      .subscribe();
    window.addEventListener("banritools:sync", scheduleRefetch);
    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
      window.removeEventListener("banritools:sync", scheduleRefetch);
    };
  }, [agencyId, isAdmin, fetchAll, user?.id]);

  const profileMap = useMemo(() => {
    const m = new Map<string, ProfileLite>();
    for (const p of profiles) m.set(p.id, p);
    return m;
  }, [profiles]);

  // Agregação por usuário a partir das entries (fonte única — modelo v3).
  // Mantém o vocabulário herdado (units/volume/recuperado/seguros/dias) para
  // não quebrar contratos de UI/export; campos novos (pjUnits, segurosValor)
  // entram aqui também.
  const entriesAgg = useMemo(() => {
    const map = new Map<string, {
      units: number;
      volume: number;         // R$ Crédito
      recuperado: number;     // R$ Recuperação
      seguros: number;        // unidades Seguros + Capitalização
      segurosValor: number;   // R$ Seguros + Capitalização
      pjUnits: number;        // unidades PJ
      dias: Set<string>;
    }>();
    for (const e of entries) {
      const cur = map.get(e.user_id) ?? {
        units: 0, volume: 0, recuperado: 0, seguros: 0, segurosValor: 0, pjUnits: 0, dias: new Set<string>(),
      };
      const qty = Number(e.quantity ?? 0);
      const amt = Number(e.amount ?? 0);
      const cat = e.products?.category ?? "";
      cur.units += qty;
      if (cat === "Seguros" || cat === "Capitalização") {
        cur.seguros += qty;
        cur.segurosValor += amt;
      }
      if (cat === "Crédito") cur.volume += amt;
      if (cat === "Recuperação") cur.recuperado += amt;
      if (cat === "PJ") cur.pjUnits += qty;
      cur.dias.add(e.entry_date);
      map.set(e.user_id, cur);
    }
    return map;
  }, [entries]);

  const stats = useMemo(() => {
    let totalUnits = 0, volFinanceiro = 0, recuperado = 0, segurosValor = 0;
    for (const agg of entriesAgg.values()) {
      totalUnits += agg.units;
      volFinanceiro += agg.volume;
      recuperado += agg.recuperado;
      segurosValor += agg.segurosValor;
    }
    return { totalUnits, volFinanceiro, recuperado, segurosValor, activeUsers: entriesAgg.size };
  }, [entriesAgg]);

  // KPIs do TIME — diferentes do dashboard pessoal (que mostra totais individuais).
  // Aqui focamos em dinâmica do grupo: engajamento, média, top performer e gap.
  const teamStats = useMemo(() => {
    const totalProfiles = profiles.length;
    const engajamento = totalProfiles > 0 ? Math.round((stats.activeUsers / totalProfiles) * 100) : 0;
    const mediaUnitsAtivo = stats.activeUsers > 0 ? Math.round(stats.totalUnits / stats.activeUsers) : 0;
    const topPoints = ranking[0]?.points ?? 0;
    const topName = ranking[0] ? (profileMap.get(ranking[0].user_id)?.name?.split(" ")[0] ?? "0") : "0";
    const lastPoints = ranking.length > 1 ? ranking[ranking.length - 1].points : topPoints;
    const gap = topPoints - lastPoints;
    return { engajamento, mediaUnitsAtivo, topPoints, topName, gap, totalProfiles };
  }, [profiles.length, stats.activeUsers, stats.totalUnits, ranking, profileMap]);

  // Per-user — lista plana ordenada por unidades, derivada do entriesAgg.
  const perUser = useMemo(() => {
    return Array.from(entriesAgg.entries())
      .map(([user_id, agg]) => ({ user_id, ...agg }))
      .sort((a, b) => b.units - a.units);
  }, [entriesAgg]);

  const inactives = useMemo(() => {
    const activeIds = new Set(perUser.map((u) => u.user_id));
    return profiles.filter((p) => !activeIds.has(p.id));
  }, [profiles, perUser]);

  // Filters
  const filteredPerUser = useMemo(() => {
    const q = search.trim().toLowerCase();
    const minU = minUnits ? Number(minUnits) : null;
    const minV = minVolume ? Number(minVolume) : null;
    const minP = minPoints ? Number(minPoints) : null;
    return perUser.filter((u) => {
      const p = profiles.find((x) => x.id === u.user_id);
      const name = (p?.name ?? "").toLowerCase();
      const email = (p?.email ?? "").toLowerCase();
      if (q && !name.includes(q) && !email.includes(q)) return false;
      if (minU != null && u.units < minU) return false;
      if (minV != null && u.volume < minV) return false;
      if (productFilter === "seguros" && u.seguros <= 0) return false;
      if (productFilter === "credito" && u.volume <= 0) return false;
      if (productFilter === "recuperacao" && u.recuperado <= 0) return false;
      if (productFilter === "pj" && u.pjUnits <= 0) return false;
      if (minP != null) {
        const pts = ranking.find((r) => r.user_id === u.user_id)?.points ?? 0;
        if (pts < minP) return false;
      }
      return true;
    });
  }, [perUser, profiles, ranking, search, minUnits, minVolume, minPoints, productFilter]);

  const filteredInactives = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inactives;
    return inactives.filter((p) =>
      (p.name ?? "").toLowerCase().includes(q) || (p.email ?? "").toLowerCase().includes(q)
    );
  }, [inactives, search]);

  const showInactivesAsRows = statusFilter === "inactive";
  const visibleUsers = showInactivesAsRows ? [] : filteredPerUser;

  const rankingChart = useMemo(() => {
    return ranking.slice(0, 10).map((r) => ({
      name: profileMap.get(r.user_id)?.name?.split(" ")[0] ?? "—",
      total: r.points,
    }));
  }, [ranking, profileMap]);

  // ====== User management actions ======
  const handleToggleRole = async (targetId: string, makeAdmin: boolean) => {
    if (targetId === user?.id) {
      toast.error("Você não pode alterar sua própria função.");
      return;
    }
    setSavingId(targetId);
    const newRole: "admin" | "user" = makeAdmin ? "admin" : "user";
    setRoles((prev) => new Map(prev).set(targetId, newRole));
    const { error } = await supabase.rpc("admin_set_user_role", {
      _target_user_id: targetId, _new_role: newRole,
    });
    setSavingId(null);
    if (error) { toast.error(error.message); fetchAll(); }
    else {
      await logAudit({ action: "role.update", entity: "user_role", entity_id: targetId, details: { new_role: newRole } });
      toast.success(`Usuário agora é ${newRole === "admin" ? "Administrador" : "Usuário"}.`);
    }
  };

  const handleAgencyChange = async (targetId: string, newAgency: string) => {
    setSavingId(targetId);
    const { error } = await supabase.from("profiles").update({ agency_id: newAgency }).eq("id", targetId);
    setSavingId(null);
    if (error) toast.error("Erro ao atualizar agência");
    else { toast.success("Agência atualizada"); fetchAll(); }
  };

  const startEditName = (p: ProfileLite) => {
    setEditingNameId(p.id);
    setNameDraft(p.name ?? "");
  };

  const saveName = async (targetId: string) => {
    setSavingId(targetId);
    const { error } = await supabase.from("profiles").update({ name: nameDraft.trim() }).eq("id", targetId);
    setSavingId(null);
    setEditingNameId(null);
    if (error) toast.error("Erro ao atualizar nome");
    else { toast.success("Nome atualizado"); fetchAll(); }
  };

  // ==== Export ====
  type ExportRow = {
    name: string; email: string; units: number; seguros: number;
    volume: number; recuperado: number; dias: number; points: number; position: number | "";
  };
  const rankMap = useMemo(() => {
    const m = new Map<string, { points: number; position: number }>();
    for (const r of ranking) m.set(r.user_id, { points: r.points, position: r.position });
    return m;
  }, [ranking]);

  const exportRows: ExportRow[] = useMemo(() => {
    if (showInactivesAsRows) {
      return filteredInactives.map((p) => ({
        name: p.name ?? "Sem nome", email: p.email ?? "",
        units: 0, seguros: 0, volume: 0, recuperado: 0, dias: 0,
        points: 0, position: "" as const,
      }));
    }
    return filteredPerUser.map((u) => {
      const p = profileMap.get(u.user_id);
      const rk = rankMap.get(u.user_id);
      return {
        name: p?.name ?? "Sem nome", email: p?.email ?? "",
        units: u.units, seguros: u.seguros, volume: u.volume,
        recuperado: u.recuperado, dias: u.dias.size,
        points: rk?.points ?? 0, position: rk?.position ?? "",
      };
    });
  }, [filteredPerUser, filteredInactives, showInactivesAsRows, profileMap, rankMap]);

  const exportColumns: ExportColumn<ExportRow>[] = useMemo(() => [
    { key: "position", label: "Posição", accessor: (r) => r.position, defaultChecked: true, format: "text" },
    { key: "name", label: "Colaborador", accessor: (r) => r.name, defaultChecked: true, format: "text" },
    { key: "email", label: "Email", accessor: (r) => r.email, defaultChecked: false, format: "text" },
    { key: "units", label: "Unidades", accessor: (r) => r.units, defaultChecked: true, format: "integer", summable: true },
    { key: "seguros", label: "Seguros (qtd)", accessor: (r) => r.seguros, defaultChecked: true, format: "integer", summable: true },
    { key: "volume", label: "Vol. Crédito (R$)", accessor: (r) => r.volume, defaultChecked: true, format: "currency", summable: true },
    { key: "recuperado", label: "Recuperação (R$)", accessor: (r) => r.recuperado, defaultChecked: true, format: "currency", summable: true },
    { key: "dias", label: "Dias Ativos", accessor: (r) => r.dias, defaultChecked: true, format: "integer" },
    { key: "points", label: "Pontos do mês", accessor: (r) => r.points, defaultChecked: true, format: "integer", summable: true },
  ], []);

  // Export "bruto": uma linha por lançamento (production_entries).
  type RawRow = {
    entry_date: string;
    name: string;
    email: string;
    category: string;
    product: string;
    quantity: number;
    amount: number;
  };
  const rawRows: RawRow[] = useMemo(() => {
    const allowedIds = activeFilterCount > 0 && !showInactivesAsRows
      ? new Set(filteredPerUser.map((u) => u.user_id))
      : null;
    const source = allowedIds ? entries.filter((e) => allowedIds.has(e.user_id)) : entries;
    return source.map((e) => {
      const p = profileMap.get(e.user_id);
      return {
        entry_date: e.entry_date,
        name: p?.name ?? "Sem nome",
        email: p?.email ?? "",
        category: e.products?.category ?? "—",
        product: e.products?.name ?? "—",
        quantity: Number(e.quantity ?? 0),
        amount: Number(e.amount ?? 0),
      };
    });
  }, [entries, profileMap, filteredPerUser, activeFilterCount, showInactivesAsRows]);
  const rawColumns: ExportColumn<RawRow>[] = useMemo(() => [
    { key: "entry_date", label: "Data", accessor: (r) => r.entry_date, defaultChecked: true, format: "date" },
    { key: "name", label: "Colaborador", accessor: (r) => r.name, defaultChecked: true, format: "text" },
    { key: "email", label: "Email", accessor: (r) => r.email, defaultChecked: false, format: "text" },
    { key: "category", label: "Categoria", accessor: (r) => r.category, defaultChecked: true, format: "text" },
    { key: "product", label: "Produto", accessor: (r) => r.product, defaultChecked: true, format: "text" },
    { key: "quantity", label: "Quantidade", accessor: (r) => r.quantity, defaultChecked: true, format: "integer", summable: true },
    { key: "amount", label: "Valor (R$)", accessor: (r) => r.amount, defaultChecked: true, format: "currency", summable: true },
  ], []);

  if (isLoading || (userRole && userRole !== "admin")) {
    return <PageSkeleton kpis={4} rows={6} />;
  }

  const initialLoading = loading && entries.length === 0 && profiles.length === 0;

  return (
    <DataGate
      loading={initialLoading}
      skeleton={<PageSkeleton kpis={4} rows={8} />}
    >
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-violet)]/40 bg-[var(--brand-violet)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-violet)]"
              title="Esta visão consolida a produção de toda a agência"
            >
              <Users2 className="h-3 w-3" aria-hidden="true" />
              Time
            </span>
            <p className="text-xs text-muted-foreground">{monthRange.label}</p>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
            Painel da Agência
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visão consolidada do time, ranking e gestão de usuários.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportDialog
            title="Relatório bruto de lançamentos"
            subtitle={`Período: ${monthRange.label}`}
            filenameBase="banritools-relatorios"
            columns={rawColumns}
            rows={rawRows}
            triggerLabel="Exportar Relatórios"
            summary={[
              { label: "Engajamento", value: `${teamStats.engajamento}%`, hint: `${stats.activeUsers}/${profiles.length} ativos` },
              { label: "Unidades do time", value: stats.totalUnits.toLocaleString("pt-BR"), hint: "Total no período" },
              { label: "Vol. Crédito", value: fmtBRL(stats.volFinanceiro), hint: "Consignado" },
              { label: "Recuperação", value: fmtBRL(stats.recuperado), hint: "E2 + E3" },
            ]}
          />
          <Select value={String(monthOffset)} onValueChange={(v) => setMonthOffset(Number(v))}>
            <SelectTrigger
              className="w-44"
              aria-label="Selecionar mês de referência do painel"
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
      </div>

      {/* Team KPIs — focados em DINÂMICA DO TIME (não duplicam o dashboard pessoal,
           que mostra totais individuais como Produção Total / Vol. Financeiro / Recuperação). */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          loading={loading}
          tone="primary"
          title="Engajamento"
          value={`${teamStats.engajamento}%`}
          icon={Activity}
          description={`${stats.activeUsers} de ${profiles.length} ativos`}
          hint="Percentual do time que fez ao menos um lançamento no período"
        />
        <StatCard
          loading={loading}
          tone="success"
          title="Média por Ativo"
          value={teamStats.mediaUnitsAtivo}
          icon={Gauge}
          description="Unidades / colaborador ativo"
          hint="Média de unidades vendidas por colaborador que produziu no período"
        />
        <StatCard
          loading={loading}
          tone="violet"
          title="Top Performer"
          value={teamStats.topName}
          icon={Trophy}
          description={`${teamStats.topPoints} pts no mês`}
          hint="Colaborador com maior pontuação no ranking do mês"
        />
        <StatCard
          loading={loading}
          tone="teal"
          title="Gap do Ranking"
          value={teamStats.gap}
          icon={Target}
          description="Pontos entre 1º e último"
          hint="Distância em pontos entre o primeiro e o último colocado do ranking"
        />
      </div>

      {/* Top performers chart */}
      <section
        className="card-hover rounded-xl border border-border bg-card p-5 sm:p-6"
        aria-label="Top 10 colaboradores por pontuação no mês"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <Award className="h-5 w-5 text-primary" aria-hidden="true" />
          Top 10 — Pontuação do Mês
        </h2>
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : rankingChart.length === 0 ? (
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
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </section>

      {/* Search & Advanced filters */}
      <section className="rounded-xl border border-border bg-card p-4" aria-label="Filtros e busca de colaboradores">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email do colaborador..."
              className="pl-9"
              aria-label="Buscar colaborador por nome ou email"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
                aria-label="Limpar campo de busca"
                title="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                aria-label="Abrir filtros avançados"
                title="Filtros avançados (status, tipo de produto, mínimos)"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros avançados
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Filtros</h4>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                    title="Remove todos os filtros aplicados"
                  >
                    Limpar
                  </button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger aria-label="Filtrar por status do colaborador"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos no período</SelectItem>
                      <SelectItem value="inactive">Inativos (sem produção)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de produto</Label>
                  <Select value={productFilter} onValueChange={(v) => setProductFilter(v as typeof productFilter)}>
                    <SelectTrigger aria-label="Filtrar por tipo de produto vendido"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="seguros">Vendeu Seguros</SelectItem>
                      <SelectItem value="credito">Crédito (consignado)</SelectItem>
                      <SelectItem value="recuperacao">Recuperação (E2/E3)</SelectItem>
                      <SelectItem value="pj">Produtos PJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mín. Unidades</Label>
                    <Input type="number" min="0" value={minUnits} onChange={(e) => setMinUnits(e.target.value)} placeholder="0" aria-label="Filtrar por mínimo de unidades vendidas" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mín. Pontos</Label>
                    <Input type="number" min="0" value={minPoints} onChange={(e) => setMinPoints(e.target.value)} placeholder="0" aria-label="Filtrar por mínimo de pontos no mês" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Mín. Volume Crédito (R$)</Label>
                  <Input type="number" min="0" value={minVolume} onChange={(e) => setMinVolume(e.target.value)} placeholder="0" aria-label="Filtrar por mínimo de volume de crédito" />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1" aria-label="Limpar todos os filtros" title="Remove todos os filtros aplicados">
              <X className="h-3.5 w-3.5" /> Limpar
            </Button>
          )}
        </div>
        {activeFilterCount > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Exibindo {showInactivesAsRows ? filteredInactives.length : visibleUsers.length} de {perUser.length + inactives.length} colaboradores
          </p>
        )}
      </section>

      {/* Detailed per-user performance table */}
      <section className="card-hover rounded-xl border border-border bg-card p-5 sm:p-6" aria-label="Performance detalhada por colaborador">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-card-foreground">Performance por Colaborador</h2>
          <ExportDialog
            title="Performance por colaborador"
            subtitle={`Período: ${monthRange.label}`}
            filenameBase="banritools-performance"
            columns={exportColumns}
            rows={exportRows}
            triggerLabel="Exportar tabela"
            summary={[
              { label: "Colaboradores", value: String(exportRows.length), hint: `de ${profiles.length} no time` },
              { label: "Top Performer", value: teamStats.topName, hint: `${teamStats.topPoints} pts` },
              { label: "Média / ativo", value: String(teamStats.mediaUnitsAtivo), hint: "Unidades" },
              { label: "Gap ranking", value: String(teamStats.gap), hint: "1º vs último" },
            ]}
          />
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (showInactivesAsRows ? filteredInactives.length === 0 : visibleUsers.length === 0) ? (
          <p className="text-sm text-muted-foreground">
            {activeFilterCount > 0 ? "Nenhum colaborador corresponde aos filtros aplicados." : "Nenhuma produção registrada no período."}
          </p>
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
                {showInactivesAsRows
                  ? filteredInactives.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 opacity-70">
                        <td className="py-2.5 pr-3">
                          <div className="text-foreground">{p.name ?? "Sem nome"}</div>
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                        </td>
                        <td className="py-2.5 pr-3 text-right text-muted-foreground">0</td>
                        <td className="py-2.5 pr-3 text-right text-muted-foreground">0</td>
                        <td className="py-2.5 pr-3 text-right text-muted-foreground">{fmtBRL(0)}</td>
                        <td className="py-2.5 pr-3 text-right text-muted-foreground">{fmtBRL(0)}</td>
                        <td className="py-2.5 text-right text-muted-foreground">0</td>
                      </tr>
                    ))
                  : visibleUsers.map((u) => {
                      const prof = profileMap.get(u.user_id);
                      return (
                        <tr key={u.user_id} className="border-b border-border/50 transition-colors hover:bg-accent/30">
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
      </section>

      {/* ===== Gestão integrada de usuários ===== */}
      <section className="card-hover rounded-xl border border-border bg-card overflow-hidden" aria-label="Gestão de usuários da agência">
        <header className="flex items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              Equipe da Agência
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Edite nomes, agência e permissão de cada colaborador.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground" title="Total de usuários cadastrados">
            {profiles.length} usuários
          </span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="p-3 font-medium text-muted-foreground">Usuário</th>
                <th className="p-3 font-medium text-muted-foreground">Agência</th>
                <th className="p-3 font-medium text-muted-foreground text-center">Administrador</th>
              </tr>
            </thead>
            <tbody>
              {loading && profiles.length === 0 && (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-3"><Skeleton className="h-9 w-48" /></td>
                      <td className="p-3"><Skeleton className="h-9 w-44" /></td>
                      <td className="p-3 text-center"><Skeleton className="mx-auto h-6 w-10" /></td>
                    </tr>
                  ))}
                </>
              )}
              {!loading && profiles.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    Nenhum usuário encontrado nesta agência.
                  </td>
                </tr>
              )}
              {profiles.map((p) => {
                const isMe = p.id === user?.id;
                const isAdmin = roles.get(p.id) === "admin";
                const isSaving = savingId === p.id;
                return (
                  <tr key={p.id} className="border-b border-border/50 transition-colors hover:bg-accent/20">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {p.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          {editingNameId === p.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                className="h-8 w-48 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                autoFocus
                                aria-label={`Novo nome para ${p.name ?? "usuário"}`}
                              />
                              <button
                                onClick={() => saveName(p.id)}
                                disabled={isSaving}
                                className="rounded p-1 text-success hover:bg-success/10"
                                title="Salvar nome"
                                aria-label="Salvar novo nome do usuário"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingNameId(null)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted"
                                title="Cancelar edição"
                                aria-label="Cancelar edição do nome"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-foreground">
                              <span className="truncate font-medium">{p.name ?? "Sem nome"}</span>
                              {isMe && <span className="text-xs text-muted-foreground">(você)</span>}
                              {isAdmin && (
                                <Shield
                                  className="h-3.5 w-3.5 text-primary"
                                  aria-label="Administrador"
                                />
                              )}
                              <button
                                onClick={() => startEditName(p)}
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Editar nome do colaborador"
                                aria-label={`Editar nome de ${p.name ?? "usuário"}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Select
                        value={p.agency_id ?? ""}
                        onValueChange={(v) => handleAgencyChange(p.id, v)}
                        disabled={isSaving}
                      >
                        <SelectTrigger
                          className="w-56"
                          aria-label={`Agência atribuída a ${p.name ?? "usuário"}`}
                          title="Trocar agência deste colaborador"
                        >
                          <SelectValue placeholder="Sem agência" />
                        </SelectTrigger>
                        <SelectContent>
                          {agencies.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={isAdmin}
                        disabled={isMe || isSaving}
                        onCheckedChange={(v) => handleToggleRole(p.id, v)}
                        aria-label={`${isAdmin ? "Remover" : "Conceder"} permissão de administrador para ${p.name ?? "usuário"}`}
                        title={isMe ? "Você não pode alterar sua própria função" : isAdmin ? "Clique para rebaixar para usuário" : "Clique para promover a administrador"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          <p>Você não pode alterar a sua própria função. Pelo menos um administrador deve permanecer na agência.</p>
        </div>
      </section>

      {/* Inactive members callout */}
      {inactives.length > 0 && (
        <aside
          className="rounded-xl border border-warning/30 bg-warning/5 p-5"
          aria-label={`${inactives.length} colaboradores sem produção no período`}
        >
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
            <Activity className="h-4 w-4 text-warning" aria-hidden="true" />
            Sem produção no período ({inactives.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {inactives.map((p) => (
              <span
                key={p.id}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                title={p.email ?? undefined}
              >
                {p.name ?? p.email ?? "Sem nome"}
              </span>
            ))}
          </div>
        </aside>
      )}
    </div>
    </DataGate>
  );
}
