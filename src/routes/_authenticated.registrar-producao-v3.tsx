import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/PageSkeleton";
import { toast } from "sonner";
import { FileText, Save } from "lucide-react";
import { logAudit } from "@/features/audit/log";
import {
  PageContainer,
  PageHeader,
  InfoCard,
  AlertCard,
} from "@/components/ds";
import type { Product } from "@/features/production/types";

export const Route = createFileRoute("/_authenticated/registrar-producao-v3")({
  head: () => ({ meta: [{ title: "Registrar Produção v3 — BanriTools" }] }),
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
    supabase
      .from("products").select("*").eq("active", true).order("display_order")
      .then(({ data }) => {
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
  }, []);

  const upd = (id: string, key: "quantity" | "amount", v: number) => {
    setValues((s) => ({ ...s, [id]: { ...{ quantity: 0, amount: 0 }, ...s[id], [key]: v } }));
  };

  const filledCount = useMemo(
    () => Object.values(values).filter((v) => v.quantity > 0 || v.amount > 0).length,
    [values],
  );

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
    await logAudit({ action: "production.create", entity: "production_entry", details: { count: entries.length, date } });
    toast.success(`${entries.length} lançamento(s) salvos`);
    setValues({});
  }, [user, products, values, date]);

  if (loading) return <PageSkeleton kpis={0} rows={8} />;

  return (
    <PageContainer size="md">
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title="Registrar Produção"
        description="Lance suas vendas do dia a partir do catálogo (v3)"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/registrar-producao">Versão antiga</Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <InfoCard title="Data do lançamento">
          <div className="flex items-center gap-3">
            <Label htmlFor="entry-date" className="sr-only">Data</Label>
            <Input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="max-w-xs"
            />
            <Badge variant="neutral">
              {filledCount} preenchido{filledCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </InfoCard>

        {products.length === 0 ? (
          <AlertCard
            tone="warning"
            title="Nenhum produto ativo"
            description="Peça ao administrador para cadastrar produtos no catálogo."
          />
        ) : (
          <div className="grid gap-3">
            {products.map((p) => {
              const v = values[p.id] ?? { quantity: 0, amount: 0 };
              const showQty = p.metric_type === "quantity" || p.metric_type === "mixed";
              const showAmt = p.metric_type === "amount" || p.metric_type === "mixed";
              const filled = v.quantity > 0 || v.amount > 0;
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:border-primary/40"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-card-foreground">{p.name}</span>
                        {filled && <Badge variant="success">Preenchido</Badge>}
                      </div>
                      {p.category && (
                        <div className="text-xs text-muted-foreground">{p.category}</div>
                      )}
                    </div>
                    <Badge variant="neutral">
                      {p.points_per_unit} pts/{p.unit}
                    </Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {showQty && (
                      <div>
                        <Label htmlFor={`q-${p.id}`} className="text-xs">Quantidade</Label>
                        <Input
                          id={`q-${p.id}`}
                          type="number" min="0" step="1"
                          value={v.quantity || ""}
                          onChange={(e) => upd(p.id, "quantity", Number(e.target.value) || 0)}
                        />
                      </div>
                    )}
                    {showAmt && (
                      <div>
                        <Label htmlFor={`a-${p.id}`} className="text-xs">Valor (R$)</Label>
                        <Input
                          id={`a-${p.id}`}
                          type="number" min="0" step="0.01"
                          value={v.amount || ""}
                          onChange={(e) => upd(p.id, "amount", Number(e.target.value) || 0)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <Button type="submit" disabled={saving || filledCount === 0} className="w-full">
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : `Salvar ${filledCount || ""} lançamento${filledCount === 1 ? "" : "s"}`}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
