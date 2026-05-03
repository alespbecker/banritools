import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/PageSkeleton";
import { toast } from "sonner";
import { Plus, Target, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({ meta: [{ title: "Metas — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={0} rows={4} />,
});

interface Goal {
  id: string;
  product_id: string | null;
  target_quantity: number;
  target_amount: number | null;
  period_start: string;
  period_end: string;
  period_type: string;
  scope: string;
  user_id: string | null;
  agency_id: string | null;
  products?: { name: string } | null;
}
interface Product { id: string; name: string }

function Page() {
  const { user, userRole, profile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<Record<string, { qty: number; amt: number }>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const isAdminOrManager = userRole === "admin";

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];

  const [form, setForm] = useState({
    product_id: "",
    target_quantity: 0,
    target_amount: 0,
    period_start: monthStart,
    period_end: monthEnd,
    period_type: "monthly",
    scope: "individual",
  });

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: g }, { data: p }] = await Promise.all([
      supabase.from("goals").select("*, products(name)").order("period_start", { ascending: false }),
      supabase.from("products").select("id, name").eq("active", true).order("display_order"),
    ]);
    setGoals((g ?? []) as Goal[]);
    setProducts((p ?? []) as Product[]);

    // calculate progress per goal
    const prog: Record<string, { qty: number; amt: number }> = {};
    for (const goal of (g ?? []) as Goal[]) {
      let q = supabase.from("production_entries")
        .select("quantity, amount")
        .gte("entry_date", goal.period_start)
        .lte("entry_date", goal.period_end)
        .eq("status", "confirmed");
      if (goal.product_id) q = q.eq("product_id", goal.product_id);
      if (goal.scope === "individual" && goal.user_id) q = q.eq("user_id", goal.user_id);
      else if (goal.scope === "agency" && goal.agency_id) q = q.eq("agency_id", goal.agency_id);
      const { data: entries } = await q;
      prog[goal.id] = {
        qty: (entries ?? []).reduce((s, e) => s + Number(e.quantity || 0), 0),
        amt: (entries ?? []).reduce((s, e) => s + Number(e.amount || 0), 0),
      };
    }
    setProgress(prog);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    const payload: Record<string, unknown> = {
      product_id: form.product_id || null,
      target_quantity: form.target_quantity,
      target_amount: form.target_amount || null,
      period_start: form.period_start,
      period_end: form.period_end,
      period_type: form.period_type,
      scope: form.scope,
    };
    if (form.scope === "individual") payload.user_id = user.id;
    else payload.agency_id = profile.agency_id;

    const { error } = await supabase.from("goals").insert(payload as never);
    if (error) return toast.error(error.message);
    toast.success("Meta criada");
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir meta?")) return;
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  if (loading) return <PageSkeleton kpis={0} rows={4} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Metas</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de metas individuais e da agência</p>
        </div>
        {isAdminOrManager && (
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Nova meta</Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Produto</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                <option value="">— Todos —</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Escopo</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
                <option value="individual">Individual (eu)</option>
                <option value="agency">Agência</option>
              </select>
            </div>
            <div><Label>Quantidade-alvo</Label><Input type="number" value={form.target_quantity} onChange={(e) => setForm({ ...form, target_quantity: Number(e.target.value) })} /></div>
            <div><Label>Valor-alvo (R$)</Label><Input type="number" step="0.01" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })} /></div>
            <div><Label>Início</Label><Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} /></div>
            <div><Label>Fim</Label><Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} /></div>
            <div>
              <Label>Tipo de período</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.period_type} onChange={(e) => setForm({ ...form, period_type: e.target.value })}>
                <option value="daily">Diário</option><option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option><option value="quarterly">Trimestral</option><option value="yearly">Anual</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2"><Button type="submit">Criar</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button></div>
        </form>
      )}

      <div className="space-y-3">
        {goals.length === 0 && <p className="text-center text-muted-foreground p-6">Nenhuma meta cadastrada.</p>}
        {goals.map((g) => {
          const p = progress[g.id] ?? { qty: 0, amt: 0 };
          const pctQty = g.target_quantity > 0 ? Math.min(100, (p.qty / g.target_quantity) * 100) : 0;
          const pctAmt = g.target_amount && g.target_amount > 0 ? Math.min(100, (p.amt / g.target_amount) * 100) : 0;
          return (
            <div key={g.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium">{g.products?.name ?? "Todos os produtos"}</div>
                  <div className="text-xs text-muted-foreground">{g.scope === "individual" ? "Individual" : "Agência"} · {g.period_type} · {g.period_start} → {g.period_end}</div>
                </div>
                {isAdminOrManager && <button onClick={() => handleDelete(g.id)} className="p-1 hover:bg-muted rounded text-destructive"><Trash2 className="h-4 w-4" /></button>}
              </div>
              {g.target_quantity > 0 && (
                <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span>Quantidade</span><span>{p.qty.toFixed(0)} / {g.target_quantity}</span></div><Progress value={pctQty} /></div>
              )}
              {g.target_amount && g.target_amount > 0 && (
                <div><div className="flex justify-between text-xs mb-1"><span>Valor</span><span>R$ {p.amt.toFixed(2)} / {g.target_amount}</span></div><Progress value={pctAmt} /></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
