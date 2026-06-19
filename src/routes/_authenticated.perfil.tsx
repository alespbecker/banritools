import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Camera, Building2, Mail, Phone, Briefcase, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/ds";
import { PageSkeleton, DataGate } from "@/components/PageSkeleton";
import defaultAvatar from "@/assets/default-avatar.png";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — BanriTools" },
      { name: "description", content: "Edite suas informações pessoais e foto de perfil" },
    ],
  }),
  component: PerfilPage,
  pendingComponent: () => <PageSkeleton kpis={0} rows={3} />,
});

type ExtendedProfile = {
  id: string;
  name: string | null;
  email: string | null;
  agency_id: string | null;
  avatar_url: string | null;
  phone: string | null;
  job_title: string | null;
};

function PerfilPage() {
  const { user, userRole, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, agency_id, avatar_url, phone, job_title")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      setProfile(data as ExtendedProfile);
      setName(data.name ?? "");
      setPhone(data.phone ?? "");
      setJobTitle(data.job_title ?? "");
      if (data.agency_id) {
        const { data: ag } = await supabase
          .from("agencies")
          .select("name")
          .eq("id", data.agency_id)
          .maybeSingle();
        setAgencyName(ag?.name ?? null);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: pub.publicUrl })
        .eq("id", user.id);
      if (updErr) throw updErr;
      setProfile((p) => p ? { ...p, avatar_url: pub.publicUrl } : p);
      toast.success("Foto atualizada!");
      window.dispatchEvent(new CustomEvent("banritools:sync"));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() || null, phone: phone.trim() || null, job_title: jobTitle.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Perfil atualizado!");
      window.dispatchEvent(new CustomEvent("banritools:sync"));
    }
  };

  const avatarSrc = profile?.avatar_url || defaultAvatar;

  return (
    <DataGate loading={loading} skeleton={<PageSkeleton kpis={0} rows={3} />}>
      <PageContainer>
        <PageHeader
          icon={<User className="h-5 w-5" />}
          title="Meu Perfil"
          description="Gerencie suas informações pessoais e foto de perfil"
        />

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Avatar card */}
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="relative mx-auto h-32 w-32">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted text-3xl font-bold text-muted-foreground">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Alterar foto de perfil"
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">{name || "Sem nome"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Shield className="h-3 w-3" />
              <span className="capitalize">{userRole ?? "user"}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div>
              <label htmlFor="perfil-name" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                <User className="h-3.5 w-3.5" /> Nome completo
              </label>
              <input
                id="perfil-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="perfil-email" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <input
                  id="perfil-email"
                  value={user?.email ?? ""}
                  disabled
                  className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
              </div>
              <div>
                <label htmlFor="perfil-phone" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                  <Phone className="h-3.5 w-3.5" /> Telefone
                </label>
                <input
                  id="perfil-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="perfil-job" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                  <Briefcase className="h-3.5 w-3.5" /> Cargo
                </label>
                <input
                  id="perfil-job"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Gerente de Contas"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="perfil-agency" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                  <Building2 className="h-3.5 w-3.5" /> Agência
                </label>
                <input
                  id="perfil-agency"
                  value={agencyName ?? "Sem agência"}
                  disabled
                  className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </div>
      </PageContainer>
    </DataGate>
  );
}
