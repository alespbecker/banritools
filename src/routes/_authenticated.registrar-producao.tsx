import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  recuperacao_estagio_2: number;
  recuperacao_estagio_3: number;
  pj_conta_empresarial: number;
  pj_maquina_vero: number;
};

type NumericField = Exclude<keyof FormData, "report_date">;

const NUMERIC_FIELDS: NumericField[] = [
  "seguro_vida", "seguro_vida_valor",
  "seguro_ap_smart", "seguro_ap_smart_valor",
  "capitalizacao", "capitalizacao_valor",
  "credito_minuto_aumento", "consignado_volume",
  "recuperacao_estagio_2", "recuperacao_estagio_3",
  "pj_conta_empresarial", "pj_maquina_vero",
];

const createDefaultForm = (): FormData => ({
  report_date: new Date().toISOString().split("T")[0],
  seguro_vida: 0, seguro_vida_valor: 0,
  seguro_ap_smart: 0, seguro_ap_smart_valor: 0,
  capitalizacao: 0, capitalizacao_valor: 0,
  credito_minuto_aumento: 0, consignado_volume: 0,
  recuperacao_estagio_2: 0, recuperacao_estagio_3: 0,
  pj_conta_empresarial: 0, pj_maquina_vero: 0,
});

const currencyFields = new Set<string>([
  "seguro_vida_valor", "seguro_ap_smart_valor", "capitalizacao_valor",
  "consignado_volume",
  "recuperacao_estagio_2", "recuperacao_estagio_3",
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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(createDefaultForm);
  const [currencyDisplay, setCurrencyDisplay] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
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
    const val = (form as unknown as Record<string, number>)[field];
    setCurrencyDisplay((prev) => ({ ...prev, [field]: formatBRL(val) }));
  }, [form]);

  const handleCurrencyFocus = useCallback((field: string) => {
    const val = (form as unknown as Record<string, number>)[field];
    setCurrencyDisplay((prev) => ({ ...prev, [field]: val === 0 ? "" : String(val) }));
  }, [form]);

  /**
   * Persist a partial set of numeric fields to today's report by SUMMING them
   * into the existing row (or creating it if absent). This allows multiple
   * submissions per day to accumulate.
   */
  const upsertSum = async (partial: Partial<Record<NumericField, number>>, reportDate: string) => {
    if (!user) return;
    const { data: existing, error: selErr } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", user.id)
      .eq("report_date", reportDate)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing) {
      const merged: Record<string, number> = {};
      const row = existing as unknown as Record<string, number | null>;
      for (const k of NUMERIC_FIELDS) {
        const cur = Number(row[k] ?? 0);
        const add = Number(partial[k] ?? 0);
        if (add > 0) merged[k] = cur + add;
      }
      if (Object.keys(merged).length === 0) return;
      const { error } = await supabase
        .from("daily_reports")
        .update(merged as never)
        .eq("id", (existing as { id: string }).id);
      if (error) throw error;
    } else {
      const insertPayload: Record<string, unknown> = {
        user_id: user.id,
        agency_id: profile?.agency_id ?? null,
        report_date: reportDate,
      };
      for (const k of NUMERIC_FIELDS) insertPayload[k] = Number(partial[k] ?? 0);
      const { error } = await supabase.from("daily_reports").insert(insertPayload as never);
      if (error) throw error;
    }

    // notify other tabs/widgets to refresh aggregates
    window.dispatchEvent(new Event("banritools:sync"));
  };

  const collectAllPartial = (): Partial<Record<NumericField, number>> => {
    const out: Partial<Record<NumericField, number>> = {};
    for (const k of NUMERIC_FIELDS) {
      const v = form[k];
      if (v && v > 0) out[k] = v;
    }
    return out;
  };

  const isFormEmpty = (): boolean => NUMERIC_FIELDS.every((k) => form[k] === 0);

  const resetFields = (keys: NumericField[]) => {
    setForm((prev) => {
      const next = { ...prev };
      for (const k of keys) next[k] = 0;
      return next;
    });
    setCurrencyDisplay((prev) => {
      const next = { ...prev };
      for (const k of keys) delete next[k];
      return next;
    });
  };

  const handleSaveAll = async (action: "save" | "saveAndNew") => {
    if (!user) return;
    if (isFormEmpty()) { toast.warning("Nenhuma produção informada"); return; }
    setSaving(true);
    try {
      await upsertSum(collectAllPartial(), form.report_date);
      toast.success("Produção registrada (somada ao dia)");
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

  /**
   * Send only fields belonging to a specific product row. Clears those
   * fields on success.
   */
  const handleSendOnly = async (fieldKey: string, keys: NumericField[]) => {
    if (!user) return;
    const partial: Partial<Record<NumericField, number>> = {};
    for (const k of keys) {
      const v = form[k];
      if (v && v > 0) partial[k] = v;
    }
    if (Object.keys(partial).length === 0) {
      toast.warning("Preencha pelo menos um valor antes de enviar");
      return;
    }
    setSavingField(fieldKey);
    try {
      await upsertSum(partial, form.report_date);
      toast.success("Lançamento enviado e somado ao dia");
      resetFields(keys);
    } catch (err) {
      console.error("Erro ao enviar lançamento:", err);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSavingField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSaveAll("save"); };
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") { e.preventDefault(); inputRefs.current[index + 1]?.focus(); }
  };

  type FieldDef = { key: string; label: string; subFields?: { key: string; label: string }[] };
  const fieldGroups: { title: string; fields: FieldDef[] }[] = [
    {
      title: "Seguros e Capitalização",
      fields: [
        { key: "seguro_vida", label: "Seguro Vida (Qtd)", subFields: [{ key: "seguro_vida_valor", label: "Valor R$" }] },
        { key: "seguro_ap_smart", label: "AP Smart (Qtd)", subFields: [{ key: "seguro_ap_smart_valor", label: "Valor R$" }] },
        { key: "capitalizacao", label: "Capitalização (Qtd)", subFields: [{ key: "capitalizacao_valor", label: "Valor R$" }] },
      ],
    },
    {
      title: "Crédito",
      fields: [
        { key: "credito_minuto_aumento", label: "Crédito Minuto / Aumento" },
        { key: "consignado_volume", label: "Consignado (Volume R$)" },
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
    const value = (form as unknown as Record<string, number>)[key];
    return (
      <div key={key} className="flex-1 min-w-0">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
        <div className="relative">
          {isCurrency && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>}
          <input
            ref={(el) => { inputRefs.current[currentIndex] = el; }}
            type={isCurrency ? "text" : "number"}
            inputMode={isCurrency ? "decimal" : "numeric"}
            min={isCurrency ? undefined : "0"}
            step={isCurrency ? undefined : "1"}
            value={isCurrency ? (currencyDisplay[key] ?? formatBRL(value)) : value}
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

  const renderProductRow = (field: FieldDef) => {
    const keys: NumericField[] = [field.key as NumericField, ...(field.subFields?.map((s) => s.key as NumericField) ?? [])];
    const busy = savingField === field.key;
    return (
      <div key={field.key} className="rounded-md border border-border/50 bg-background/50 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {renderInput(field.key, field.label)}
            {field.subFields?.map((sf) => renderInput(sf.key, sf.label))}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={saving || busy}
            onClick={() => handleSendOnly(field.key, keys)}
            className="gap-1.5 sm:self-end"
            title="Enviar apenas este produto"
          >
            <Send className="h-3.5 w-3.5" />
            {busy ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Registrar Produção</h1>
        <p className="text-sm text-muted-foreground">
          Vários lançamentos no mesmo dia são somados automaticamente. Use "Enviar" ao lado de cada produto para registrar apenas aquela venda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div>
          <label htmlFor="report-date" className="mb-1.5 block text-sm font-medium text-foreground">Data</label>
          <input id="report-date" type="date" value={form.report_date} onChange={(e) => handleChange("report_date", e.target.value)}
            aria-label="Data do registro de produção"
            title="Data dos lançamentos que serão somados"
            className="h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>

        {fieldGroups.map((group) => (
          <div key={group.title} className="rounded-lg border border-border bg-card p-4 sm:p-5 animate-fade-in-up">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">{group.title}</h3>
            <div className="space-y-4">
              {group.fields.map((field) => renderProductRow(field))}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={saving}
            title="Salvar todos os produtos preenchidos e voltar ao dashboard"
            aria-label="Salvar tudo e ir ao dashboard"
            className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar Tudo"}
          </button>
          <button type="button" disabled={saving} onClick={() => handleSaveAll("saveAndNew")}
            title="Salvar e limpar formulário para registrar outro dia"
            aria-label="Salvar e registrar outro dia"
            className="h-10 rounded-md border border-input bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50">
            Salvar e Registrar Outro Dia
          </button>
        </div>
      </form>
    </div>
  );
}
