import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Topbar } from "@/components/Topbar";
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/registrar-producao")({
  head: () => ({
    meta: [
      { title: "Registrar Produção — BanriTools" },
      { name: "description", content: "Registre sua produção diária" },
    ],
  }),
  component: RegistrarProducaoPage,
});

type FormData = {
  report_date: string;
  seguro_vida: number;
  seguro_vida_valor: number;
  seguro_ap_smart: number;
  seguro_ap_smart_valor: number;
  capitalizacao: number;
  capitalizacao_valor: number;
  credito_minuto_aumento: number;
  consignado_volume: number;
  credito_fidelidade_volume: number;
  recuperacao_estagio_2: number;
  recuperacao_estagio_3: number;
  pj_conta_empresarial: number;
  pj_maquina_vero: number;
};

const createDefaultForm = (): FormData => ({
  report_date: new Date().toISOString().split("T")[0],
  seguro_vida: 0,
  seguro_vida_valor: 0,
  seguro_ap_smart: 0,
  seguro_ap_smart_valor: 0,
  capitalizacao: 0,
  capitalizacao_valor: 0,
  credito_minuto_aumento: 0,
  consignado_volume: 0,
  credito_fidelidade_volume: 0,
  recuperacao_estagio_2: 0,
  recuperacao_estagio_3: 0,
  pj_conta_empresarial: 0,
  pj_maquina_vero: 0,
});

const currencyFields = new Set([
  "seguro_vida_valor",
  "seguro_ap_smart_valor",
  "capitalizacao_valor",
  "consignado_volume",
  "credito_fidelidade_volume",
  "recuperacao_estagio_2",
  "recuperacao_estagio_3",
]);

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.max(0, num);
}

