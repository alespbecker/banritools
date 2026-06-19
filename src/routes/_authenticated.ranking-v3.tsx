import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Trophy, Medal, Award, TrendingUp, Sparkles } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  InfoCard,
  KpiCard,
  DashboardGrid,
  ProgressWithLabel,
} from "@/components/ds";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { motion, AnimatePresence } from "framer-motion";

import { ErrorState } from "@/components/states/ErrorState";
import { EmptyState } from "@/components/states/EmptyState";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ranking-v3")({
  head: () => ({ meta: [{ title: "Ranking — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={3} rows={8} />,
});

interface Row { user_id: string; name: string; pts: number }

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}

function Page() {
  const { profile, user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showSpinner = true) => {
    if (!profile?.agency_id) { setLoading(false); return; }
    if (showSpinner) setLoading(true);
    setError(null);
    const start = new Date(); start.setDate(1);
    const startStr = start.toISOString().split("T")[0];

    const { data: entries, error: e } = await supabase
      .from("production_entries")
      .select("user_id, quantity, amount, products(points_per_unit)")
      .eq("agency_id", profile.agency_id!)
      .eq("status", "confirmed")
      .gte("entry_date", startStr);
    if (e) { setError(e.message); setLoading(false); return; }

    const byUser = new Map<string, number>();
    (entries ?? []).forEach((row) => {
      type EntryRow = {
        user_id: string; quantity: number | null; amount: number | null;
        products: { points_per_unit: number } | null;
      };
      const er = row as unknown as EntryRow;
      const ppu = er.products?.points_per_unit ?? 0;
      const pts = (Number(er.quantity || 0) + Number(er.amount || 0)) * ppu;
      byUser.set(er.user_id, (byUser.get(er.user_id) ?? 0) + pts);
    });

    if (byUser.size === 0) { setRows([]); setLoading(false); return; }

    const { data: profiles } = await supabase
      .from("profiles").select("id, name").in("id", Array.from(byUser.keys()));

    const out = Array.from(byUser.entries())
      .map(([uid, pts]) => ({
        user_id: uid,
        name: profiles?.find((p) => p.id === uid)?.name ?? "—",
        pts,
      }))
      .sort((a, b) => b.pts - a.pts);
    setRows(out);
    setLoading(false);
  }, [profile?.agency_id]);

  useEffect(() => { load(true); }, [load]);

  // Realtime: re-fetch silently on any production change in the agency
  useEffect(() => {
    if (!profile?.agency_id) return;
    const channel = supabase
      .channel(`ranking-v3-${profile.agency_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "production_entries", filter: `agency_id=eq.${profile.agency_id}` },
        () => { load(false); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.agency_id, load]);

  const computed = useMemo(() => {
    const top = rows[0]?.pts ?? 0;
    const myIndex = rows.findIndex((r) => r.user_id === user?.id);
    const myRow = myIndex >= 0 ? rows[myIndex] : null;
    const nextAhead = myIndex > 0 ? rows[myIndex - 1] : null;
    const diffToNext = nextAhead && myRow ? nextAhead.pts - myRow.pts : 0;
    const diffToLeader = myRow && myIndex > 0 ? top - myRow.pts : 0;
    const totalPts = rows.reduce((s, r) => s + r.pts, 0);
    return { top, myIndex, myRow, nextAhead, diffToNext, diffToLeader, totalPts };
  }, [rows, user?.id]);

  if (loading) return <PageSkeleton kpis={3} rows={8} />;
  if (error) return <ErrorState message={error} onRetry={() => load(true)} />;

  const { top, myIndex, myRow, nextAhead, diffToNext, diffToLeader, totalPts } = computed;

  const podium = (i: number) => {
    if (i === 0) return { Icon: Trophy, color: "text-warning", bg: "bg-warning/15" };
    if (i === 1) return { Icon: Medal, color: "text-muted-foreground", bg: "bg-muted" };
    if (i === 2) return { Icon: Award, color: "text-accent", bg: "bg-accent/15" };
    return null;
  };

  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

  const motivation = !myRow
    ? "Comece a registrar produção para entrar no ranking deste mês."
    : myIndex === 0
      ? "Você está liderando o mês. Continue no ritmo!"
      : diffToNext > 0
        ? `Faltam ${Math.round(diffToNext)} pontos para subir para o ${myIndex}º lugar.`
        : "Continue evoluindo neste mês.";

  return (
    <PageContainer>
      <PageHeader
        icon={<Trophy className="h-5 w-5" />}
        title="Ranking"
        description={`Sua evolução em ${monthName}`}
      />

      <section className="animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Sua posição
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums">
                {myRow ? <><AnimatedNumber value={myIndex + 1} />º</> : "—"}
              </span>
              {myRow && (
                <span className="text-sm text-muted-foreground">
                  de <AnimatedNumber value={rows.length} />
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{motivation}</p>
            {myRow && (
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="info"><AnimatedNumber value={Math.round(myRow.pts)} /> pts</Badge>
                {diffToNext > 0 && (
                  <Badge variant="warning">+<AnimatedNumber value={Math.round(diffToNext)} /> para subir</Badge>
                )}
                {diffToLeader > 0 && (
                  <Badge variant="neutral"><AnimatedNumber value={Math.round(diffToLeader)} /> para o líder</Badge>
                )}
              </div>
            )}
          </div>
          {myRow && top > 0 && (
            <div className="space-y-2">
              <ProgressWithLabel
                label="Sua evolução vs. líder"
                value={(myRow.pts / top) * 100}
                valueLabel={`${Math.round(myRow.pts)} / ${Math.round(top)} pts`}
                tone={myIndex === 0 ? "success" : "primary"}
                size="lg"
              />
              <p className="text-xs text-muted-foreground">
                Cada lançamento de produção soma pontos para sua posição no mês.
              </p>
            </div>
          )}
        </div>
      </section>

      <DashboardGrid cols={3}>
        <KpiCard
          label="Líder do mês"
          value={rows[0]?.name ?? "—"}
          icon={Trophy}
          tone="warning"
          description={rows[0] ? `${Math.round(rows[0].pts)} pts` : "—"}
        />
        <KpiCard
          label="Próxima posição"
          value={nextAhead ? nextAhead.name : myIndex === 0 ? "Você lidera" : "—"}
          icon={TrendingUp}
          tone="accent"
          description={
            nextAhead ? `+${Math.round(diffToNext)} pts à frente` : myIndex === 0 ? "Continue assim!" : "—"
          }
        />
        <KpiCard
          label="Total da agência"
          value={Math.round(totalPts)}
          icon={Award}
          tone="success"
          description={`${rows.length} participante${rows.length === 1 ? "" : "s"}`}
        />
      </DashboardGrid>

      <InfoCard title="Classificação" description="Pontuação acumulada no mês (atualiza em tempo real)" bodyless>
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sem dados de produção"
              description="O ranking aparece quando alguém da agência registrar produção este mês."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {rows.map((r, i) => {
                const isMe = r.user_id === user?.id;
                const pct = top > 0 ? (r.pts / top) * 100 : 0;
                const p = podium(i);
                return (
                  <motion.li
                    key={r.user_id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3",
                      isMe ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : "hover:bg-accent/30",
                      i < 3 && "bg-card",
                    )}
                  >
                    <div className="flex w-10 shrink-0 items-center justify-center">
                      {p ? (
                        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", p.bg)}>
                          <p.Icon className={cn("h-4 w-4", p.color)} />
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}>
                      {initials(r.name) || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
                        {isMe && <Badge variant="info">Você</Badge>}
                        {i === 0 && <Badge variant="warning">Líder</Badge>}
                      </div>
                      <div className="mt-1.5">
                        <ProgressWithLabel
                          value={pct}
                          valueLabel={`${Math.round(r.pts)} pts`}
                          size="sm"
                          tone={i === 0 ? "warning" : isMe ? "primary" : "muted"}
                        />
                      </div>
                    </div>
                    <div className="hidden sm:block text-right text-sm font-semibold text-foreground tabular-nums min-w-[60px]">
                      <AnimatedNumber value={Math.round(r.pts)} />
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </InfoCard>
    </PageContainer>
  );
}
