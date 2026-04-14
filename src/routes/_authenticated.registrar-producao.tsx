import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/registrar-producao")({
  head: () => ({
    meta: [
      { title: "Registrar Produção — BanriTools" },
      { name: "description", content: "Registre sua produção diária" },
    ],
  }),
  component: RegistrarProducaoPage,
});

const defaultForm = {
  report_date: new Date().toISOString().split("T")[0],
  seguro_vida: 0,
  seguro_ap_smart: 0,
  capitalizacao: 0,
  credito_minuto_aumento: 0,
  consignado_volume: 0,
  credito_fidelidade_volume: 0,
  recuperacao_estagio_2: 0,
  recuperacao_estagio_3: 0,
  pj_conta_empresarial: 0,
  pj_maquina_vero: 0,
};

function RegistrarProducaoPage() {
  const { user, isAuthenticated, isLoading, signOut, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [isLoading, isAuthenticated, navigate]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: field === "report_date" ? value : Number(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    const { error: err } = await supabase.from("daily_reports").insert({
      user_id: user.id,
      agency_id: profile?.agency_id ?? null,
      ...form,
    });

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setForm(defaultForm);
    }
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!isAuthenticated) return null;

  const fieldGroups = [
    {
      title: "Seguros",
      fields: [
        { key: "seguro_vida", label: "Seguro Vida" },
        { key: "seguro_ap_smart", label: "Seguro AP Smart" },
        { key: "capitalizacao", label: "Capitalização" },
      ],
    },
    {
      title: "Crédito",
      fields: [
        { key: "credito_minuto_aumento", label: "Crédito Minuto / Aumento" },
        { key: "consignado_volume", label: "Consignado (Volume R$)" },
        { key: "credito_fidelidade_volume", label: "Crédito Fidelidade (Volume R$)" },
      ],
    },
    {
      title: "Recuperação",
      fields: [
        { key: "recuperacao_estagio_2", label: "Recuperação Estágio 2 (R$)" },
        { key: "recuperacao_estagio_3", label: "Recuperação Estágio 3 (R$)" },
      ],
    },
    {
      title: "PJ",
      fields: [
        { key: "pj_conta_empresarial", label: "PJ Conta Empresarial" },
        { key: "pj_maquina_vero", label: "PJ Máquina Vero" },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar onSignOut={signOut} />
      <div className="flex flex-1 flex-col">
        <Topbar userName={profile?.name ?? null} userRole={userRole} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Registrar Produção</h1>
            <p className="text-sm text-muted-foreground">Registre sua produção do dia</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Data</label>
              <input
                type="date"
                value={form.report_date}
                onChange={(e) => handleChange("report_date", e.target.value)}
                className="h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {fieldGroups.map((group) => (
              <div key={group.title} className="rounded-lg border border-border bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-card-foreground">{group.title}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.fields.map((field) => (
                    <div key={field.key}>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        {field.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={field.key.includes("volume") || field.key.includes("recuperacao") ? "0.01" : "1"}
                        value={(form as any)[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-success">Produção registrada com sucesso!</p>}

            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Produção"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
