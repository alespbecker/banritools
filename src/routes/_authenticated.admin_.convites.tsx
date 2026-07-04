import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PageContainer, PageHeader, InfoCard } from "@/components/ds";
import { PageSkeleton } from "@/components/PageSkeleton";
import { UnauthorizedState } from "@/components/states/UnauthorizedState";
import { Users, Plus, Copy, Trash2, Link as LinkIcon, CheckCircle2, Pencil, Inbox, X } from "lucide-react";
import { toast } from "sonner";
import type { AppRole } from "@/features/auth/types";
import { listAgencyUsers, type AgencyUserRow } from "@/features/admin/users";
import { UserEditDialog } from "@/features/admin/UserEditDialog";
import { cargoLabel } from "@/features/auth/cargos";

export const Route = createFileRoute("/_authenticated/admin_/convites")({
  head: () => ({ meta: [{ title: "Usuários — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={0} rows={6} />,
});

interface Invite {
  id: string;
  code: string;
  agency_id: string;
  role: AppRole;
  name: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

function status(inv: Invite): { label: string; tone: "success" | "warning" | "info" | "neutral" } {
  if (inv.used_at) return { label: "Usado", tone: "neutral" };
  if (new Date(inv.expires_at) < new Date()) return { label: "Expirado", tone: "warning" };
  return { label: "Ativo", tone: "success" };
}

interface InviteRequest {
  id: string;
  name: string;
  email: string;
  agency_name: string;
  cargo: string | null;
  cargo_especialidade: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

function Page() {
  const { user, userRole, profile } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [users, setUsers] = useState<AgencyUserRow[]>([]);
  const [requests, setRequests] = useState<InviteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<AppRole>("funcionario");
  const [creating, setCreating] = useState(false);
  const [justCreated, setJustCreated] = useState<Invite | null>(null);
  const [editingUser, setEditingUser] = useState<AgencyUserRow | null>(null);
  const [processingReqId, setProcessingReqId] = useState<string | null>(null);

  const canManage = userRole === "admin" || userRole === "gerente";
  const isOwner = userRole === "admin";

  const load = useCallback(async () => {
    if (!profile?.agency_id) { setLoading(false); return; }
    setLoading(true);
    const [{ data: invData }, agencyUsers, { data: reqData }] = await Promise.all([
      supabase.from("user_invites").select("*").order("created_at", { ascending: false }),
      listAgencyUsers(profile.agency_id),
      isOwner
        ? supabase.from("invite_requests").select("*").eq("status", "pending").order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as InviteRequest[] }),
    ]);
    setInvites((invData ?? []) as unknown as Invite[]);
    setUsers(agencyUsers);
    setRequests((reqData ?? []) as unknown as InviteRequest[]);
    setLoading(false);
  }, [profile?.agency_id, isOwner]);

  useEffect(() => { if (canManage) load(); else setLoading(false); }, [canManage, load]);

  if (loading) return <PageSkeleton kpis={0} rows={6} />;
  if (!canManage) return <UnauthorizedState />;

  const handleCreate = async () => {
    if (!user || !profile?.agency_id) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("user_invites")
      .insert({
        agency_id: profile.agency_id,
        role,
        name: name.trim() || null,
        created_by: user.id,
      })
      .select("*")
      .single();
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    const inv = data as unknown as Invite;
    setJustCreated(inv);
    setInvites((prev) => [inv, ...prev]);
    setName("");
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from("user_invites").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setInvites((prev) => prev.filter((i) => i.id !== id));
    toast.success("Convite revogado");
  };

  const copy = (text: string, label = "Copiado") => {
    navigator.clipboard.writeText(text).then(() => toast.success(label));
  };

  const inviteLink = (code: string) => `${window.location.origin}/convite/${code}`;

  const handleApproveRequest = async (req: InviteRequest) => {
    if (!user || !profile?.agency_id) return;
    setProcessingReqId(req.id);
    const validRole: AppRole = req.cargo === "gerente_geral" || req.cargo === "gerente_adjunta"
      ? "gerente"
      : "funcionario";
    const { data: invData, error: invErr } = await supabase
      .from("user_invites")
      .insert({
        agency_id: profile.agency_id,
        role: validRole,
        name: req.name,
        created_by: user.id,
      })
      .select("*")
      .single();
    if (invErr || !invData) {
      setProcessingReqId(null);
      toast.error(invErr?.message ?? "Erro ao gerar convite");
      return;
    }
    const newInv = invData as unknown as Invite;
    const { error: updErr } = await supabase
      .from("invite_requests")
      .update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString(), invite_id: newInv.id })
      .eq("id", req.id);
    setProcessingReqId(null);
    if (updErr) { toast.error(updErr.message); return; }
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setInvites((prev) => [newInv, ...prev]);
    setJustCreated(newInv);
    setOpen(true);
    toast.success(`Convite gerado para ${req.name}`);
  };

  const handleRejectRequest = async (req: InviteRequest) => {
    if (!user) return;
    setProcessingReqId(req.id);
    const { error } = await supabase
      .from("invite_requests")
      .update({ status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq("id", req.id);
    setProcessingReqId(null);
    if (error) { toast.error(error.message); return; }
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    toast.success("Solicitação rejeitada");
  };


  return (
    <PageContainer>
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title="Usuários"
        description="Gerencie a equipe da sua agência e gere convites de cadastro"
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setJustCreated(null); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Gerar convite</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{justCreated ? "Convite gerado" : "Novo convite"}</DialogTitle>
              </DialogHeader>
              {justCreated ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Código</p>
                    <p className="mt-1 text-3xl font-bold tracking-[0.2em] text-foreground tabular-nums">
                      {justCreated.code}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => copy(justCreated.code, "Código copiado")}>
                      <Copy className="h-4 w-4" /> Copiar código
                    </Button>
                    <Button variant="outline" onClick={() => copy(inviteLink(justCreated.code), "Link copiado")}>
                      <LinkIcon className="h-4 w-4" /> Copiar link
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compartilhe com o funcionário. Ele criará a própria conta e será vinculado automaticamente à sua agência.
                  </p>
                  <DialogFooter>
                    <Button onClick={() => { setJustCreated(null); setOpen(false); }}>Concluir</Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inv-name">Nome (opcional)</Label>
                    <Input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria Silva" className="mt-1" />
                    <p className="mt-1 text-xs text-muted-foreground">Pré-preenche o nome no cadastro.</p>
                  </div>
                  <div>
                    <Label>Cargo</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="funcionario">Funcionário</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                        <SelectItem value="viewer">Apenas leitura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreate} disabled={creating}>
                      {creating ? "Gerando..." : "Gerar convite"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      <InfoCard title="Equipe" description={`${users.length} usuário${users.length === 1 ? "" : "s"} na agência`} bodyless>
        {users.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum usuário cadastrado ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-3">Nome</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Cargo</th>
                  <th className="p-3">Função</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="p-3 font-medium">{u.name ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">{cargoLabel(u.cargo, u.cargo_especialidade)}</td>
                    <td className="p-3 capitalize">{u.role ?? "—"}</td>
                    <td className="p-3">
                      <div className="flex justify-end">
                        {isOwner ? (
                          <Button variant="ghost" size="sm" onClick={() => setEditingUser(u)} aria-label="Editar usuário">
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Somente admin</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      <InfoCard title="Histórico de convites" description={`${invites.length} convite${invites.length === 1 ? "" : "s"}`} bodyless>
        {invites.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum convite ainda. Clique em <strong>Gerar convite</strong> para começar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-3">Código</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Cargo</th>
                  <th className="p-3">Criado</th>
                  <th className="p-3">Expira</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => {
                  const s = status(inv);
                  return (
                    <tr key={inv.id} className="border-t border-border">
                      <td className="p-3 font-mono font-semibold tracking-wider tabular-nums">{inv.code}</td>
                      <td className="p-3">{inv.name ?? <span className="text-muted-foreground">—</span>}</td>
                      <td className="p-3 capitalize">{inv.role}</td>
                      <td className="p-3 text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="p-3 text-muted-foreground">{new Date(inv.expires_at).toLocaleDateString("pt-BR")}</td>
                      <td className="p-3"><Badge variant={s.tone}>{s.label}</Badge></td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {!inv.used_at && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => copy(inv.code, "Código copiado")}><Copy className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => copy(inviteLink(inv.code), "Link copiado")}><LinkIcon className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRevoke(inv.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                            </>
                          )}
                          {inv.used_at && <CheckCircle2 className="h-4 w-4 text-success" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      {user && (
        <UserEditDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(v) => !v && setEditingUser(null)}
          onChanged={load}
          currentAdminId={user.id}
        />
      )}
    </PageContainer>
  );
}
