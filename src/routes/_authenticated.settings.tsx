import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, Award, Building2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — BanriTools" },
      { name: "description", content: "Configurações do perfil" },
    ],
  }),
  component: SettingsPage,
});

type Stats = {
  total_points: number;
  level: number;
  reports_count: number;
  total_seguros: number;
  agency_name: string | null;
};

function SettingsPage() {
  const { user, profile, userRole } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_points: 0, level: 1, reports_count: 0, total_seguros: 0, agency_name: null,
  });

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const [ptsRes, repRes, agRes] = await Promise.all([
      supabase.from("user_points").select("total_points, level").eq("user_id", user.id).maybeSingle(),
      supabase.from("daily_reports").select("seguro_vida, seguro_ap_smart, capitalizacao").eq("user_id", user.id),
      profile?.agency_id
        ? supabase.from("agencies").select("name").eq("id", profile.agency_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const reports = repRes.data ?? [];
    const total_seguros = reports.reduce(
      (acc, r) => acc + (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0),
      0,
    );
    setStats({
      total_points: ptsRes.data?.total_points ?? 0,
      level: ptsRes.data?.level ?? 1,
      reports_count: reports.length,
      total_seguros,
      agency_name: (agRes.data as { name?: string } | null)?.name ?? null,
    });
  }, [user, profile?.agency_id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const handler = () => fetchStats();
    window.addEventListener("banritools:sync", handler);
    return () => window.removeEventListener("banritools:sync", handler);
  }, [fetchStats]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Perfil atualizado!");
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil e veja seu resumo</p>
      </div>

      {/* Resumo */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-4 w-4" /> Pontos
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total_points.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Award className="h-4 w-4" /> Nível
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">Lv {stats.level}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <BarChart3 className="h-4 w-4" /> Lançamentos
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.reports_count}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Trophy className="h-4 w-4" /> Seguros vendidos
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.total_seguros}</p>
        </div>
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">Perfil</label>
            <input value={userRole ?? "user"} disabled className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground capitalize" />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-card-foreground">
              <Building2 className="h-3.5 w-3.5" /> Agência
            </label>
            <input value={stats.agency_name ?? "Sem agência"} disabled className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </>
  );
}
