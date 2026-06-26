import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Save } from "lucide-react";
import { CARGO_OPTIONS, type CargoValue, type CargoEspecialidade } from "@/features/auth/cargos";
import type { AppRole } from "@/features/auth/types";
import {
  type AgencyUserRow,
  type ProductionEntryRow,
  updateProfileFields,
  setUserRole,
  listUserEntries,
  updateEntry,
  deleteEntry,
} from "./users";

interface Props {
  user: AgencyUserRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
  currentAdminId: string;
}

export function UserEditDialog({ user, open, onOpenChange, onChanged, currentAdminId }: Props) {
  const [tab, setTab] = useState("perfil");

  // perfil
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [cargo, setCargo] = useState<CargoValue | "">("");
  const [esp, setEsp] = useState<CargoEspecialidade | "">("");
  const [savingProfile, setSavingProfile] = useState(false);

  // acesso
  const [role, setRole] = useState<AppRole>("funcionario");
  const [savingRole, setSavingRole] = useState(false);

  // produção
  const [entries, setEntries] = useState<ProductionEntryRow[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [editing, setEditing] = useState<ProductionEntryRow | null>(null);

  useEffect(() => {
    if (!user) return;
    setTab("perfil");
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setJobTitle(user.job_title ?? "");
    setCargo(user.cargo ?? "");
    setEsp(user.cargo_especialidade ?? "");
    setRole((user.role ?? "funcionario") as AppRole);
  }, [user]);

  const loadEntries = useCallback(async () => {
    if (!user) return;
    setLoadingEntries(true);
    try {
      setEntries(await listUserEntries(user.id));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingEntries(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && tab === "producao" && user) loadEntries();
  }, [open, tab, user, loadEntries]);

  if (!user) return null;

  const isSelf = user.id === currentAdminId;

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfileFields(user.id, {
        name: name.trim() || null,
        phone: phone.trim() || null,
        job_title: jobTitle.trim() || null,
        cargo: (cargo || null) as CargoValue | null,
        cargo_especialidade: cargo === "gerente_mercado" ? ((esp || null) as CargoEspecialidade | null) : null,
      });
      toast.success("Perfil atualizado");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveRole = async () => {
    if (isSelf) { toast.error("Você não pode alterar sua própria função"); return; }
    setSavingRole(true);
    try {
      await setUserRole(user.id, role);
      toast.success("Função atualizada");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Excluir este lançamento? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Lançamento excluído");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            <p className="text-sm text-muted-foreground">{user.name ?? user.email}</p>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="acesso">Acesso</TabsTrigger>
              <TabsTrigger value="producao">Produção</TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="ue-name">Nome completo</Label>
                <Input id="ue-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ue-email">Email</Label>
                  <Input id="ue-email" value={user.email ?? ""} disabled className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="ue-phone">Telefone</Label>
                  <Input id="ue-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="ue-job">Cargo (livre)</Label>
                <Input id="ue-job" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="mt-1" placeholder="Ex: Gerente de Contas" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Cargo (estrutural)</Label>
                  <Select value={cargo || ""} onValueChange={(v) => setCargo(v as CargoValue)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      {CARGO_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {cargo === "gerente_mercado" && (
                  <div>
                    <Label>Especialidade</Label>
                    <Select value={esp || ""} onValueChange={(v) => setEsp(v as CargoEspecialidade)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="PJ ou PF" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PJ">PJ</SelectItem>
                        <SelectItem value="PF">PF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={saveProfile} disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar perfil
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="acesso" className="space-y-4 pt-4">
              <div>
                <Label>Função (acesso)</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AppRole)} disabled={isSelf}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                    <SelectItem value="viewer">Apenas leitura</SelectItem>
                  </SelectContent>
                </Select>
                {isSelf && (
                  <p className="mt-2 text-xs text-muted-foreground">Você não pode alterar sua própria função.</p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={saveRole} disabled={savingRole || isSelf}>
                  {savingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar função
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="producao" className="pt-4">
              {loadingEntries ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : entries.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Nenhum lançamento.</div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="p-2 text-left">Data</th>
                        <th className="p-2 text-left">Produto</th>
                        <th className="p-2 text-right">Qtd</th>
                        <th className="p-2 text-right">Valor</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => (
                        <tr key={e.id} className="border-t border-border">
                          <td className="p-2 whitespace-nowrap">{new Date(e.entry_date).toLocaleDateString("pt-BR")}</td>
                          <td className="p-2">{e.product_name ?? "—"}</td>
                          <td className="p-2 text-right tabular-nums">{e.quantity ?? "—"}</td>
                          <td className="p-2 text-right tabular-nums">{e.amount != null ? `R$ ${Number(e.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</td>
                          <td className="p-2"><Badge variant={e.status === "confirmed" ? "success" : "neutral"}>{e.status ?? "—"}</Badge></td>
                          <td className="p-2">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditing(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(e.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {editing && (
        <EntryEditDialog
          entry={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadEntries(); onChanged(); }}
        />
      )}
    </>
  );
}

function EntryEditDialog({ entry, onClose, onSaved }: { entry: ProductionEntryRow; onClose: () => void; onSaved: () => void }) {
  const [entryDate, setEntryDate] = useState(entry.entry_date);
  const [quantity, setQuantity] = useState<string>(entry.quantity != null ? String(entry.quantity) : "");
  const [amount, setAmount] = useState<string>(entry.amount != null ? String(entry.amount) : "");
  const [notes, setNotes] = useState(entry.notes ?? "");
  const [status, setStatus] = useState(entry.status ?? "confirmed");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateEntry(entry.id, {
        entry_date: entryDate,
        quantity: quantity === "" ? null : Number(quantity),
        amount: amount === "" ? null : Number(amount),
        notes: notes.trim() || null,
        status,
      });
      toast.success("Lançamento atualizado");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar lançamento</DialogTitle>
          <p className="text-sm text-muted-foreground">{entry.product_name}</p>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="ee-date">Data</Label>
            <Input id="ee-date" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ee-qty">Quantidade</Label>
              <Input id="ee-qty" type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="ee-amt">Valor (R$)</Label>
              <Input id="ee-amt" type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ee-notes">Observações</Label>
            <Input id="ee-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
