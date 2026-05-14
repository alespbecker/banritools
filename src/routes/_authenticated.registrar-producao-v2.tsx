import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageSkeleton } from "@/components/PageSkeleton";
import { EmptyState } from "@/components/states/EmptyState";
import { toast } from "sonner";
import { Sparkles, ArrowLeft, Search, ChevronLeft, Check, Clock } from "lucide-react";
import { logAudit } from "@/features/audit/log";
import type { Product, ProductVariant, SchemaField, VariantType } from "@/features/production/types";
import { VARIANT_TYPE_LABEL } from "@/features/production/types";

export const Route = createFileRoute("/_authenticated/registrar-producao-v2")({
  head: () => ({ meta: [{ title: "Registrar Produção (Novo) — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={0} rows={8} />,
});

interface RecentEntry {
  id: string;
  entry_date: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  amount: number | null;
  details: Record<string, unknown>;
  notes: string | null;
}

function Page() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const loadRecent = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("production_entries")
      .select("id, entry_date, product_id, variant_id, quantity, amount, details, notes")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10);
    setRecent((data ?? []) as unknown as RecentEntry[]);
  }, [user?.id]);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("*").eq("active", true).order("display_order"),
      supabase.from("product_variants").select("*").eq("active", true).order("display_order"),
    ]).then(([{ data: p }, { data: v }]) => {
      setProducts((p ?? []) as unknown as Product[]);
      setVariants((v ?? []) as unknown as ProductVariant[]);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q));
  }, [products, search]);

  const grouped = useMemo(() => {
    const m = new Map<string, Product[]>();
    for (const p of filtered) {
      const k = p.category ?? "Outros";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(p);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [filtered]);

  const variantsForSelected = useMemo(
    () => (selected ? variants.filter((v) => v.product_id === selected.id) : []),
    [variants, selected],
  );

  if (loading) return <PageSkeleton kpis={0} rows={8} />;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Registrar Produção
            <span className="text-xs text-muted-foreground font-normal">(Novo)</span>
          </h1>
          <p className="text-sm text-muted-foreground">Selecione o produto e preencha apenas o que importa.</p>
        </div>
        <Link to="/registrar-producao" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />Versão antiga
        </Link>
      </div>

      {!selected ? (
        <ProductPicker
          grouped={grouped}
          search={search}
          setSearch={setSearch}
          onPick={setSelected}
        />
      ) : (
        <EntryForm
          product={selected}
          variants={variantsForSelected}
          userId={user?.id ?? ""}
          onBack={() => setSelected(null)}
          onSaved={() => { loadRecent(); setSelected(null); }}
        />
      )}

      <RecentEntries entries={recent} products={products} variants={variants} />
    </div>
  );
}

