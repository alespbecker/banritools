import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Send, ShieldCheck, CreditCard, LifeBuoy, Building2,
  Calendar, RotateCcw, Sparkles, ArrowLeft, CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
function fmtMoney(v: number) {
  return `R$ ${formatBRL(v)}`;
}

function parseBRL(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.max(0, num);
}

type FieldDef = {
  key: NumericField;
  label: string;
  /** Sub-campos relacionados (ex.: valor R$ ao lado da quantidade) */
  subFields?: { key: NumericField; label: string }[];
  /** Texto curto explicando o que registrar nesse campo */
  hint?: string;
};

type GroupDef = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof ShieldCheck;
  tone: "primary" | "teal" | "violet" | "warning";
  fields: FieldDef[];
};

const GROUPS: GroupDef[] = [
  {
    id: "seguros",
    title: "Seguros e Capitalização",
    subtitle: "Quantidade vendida e valor (R$) de cada apólice/título.",
    icon: ShieldCheck,
    tone: "primary",
    fields: [
      { key: "seguro_vida", label: "Seguro Vida", subFields: [{ key: "seguro_vida_valor", label: "Valor" }], hint: "Apólices de Seguro de Vida vendidas no dia." },
      { key: "seguro_ap_smart", label: "AP Smart", subFields: [{ key: "seguro_ap_smart_valor", label: "Valor" }], hint: "Apólices AP Smart contratadas no dia." },
      { key: "capitalizacao", label: "Capitalização", subFields: [{ key: "capitalizacao_valor", label: "Valor" }], hint: "Títulos de capitalização vendidos no dia." },
    ],
  },
  {
    id: "credito",
    title: "Crédito",
    subtitle: "Liberações de crédito do dia.",
    icon: CreditCard,
    tone: "teal",
    fields: [
      { key: "credito_minuto_aumento", label: "Crédito Minuto / Aumento", hint: "Quantidade de operações de Crédito Minuto + Aumento de limite." },
      { key: "consignado_volume", label: "Consignado (Volume)", hint: "Volume financeiro liberado em consignado (R$)." },
    ],
  },
  {
    id: "recuperacao",
    title: "Recuperação de Inadimplência",
    subtitle: "Valores recuperados por estágio.",
    icon: LifeBuoy,
    tone: "warning",
    fields: [
      { key: "recuperacao_estagio_2", label: "Estágio 2", hint: "Valor recuperado em contratos do estágio 2." },
      { key: "recuperacao_estagio_3", label: "Estágio 3", hint: "Valor recuperado em contratos do estágio 3." },
    ],
  },
  {
    id: "pj",
    title: "Produtos PJ",
    subtitle: "Aberturas e contratações de produtos para Pessoa Jurídica.",
    icon: Building2,
    tone: "violet",
    fields: [
      { key: "pj_conta_empresarial", label: "Conta Empresarial", hint: "Quantidade de contas PJ abertas." },
      { key: "pj_maquina_vero", label: "Máquina Vero", hint: "Quantidade de máquinas Vero contratadas." },
    ],
  },
];

