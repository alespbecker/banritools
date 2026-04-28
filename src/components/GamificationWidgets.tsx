import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Flame, Shield, Target, TrendingUp } from "lucide-react";

const LEVEL_NAMES: Record<number, string> = {
  1: "Iniciante",
  2: "Consultor",
  3: "Especialista",
  4: "Elite",
  5: "Mestre",
};

const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 1000,
  3: 3000,
  4: 7000,
  5: 15000,
};

type Badge = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  condition_type: string;
  condition_value: number;
};

type UserBadge = {
  badge_id: string;
  unlocked_at: string;
};

type RankingEntry = {
  user_id: string;
  points: number;
  position: number;
  profiles?: { name: string | null } | null;
};

type UserPointsData = {
  total_points: number;
  level: number;
};

interface GamificationWidgetsProps {
  userId: string;
  agencyId: string | null;
  monthStart: string;
  /** Chamado quando os dados iniciais estiverem carregados — permite ao pai
   *  coordenar a transição para evitar pop-in de conteúdo. */
  onReady?: () => void;
}

export function GamificationWidgets({ userId, agencyId, monthStart, onReady }: GamificationWidgetsProps) {
  const [userPoints, setUserPoints] = useState<UserPointsData | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<UserBadge[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const readyFiredRef = useRef(false);

  const fetchUserPoints = () =>
    supabase
      .from("user_points")
      .select("total_points, level")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setUserPoints(data ?? { total_points: 0, level: 1 }));

  const fetchBadges = () =>
    Promise.all([
      supabase.from("badges").select("*"),
      supabase.from("user_badges").select("badge_id, unlocked_at").eq("user_id", userId),
    ]).then(([badgesRes, userBadgesRes]) => {
      setAllBadges((badgesRes.data as Badge[]) ?? []);
      setUnlockedBadges((userBadgesRes.data as UserBadge[]) ?? []);
    });

  const fetchRanking = () => {
    if (!agencyId) return Promise.resolve();
    return supabase
      .from("ranking_monthly")
      .select("user_id, points, position, profiles:user_id(name)")
      .eq("agency_id", agencyId)
      .eq("month", monthStart)
      .order("position")
      .limit(10)
      .then(({ data }) => setRanking((data as unknown as RankingEntry[]) ?? []));
  };

  // Carga inicial coordenada — só dispara onReady quando TUDO chegou.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    Promise.all([fetchUserPoints(), fetchBadges(), fetchRanking()]).finally(() => {
      if (cancelled) return;
      if (!readyFiredRef.current) {
        readyFiredRef.current = true;
        onReady?.();
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, agencyId, monthStart]);

  // Realtime subscriptions for live gamification updates
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`gamification-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_points", filter: `user_id=eq.${userId}` }, fetchUserPoints)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_badges", filter: `user_id=eq.${userId}` }, fetchBadges)
      .on("postgres_changes", { event: "*", schema: "public", table: "ranking_monthly" }, fetchRanking)
      .subscribe();

    const handler = () => { fetchUserPoints(); fetchBadges(); fetchRanking(); };
    window.addEventListener("banritools:sync", handler);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("banritools:sync", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, agencyId, monthStart]);

  // Generate insights
  useEffect(() => {
    if (!userPoints) return;
    const msgs: string[] = [];

    const level = userPoints.level;
    if (level < 5) {
      const nextThreshold = LEVEL_THRESHOLDS[level + 1];
      const remaining = nextThreshold - userPoints.total_points;
      if (remaining > 0) {
        msgs.push(`Você está a ${remaining.toLocaleString("pt-BR")} pontos de alcançar o nível ${LEVEL_NAMES[level + 1]}.`);
      }
    }

    const myRank = ranking.find((r) => r.user_id === userId);
    if (myRank) {
      msgs.push(`Você está em ${myRank.position}º lugar no ranking da agência.`);
    }

    // Badge proximity hints
    const unlockedIds = new Set(unlockedBadges.map((ub) => ub.badge_id));
    for (const badge of allBadges) {
      if (unlockedIds.has(badge.id)) continue;
      if (badge.condition_type === "seguros_total" && badge.condition_value <= 25) {
        msgs.push(`Continue vendendo seguros para desbloquear "${badge.name}".`);
        break;
      }
    }

    setInsights(msgs);
  }, [userPoints, ranking, allBadges, unlockedBadges, userId]);

  const level = userPoints?.level ?? 1;
  const totalPoints = userPoints?.total_points ?? 0;
  const nextLevel = Math.min(level + 1, 5);
  const currentThreshold = LEVEL_THRESHOLDS[level];
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
  const progressPct = level >= 5 ? 100 : Math.min(100, ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  const unlockedIds = new Set(unlockedBadges.map((ub) => ub.badge_id));

  const profileName = (entry: RankingEntry) => {
    if (entry.profiles && typeof entry.profiles === "object" && "name" in entry.profiles) {
      return (entry.profiles as { name: string | null }).name ?? "Sem nome";
    }
    return "Sem nome";
  };

  return (
    <div className="space-y-6">
      {/* Smart Notifications */}
      {insights.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <Target className="h-4 w-4" />
            Insights de Performance
          </div>
          <ul className="space-y-1">
            {insights.map((msg, i) => (
              <li key={i} className="text-sm text-muted-foreground">• {msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Level Card + Badges in grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Level Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
              {level >= 5 ? "👑" : level >= 4 ? "💎" : level >= 3 ? "⭐" : level >= 2 ? "🏅" : "🌱"}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Nível {level}</p>
              <p className="text-lg font-bold text-foreground">{LEVEL_NAMES[level]}</p>
            </div>
          </div>
          <p className="mb-3 text-2xl font-bold text-primary">{totalPoints.toLocaleString("pt-BR")} <span className="text-sm font-normal text-muted-foreground">pontos</span></p>
          {level < 5 && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Progresso para {LEVEL_NAMES[nextLevel]}</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <Progress value={progressPct} className="h-2.5" />
              <p className="mt-1 text-xs text-muted-foreground">
                {(nextThreshold - totalPoints).toLocaleString("pt-BR")} pontos restantes
              </p>
            </div>
          )}
          {level >= 5 && (
            <p className="text-sm text-primary font-medium">🏆 Nível máximo alcançado!</p>
          )}
        </div>

        {/* Badges */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <Award className="h-4 w-4 text-primary" />
            Conquistas
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {allBadges.map((badge) => {
              const unlocked = unlockedIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center rounded-lg border p-3 text-center transition-colors ${
                    unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 bg-muted/30 opacity-50"
                  }`}
                >
                  <span className="mb-1 text-2xl">{badge.icon ?? "🏅"}</span>
                  <p className={`text-xs font-medium ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    {badge.name}
                  </p>
                  {unlocked && <p className="mt-0.5 text-[10px] text-primary">Desbloqueado!</p>}
                </div>
              );
            })}
            {allBadges.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">Nenhuma conquista disponível</p>
            )}
          </div>
        </div>
      </div>

      {/* Ranking */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <Trophy className="h-4 w-4 text-primary" />
          Ranking da Agência
        </h3>
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ranking não disponível. Verifique se você está vinculado a uma agência.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">#</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Colaborador</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr
                    key={r.user_id}
                    className={`border-b border-border/50 ${r.user_id === userId ? "bg-primary/5" : ""} ${r.position <= 3 ? "font-semibold" : ""}`}
                  >
                    <td className="py-2.5 pr-4">
                      {r.position === 1 ? "🥇" : r.position === 2 ? "🥈" : r.position === 3 ? "🥉" : `${r.position}º`}
                    </td>
                    <td className="py-2.5 pr-4 text-foreground">{profileName(r)}</td>
                    <td className="py-2.5 text-right text-foreground">{r.points.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
