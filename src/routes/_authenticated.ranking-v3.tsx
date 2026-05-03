import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Trophy, Medal, Award } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  InfoCard,
  AlertCard,
  KpiCard,
  DashboardGrid,
  ProgressWithLabel,
} from "@/components/ds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/states/ErrorState";
import { EmptyState } from "@/components/states/EmptyState";

export const Route = createFileRoute("/_authenticated/ranking-v3")({
  head: () => ({ meta: [{ title: "Ranking v3 — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={3} rows={8} />,
});

interface Row { user_id: string; name: string; pts: number }

function Page() {
  const { profile, user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.agency_id) { setLoading(false); return; }
    setLoading(true); setError(null);
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

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageSkeleton kpis={3} rows={8} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const top = rows[0]?.pts ?? 0;
  const myIndex = rows.findIndex((r) => r.user_id === user?.id);
  const myRow = myIndex >= 0 ? rows[myIndex] : null;
  const totalPts = rows.reduce((s, r) => s + r.pts, 0);

  const podiumIcon = (i: number) => {
    if (i === 0) return <Trophy className="h-4 w-4 text-warning" />;
    if (i === 1) return <Medal className="h-4 w-4 text-muted-foreground" />;
    if (i === 2) return <Award className="h-4 w-4 text-accent" />;
    return null;
  };

  return (
    <PageContainer>
      <PageHeader
        icon={<Trophy className="h-5 w-5" />}
        title="Ranking"
        description="Classificação da agência no mês corrente (v3)"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/ranking">Versão antiga</Link>
          </Button>
        }
      />

      <DashboardGrid cols={3}>
        <KpiCard
          label="Sua posição"
          value={myRow ? `${myIndex + 1}º` : "—"}
          icon={Trophy}
          tone="primary"
          description={myRow ? `${myRow.pts.toFixed(0)} pts` : "Sem produção"}
        />
        <KpiCard
          label="Líder"
          value={rows[0]?.name ?? "—"}
          icon={Medal}
          tone="warning"
          description={rows[0] ? `${rows[0].pts.toFixed(0)} pts` : "—"}
        />
        <KpiCard
          label="Total da agência"
          value={totalPts.toFixed(0)}
          icon={Award}
          tone="success"
          description={`${rows.length} participante${rows.length === 1 ? "" : "s"}`}
        />
      </DashboardGrid>

      {myRow && myIndex > 2 && (
        <AlertCard
          tone="info"
          title={`Você está em ${myIndex + 1}º lugar`}
          description={`Faltam ${(top - myRow.pts).toFixed(0)} pontos para alcançar a liderança.`}
        />
      )}

      <InfoCard title="Classificação" description="Pontuação acumulada no mês" bodyless>
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sem dados de produção"
              description="O ranking aparece quando alguém da agência registrar produção este mês."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r, i) => {
              const isMe = r.user_id === user?.id;
              const pct = top > 0 ? (r.pts / top) * 100 : 0;
              return (
                <li
                  key={r.user_id}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                    isMe ? "bg-primary/5" : "hover:bg-accent/30"
                  }`}
                >
                  <div className="flex w-8 shrink-0 items-center gap-1 font-semibold text-foreground">
                    {podiumIcon(i)}
                    <span>{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
                      {isMe && <Badge variant="info">Você</Badge>}
                    </div>
                    <div className="mt-1.5">
                      <ProgressWithLabel
                        value={pct}
                        valueLabel={`${r.pts.toFixed(0)} pts`}
                        size="sm"
                        tone={i === 0 ? "warning" : isMe ? "primary" : "muted"}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </InfoCard>
    </PageContainer>
  );
}
