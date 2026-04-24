import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageSkeleton, TableSkeleton } from "@/components/PageSkeleton";

export const Route = createFileRoute("/_authenticated/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — BanriTools" },
      { name: "description", content: "Ranking mensal de produção da agência" },
    ],
  }),
  component: RankingPage,
  pendingComponent: () => <PageSkeleton kpis={3} rows={6} />,
});

type RankingRow = {
  user_id: string;
  agency_id: string | null;
  points: number;
  position: number;
  month: string;
};

type ProfileLite = { id: string; name: string | null };

function getMonthOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    out.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return out;
}

function RankingPage() {
  const { user, profile } = useAuth();
  const months = useMemo(getMonthOptions, []);
  const [month, setMonth] = useState(months[0].value);
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [profilesMap, setProfilesMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    const { data: rankData } = await supabase
      .from("ranking_monthly")
      .select("user_id, agency_id, points, position, month")
      .eq("month", month)
      .order("points", { ascending: false });

    const list = (rankData as RankingRow[]) ?? [];
    setRows(list);

    const userIds = list.map((r) => r.user_id);
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);
      const m = new Map<string, string>();
      for (const p of (profs as ProfileLite[]) ?? []) {
        m.set(p.id, p.name ?? "Sem nome");
      }
      setProfilesMap(m);
    } else {
      setProfilesMap(new Map());
    }
    setLoading(false);
  }, [month]);

  useEffect(() => { fetchRanking(); }, [fetchRanking]);

  useEffect(() => {
    const handler = () => fetchRanking();
    window.addEventListener("banritools:sync", handler);
    return () => window.removeEventListener("banritools:sync", handler);
  }, [fetchRanking]);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("ranking-monthly")
      .on("postgres_changes", { event: "*", schema: "public", table: "ranking_monthly" }, () => fetchRanking())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchRanking]);

  const myRow = rows.find((r) => r.user_id === user?.id);
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);

  const medalFor = (pos: number) => {
    if (pos === 1) return <Trophy className="h-5 w-5 text-warning" />;
    if (pos === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (pos === 3) return <Award className="h-5 w-5 text-warning/70" />;
    return <span className="text-sm font-bold text-muted-foreground">#{pos}</span>;
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Trophy className="h-5 w-5 text-warning" aria-hidden="true" />
            Ranking Mensal
          </h1>
          <p className="text-sm text-muted-foreground">Classificação de produção da sua agência</p>
        </div>
        <div>
          <label htmlFor="ranking-month" className="mb-1 block text-xs text-muted-foreground">Mês</label>
          <select
            id="ranking-month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Selecionar mês para visualizar o ranking"
            title="Trocar o mês exibido no ranking"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Minha posição */}
      {myRow && (
        <div className="mb-6 rounded-lg border border-primary/40 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Sua posição</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
                {medalFor(rows.findIndex((r) => r.user_id === user?.id) + 1)}
                <span>{profile?.name ?? "Você"}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Pontos</p>
              <p className="mt-1 flex items-center justify-end gap-1 text-2xl font-bold text-primary">
                <TrendingUp className="h-5 w-5" />
                {myRow.points.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pódio */}
      {top.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {top.map((r, i) => {
            const pos = i + 1;
            return (
              <div
                key={r.user_id}
                className={cn(
                  "rounded-lg border p-4",
                  pos === 1 ? "border-warning/40 bg-warning/5" :
                  pos === 2 ? "border-muted-foreground/30 bg-muted/30" :
                  "border-warning/20 bg-warning/5"
                )}
              >
                <div className="flex items-center gap-2">{medalFor(pos)}<span className="text-xs uppercase tracking-wide text-muted-foreground">{pos}º lugar</span></div>
                <p className="mt-2 truncate text-base font-semibold text-foreground">{profilesMap.get(r.user_id) ?? "Usuário"}</p>
                <p className="mt-1 text-xl font-bold text-primary">{r.points.toLocaleString("pt-BR")} pts</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabela completa */}
      {loading ? (
        <TableSkeleton rows={5} cols={3} />
      ) : (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Posição</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuário</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {rest.length === 0 && top.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Sem dados de ranking para este mês</td></tr>
            ) : (
              rows.map((r, idx) => {
                const pos = idx + 1;
                const isMe = r.user_id === user?.id;
                return (
                  <tr key={r.user_id} className={cn("border-b border-border last:border-0", isMe && "bg-primary/5")}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2">{medalFor(pos)}</div></td>
                    <td className="px-4 py-3 text-foreground">
                      {profilesMap.get(r.user_id) ?? "Usuário"}
                      {isMe && <span className="ml-2 text-xs text-primary">(você)</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{r.points.toLocaleString("pt-BR")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
