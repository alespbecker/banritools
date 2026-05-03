import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageSkeleton } from "@/components/PageSkeleton";
import { toast } from "sonner";
import { Megaphone, Plus, Trash2, Users } from "lucide-react";
import { logAudit } from "@/features/audit/log";
import { EmptyState } from "@/components/states/EmptyState";

export const Route = createFileRoute("/_authenticated/campanhas")({
  head: () => ({ meta: [{ title: "Campanhas — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={0} rows={4} />,
});

interface Campaign {
  id: string; name: string; description: string | null;
  product_id: string | null; target_quantity: number;
  period_start: string; period_end: string; status: string;
  agency_id: string | null;
}
interface Product { id: string; name: string }

function Page() {
  const { user, userRole, profile } = useAuth();
  const [items, setItems] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contactCounts, setContactCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const canManage = userRole === "admin";

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "", description: "", product_id: "", target_quantity: 0,
    period_start: monthStart, period_end: monthEnd, status: "active",
  });

  const load = useCallback(async () => {
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("campaigns").select("*").order("period_start", { ascending: false }),
      supabase.from("products").select("id, name").eq("active", true).order("display_order"),
    ]);
    setItems((c ?? []) as Campaign[]);
    setProducts((p ?? []) as Product[]);

    if (c && c.length) {
      const { data: cc } = await supabase
        .from("campaign_contacts")
        .select("campaign_id")
        .in("campaign_id", c.map((x) => x.id));
      const counts: Record<string, number> = {};
      (cc ?? []).forEach((r) => { counts[r.campaign_id] = (counts[r.campaign_id] ?? 0) + 1; });
      setContactCounts(counts);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.agency_id) return toast.error("Você precisa estar vinculado a uma agência");
    const { error } = await supabase.from("campaigns").insert({
      ...form,
      product_id: form.product_id || null,
      agency_id: profile.agency_id,
      created_by: user.id,
    } as never);
    if (error) return toast.error(error.message);
    toast.success("Campanha criada");
    setShowForm(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir campanha?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  if (loading) return <PageSkeleton kpis={0} rows={4} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" />Campanhas</h1>
          <p className="text-sm text-muted-foreground">Campanhas comerciais da agência</p>
        </div>
        {canManage && <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Nova</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div><Label>Nome</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Produto (opcional)</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                <option value="">—</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div><Label>Meta (qtd)</Label><Input type="number" value={form.target_quantity} onChange={(e) => setForm({ ...form, target_quantity: Number(e.target.value) })} /></div>
            <div><Label>Início</Label><Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} /></div>
            <div><Label>Fim</Label><Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button type="submit">Criar</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button></div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {items.length === 0 && <p className="text-center text-muted-foreground p-6 sm:col-span-2">Nenhuma campanha.</p>}
        {items.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.period_start} → {c.period_end} · {c.status}</div>
              </div>
              {canManage && <button onClick={() => handleDelete(c.id)} className="p-1 hover:bg-muted rounded text-destructive"><Trash2 className="h-4 w-4" /></button>}
            </div>
            {c.description && <p className="text-sm text-muted-foreground mt-2">{c.description}</p>}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3"><Users className="h-3 w-3" />{contactCounts[c.id] ?? 0} contato(s) vinculado(s)</div>
          </div>
        ))}
      </div>
    </div>
  );
}
