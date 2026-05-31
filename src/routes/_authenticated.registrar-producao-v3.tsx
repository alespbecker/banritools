import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageSkeleton } from "@/components/PageSkeleton";
import { toast } from "sonner";
import { FileText, Save, CheckCircle2, Sparkles, Package } from "lucide-react";
import { logAudit } from "@/features/audit/log";
import {
  PageContainer,
  PageHeader,
  InfoCard,
  AlertCard,
} from "@/components/ds";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/features/production/types";
import { VARIANT_TYPE_LABEL } from "@/features/production/types";

const CATEGORY_GRADIENT: Record<string, string> = {
  Seguros: "from-blue-500/10 to-cyan-500/10",
  Capitalização: "from-purple-500/10 to-pink-500/10",
  Crédito: "from-emerald-500/10 to-teal-500/10",
  Cartões: "from-orange-500/10 to-amber-500/10",
  Recuperação: "from-rose-500/10 to-red-500/10",
  PJ: "from-indigo-500/10 to-blue-500/10",
  "Serviços Bancários": "from-slate-500/10 to-zinc-500/10",
  Relacionamento: "from-fuchsia-500/10 to-pink-500/10",
  Investimentos: "from-violet-500/10 to-purple-500/10",
};

export const Route = createFileRoute("/_authenticated/registrar-producao-v3")({
  head: () => ({ meta: [{ title: "Registrar Produção — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={0} rows={8} />,
});

interface Values { quantity: number; amount: number; variants: Record<string, string> }

function ProductRow({
  product,
  variants,
  values,
  gradient,
  onChange,
  onVariant,
}: {
  product: Product;
  variants: ProductVariant[];
  values: Values;
  gradient: string;
  onChange: (key: "quantity" | "amount", v: number) => void;
  onVariant: (type: string, variantId: string) => void;
}) {
  const showQty = product.metric_type === "quantity" || product.metric_type === "mixed";
  const showAmt = product.metric_type === "amount" || product.metric_type === "mixed";
  const filled = values.quantity > 0 || values.amount > 0;
  const points = (values.quantity + values.amount) * (product.points_per_unit ?? 0);

  const variantsByType = useMemo(() => {
    const m = new Map<string, ProductVariant[]>();
    for (const v of variants) {
      if (!m.has(v.variant_type)) m.set(v.variant_type, []);
      m.get(v.variant_type)!.push(v);
    }
    return Array.from(m.entries());
  }, [variants]);

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br p-4 transition-all duration-200",
        gradient,
        filled
          ? "border-success/50 shadow-sm ring-1 ring-success/20"
          : "border-border hover:border-primary/40 hover:shadow-sm",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-card-foreground">{product.name}</span>
            {filled && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Preenchido
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {product.category && <span>{product.category}</span>}
            <span className="opacity-50">·</span>
            <span className="capitalize">{product.metric_type}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="neutral">{product.points_per_unit} pts/{product.unit}</Badge>
          {filled && points > 0 && (
            <span className="text-xs font-medium text-success">+{points.toFixed(0)} pts</span>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {showQty && (
          <div>
            <Label htmlFor={`q-${product.id}`} className="text-xs text-muted-foreground">
              Quantidade
            </Label>
            <Input
              id={`q-${product.id}`}
              type="number" min="0" step="1" inputMode="numeric"
              placeholder="0"
              value={values.quantity || ""}
              onChange={(e) => onChange("quantity", Number(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        )}
        {showAmt && (
          <div>
            <Label htmlFor={`a-${product.id}`} className="text-xs text-muted-foreground">
              Valor (R$)
            </Label>
            <Input
              id={`a-${product.id}`}
              type="number" min="0" step="0.01" inputMode="decimal"
              placeholder="0,00"
              value={values.amount || ""}
              onChange={(e) => onChange("amount", Number(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        )}
      </div>
      {filled && variantsByType.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {variantsByType.map(([type, list]) => (
            <div key={type}>
              <Label className="text-xs text-muted-foreground">
                {VARIANT_TYPE_LABEL[type as keyof typeof VARIANT_TYPE_LABEL] ?? type}
              </Label>
              <Select
                value={values.variants[type] ?? ""}
                onValueChange={(v) => onVariant(type, v)}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {list.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DRAFT_KEY = "banritools:producao-v3:draft";

function Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [values, setValues] = useState<Record<string, Values>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as { values?: Record<string, Values> };
      return parsed.values ?? {};
    } catch { return {}; }
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<{
    count: number; points: number;
    items: { name: string; qty: number; amt: number; variantNames: string[] }[];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("*").eq("active", true).order("display_order"),
      supabase.from("product_variants").select("*").eq("active", true).order("display_order"),
    ]).then(([prodRes, varRes]) => {
      setProducts((prodRes.data ?? []) as unknown as Product[]);
      setVariants((varRes.data ?? []) as unknown as ProductVariant[]);
      setLoading(false);
    });
  }, []);

  // Persist draft so variant selection survives reload until salvar
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ date, values })); }
    catch { /* ignore quota */ }
  }, [date, values]);

  const variantsByProduct = useMemo(() => {
    const m = new Map<string, ProductVariant[]>();
    for (const v of variants) {
      if (!m.has(v.product_id)) m.set(v.product_id, []);
      m.get(v.product_id)!.push(v);
    }
    return m;
  }, [variants]);

  const upd = (id: string, key: "quantity" | "amount", v: number) => {
    setValues((s) => {
      const prev = s[id] ?? { quantity: 0, amount: 0, variants: {} };
      return { ...s, [id]: { ...prev, [key]: v } };
    });
  };

  const updVariant = (id: string, type: string, variantId: string) => {
    setValues((s) => {
      const prev = s[id] ?? { quantity: 0, amount: 0, variants: {} };
      return { ...s, [id]: { ...prev, variants: { ...prev.variants, [type]: variantId } } };
    });
  };

  const summary = useMemo(() => {
    let count = 0, points = 0, totalAmt = 0, totalQty = 0;
    products.forEach((p) => {
      const v = values[p.id];
      if (!v) return;
      if (v.quantity > 0 || v.amount > 0) {
        count++;
        points += (v.quantity + v.amount) * (p.points_per_unit ?? 0);
        totalAmt += v.amount;
        totalQty += v.quantity;
      }
    });
    return { count, points, totalAmt, totalQty };
  }, [products, values]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const key = p.category ?? "Outros";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries());
  }, [products]);

  const variantById = useMemo(() => {
    const m = new Map<string, ProductVariant>();
    for (const v of variants) m.set(v.id, v);
    return m;
  }, [variants]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const summaryItems: { name: string; qty: number; amt: number; variantNames: string[] }[] = [];
    const entries = products
      .map((p) => {
        const v = values[p.id] ?? { quantity: 0, amount: 0, variants: {} };
        if (v.quantity === 0 && v.amount === 0) return null;
        const variantIds = Object.values(v.variants ?? {}).filter(Boolean);
        const primaryVariantId = variantIds[0] ?? null;
        summaryItems.push({
          name: p.name,
          qty: v.quantity,
          amt: v.amount,
          variantNames: variantIds.map((id) => variantById.get(id)?.name ?? "").filter(Boolean),
        });
        return {
          user_id: user.id,
          product_id: p.id,
          variant_id: primaryVariantId,
          entry_date: date,
          quantity: v.quantity,
          amount: v.amount,
          status: "confirmed",
          details: variantIds.length > 1 ? { variant_ids: variantIds } : {},
        };
      })
      .filter(Boolean);
    setSaving(true);
    const { error } = await supabase.from("production_entries").insert(entries as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    await logAudit({ action: "production.create", entity: "production_entry", details: { count: entries.length, date } });
    toast.success(`${entries.length} lançamento(s) salvos`);
    setLastSaved({ count: entries.length, points: summary.points, items: summaryItems });
    setValues({});
    if (typeof window !== "undefined") {
      try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [user, products, values, date, summary.points, variantById]);

  if (loading) return <PageSkeleton kpis={0} rows={8} />;

  return (
    <PageContainer size="lg">
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title="Registrar Produção"
        description="Lance suas vendas do dia em segundos"
      />

      {lastSaved && (
        <div className="animate-fade-in-up rounded-2xl border border-success/30 bg-gradient-to-br from-success/10 via-card to-card p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground">Produção registrada</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">{lastSaved.count}</span> lançamento{lastSaved.count === 1 ? "" : "s"} salvo{lastSaved.count === 1 ? "" : "s"}
                {lastSaved.points > 0 && (
                  <> · <span className="font-medium text-success tabular-nums">+{lastSaved.points.toFixed(0)} pontos</span> adicionados</>
                )}
              </p>
              {lastSaved.items.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {lastSaved.items.map((it, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-foreground">{it.name}</span>
                      {it.qty > 0 && <span className="tabular-nums">· {it.qty} un</span>}
                      {it.amt > 0 && <span className="tabular-nums">· R$ {it.amt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                      {it.variantNames.map((vn) => (
                        <Badge key={vn} variant="neutral" className="text-[10px]">{vn}</Badge>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setLastSaved(null)}>
                  Registrar mais
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate({ to: "/dashboard-v3" })}>
                  Ver início
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/historico" })}>
                  Ver histórico
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InfoCard title="Data do lançamento">
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="entry-date" className="sr-only">Data</Label>
            <Input
              id="entry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="max-w-xs"
            />
            <Badge variant={summary.count > 0 ? "success" : "neutral"}>
              {summary.count} preenchido{summary.count === 1 ? "" : "s"}
            </Badge>
            {summary.points > 0 && (
              <Badge variant="info">+{summary.points.toFixed(0)} pts</Badge>
            )}
          </div>
        </InfoCard>

        {products.length === 0 ? (
          <AlertCard
            tone="warning"
            title="Nenhum produto ativo"
            description="Peça ao administrador para cadastrar produtos no catálogo."
          />
        ) : (
          <div className="space-y-5">
            {grouped.map(([category, items]) => {
              const filledInCat = items.filter(
                (p) => (values[p.id]?.quantity ?? 0) > 0 || (values[p.id]?.amount ?? 0) > 0,
              ).length;
              return (
                <section key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      {category}
                      <span className="text-muted-foreground/60">· {items.length}</span>
                    </h3>
                    {filledInCat > 0 && (
                      <Badge variant="success">{filledInCat} preenchido{filledInCat === 1 ? "" : "s"}</Badge>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        variants={variantsByProduct.get(p.id) ?? []}
                        values={values[p.id] ?? { quantity: 0, amount: 0, variants: {} }}
                        gradient={CATEGORY_GRADIENT[category] ?? "from-muted/20 to-muted/5"}
                        onChange={(k, v) => upd(p.id, k, v)}
                        onVariant={(t, vid) => updVariant(p.id, t, vid)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/85 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 text-xs text-muted-foreground">
              {summary.count > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="success">{summary.count} produto{summary.count === 1 ? "" : "s"}</Badge>
                  {summary.totalAmt > 0 && (
                    <Badge variant="neutral" className="tabular-nums">
                      R$ {summary.totalAmt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </Badge>
                  )}
                  {summary.points > 0 && (
                    <Badge variant="info" className="tabular-nums">+{summary.points.toFixed(0)} pts</Badge>
                  )}
                </div>
              ) : (
                "Preencha ao menos um produto para salvar"
              )}
            </div>
            <Button type="submit" disabled={saving || summary.count === 0} size="lg" className="min-w-[180px]">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : `Salvar lançamento${summary.count === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
