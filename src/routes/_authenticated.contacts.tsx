import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageSkeleton, DataGate } from "@/components/PageSkeleton";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contatos — BanriTools" },
      { name: "description", content: "Gerencie seus contatos" },
    ],
  }),
  component: ContactsPage,
  pendingComponent: () => <PageSkeleton kpis={0} rows={6} />,
});

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  product_interest: string | null;
  status: string | null;
  next_follow_up: string | null;
  notes: string | null;
}

function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", product_interest: "", status: "novo", next_follow_up: "", notes: "" });

  const loadContacts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("contacts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setContacts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editing) {
      await supabase.from("contacts").update(form).eq("id", editing.id);
    } else {
      await supabase.from("contacts").insert({ ...form, user_id: user.id });
    }
    setForm({ name: "", phone: "", product_interest: "", status: "novo", next_follow_up: "", notes: "" });
    setShowForm(false);
    setEditing(null);
    loadContacts();
  };

  const handleEdit = (c: Contact) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone ?? "", product_interest: c.product_interest ?? "", status: c.status ?? "novo", next_follow_up: c.next_follow_up ?? "", notes: c.notes ?? "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("contacts").delete().eq("id", id);
    loadContacts();
  };

  return (
    <DataGate loading={loading && contacts.length === 0} skeleton={<PageSkeleton kpis={0} rows={6} />}>
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Contatos</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus contatos e follow-ups</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", phone: "", product_interest: "", status: "novo", next_follow_up: "", notes: "" }); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          title={showForm ? "Fechar formulário de novo contato" : "Abrir formulário para criar um novo contato"}
          aria-label={showForm ? "Fechar formulário de novo contato" : "Criar novo contato"}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Novo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mb-6 max-w-lg space-y-3 rounded-lg border border-border bg-card p-5 animate-fade-in-up">
          <h3 className="text-sm font-semibold text-card-foreground">{editing ? "Editar Contato" : "Novo Contato"}</h3>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nome" aria-label="Nome do contato" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefone" aria-label="Telefone do contato" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <input value={form.product_interest} onChange={(e) => setForm({ ...form, product_interest: e.target.value })} placeholder="Produto de interesse" aria-label="Produto de interesse" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} aria-label="Status do contato" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="novo">Novo</option>
            <option value="em_contato">Em Contato</option>
            <option value="negociando">Negociando</option>
            <option value="fechado">Fechado</option>
            <option value="perdido">Perdido</option>
          </select>
          <input type="date" value={form.next_follow_up} onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })} aria-label="Próximo follow-up" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas" rows={2} aria-label="Notas sobre o contato" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <div className="flex gap-2">
            <button type="submit" title="Salvar contato e atualizar lista" className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Salvar</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} title="Descartar e fechar formulário" className="h-9 rounded-md border border-input bg-background px-4 text-sm text-foreground hover:bg-accent">Cancelar</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefone</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Follow-up</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum contato encontrado</td></tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-foreground">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">{c.product_interest ?? "—"}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground capitalize">{c.status?.replace("_", " ") ?? "—"}</span></td>
                  <td className="px-4 py-3 text-foreground">{c.next_follow_up ? new Date(c.next_follow_up).toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(c)} title={`Editar contato de ${c.name}`} aria-label={`Editar contato de ${c.name}`} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} title={`Excluir contato de ${c.name}`} aria-label={`Excluir contato de ${c.name}`} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