const TONE_CLASSES: Record<GroupDef["tone"], { bg: string; text: string; ring: string }> = {
  primary: { bg: "bg-primary/10",                     text: "text-primary",                     ring: "ring-primary/20" },
  teal:    { bg: "bg-[var(--brand-teal)]/12",         text: "text-[var(--brand-teal)]",         ring: "ring-[var(--brand-teal)]/20" },
  violet:  { bg: "bg-[var(--brand-violet)]/12",       text: "text-[var(--brand-violet)]",       ring: "ring-[var(--brand-violet)]/20" },
  warning: { bg: "bg-warning/15",                     text: "text-warning",                     ring: "ring-warning/20" },
};

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

  const upsertSum = async (partial: Partial<Record<NumericField, number>>, reportDate: string) => {
    if (!user) return;
    const { data: existing, error: selErr } = await supabase
      .from("daily_reports").select("*")
      .eq("user_id", user.id).eq("report_date", reportDate).maybeSingle();
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
        .from("daily_reports").update(merged as never)
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
      console.error(err);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

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
      console.error(err);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSavingField(null);
    }
  };

  const handleClearAll = () => {
    setForm((prev) => ({ ...createDefaultForm(), report_date: prev.report_date }));
    setCurrencyDisplay({});
    toast.info("Formulário limpo");
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSaveAll("save"); };
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") { e.preventDefault(); inputRefs.current[index + 1]?.focus(); }
  };

  // Resumo em tempo real do que será salvo
  const summary = useMemo(() => {
    let totalUnidades = 0;
    let totalValor = 0;
    let camposPreenchidos = 0;
    for (const k of NUMERIC_FIELDS) {
      const v = form[k];
      if (v > 0) {
        camposPreenchidos++;
        if (currencyFields.has(k)) totalValor += v;
        else totalUnidades += v;
      }
    }
    return { totalUnidades, totalValor, camposPreenchidos };
  }, [form]);

  // Render input — usa um índice global para navegação por Enter
  const fieldIndexRef = useRef(0);
  fieldIndexRef.current = 0;

  const renderInput = (key: string, label: string, opts?: { compact?: boolean }) => {
    const isCurrency = currencyFields.has(key);
    const currentIndex = fieldIndexRef.current++;
    const value = (form as unknown as Record<string, number>)[key];
    const filled = value > 0;
    return (
      <div key={key} className="flex-1 min-w-0">
        <label
          htmlFor={`field-${key}`}
          className={cn(
            "mb-1 block text-xs font-medium",
            filled ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </label>
        <div className="relative">
          {isCurrency && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              R$
            </span>
          )}
          <input
            id={`field-${key}`}
            ref={(el) => { inputRefs.current[currentIndex] = el; }}
            type={isCurrency ? "text" : "number"}
            inputMode={isCurrency ? "decimal" : "numeric"}
            min={isCurrency ? undefined : "0"}
            step={isCurrency ? undefined : "1"}
            value={isCurrency ? (currencyDisplay[key] ?? (value === 0 ? "" : formatBRL(value))) : (value === 0 ? "" : value)}
            onChange={(e) => handleChange(key, e.target.value)}
            onBlur={isCurrency ? () => handleCurrencyBlur(key) : undefined}
            onFocus={isCurrency ? () => handleCurrencyFocus(key) : undefined}
            onKeyDown={(e) => handleKeyDown(e, currentIndex)}
            placeholder={isCurrency ? "0,00" : "0"}
            aria-label={label}
            className={cn(
              opts?.compact ? "h-10" : "h-11",
              "w-full rounded-md border bg-background text-sm text-foreground transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              filled
                ? "border-primary/40 bg-primary/5 font-semibold"
                : "border-input",
              isCurrency ? "pl-9 pr-3" : "px-3"
            )}
          />
        </div>
      </div>
    );
  };

  const renderProductRow = (field: FieldDef, tone: GroupDef["tone"]) => {
    const keys: NumericField[] = [field.key, ...(field.subFields?.map((s) => s.key) ?? [])];
    const busy = savingField === field.key;
    const anyFilled = keys.some((k) => form[k] > 0);
    const t = TONE_CLASSES[tone];

    return (
      <div
        key={field.key}
        className={cn(
          "rounded-lg border bg-background/40 p-3 transition-all",
          anyFilled ? `border-transparent ring-1 ${t.ring} bg-background/70` : "border-border/60"
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {renderInput(field.key, field.label)}
            {field.subFields?.map((sf) => renderInput(sf.key, sf.label))}
          </div>
          <Button
            type="button"
            size="sm"
            variant={anyFilled ? "default" : "outline"}
            disabled={saving || busy || !anyFilled}
            onClick={() => handleSendOnly(field.key, keys)}
            className="gap-1.5 sm:self-end sm:min-w-[110px]"
            title={`Enviar apenas "${field.label}" para ${form.report_date}`}
            aria-label={`Enviar apenas ${field.label}`}
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            {busy ? "Enviando..." : "Enviar"}
          </Button>
        </div>
        {field.hint && (
          <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{field.hint}</span>
          </p>
        )}
      </div>
    );
  };

  const dateLabel = useMemo(() => {
    const [y, m, d] = form.report_date.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  }, [form.report_date]);

  return (
    <div className="animate-fade-in-up pb-32">
      {/* Header com breadcrumb e contexto */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Voltar ao dashboard"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Voltar ao dashboard
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
              Registrar Produção
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Preencha apenas o que vendeu. Vários lançamentos no mesmo dia são <strong className="text-foreground">somados automaticamente</strong> — você pode registrar uma venda de cada vez ou tudo de uma vez.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* COLUNA PRINCIPAL */}
        <div className="space-y-5 min-w-0">
          {/* Data — destaque visual */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <label htmlFor="report-date" className="block text-sm font-semibold text-foreground">
                    Data da produção
                  </label>
                  <p className="text-xs text-muted-foreground capitalize">{dateLabel}</p>
                </div>
              </div>
              <input
                id="report-date"
                type="date"
                value={form.report_date}
                onChange={(e) => handleChange("report_date", e.target.value)}
                aria-label="Data dos lançamentos"
                title="Data em que essas vendas serão somadas"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-52"
              />
            </div>
          </div>

          {/* Grupos de produtos */}
          {GROUPS.map((group) => {
            const Icon = group.icon;
            const t = TONE_CLASSES[group.tone];
            const groupFilledCount = group.fields.reduce((acc, f) => {
              const keys = [f.key, ...(f.subFields?.map((s) => s.key) ?? [])];
              return acc + (keys.some((k) => form[k] > 0) ? 1 : 0);
            }, 0);
            return (
              <section
                key={group.id}
                aria-label={group.title}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 animate-fade-in-up"
              >
                <header className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", t.bg)}>
                      <Icon className={cn("h-5 w-5", t.text)} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-card-foreground">{group.title}</h2>
                      <p className="text-xs text-muted-foreground">{group.subtitle}</p>
                    </div>
                  </div>
                  {groupFilledCount > 0 && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success"
                      title={`${groupFilledCount} produto(s) preenchido(s) neste grupo`}
                    >
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      {groupFilledCount}
                    </span>
                  )}
                </header>
                <div className="space-y-3">
                  {group.fields.map((field) => renderProductRow(field, group.tone))}
                </div>
              </section>
            );
          })}
        </div>

        {/* COLUNA LATERAL — Resumo (sticky no desktop) */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-card-foreground">Resumo deste lançamento</h3>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">Produtos preenchidos</dt>
                <dd className="text-sm font-semibold text-foreground">{summary.camposPreenchidos}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">Total em unidades</dt>
                <dd className="text-sm font-semibold text-foreground">{summary.totalUnidades}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <dt className="text-xs text-muted-foreground">Valor total (R$)</dt>
                <dd className="text-base font-bold text-primary">{fmtMoney(summary.totalValor)}</dd>
              </div>
            </dl>
            <p className="mt-3 rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">
              Esses números refletem apenas o que está digitado agora. Eles serão <strong>somados</strong> ao que já existe no dia {form.report_date.split("-").reverse().join("/")}.
            </p>
          </div>

          {/* Ações principais — visíveis no desktop, replicadas em barra fixa no mobile */}
          <div className="hidden lg:block rounded-xl border border-border bg-card p-4 space-y-2">
            <Button
              type="submit"
              disabled={saving || isFormEmpty()}
              className="h-11 w-full"
              title="Salvar todos os campos preenchidos e voltar ao dashboard"
              aria-label="Salvar tudo e voltar ao dashboard"
            >
              {saving ? "Salvando..." : "Salvar e voltar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving || isFormEmpty()}
              onClick={() => handleSaveAll("saveAndNew")}
              className="h-10 w-full"
              title="Salvar e limpar para registrar outro dia"
              aria-label="Salvar e registrar outro dia"
            >
              Salvar e registrar outro dia
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={saving || isFormEmpty()}
              onClick={handleClearAll}
              className="h-9 w-full text-muted-foreground"
              title="Limpa todos os campos sem salvar"
              aria-label="Limpar formulário"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Limpar tudo
            </Button>
          </div>
        </aside>
      </form>

      {/* Barra de ações fixa no mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex-1 text-xs">
            <div className="text-muted-foreground">Total digitado</div>
            <div className="font-semibold text-foreground">
              {summary.totalUnidades} un · {fmtMoney(summary.totalValor)}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving || isFormEmpty()}
            onClick={handleClearAll}
            aria-label="Limpar formulário"
            title="Limpar"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            disabled={saving || isFormEmpty()}
            onClick={() => handleSaveAll("save")}
            aria-label="Salvar tudo e voltar ao dashboard"
            title="Salvar e voltar"
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
