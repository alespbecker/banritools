import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/PageSkeleton";
import {
  TrendingUp, Trophy, Package, DollarSign,
  FileText, UserPlus, Megaphone, Target, Users,
  Clock, ListChecks, Sparkles,
} from "lucide-react";
import { ErrorState } from "@/components/states/ErrorState";
import { EmptyState } from "@/components/states/EmptyState";
import {
  PageContainer,
  PageHeader,
  DashboardGrid,
  KpiCard,
  InfoCard,
  ActionCard,
  ProgressWithLabel,
  HeroPerformance,
  PriorityItem,
} from "@/components/ds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard-v3")({
  head: () => ({ meta: [{ title: "Dashboard v3 — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={4} rows={4} />,
});

interface Entry {
  product_id: string;
  quantity: number;
  amount: number | null;
  entry_date: string;
  products: { name: string; category: string | null; points_per_unit: number } | null;
}
interface ContactRow {
  id: string;
  name: string;
  status: string | null;
  next_follow_up: string | null;
}
interface GoalRow {
  id: string;
  scope: string;
  period_type: string;
  period_start: string;
  period_end: string;
  target_quantity: number;
  target_amount: number | null;
}

function greetingForHour() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Page() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [monthEntries, setMonthEntries] = useState<Entry[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [agencyEntries, setAgencyEntries] = useState<{ user_id: string; pts: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);

    const monthStart = new Date(); monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    try {
      const [
        { data: meEntries, error: e1 },
        { data: meContacts },
        { data: meGoals },
        { data: agEntries },
      ] = await Promise.all([
        supabase
          .from("production_entries")
          .select("product_id, quantity, amount, entry_date, products(name, category, points_per_unit)")
          .eq("user_id", user.id)
          .eq("status", "confirmed")
          .gte("entry_date", monthStartStr)
          .order("entry_date", { ascending: false }),
        supabase
          .from("contacts").select("id, name, status, next_follow_up")
          .eq("user_id", user.id),
        supabase
          .from("goals").select("id, scope, period_type, period_start, period_end, target_quantity, target_amount")
          .or(`user_id.eq.${user.id},scope.eq.agency`)
          .lte("period_start", today)
          .gte("period_end", today),
        profile?.agency_id
          ? supabase
              .from("production_entries")
              .select("user_id, quantity, amount, products(points_per_unit)")
              .eq("agency_id", profile.agency_id)
              .eq("status", "confirmed")
              .gte("entry_date", monthStartStr)
          : Promise.resolve({ data: [] as never[] }),
      ]);

      if (e1) throw e1;
      setMonthEntries((meEntries ?? []) as never);
      setContacts((meContacts ?? []) as ContactRow[]);
      setGoals((meGoals ?? []) as GoalRow[]);

      const byUser = new Map<string, number>();
      (agEntries ?? []).forEach((row) => {
        const er = row as unknown as {
          user_id: string; quantity: number | null; amount: number | null;
          products: { points_per_unit: number } | null;
        };
        const ppu = er.products?.points_per_unit ?? 0;
        const pts = (Number(er.quantity || 0) + Number(er.amount || 0)) * ppu;
        byUser.set(er.user_id, (byUser.get(er.user_id) ?? 0) + pts);
      });
      setAgencyEntries(
        Array.from(byUser.entries())
          .map(([user_id, pts]) => ({ user_id, pts }))
          .sort((a, b) => b.pts - a.pts),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [user, profile?.agency_id]);

  useEffect(() => { reload(); }, [reload]);

  // ----- Cálculos (sempre executados antes dos returns para manter ordem dos hooks) -----
  const todayStr = new Date().toISOString().split("T")[0];

  const todayEntries = useMemo(
    () => monthEntries.filter((e) => e.entry_date === todayStr),
    [monthEntries, todayStr],
  );

  const stats = useMemo(() => {
    const todayQty = todayEntries.reduce((s, e) => s + Number(e.quantity || 0), 0);
    const todayAmt = todayEntries.reduce((s, e) => s + Number(e.amount || 0), 0);
    const todayPts = todayEntries.reduce((s, e) => {
      const ppu = e.products?.points_per_unit ?? 0;
      return s + (Number(e.quantity || 0) + Number(e.amount || 0)) * ppu;
    }, 0);
    const monthQty = monthEntries.reduce((s, e) => s + Number(e.quantity || 0), 0);
    const monthAmt = monthEntries.reduce((s, e) => s + Number(e.amount || 0), 0);
    const monthPts = monthEntries.reduce((s, e) => {
      const ppu = e.products?.points_per_unit ?? 0;
      return s + (Number(e.quantity || 0) + Number(e.amount || 0)) * ppu;
    }, 0);
    return { todayQty, todayAmt, todayPts, monthQty, monthAmt, monthPts };
  }, [monthEntries, todayEntries]);

  const personalMonthGoal = goals.find(
    (g) => g.scope === "individual" && g.period_type === "monthly",
  );
  const personalDailyGoal = goals.find(
    (g) => g.scope === "individual" && g.period_type === "daily",
  );
  const daysInMonth = new Date(
    new Date().getFullYear(), new Date().getMonth() + 1, 0,
  ).getDate();
  const dailyTarget =
    personalDailyGoal?.target_quantity ??
    (personalMonthGoal ? personalMonthGoal.target_quantity / daysInMonth : 0);
  const dailyProgress = dailyTarget > 0 ? (stats.todayQty / dailyTarget) * 100 : 0;
  const monthTarget = personalMonthGoal?.target_quantity ?? 0;
  const monthProgress = monthTarget > 0 ? (stats.monthQty / monthTarget) * 100 : 0;

  const todayDate = new Date(new Date().toDateString());
  const overdueFollowups = contacts.filter(
    (c) => c.next_follow_up && new Date(c.next_follow_up) < todayDate,
  ).length;
  const pendingContacts = contacts.filter(
    (c) => c.status === "novo" || c.status === "contato",
  ).length;
  const goalsAtRisk = goals.filter((g) => {
    if (g.scope !== "individual" || g.period_type !== "monthly") return false;
    if (!g.target_quantity) return false;
    const elapsed = (Date.now() - new Date(g.period_start).getTime()) /
      (new Date(g.period_end).getTime() - new Date(g.period_start).getTime());
    const expected = g.target_quantity * elapsed;
    return stats.monthQty < expected * 0.8;
  }).length;

  const myIndex = agencyEntries.findIndex((r) => r.user_id === user?.id);
  const myPos = myIndex >= 0 ? myIndex + 1 : null;
  const myPts = myIndex >= 0 ? agencyEntries[myIndex].pts : stats.monthPts;
  const nextAhead = myIndex > 0 ? agencyEntries[myIndex - 1] : null;
  const diffToNext = nextAhead ? nextAhead.pts - myPts : 0;
  const leaderPts = agencyEntries[0]?.pts ?? 0;
  const diffToLeader = myPos && myPos > 1 ? leaderPts - myPts : 0;

  if (loading) return <PageSkeleton kpis={4} rows={6} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const firstName = profile?.name?.split(" ")[0] ?? "";
  const greeting = firstName ? `${greetingForHour()}, ${firstName}` : greetingForHour();

  // Próxima melhor ação
  const nextAction =
    overdueFollowups > 0
      ? {
          title: `Cuidar de ${overdueFollowups} follow-up${overdueFollowups === 1 ? "" : "s"} atrasado${overdueFollowups === 1 ? "" : "s"}`,
          description: "Recupere oportunidades antes do fim do dia.",
          icon: Clock,
          tone: "danger" as const,
          ctaLabel: "Abrir contatos",
          onClick: () => navigate({ to: "/contacts-v3" }),
        }
      : stats.todayQty === 0
        ? {
            title: "Registrar produção do dia",
            description: "Lance vendas e produtos para acompanhar sua meta.",
            icon: FileText,
            tone: "primary" as const,
            ctaLabel: "Registrar agora",
            onClick: () => navigate({ to: "/registrar-producao-v3" }),
          }
        : pendingContacts > 0
          ? {
              title: `Avançar ${pendingContacts} contato${pendingContacts === 1 ? "" : "s"} no funil`,
              description: "Mova leads novos para a próxima etapa.",
              icon: Users,
              tone: "warning" as const,
              ctaLabel: "Abrir contatos",
              onClick: () => navigate({ to: "/contacts-v3" }),
            }
          : {
              title: "Tudo em dia",
              description: "Aproveite para revisar metas e novas oportunidades.",
              icon: Sparkles,
              tone: "success" as const,
              ctaLabel: "Ver metas",
              onClick: () => navigate({ to: "/metas" }),
            };

  const heroProgress = dailyTarget > 0 ? dailyProgress : monthProgress;
  const heroProgressLabel = dailyTarget > 0 ? "Meta diária" : monthTarget > 0 ? "Meta mensal" : undefined;
  const heroProgressCaption =
    dailyTarget > 0
      ? `${stats.todayQty.toFixed(0)} / ${dailyTarget.toFixed(0)}`
      : monthTarget > 0
        ? `${stats.monthQty.toFixed(0)} / ${monthTarget.toFixed(0)}`
        : undefined;

  const priorityCount = (overdueFollowups > 0 ? 1 : 0) + (goalsAtRisk > 0 ? 1 : 0) + (pendingContacts > 0 ? 1 : 0);

  return (
    <PageContainer>
      <PageHeader
        title="Início"
        description="Sua central de operações"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">Versão antiga</Link>
          </Button>
        }
      />

      {/* Hero de performance */}
      <HeroPerformance
        greeting={greeting}
        subtitle="Aqui está sua situação hoje e sua próxima melhor ação."
        primaryLabel="Produção de hoje"
        primaryValue={stats.todayQty.toLocaleString("pt-BR")}
        primaryHint={stats.todayPts > 0 ? `+${stats.todayPts.toFixed(0)} pts` : undefined}
        progress={heroProgress > 0 || heroProgressLabel ? heroProgress : undefined}
        progressLabel={heroProgressLabel}
        progressCaption={heroProgressCaption}
        nextAction={nextAction}
      />

      {/* Bloco — Fila operacional */}
      {priorityCount > 0 && (
        <InfoCard
          title="Ações prioritárias"
          description={`${priorityCount} item${priorityCount === 1 ? "" : "s"} aguardando você`}
          actions={<Badge variant="warning">{priorityCount}</Badge>}
        >
          <div className="space-y-2">
            {overdueFollowups > 0 && (
              <PriorityItem
                tone="danger"
                count={overdueFollowups}
                icon={Clock}
                title="Follow-ups em atraso"
                description="Priorize esses contatos antes do fim do dia"
                onClick={() => navigate({ to: "/contacts-v3" })}
              />
            )}
            {goalsAtRisk > 0 && (
              <PriorityItem
                tone="warning"
                count={goalsAtRisk}
                icon={Target}
                title="Metas precisando de atenção"
                description="Acelere o ritmo para alcançar a meta do mês"
                onClick={() => navigate({ to: "/metas" })}
              />
            )}
            {pendingContacts > 0 && (
              <PriorityItem
                tone="info"
                count={pendingContacts}
                icon={ListChecks}
                title="Contatos pendentes no funil"
                description="Avance esses leads para a próxima etapa"
                onClick={() => navigate({ to: "/contacts-v3" })}
              />
            )}
          </div>
        </InfoCard>
      )}

      {/* Performance mensal */}
      <section aria-labelledby="bloco-perf" className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 id="bloco-perf" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sua performance no mês
          </h2>
          <span className="text-xs text-muted-foreground">
            {monthEntries.length} lançamento{monthEntries.length === 1 ? "" : "s"}
          </span>
        </div>
        <DashboardGrid cols={4}>
          <KpiCard
            label="Produção"
            value={stats.monthQty.toLocaleString("pt-BR")}
            icon={Package}
            tone="primary"
            description="unidades no mês"
          />
          <KpiCard
            label="Valor"
            value={`R$ ${stats.monthAmt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            tone="success"
          />
          <KpiCard
            label="Pontos"
            value={stats.monthPts.toFixed(0)}
            icon={TrendingUp}
            tone="accent"
            description={monthTarget > 0 ? `Meta ${monthProgress.toFixed(0)}%` : "—"}
          />
          <KpiCard
            label="Ranking"
            value={myPos ? `${myPos}º` : "—"}
            icon={Trophy}
            tone="warning"
            description={
              nextAhead
                ? `+${diffToNext.toFixed(0)} pts para subir`
                : myPos === 1
                  ? "Liderança 🏆"
                  : "Sem ranking ainda"
            }
          />
        </DashboardGrid>
        {monthTarget > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <ProgressWithLabel
              label="Progresso da meta mensal"
              value={monthProgress}
              valueLabel={`${stats.monthQty.toFixed(0)} / ${monthTarget.toFixed(0)}`}
              autoTone
            />
          </div>
        )}
      </section>

      {/* Atalhos */}
      <section aria-labelledby="bloco-atalhos" className="space-y-3">
        <h2 id="bloco-atalhos" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ações rápidas
        </h2>
        <DashboardGrid cols={4}>
          <ActionCard
            title="Registrar produção"
            description="Lançar vendas e produtos do dia"
            icon={FileText}
            ctaLabel="Lançar"
            onAction={() => navigate({ to: "/registrar-producao-v3" })}
          />
          <ActionCard
            title="Contatos"
            description="Gerenciar leads e follow-ups"
            icon={UserPlus}
            ctaLabel="Abrir"
            onAction={() => navigate({ to: "/contacts-v3" })}
          />
          <ActionCard
            title="Campanhas"
            description="Acompanhar campanhas comerciais"
            icon={Megaphone}
            ctaLabel="Abrir"
            onAction={() => navigate({ to: "/campanhas" })}
          />
          <ActionCard
            title="Metas"
            description="Definir e acompanhar metas"
            icon={Target}
            ctaLabel="Abrir"
            onAction={() => navigate({ to: "/metas" })}
          />
        </DashboardGrid>
      </section>

      {/* Histórico rápido */}
      <InfoCard
        title="Últimos lançamentos"
        description={`${monthEntries.length} no mês`}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/historico">Ver tudo</Link>
          </Button>
        }
        bodyless
      >
        {monthEntries.length === 0 ? (
          <div className="px-5 py-8">
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="Você ainda não registrou produção este mês"
              description="Lance suas vendas para acompanhar metas e ranking."
              action={
                <Button asChild size="sm">
                  <Link to="/registrar-producao-v3">Registrar agora</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {monthEntries.slice(0, 8).map((e, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-accent/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {e.products?.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.entry_date).toLocaleDateString("pt-BR")}
                      {e.products?.category && ` · ${e.products.category}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {e.quantity ? <Badge variant="neutral">{e.quantity} un</Badge> : null}
                  {e.amount ? (
                    <Badge variant="success">
                      R$ {Number(e.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </InfoCard>

      {/* Atalho agência */}
      {agencyEntries.length > 0 && (
        <InfoCard
          title="Sua agência"
          description={`${agencyEntries.length} colega${agencyEntries.length === 1 ? "" : "s"} ativos no mês`}
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/ranking-v3">Ver ranking</Link>
            </Button>
          }
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Líder:</span>
              <span className="font-medium text-foreground">
                {leaderPts.toFixed(0)} pts
              </span>
            </div>
            {myPos && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground">Você:</span>
                <span className="font-medium text-foreground">{myPos}º lugar</span>
                {diffToLeader > 0 && (
                  <Badge variant="info">faltam {diffToLeader.toFixed(0)} pts</Badge>
                )}
              </div>
            )}
          </div>
        </InfoCard>
      )}
    </PageContainer>
  );
}
