import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSkeleton } from "@/components/PageSkeleton";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";
import type { Product } from "@/features/production/types";

export const Route = createFileRoute("/_authenticated/registrar-producao-v2")({
  head: () => ({ meta: [{ title: "Registrar Produção (Novo) — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={0} rows={8} />,
});

function Page() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [values, setValues] = useState<Record<string, { quantity: number; amount: number }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("products").select("*").eq("active", true).order("display_order").then(({ data }) => {
      setProducts((data ?? []) as Product[]);
      setLoading(false);
    });
  }, []);

  const upd = (id: string, key: "quantity" | "amount", v: number) => {
    setValues((s) => ({ ...s, [id]: { quantity: 0, amount: 0, ...s[id], [key]: v } }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const entries = products
      .map((p) => {
        const v = values[p.id] ?? { quantity: 0, amount: 0 };
        if (v.quantity === 0 && v.amount === 0) return null;
        return {
          user_id: user.id,
          product_id: p.id,
          entry_date: date,
          quantity: v.quantity,
          amount: v.amount,
          status: "confirmed",
        };
      })
      .filter(Boolean);
    if (entries.length === 0) return toast.error("Preencha ao menos um produto");
    setSaving(true);
    const { error } = await supabase.from("production_entries").insert(entries as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${entries.length} lançamento(s) salvos`);
    setValues({});
  }, [user, products, values, date]);

  if (loading) return <PageSkeleton kpis={0} rows={8} />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Registrar Produção <span className="text-xs text-muted-foreground">(Novo)</span></h1>
          <p className="text-sm text-muted-foreground">Modelo flexível baseado em catálogo de produtos</p>
        </div>
        <Link to="/registrar-producao" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Versão antiga</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <Label>Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-xs" />
        </div>

        <div className="space-y-2">
          {products.map((p) => {
            const v = values[p.id] ?? { quantity: 0, amount: 0 };
            const showQty = p.metric_type === "quantity" || p.metric_type === "mixed";
            const showAmt = p.metric_type === "amount" || p.metric_type === "mixed";
            return (
              <div key={p.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    {p.category && <div className="text-xs text-muted-foreground">{p.category}</div>}
                  </div>
                  <span className="text-xs text-muted-foreground">{p.points_per_unit} pts/{p.unit}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {showQty && (
                    <div>
                      <Label className="text-xs">Quantidade</Label>
                      <Input type="number" min="0" step="1" value={v.quantity || ""} onChange={(e) => upd(p.id, "quantity", Number(e.target.value) || 0)} />
                    </div>
                  )}
                  {showAmt && (
                    <div>
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input type="number" min="0" step="0.01" value={v.amount || ""} onChange={(e) => upd(p.id, "amount", Number(e.target.value) || 0)} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {products.length === 0 && <p className="text-center text-muted-foreground p-6">Nenhum produto ativo. Peça ao admin para cadastrar em /admin/produtos.</p>}
        </div>

        <div className="sticky bottom-0 bg-background pt-3 pb-1">
          <Button type="submit" disabled={saving} className="w-full">{saving ? "Salvando..." : "Salvar lançamentos"}</Button>
        </div>
      </form>
    </div>
  );
}