function RegistrarProducaoPage() {
  const { user, isAuthenticated, isLoading, signOut, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(createDefaultForm);
  const [currencyDisplay, setCurrencyDisplay] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"save" | "saveAndNew">("save");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((field: string, value: string) => {
    if (field === "report_date") {
      setForm((prev) => ({ ...prev, report_date: value }));
      return;
    }
    if (currencyFields.has(field)) {
      setCurrencyDisplay((prev) => ({ ...prev, [field]: value }));
      setForm((prev) => ({ ...prev, [field]: parseBRL(value) }));
    } else {
      const num = Math.max(0, Math.floor(Number(value) || 0));
      setForm((prev) => ({ ...prev, [field]: num }));
    }
  }, []);

  const handleCurrencyBlur = useCallback((field: string) => {
    const val = (form as any)[field] as number;
    setCurrencyDisplay((prev) => ({ ...prev, [field]: formatBRL(val) }));
  }, [form]);

  const handleCurrencyFocus = useCallback((field: string) => {
    const val = (form as any)[field] as number;
    setCurrencyDisplay((prev) => ({ ...prev, [field]: val === 0 ? "" : String(val) }));
  }, [form]);

  const isFormEmpty = (): boolean => {
    const numericKeys = Object.keys(form).filter((k) => k !== "report_date") as (keyof FormData)[];
    return numericKeys.every((k) => form[k] === 0);
  };

  const saveReport = async (action: "save" | "saveAndNew") => {
    if (!user) return;
    if (isFormEmpty()) {
      toast.warning("Nenhuma produção informada");
      return;
    }

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("daily_reports")
        .select("id")
        .eq("user_id", user.id)
        .eq("report_date", form.report_date)
        .maybeSingle();

      if (existing) {
        setDuplicateId(existing.id);
        setPendingAction(action);
        setShowDuplicateDialog(true);
        setSaving(false);
        return;
      }

      await insertReport(action);
    } catch (err) {
      console.error("Erro ao salvar produção:", err);
      toast.error("Erro ao salvar produção. Tente novamente.");
      setSaving(false);
    }
  };

  const insertReport = async (action: "save" | "saveAndNew") => {
    if (!user) return;
    setSaving(true);
    try {
      const { report_date, ...fields } = form;
      const { error } = await supabase.from("daily_reports").insert({
        user_id: user.id,
        agency_id: profile?.agency_id ?? null,
        report_date,
        ...fields,
      });

      if (error) throw error;

      toast.success("Produção registrada com sucesso");
      if (action === "save") {
        navigate({ to: "/dashboard" });
      } else {
        setForm(createDefaultForm());
        setCurrencyDisplay({});
      }
    } catch (err) {
      console.error("Erro ao salvar produção:", err);
      toast.error("Erro ao salvar produção. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const updateReport = async () => {
    if (!user || !duplicateId) return;
    setSaving(true);
    setShowDuplicateDialog(false);
    try {
      const { report_date, ...fields } = form;
      const { error } = await supabase
        .from("daily_reports")
        .update({ ...fields })
        .eq("id", duplicateId);

      if (error) throw error;

      toast.success("Produção atualizada com sucesso");
      if (pendingAction === "save") {
        navigate({ to: "/dashboard" });
      } else {
        setForm(createDefaultForm());
        setCurrencyDisplay({});
      }
    } catch (err) {
      console.error("Erro ao atualizar produção:", err);
      toast.error("Erro ao salvar produção. Tente novamente.");
    } finally {
      setSaving(false);
      setDuplicateId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveReport("save");
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = inputRefs.current[index + 1];
      if (next) next.focus();
    }
  };

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!isAuthenticated) return null;

  type FieldDef = { key: string; label: string; subFields?: { key: string; label: string }[] };

  const fieldGroups: { title: string; fields: FieldDef[] }[] = [
    {
      title: "Seguros e Capitalização",
      fields: [
        { key: "seguro_vida", label: "Seguro Vida (Qtd)", subFields: [{ key: "seguro_vida_valor", label: "Valor R$" }] },
        { key: "seguro_ap_smart", label: "Seguro AP Smart (Qtd)", subFields: [{ key: "seguro_ap_smart_valor", label: "Valor R$" }] },
        { key: "capitalizacao", label: "Capitalização (Qtd)", subFields: [{ key: "capitalizacao_valor", label: "Valor R$" }] },
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
      title: "Recuperação de Inadimplência",
      fields: [
        { key: "recuperacao_estagio_2", label: "Recuperação Estágio 2 (R$)" },
        { key: "recuperacao_estagio_3", label: "Recuperação Estágio 3 (R$)" },
      ],
    },
    {
      title: "Produtos PJ",
      fields: [
        { key: "pj_conta_empresarial", label: "PJ Conta Empresarial" },
        { key: "pj_maquina_vero", label: "PJ Máquina Vero" },
      ],
    },
  ];

  let fieldIndex = 0;

  const renderInput = (key: string, label: string) => {
    const isCurrency = currencyFields.has(key);
    const currentIndex = fieldIndex++;
    return (
      <div key={key}>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
        <div className="relative">
          {isCurrency && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
          )}
          <input
            ref={(el) => { inputRefs.current[currentIndex] = el; }}
            type={isCurrency ? "text" : "number"}
            inputMode={isCurrency ? "decimal" : "numeric"}
            min={isCurrency ? undefined : "0"}
            step={isCurrency ? undefined : "1"}
            value={isCurrency ? (currencyDisplay[key] ?? formatBRL((form as any)[key])) : (form as any)[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            onBlur={isCurrency ? () => handleCurrencyBlur(key) : undefined}
            onFocus={isCurrency ? () => handleCurrencyFocus(key) : undefined}
            onKeyDown={(e) => handleKeyDown(e, currentIndex)}
            className={`h-9 w-full rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${isCurrency ? "pl-9 pr-3" : "px-3"}`}
          />
        </div>
      </div>
    );
  };

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

          <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
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
                <div className="space-y-4">
                  {group.fields.map((field) => {
                    if (field.subFields) {
                      return (
                        <div key={field.key} className="rounded-md border border-border/50 bg-background/50 p-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {renderInput(field.key, field.label)}
                            {field.subFields.map((sf) => renderInput(sf.key, sf.label))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={field.key} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {renderInput(field.key, field.label)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar Produção"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => saveReport("saveAndNew")}
                className="h-10 rounded-md border border-input bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                Salvar e Registrar Outro Dia
              </button>
            </div>
          </form>
        </main>
      </div>

      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registro duplicado</AlertDialogTitle>
            <AlertDialogDescription>
              Você já registrou produção para este dia. Deseja atualizar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={updateReport}>
              Atualizar registro existente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
