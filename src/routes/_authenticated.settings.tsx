import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — BanriTools" },
      { name: "description", content: "Configurações do perfil" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, isAuthenticated, isLoading, signOut, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ name }).eq("id", user.id);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar onSignOut={signOut} />
      <div className="flex flex-1 flex-col">
        <Topbar userName={profile?.name ?? null} userRole={userRole} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Configurações</h1>
            <p className="text-sm text-muted-foreground">Gerencie seu perfil</p>
          </div>

          <form onSubmit={handleSave} className="max-w-md space-y-4 rounded-lg border border-border bg-card p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">Email</label>
              <input value={user?.email ?? ""} disabled className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">Perfil</label>
              <input value={userRole ?? "user"} disabled className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground capitalize" />
            </div>
            {success && <p className="text-sm text-success">Perfil atualizado!</p>}
            <button type="submit" disabled={saving} className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
