import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users as UsersIcon, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Gestão de Usuários — BanriTools" },
      { name: "description", content: "Administração de usuários da agência" },
    ],
  }),
  component: AdminUsersPage,
});

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  agency_id: string | null;
};

type RoleRow = { user_id: string; role: "admin" | "user" };
type AgencyRow = { id: string; name: string };

function AdminUsersPage() {
  const { userRole, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<Map<string, "admin" | "user">>(new Map());
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && userRole && userRole !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [userRole, isLoading, navigate]);

  const fetchAll = useCallback(async () => {
    const [pRes, rRes, aRes] = await Promise.all([
      supabase.from("profiles").select("id, name, email, agency_id").order("name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("agencies").select("id, name").order("name"),
    ]);
    setProfiles((pRes.data as ProfileRow[]) ?? []);
    const m = new Map<string, "admin" | "user">();
    for (const r of (rRes.data as RoleRow[]) ?? []) m.set(r.user_id, r.role);
    setRoles(m);
    setAgencies((aRes.data as AgencyRow[]) ?? []);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("admin-users")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const handleToggleRole = async (targetId: string, makeAdmin: boolean) => {
    if (targetId === user?.id) {
      toast.error("Você não pode alterar sua própria função.");
      return;
    }
    setSavingId(targetId);
    const newRole: "admin" | "user" = makeAdmin ? "admin" : "user";
    // Optimistic update
    setRoles((prev) => new Map(prev).set(targetId, newRole));
    const { error } = await supabase.rpc("admin_set_user_role", {
      _target_user_id: targetId,
      _new_role: newRole,
    });
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      // Revert
      fetchAll();
    } else {
      toast.success(`Usuário agora é ${newRole === "admin" ? "Administrador" : "Usuário"}.`);
    }
  };

  const handleAgencyChange = async (targetId: string, agencyId: string) => {
    setSavingId(targetId);
    const { error } = await supabase
      .from("profiles")
      .update({ agency_id: agencyId })
      .eq("id", targetId);
    setSavingId(null);
    if (error) {
      toast.error("Erro ao atualizar agência");
    } else {
      toast.success("Agência atualizada");
      fetchAll();
    }
  };

  if (isLoading || (userRole && userRole !== "admin")) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Verificando permissão...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <UsersIcon className="h-5 w-5 text-primary" />
          Gestão de Usuários
        </h1>
        <p className="text-sm text-muted-foreground">Promova ou rebaixe administradores e gerencie agências</p>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="p-3 font-medium text-muted-foreground">Usuário</th>
                <th className="p-3 font-medium text-muted-foreground">Agência</th>
                <th className="p-3 font-medium text-muted-foreground text-center">Administrador</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
              {profiles.map((p) => {
                const isMe = p.id === user?.id;
                const isAdmin = roles.get(p.id) === "admin";
                const isSaving = savingId === p.id;
                return (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {p.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <div className="text-foreground flex items-center gap-2">
                            {p.name ?? "Sem nome"}
                            {isMe && <span className="text-xs text-muted-foreground">(você)</span>}
                            {isAdmin && <Shield className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Select
                        value={p.agency_id ?? ""}
                        onValueChange={(v) => handleAgencyChange(p.id, v)}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Sem agência" />
                        </SelectTrigger>
                        <SelectContent>
                          {agencies.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={isAdmin}
                        disabled={isMe || isSaving}
                        onCheckedChange={(v) => handleToggleRole(p.id, v)}
                        aria-label={`Tornar ${p.name} administrador`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
        <p>• Você não pode alterar sua própria função (evita travamento).</p>
        <p>• Pelo menos um administrador deve existir na agência.</p>
        <p>• Apenas usuários da mesma agência podem ter o cargo alterado.</p>
      </div>
    </div>
  );
}