function RecentEntries({
  entries, products, variants,
}: { entries: RecentEntry[]; products: Product[]; variants: ProductVariant[] }) {
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const variantsById = useMemo(() => new Map(variants.map((v) => [v.id, v])), [variants]);
  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const fmtMoney = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" /> Últimos lançamentos
      </h2>
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhum lançamento ainda.
        </div>
      ) : (
        <ul className="rounded-lg border border-border divide-y divide-border bg-card">
          {entries.map((e) => {
            const p = productsById.get(e.product_id);
            const v = e.variant_id ? variantsById.get(e.variant_id) : null;
            const detailKeys = Object.keys(e.details ?? {}).filter((k) => k !== "variant_ids");
            const detailSummary = detailKeys.slice(0, 2).map((k) => {
              const val = (e.details as Record<string, unknown>)[k];
              return `${k}: ${typeof val === "number" ? val : String(val ?? "—")}`;
            }).join(" · ");
            return (
              <li key={e.id} className="px-3 py-2.5 text-sm flex items-start gap-3">
                <div className="text-[11px] text-muted-foreground tabular-nums w-12 shrink-0 pt-0.5">
                  {fmtDate(e.entry_date)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{p?.name ?? "—"}</span>
                    {v && <Badge variant="secondary" className="text-[10px]">{v.name}</Badge>}
                  </div>
                  {detailSummary && (
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{detailSummary}</div>
                  )}
                </div>
                <div className="text-right text-xs tabular-nums shrink-0">
                  {e.quantity > 0 && <div>{e.quantity} {p?.unit ?? ""}</div>}
                  {e.amount && e.amount > 0 ? <div className="text-muted-foreground">{fmtMoney(Number(e.amount))}</div> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ProductPicker({
  grouped, search, setSearch, onPick,
}: {
  grouped: [string, Product[]][];
  search: string;
  setSearch: (s: string) => void;
  onPick: (p: Product) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {grouped.length === 0 && <EmptyState title="Nenhum produto" description="Sem produtos ativos no catálogo." />}
      {grouped.map(([cat, items]) => (
        <section key={cat}>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{cat}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p)}
                className="text-left rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/30 transition p-3"
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{p.points_per_unit} pts/{p.unit}</div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function EntryForm({
  product, variants, userId, onBack,
}: {
  product: Product;
  variants: ProductVariant[];
  userId: string;
  onBack: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [quantity, setQuantity] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [details, setDetails] = useState<Record<string, unknown>>({});
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const showQty = product.metric_type === "quantity" || product.metric_type === "mixed";
  const showAmt = product.metric_type === "amount" || product.metric_type === "mixed";

  const variantsByType = useMemo(() => {
    const m = new Map<VariantType, ProductVariant[]>();
    for (const v of variants) {
      if (!m.has(v.variant_type)) m.set(v.variant_type, []);
      m.get(v.variant_type)!.push(v);
    }
    return Array.from(m.entries());
  }, [variants]);

  const updField = (key: string, value: unknown) =>
    setDetails((s) => ({ ...s, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (showQty && !quantity && showAmt && !amount) {
      return toast.error("Informe quantidade ou valor");
    }
    if (!showQty && showAmt && !amount) return toast.error("Informe o valor");
    if (showQty && !showAmt && !quantity) return toast.error("Informe a quantidade");

    for (const f of product.field_schema) {
      if (f.required && !details[f.key]) return toast.error(`Campo obrigatório: ${f.label}`);
    }

    // primeira variante (se houver) vai em variant_id; restantes ficam em details.variants
    const variantIds = Object.values(variantSelections).filter(Boolean);
    const primaryVariantId = variantIds[0] ?? null;
    const fullDetails = {
      ...details,
      ...(variantIds.length > 1 ? { variant_ids: variantIds } : {}),
    };

    setSaving(true);
    const { error } = await supabase.from("production_entries").insert({
      user_id: userId,
      product_id: product.id,
      variant_id: primaryVariantId,
      entry_date: date,
      quantity: showQty ? quantity : 0,
      amount: showAmt ? amount : 0,
      notes: notes || null,
      details: fullDetails,
      status: "confirmed",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    await logAudit({ action: "production.create", entity: "production_entry", details: { product: product.slug, date } });
    toast.success("Lançamento salvo");
    onBack();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <button type="button" onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ChevronLeft className="h-3.5 w-3.5" />Outro produto
      </button>

      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-background p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-lg font-medium">{product.name}</h2>
          <Badge variant="secondary" className="text-[10px]">{product.points_per_unit} pts/{product.unit}</Badge>
        </div>
        {product.description && <p className="text-xs text-muted-foreground">{product.description}</p>}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {showQty && (
            <div>
              <Label>Quantidade</Label>
              <Input type="number" min="0" step="1" value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)} />
            </div>
          )}
          {showAmt && (
            <div>
              <Label>Valor (R$)</Label>
              <Input type="number" min="0" step="0.01" value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value) || 0)} />
            </div>
          )}
        </div>

        {variantsByType.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {variantsByType.map(([type, list]) => (
              <div key={type}>
                <Label className="text-xs">{VARIANT_TYPE_LABEL[type]}</Label>
                <Select
                  value={variantSelections[type] ?? ""}
                  onValueChange={(v) => setVariantSelections((s) => ({ ...s, [type]: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
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

        {product.field_schema.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {product.field_schema.map((f) => (
              <DynamicField key={f.key} field={f} value={details[f.key]} onChange={(v) => updField(f.key, v)} />
            ))}
          </div>
        )}

        <div>
          <Label className="text-xs">Observação geral</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
        </div>
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        <Check className="h-4 w-4 mr-1" />{saving ? "Salvando…" : "Salvar lançamento"}
      </Button>
    </form>
  );
}

function DynamicField({
  field, value, onChange,
}: {
  field: SchemaField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const required = field.required ? <span className="text-destructive ml-0.5">*</span> : null;
  const lbl = (
    <Label className="text-xs">{field.label}{required}</Label>
  );

  if (field.type === "select") {
    return (
      <div>
        {lbl}
        <Select value={(value as string) ?? ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === "text") {
    return (
      <div className="sm:col-span-2">
        {lbl}
        <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (field.type === "date") {
    return (
      <div>{lbl}<Input type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} /></div>
    );
  }
  // number, currency, integer
  const step = field.type === "integer" ? "1" : field.type === "currency" ? "0.01" : "any";
  return (
    <div>
      {lbl}
      <Input
        type="number"
        step={step}
        min="0"
        value={(value as number | string) ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </div>
  );
}
