import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageSkeleton } from "@/components/PageSkeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { Product, MetricType } from "@/features/production/types";

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  head: () => ({ meta: [{ title: "Produtos — BanriTools" }] }),
  component: AdminProductsPage,
  pendingComponent: () => <PageSkeleton kpis={0} rows={6} />,
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

function AdminProductsPage() {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isLoading && userRole !== "admin") navigate({ to: "/dashboard" });
  }, [isLoading, userRole, navigate]);

  const load = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("display_order");
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const reset = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, category: form.category || null };
    const res = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Produto atualizado" : "Produto criado");
    reset(); load();
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category ?? "", unit: p.unit ?? "unidade",
      points_per_unit: p.points_per_unit, metric_type: p.metric_type,
      display_order: p.display_order, active: p.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Produto excluído"); load();
  };

  const move = async (p: Product, delta: number) => {
    await supabase.from("products").update({ display_order: p.display_order + delta }).eq("id", p.id);
    load();
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    load();
  };

  if (loading) return <PageSkeleton kpis={0} rows={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">Catálogo de métricas de produção</p>
        </div>
        <Button onClick={() => { reset(); setShowForm(true); }}><Plus className="h-4 w-4 mr-2" />Novo</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Nome</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div><Label>Pontos por unidade</Label><Input type="number" step="0.001" value={form.points_per_unit} onChange={(e) => setForm({ ...form, points_per_unit: Number(e.target.value) })} /></div>
            <div>
              <Label>Tipo de métrica</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.metric_type} onChange={(e) => setForm({ ...form, metric_type: e.target.value as MetricType })}>
                <option value="quantity">Quantidade</option>
                <option value="amount">Valor (R$)</option>
                <option value="mixed">Quantidade + Valor</option>
              </select>
            </div>
            <div><Label>Ordem</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
          </div>
          <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Ativo</Label></div>
          <div className="flex gap-2"><Button type="submit">Salvar</Button><Button type="button" variant="outline" onClick={reset}>Cancelar</Button></div>
        </form>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr><th className="text-left p-3">Ordem</th><th className="text-left p-3">Nome</th><th className="text-left p-3">Categoria</th><th className="text-left p-3">Tipo</th><th className="text-right p-3">Pontos/un</th><th className="text-center p-3">Ativo</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6">{p.display_order}</span>
                    <button onClick={() => move(p, -10)} className="p-1 hover:bg-muted rounded"><ArrowUp className="h-3 w-3" /></button>
                    <button onClick={() => move(p, 10)} className="p-1 hover:bg-muted rounded"><ArrowDown className="h-3 w-3" /></button>
                  </div>
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.category ?? "—"}</td>
                <td className="p-3">{p.metric_type}</td>
                <td className="p-3 text-right">{p.points_per_unit}</td>
                <td className="p-3 text-center"><Switch checked={p.active} onCheckedChange={() => toggleActive(p)} /></td>
                <td className="p-3 text-right">
                  <button onClick={() => handleEdit(p)} className="p-1 hover:bg-muted rounded mr-1"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-muted rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum produto cadastrado</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
