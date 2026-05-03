import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/PageSkeleton";
import {
  Sparkles, TrendingUp, Trophy, Package, DollarSign,
  FileText, UserPlus, Megaphone, AlertTriangle, Users, Target,
} from "lucide-react";
import { ErrorState } from "@/components/states/ErrorState";
import {
  PageContainer,
  PageHeader,
  DashboardGrid,
  KpiCard,
  InfoCard,
  AlertCard,
  ActionCard,
  ProgressWithLabel,
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

function Page() {
  const { user, profile } = useAuth();
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

  if (loading) return <PageSkeleton kpis={4} rows={6} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  // ----- Cálculos -----
  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntries = monthEntries.filter((e) => e.entry_date === todayStr);
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

  // Meta do dia: derivada da meta mensal pessoal (target_quantity / dias do mês)
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
  const dailyProgress = dailyTarget > 0 ? (todayQty / dailyTarget) * 100 : 0;
  const monthTarget = personalMonthGoal?.target_quantity ?? 0;
  const monthProgress = monthTarget > 0 ? (monthQty / monthTarget) * 100 : 0;

  // Ações prioritárias
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
    return monthQty < expected * 0.8;
  }).length;

  // Ranking
  const myIndex = agencyEntries.findIndex((r) => r.user_id === user?.id);
  const myPos = myIndex >= 0 ? myIndex + 1 : null;
  const myPts = myIndex >= 0 ? agencyEntries[myIndex].pts : monthPts;
  const nextAhead = myIndex > 0 ? agencyEntries[myIndex - 1] : null;
  const diffToNext = nextAhead ? nextAhead.pts - myPts : 0;

  return (
    <PageContainer>
      <PageHeader
        icon={<Sparkles className="h-5 w-5" />}
        title={`Olá, ${profile?.name?.split(" ")[0] ?? "tudo bem"}`}
        description="Como você está hoje e o que precisa fazer agora"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">Versão antiga</Link>
          </Button>
        }
      />

      {/* Bloco 1 — Status do dia */}
      <section aria-labelledby="bloco-status" className="space-y-3">
        <h2 id="bloco-status" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Status do dia
        </h2>
        <DashboardGrid cols={3}>
          <KpiCard
            label="Produção de hoje"
            value={todayQty.toLocaleString("pt-BR")}
            icon={Package}
            tone="primary"
            description={`${todayEntries.length} lançamento${todayEntries.length === 1 ? "" : "s"}`}
          />
          <KpiCard
            label="Valor de hoje"
            value={`R$ ${todayAmt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            tone="success"
            description={`${todayPts.toFixed(0)} pts`}
          />
          <InfoCard title="Meta diária" description={dailyTarget > 0 ? `Alvo: ${dailyTarget.toFixed(0)}` : "Sem meta definida"}>
            {dailyTarget > 0 ? (
              <ProgressWithLabel
                value={dailyProgress}
                valueLabel={`${todayQty.toFixed(0)} / ${dailyTarget.toFixed(0)}`}
                autoTone
              />
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/metas">
                  <Target className="h-3.5 w-3.5" /> Definir meta
                </Link>
              </Button>
            )}
          </InfoCard>
        </DashboardGrid>
      </section>

      {/* Bloco 2 — Ações prioritárias */}
      {(overdueFollowups > 0 || goalsAtRisk > 0 || pendingContacts > 0) && (
        <section aria-labelledby="bloco-acoes" className="space-y-3">
          <h2 id="bloco-acoes" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ações prioritárias
          </h2>
          <div className="space-y-3">
            {overdueFollowups > 0 && (
              <AlertCard
                tone="danger"
                title={`${overdueFollowups} follow-up(s) em atraso`}
                description="Priorize esses contatos antes do fim do dia."
                actions={
                  <Button asChild size="sm">
                    <Link to="/contacts-v3">Abrir contatos</Link>
                  </Button>
                }
              />
            )}
            {goalsAtRisk > 0 && (
              <AlertCard
                tone="warning"
                title={`${goalsAtRisk} meta(s) em risco`}
                description="Você está abaixo do ritmo esperado para o mês."
                actions={
                  <Button asChild size="sm" variant="outline">
                    <Link to="/metas">Ver metas</Link>
                  </Button>
                }
              />
            )}
            {pendingContacts > 0 && (
              <AlertCard
                tone="info"
                title={`${pendingContacts} contato(s) pendente(s)`}
                description="Avance esses leads para a próxima etapa do funil."
              />
            )}
          </div>
        </section>
      )}

      {/* Bloco 3 — Performance */}
      <section aria-labelledby="bloco-perf" className="space-y-3">
        <h2 id="bloco-perf" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sua performance no mês
        </h2>
        <DashboardGrid cols={3}>
          <KpiCard
            label="Produção do mês"
            value={monthQty.toLocaleString("pt-BR")}
            icon={TrendingUp}
            tone="accent"
            description={`R$ ${monthAmt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          />
          <KpiCard
            label="Pontos acumulados"
            value={monthPts.toFixed(0)}
            icon={Trophy}
            tone="warning"
            description={monthTarget > 0 ? `Meta ${monthProgress.toFixed(0)}%` : "—"}
          />
          <KpiCard
            label="Posição no ranking"
            value={myPos ? `${myPos}º` : "—"}
            icon={Trophy}
            tone="primary"
            description={
              nextAhead
                ? `${diffToNext.toFixed(0)} pts para o próximo`
                : myPos === 1
                  ? "Liderança"
                  : "—"
            }
          />
        </DashboardGrid>
      </section>

      {/* Bloco 4 — Atalhos */}
      <section aria-labelledby="bloco-atalhos" className="space-y-3">
        <h2 id="bloco-atalhos" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Atalhos
        </h2>
        <DashboardGrid cols={3}>
          <Link to="/registrar-producao-v3" className="contents">
            <ActionCard
              title="Registrar produção"
              description="Lançar vendas e produtos do dia"
              icon={FileText}
              ctaLabel="Abrir"
              onAction={() => {}}
            />
          </Link>
          <Link to="/contacts-v3" className="contents">
            <ActionCard
              title="Novo contato"
              description="Adicionar lead ou retomar follow-up"
              icon={UserPlus}
              ctaLabel="Abrir"
              onAction={() => {}}
            />
          </Link>
          <Link to="/campanhas" className="contents">
            <ActionCard
              title="Nova campanha"
              description="Criar campanha comercial da agência"
              icon={Megaphone}
              ctaLabel="Abrir"
              onAction={() => {}}
            />
          </Link>
        </DashboardGrid>
      </section>

      {/* Bloco 5 — Histórico rápido */}
      <section aria-labelledby="bloco-hist" className="space-y-3">
        <h2 id="bloco-hist" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Últimos lançamentos
        </h2>
        <InfoCard
          title="Histórico recente"
          description={`${monthEntries.length} no mês`}
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/historico">Ver tudo</Link>
            </Button>
          }
          bodyless
        >
          {monthEntries.length === 0 ? (
            <div className="flex items-center justify-between gap-3 px-5 py-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Nenhum lançamento no mês.</span>
              </div>
              <Button asChild size="sm">
                <Link to="/registrar-producao-v3">Registrar agora</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {monthEntries.slice(0, 8).map((e, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {e.products?.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.entry_date).toLocaleDateString("pt-BR")}
                      {e.products?.category && ` · ${e.products.category}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
      </section>

      {/* Bloco 5b — atalho para colaboradores */}
      {agencyEntries.length > 0 && (
        <InfoCard
          title="Sua agência"
          description={`${agencyEntries.length} colega(s) ativos no mês`}
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/ranking-v3">Ver ranking</Link>
            </Button>
          }
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              Líder: <span className="font-medium text-foreground">
                {agencyEntries[0]?.pts.toFixed(0)} pts
              </span>
              {myPos ? ` · você em ${myPos}º` : ""}
            </span>
          </div>
        </InfoCard>
      )}
    </PageContainer>
  );
}
