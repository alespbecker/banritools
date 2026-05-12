import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageSkeleton } from "@/components/PageSkeleton";
import { EmptyState } from "@/components/states/EmptyState";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Search, Package,
  PackageCheck, PackageX, Tag, ChevronLeft,
} from "lucide-react";
import type { Product, MetricType } from "@/features/production/types";

export const Route = createFileRoute("/_authenticated/admin_/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — BanriTools" },
      { name: "description", content: "Catálogo de produtos e métricas de produção" },
    ],
  }),
  component: AdminProductsPage,
  pendingComponent: () => <PageSkeleton kpis={3} rows={6} />,
});

const emptyForm = {
  name: "",
  category: "",
  unit: "unidade",
  points_per_unit: 0,
  metric_type: "quantity" as MetricType,
  display_order: 0,
  active: true,
};

const METRIC_LABEL: Record<MetricType, string> = {
  quantity: "Quantidade",
  amount: "Valor (R$)",
  mixed: "Quantidade + Valor",
};

const METRIC_HINT: Record<MetricType, string> = {
  quantity: "O lançamento exige apenas a quantidade vendida.",
  amount: "O lançamento exige apenas o valor financeiro (R$).",
  mixed: "O lançamento exige quantidade e valor financeiro.",
};

function AdminProductsPage() {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && userRole && userRole !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [isLoading, userRole, navigate]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("display_order")
      .order("name");
    if (error) toast.error("Erro ao carregar produtos");
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !(p.category ?? "").toLowerCase().includes(q)) return false;
      if (categoryFilter !== "all" && (p.category ?? "") !== categoryFilter) return false;
      if (statusFilter === "active" && !p.active) return false;
      if (statusFilter === "inactive" && p.active) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const inactive = total - active;
    const cats = categories.length;
    return { total, active, inactive, cats };
  }, [products, categories]);

  const openCreate = () => {
    const nextOrder = (products[products.length - 1]?.display_order ?? 0) + 10;
    setEditing(null);
    setForm({ ...emptyForm, display_order: nextOrder });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category ?? "",
      unit: p.unit ?? "unidade",
      points_per_unit: p.points_per_unit,
      metric_type: p.metric_type,
      display_order: p.display_order,
      active: p.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim() || null,
      unit: (form.unit || "unidade").trim(),
    };
    const res = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Produto atualizado" : "Produto criado");
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id);
    if (error) toast.error(error.message);
    else toast.success("Produto excluído");
    setDeleteTarget(null);
    load();
  };

  const move = async (p: Product, direction: -1 | 1) => {
    // Encontra o vizinho na lista filtrada para fazer um swap real de display_order
    const idx = filtered.findIndex((x) => x.id === p.id);
    const neighbor = filtered[idx + direction];
    if (!neighbor) return;
    setSavingId(p.id);
    const a = supabase.from("products").update({ display_order: neighbor.display_order }).eq("id", p.id);
    const b = supabase.from("products").update({ display_order: p.display_order }).eq("id", neighbor.id);
    const [ra, rb] = await Promise.all([a, b]);
    setSavingId(null);
    if (ra.error || rb.error) toast.error("Erro ao reordenar");
    load();
  };

  const toggleActive = async (p: Product) => {
    setSavingId(p.id);
    const { error } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else toast.success(!p.active ? "Produto ativado" : "Produto desativado");
    load();
  };

  if (loading) return <PageSkeleton kpis={3} rows={6} />;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
              Painel da Agência
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Catálogo de Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre os produtos e métricas que aparecem em <span className="font-medium text-foreground">Registrar Produção</span>,
              definindo unidade, pontos e ordem de exibição.
            </p>
          </div>
          <Button onClick={openCreate} size="lg" className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo produto
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile icon={<Package className="h-4 w-4" />} label="Total" value={stats.total} tone="default" />
          <KpiTile icon={<PackageCheck className="h-4 w-4" />} label="Ativos" value={stats.active} tone="success" />
          <KpiTile icon={<PackageX className="h-4 w-4" />} label="Inativos" value={stats.inactive} tone="muted" />
          <KpiTile icon={<Tag className="h-4 w-4" />} label="Categorias" value={stats.cats} tone="default" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou categoria…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="active">Apenas ativos</SelectItem>
              <SelectItem value="inactive">Apenas inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8">
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title={products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
              description={
                products.length === 0
                  ? "Cadastre o primeiro produto para começar a registrar produção."
                  : "Ajuste os filtros ou faça uma nova busca."
              }
              action={
                products.length === 0 ? (
                  <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo produto
                  </Button>
                ) : undefined
              }
            />
          </div>

        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Ordem</th>
                    <th className="text-left px-4 py-3 font-medium">Produto</th>
                    <th className="text-left px-4 py-3 font-medium">Categoria</th>
                    <th className="text-left px-4 py-3 font-medium">Tipo de métrica</th>
                    <th className="text-right px-4 py-3 font-medium tabular-nums">Pontos / un.</th>
                    <th className="text-center px-4 py-3 font-medium">Ativo</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${
                        savingId === p.id ? "opacity-60" : ""
                      } ${!p.active ? "bg-muted/10" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="w-8 tabular-nums text-xs font-medium text-muted-foreground">
                            {p.display_order}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => move(p, -1)}
                                disabled={i === 0}
                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Mover para cima"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Mover para cima</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => move(p, 1)}
                                disabled={i === filtered.length - 1}
                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Mover para baixo"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Mover para baixo</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">unidade: {p.unit ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        {p.category ? (
                          <Badge variant="secondary" className="font-normal">{p.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs">
                          {METRIC_LABEL[p.metric_type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {p.points_per_unit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={p.active}
                          onCheckedChange={() => toggleActive(p)}
                          aria-label={p.active ? "Desativar produto" : "Ativar produto"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => openEdit(p)}
                                className="p-2 rounded-md hover:bg-muted transition-colors"
                                aria-label="Editar produto"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                                aria-label="Excluir produto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{filtered.length}</span> de {products.length} produto(s)
            </div>
          </div>
        )}

        {/* Dialog Create/Edit */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Atualize as informações do produto. As alterações refletem em todas as agências."
                  : "Cadastre um novo produto para que apareça na tela de Registrar Produção."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="p-name">Nome *</Label>
                  <Input
                    id="p-name"
                    required
                    autoFocus
                    placeholder="Ex.: Seguro Residencial"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-cat">Categoria</Label>
                  <Input
                    id="p-cat"
                    list="cat-suggestions"
                    placeholder="Seguros, Crédito, PJ…"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                  <datalist id="cat-suggestions">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-unit">Unidade</Label>
                  <Input
                    id="p-unit"
                    placeholder="unidade, contrato, apólice…"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="p-metric">Tipo de métrica</Label>
                  <Select
                    value={form.metric_type}
                    onValueChange={(v) => setForm({ ...form, metric_type: v as MetricType })}
                  >
                    <SelectTrigger id="p-metric"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quantity">Quantidade</SelectItem>
                      <SelectItem value="amount">Valor (R$)</SelectItem>
                      <SelectItem value="mixed">Quantidade + Valor</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{METRIC_HINT[form.metric_type]}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-points">Pontos por unidade</Label>
                  <Input
                    id="p-points"
                    type="number"
                    step="0.001"
                    min="0"
                    value={form.points_per_unit}
                    onChange={(e) => setForm({ ...form, points_per_unit: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-order">Ordem de exibição</Label>
                  <Input
                    id="p-order"
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                <div>
                  <Label htmlFor="p-active" className="cursor-pointer">Produto ativo</Label>
                  <p className="text-xs text-muted-foreground">Quando inativo, não aparece em Registrar Produção.</p>
                </div>
                <Switch
                  id="p-active"
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{editing ? "Salvar alterações" : "Criar produto"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirm delete */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O produto <span className="font-medium text-foreground">{deleteTarget?.name}</span> será removido do catálogo.
                Lançamentos já registrados serão preservados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function KpiTile({
  icon, label, value, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "default" | "success" | "muted";
}) {
  const toneClasses =
    tone === "success"
      ? "bg-success/10 text-success border-success/20"
      : tone === "muted"
      ? "bg-muted text-muted-foreground border-border"
      : "bg-primary/10 text-primary border-primary/20";
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-shadow card-hover">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-md border ${toneClasses}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
