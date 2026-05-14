import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageSkeleton } from "@/components/PageSkeleton";
import { EmptyState } from "@/components/states/EmptyState";
import { toast } from "sonner";
import {
  Pencil, Search, Package, Tag, Layers, Plus, Power, ChevronRight,
} from "lucide-react";
import type { Product, ProductVariant, MetricType, VariantType } from "@/features/production/types";
import { VARIANT_TYPE_LABEL } from "@/features/production/types";

export const Route = createFileRoute("/_authenticated/admin_/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — BanriTools" },
      { name: "description", content: "Catálogo de produtos e variantes" },
    ],
  }),
  component: AdminProductsPage,
  pendingComponent: () => <PageSkeleton kpis={3} rows={6} />,
});

const METRIC_LABEL: Record<MetricType, string> = {
  quantity: "Quantidade",
  amount: "Valor (R$)",
  mixed: "Quantidade + Valor",
};

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

function AdminProductsPage() {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    if (!isLoading && userRole && userRole !== "admin") navigate({ to: "/dashboard-v3" });
  }, [isLoading, userRole, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: v }] = await Promise.all([
      supabase.from("products").select("*").order("display_order").order("name"),
      supabase.from("product_variants").select("*").order("display_order"),
    ]);
    setProducts((p ?? []) as unknown as Product[]);
    setVariants((v ?? []) as unknown as ProductVariant[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q),
    );
  }, [products, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const k = p.category ?? "Sem categoria";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [filtered]);

  const variantsByProduct = useMemo(() => {
    const m = new Map<string, ProductVariant[]>();
    for (const v of variants) {
      if (!m.has(v.product_id)) m.set(v.product_id, []);
      m.get(v.product_id)!.push(v);
    }
    return m;
  }, [variants]);

  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success(p.active ? "Produto desativado" : "Produto ativado");
      load();
    }
  };

  if (isLoading || loading) return <PageSkeleton kpis={3} rows={6} />;
  if (userRole !== "admin") return null;

  const totalVariants = variants.length;
  const activeProducts = products.filter((p) => p.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Package className="h-3.5 w-3.5" />
              Catálogo
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Catálogo dos produtos vendidos na agência. Cada produto define os campos do lançamento e suas variantes.
            </p>
          </div>
          <div className="hidden sm:flex gap-3">
            <div className="rounded-lg border border-border bg-card px-4 py-3 min-w-[110px]">
              <div className="text-xs text-muted-foreground">Produtos</div>
              <div className="text-xl font-medium tabular-nums">{products.length}</div>
              <div className="text-[10px] text-muted-foreground">{activeProducts} ativos</div>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3 min-w-[110px]">
              <div className="text-xs text-muted-foreground">Variantes</div>
              <div className="text-xl font-medium tabular-nums">{totalVariants}</div>
              <div className="text-[10px] text-muted-foreground">subtipos / modalidades</div>
            </div>
          </div>
        </div>

        <div className="mt-5 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto, slug ou categoria…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categorias */}
      {grouped.length === 0 ? (
        <EmptyState title="Nenhum produto encontrado" description="Ajuste a busca acima." />
      ) : (
        <div className="space-y-6">
          {grouped.map(([cat, items]) => (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {cat}
                </h2>
                <span className="text-xs text-muted-foreground">· {items.length}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((p) => {
                  const vs = variantsByProduct.get(p.id) ?? [];
                  const grad = CATEGORY_GRADIENT[cat] ?? "from-muted/20 to-muted/5";
                  return (
                    <article
                      key={p.id}
                      className={`group rounded-xl border border-border bg-gradient-to-br ${grad} p-4 transition hover:border-primary/40 hover:shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{p.name}</h3>
                            {!p.active && <Badge variant="outline" className="text-[10px]">inativo</Badge>}
                          </div>
                          <code className="text-[11px] text-muted-foreground">{p.slug}</code>
                        </div>
                        <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} />
                      </div>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="secondary" className="text-[10px]">{METRIC_LABEL[p.metric_type]}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{p.points_per_unit} pts/{p.unit}</Badge>
                        {p.legacy_field && (
                          <Badge variant="outline" className="text-[10px]" title="Mapeia para coluna do dashboard antigo">
                            legacy
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition"
                        >
                          <Layers className="h-3.5 w-3.5" />
                          {vs.length} {vs.length === 1 ? "variante" : "variantes"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-primary hover:underline"
                        >
                          <Pencil className="h-3 w-3" /> editar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <ProductEditDialog
          product={editing}
          variants={variantsByProduct.get(editing.id) ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductEditDialog({
  product, variants, onClose, onSaved,
}: {
  product: Product;
  variants: ProductVariant[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product.name,
    description: product.description ?? "",
    category: product.category ?? "",
    subcategory: product.subcategory ?? "",
    unit: product.unit ?? "unidade",
    metric_type: product.metric_type,
    points_per_unit: product.points_per_unit,
    display_order: product.display_order,
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"info" | "variants" | "schema">("info");
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>(variants);
  const [newVar, setNewVar] = useState({ name: "", variant_type: "subtype" as VariantType });

  const saveProduct = async () => {
    setSaving(true);
    const { error } = await supabase.from("products").update(form).eq("id", product.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Produto salvo");
    onSaved();
  };

  const toggleVariant = async (v: ProductVariant) => {
    const { error } = await supabase.from("product_variants").update({ active: !v.active }).eq("id", v.id);
    if (error) return toast.error(error.message);
    setLocalVariants((s) => s.map((x) => (x.id === v.id ? { ...x, active: !x.active } : x)));
  };

  const addVariant = async () => {
    if (!newVar.name.trim()) return toast.error("Informe o nome");
    const slug = newVar.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug) return toast.error("Nome inválido");

    const duplicate = localVariants.some(
      (v) => v.variant_type === newVar.variant_type && v.slug === slug,
    );
    if (duplicate) return toast.error("Já existe uma variante com esse slug para este produto.");

    const next_order = (localVariants.filter((v) => v.variant_type === newVar.variant_type).at(-1)?.display_order ?? 0) + 10;
    const { data, error } = await supabase.from("product_variants").insert({
      product_id: product.id,
      slug, name: newVar.name.trim(), variant_type: newVar.variant_type,
      display_order: next_order, active: true,
    }).select().single();
    if (error) {
      if (error.code === "23505") return toast.error("Já existe uma variante com esse slug para este produto.");
      return toast.error(error.message);
    }
    setLocalVariants((s) => [...s, data as unknown as ProductVariant]);
    setNewVar({ name: "", variant_type: "subtype" });
    toast.success("Variante adicionada");
  };

  const groupedVariants = useMemo(() => {
    const m = new Map<string, ProductVariant[]>();
    for (const v of localVariants) {
      if (!m.has(v.variant_type)) m.set(v.variant_type, []);
      m.get(v.variant_type)!.push(v);
    }
    return Array.from(m.entries());
  }, [localVariants]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            <code className="text-[11px]">{product.slug}</code>
            {product.legacy_field && <span className="ml-2 text-[11px]">· legacy: {product.legacy_field}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 border-b border-border">
          {(["info", "variants", "schema"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm border-b-2 -mb-px transition ${
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "info" ? "Informações" : t === "variants" ? `Variantes (${localVariants.length})` : "Esquema de campos"}
            </button>
          ))}
        </div>

        {tab === "info" && (
          <div className="space-y-3 pt-2">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <Label>Subcategoria</Label>
                <Input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Unidade</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div>
                <Label>Pts/unidade</Label>
                <Input type="number" value={form.points_per_unit}
                  onChange={(e) => setForm({ ...form, points_per_unit: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Ordem</Label>
                <Input type="number" value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>Tipo de métrica</Label>
              <Select value={form.metric_type} onValueChange={(v) => setForm({ ...form, metric_type: v as MetricType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantity">Quantidade</SelectItem>
                  <SelectItem value="amount">Valor (R$)</SelectItem>
                  <SelectItem value="mixed">Quantidade + Valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {tab === "variants" && (
          <div className="space-y-4 pt-2">
            {groupedVariants.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">Sem variantes ainda.</div>
            )}
            {groupedVariants.map(([type, list]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {VARIANT_TYPE_LABEL[type as VariantType]}
                  </span>
                </div>
                <div className="rounded-lg border border-border divide-y divide-border">
                  {list.map((v) => (
                    <div key={v.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div>
                        <div className={v.active ? "" : "line-through text-muted-foreground"}>{v.name}</div>
                        <code className="text-[10px] text-muted-foreground">{v.slug}</code>
                        {v.legacy_field && <Badge variant="outline" className="ml-2 text-[10px]">{v.legacy_field}</Badge>}
                      </div>
                      <Switch checked={v.active} onCheckedChange={() => toggleVariant(v)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
              <div className="text-xs text-muted-foreground">Adicionar variante</div>
              <div className="flex gap-2">
                <Input placeholder="Nome" value={newVar.name}
                  onChange={(e) => setNewVar({ ...newVar, name: e.target.value })} />
                <Select value={newVar.variant_type} onValueChange={(v) => setNewVar({ ...newVar, variant_type: v as VariantType })}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(VARIANT_TYPE_LABEL).map(([k, label]) => (
                      <SelectItem key={k} value={k}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" onClick={addVariant}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}

        {tab === "schema" && (
          <div className="pt-2">
            <Label className="text-xs text-muted-foreground">Campos extras coletados no lançamento</Label>
            {product.field_schema.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">Sem campos extras configurados.</div>
            ) : (
              <div className="rounded-lg border border-border divide-y divide-border mt-2">
                {product.field_schema.map((f) => (
                  <div key={f.key} className="px-3 py-2 text-sm flex items-center justify-between">
                    <div>
                      <div>{f.label} {f.required && <span className="text-destructive">*</span>}</div>
                      <code className="text-[10px] text-muted-foreground">{f.key}</code>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-3">
              Edição do esquema via banco (futuro: editor visual). Os campos aparecem automaticamente no formulário de lançamento.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          {tab === "info" && (
            <Button onClick={saveProduct} disabled={saving}>
              <Power className="h-4 w-4 mr-1" />{saving ? "Salvando…" : "Salvar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
