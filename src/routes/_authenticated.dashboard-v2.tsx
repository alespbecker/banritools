import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Sparkles, TrendingUp, Trophy, Package } from "lucide-react";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";

export const Route = createFileRoute("/_authenticated/dashboard-v2")({
  head: () => ({ meta: [{ title: "Dashboard (Novo) — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={4} rows={4} />,
});

interface Row {
  product_id: string;
  quantity: number;
  amount: number | null;
  entry_date: string;
  products: { name: string; category: string | null; points_per_unit: number } | null;
}

function Page() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const start = new Date(); start.setDate(1);
    const startStr = start.toISOString().split("T")[0];
    supabase
      .from("production_entries")
      .select("product_id, quantity, amount, entry_date, products(name, category, points_per_unit)")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .gte("entry_date", startStr)
      .order("entry_date", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []) as never);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <PageSkeleton kpis={4} rows={4} />;

  const totalEntries = rows.length;
  const totalQty = rows.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const totalAmt = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalPts = rows.reduce((s, r) => {
    const ppu = r.products?.points_per_unit ?? 0;
    return s + Number(r.quantity || 0) * ppu + Number(r.amount || 0) * ppu;
  }, 0);

  // por categoria
  const byCat = new Map<string, number>();
  rows.forEach((r) => {
    const cat = r.products?.category ?? "Outros";
    byCat.set(cat, (byCat.get(cat) ?? 0) + Number(r.quantity || 0) + Number(r.amount || 0));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Dashboard <span className="text-xs text-muted-foreground">(Novo)</span></h1>
          <p className="text-sm text-muted-foreground">Baseado no novo modelo de produção (mês corrente)</p>
        </div>
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Versão antiga →</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Package} label="Lançamentos" value={totalEntries} />
        <Kpi icon={TrendingUp} label="Quantidade total" value={totalQty.toFixed(0)} />
        <Kpi icon={TrendingUp} label="Valor (R$)" value={totalAmt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} />
        <Kpi icon={Trophy} label="Pontos estimados" value={totalPts.toFixed(0)} />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold mb-3">Por categoria</h2>
        {byCat.size === 0 ? (
          <p className="text-sm text-muted-foreground">Sem lançamentos no mês.</p>
        ) : (
          <div className="space-y-2">
            {Array.from(byCat.entries()).map(([cat, val]) => (
              <div key={cat} className="flex justify-between text-sm">
                <span>{cat}</span>
                <span className="font-medium">{val.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold mb-3">Últimos lançamentos</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum lançamento. <Link to="/registrar-producao-v2" className="text-primary">Registrar agora</Link></p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="pb-2">Data</th><th>Produto</th><th className="text-right">Qtd</th><th className="text-right">Valor</th></tr></thead>
            <tbody>
              {rows.slice(0, 10).map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2">{new Date(r.entry_date).toLocaleDateString("pt-BR")}</td>
                  <td>{r.products?.name ?? "—"}</td>
                  <td className="text-right">{r.quantity || "—"}</td>
                  <td className="text-right">{r.amount ? Number(r.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm"><Icon className="h-4 w-4" />{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
