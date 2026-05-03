import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Trophy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ranking-v2")({
  head: () => ({ meta: [{ title: "Ranking (Novo) — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={0} rows={6} />,
});

function Page() {
  const { profile, user } = useAuth();
  const [rows, setRows] = useState<{ user_id: string; name: string; pts: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.agency_id) { setLoading(false); return; }
    const start = new Date(); start.setDate(1);
    const startStr = start.toISOString().split("T")[0];

    (async () => {
      const { data: entries } = await supabase
        .from("production_entries")
        .select("user_id, quantity, amount, products(points_per_unit)")
        .eq("agency_id", profile.agency_id!)
        .eq("status", "confirmed")
        .gte("entry_date", startStr);

      const byUser = new Map<string, number>();
      (entries ?? []).forEach((e) => {
        type EntryRow = { user_id: string; quantity: number | null; amount: number | null; products: { points_per_unit: number } | null };
        const er = e as unknown as EntryRow;
        const ppu = er.products?.points_per_unit ?? 0;
        const pts = (Number(er.quantity || 0) + Number(er.amount || 0)) * ppu;
        byUser.set(er.user_id, (byUser.get(er.user_id) ?? 0) + pts);
      });

      if (byUser.size === 0) { setRows([]); setLoading(false); return; }

      const { data: profiles } = await supabase
        .from("profiles").select("id, name").in("id", Array.from(byUser.keys()));

      const out = Array.from(byUser.entries())
        .map(([uid, pts]) => ({ user_id: uid, name: profiles?.find((p) => p.id === uid)?.name ?? "—", pts }))
        .sort((a, b) => b.pts - a.pts);
      setRows(out);
      setLoading(false);
    })();
  }, [profile?.agency_id]);

  if (loading) return <PageSkeleton kpis={0} rows={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Ranking <span className="text-xs text-muted-foreground">(Novo)</span></h1>
          <p className="text-sm text-muted-foreground">Calculado em tempo real do novo modelo (mês corrente)</p>
        </div>
        <Link to="/ranking" className="text-sm text-muted-foreground hover:text-foreground">Versão antiga →</Link>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr><th className="text-left p-3 w-16">#</th><th className="text-left p-3">Funcionário</th><th className="text-right p-3">Pontos</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.user_id} className={`border-t border-border ${r.user_id === user?.id ? "bg-primary/5" : ""}`}>
                <td className="p-3 font-bold flex items-center gap-1">{i < 3 && <Trophy className="h-4 w-4 text-primary" />}{i + 1}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3 text-right font-medium">{r.pts.toFixed(0)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Sem dados de produção este mês.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
