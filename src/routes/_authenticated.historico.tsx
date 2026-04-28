import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, Fragment } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageSkeleton, DataGate } from "@/components/PageSkeleton";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — BanriTools" },
      { name: "description", content: "Histórico de produção diária" },
    ],
  }),
  component: HistoricoPage,
  pendingComponent: () => <PageSkeleton kpis={0} rows={8} />,
});

type ReportRow = {
  id: string;
  user_id: string;
  report_date: string;
  seguro_vida: number | null;
  seguro_vida_valor: number | null;
  seguro_ap_smart: number | null;
  seguro_ap_smart_valor: number | null;
  capitalizacao: number | null;
  capitalizacao_valor: number | null;
  credito_minuto_aumento: number | null;
  consignado_volume: number | null;
  recuperacao_estagio_2: number | null;
  recuperacao_estagio_3: number | null;
  pj_conta_empresarial: number | null;
  pj_maquina_vero: number | null;
};

const NUMERIC_FIELDS = [
  "seguro_vida", "seguro_vida_valor",
  "seguro_ap_smart", "seguro_ap_smart_valor",
  "capitalizacao", "capitalizacao_valor",
  "credito_minuto_aumento", "consignado_volume",
  "recuperacao_estagio_2", "recuperacao_estagio_3",
  "pj_conta_empresarial", "pj_maquina_vero",
] as const;

const FIELD_LABELS: Record<string, string> = {
  seguro_vida: "Seguro Vida (qtd)",
  seguro_vida_valor: "Seguro Vida (R$)",
  seguro_ap_smart: "AP Smart (qtd)",
  seguro_ap_smart_valor: "AP Smart (R$)",
  capitalizacao: "Capitalização (qtd)",
  capitalizacao_valor: "Capitalização (R$)",
  credito_minuto_aumento: "Crédito Minuto (qtd)",
  consignado_volume: "Consignado (R$)",
  recuperacao_estagio_2: "Recup. E2 (R$)",
  recuperacao_estagio_3: "Recup. E3 (R$)",
  pj_conta_empresarial: "PJ Conta Emp. (qtd)",
  pj_maquina_vero: "Máquina Vero (qtd)",
};

const CURRENCY_FIELDS = new Set([
  "seguro_vida_valor", "seguro_ap_smart_valor", "capitalizacao_valor",
  "consignado_volume", "recuperacao_estagio_2", "recuperacao_estagio_3",
]);

function HistoricoPage() {
  const { user, userRole } = useAuth();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ReportRow>>({});
  const [saving, setSaving] = useState(false);

  const fetchReports = useCallback(() => {
    if (!user) return;
    let query = supabase.from("daily_reports").select("*")
      .order("report_date", { ascending: false });
    // Admin vê toda a agência; user vê só seus próprios (RLS já garante)
    if (userRole !== "admin") {
      query = query.eq("user_id", user.id);
    }
    if (dateFrom) query = query.gte("report_date", dateFrom);
    if (dateTo) query = query.lte("report_date", dateTo);
    query.then(({ data }) => {
      setReports((data as ReportRow[]) ?? []);
      setLoading(false);
    });
  }, [user, userRole, dateFrom, dateTo]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    const handler = () => fetchReports();
    window.addEventListener("banritools:sync", handler);
    return () => window.removeEventListener("banritools:sync", handler);
  }, [fetchReports]);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("historico-reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_reports" }, () => fetchReports())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchReports]);

  const startEdit = (r: ReportRow) => {
    setEditingId(r.id);
    setDraft({ ...r });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const handleField = (field: string, raw: string) => {
    const num = CURRENCY_FIELDS.has(field)
      ? Math.max(0, parseFloat(raw.replace(",", ".")) || 0)
      : Math.max(0, Math.floor(Number(raw) || 0));
    setDraft((d) => ({ ...d, [field]: num }));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const payload: Record<string, number> = {};
    for (const f of NUMERIC_FIELDS) {
      const v = (draft as Record<string, unknown>)[f];
      payload[f] = typeof v === "number" ? v : 0;
    }
    // @ts-expect-error dynamic field set is validated above
    const { error } = await supabase.from("daily_reports").update(payload).eq("id", editingId);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Lançamento atualizado");
      setEditingId(null);
      setDraft({});
      fetchReports();
      window.dispatchEvent(new Event("banritools:sync"));
    }
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Excluir este lançamento? Esta ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("daily_reports").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
    } else {
      toast.success("Lançamento excluído");
      fetchReports();
      window.dispatchEvent(new Event("banritools:sync"));
    }
  };

  const fmtBRL = (n: number | null | undefined) =>
    Number(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Histórico</h1>
        <p className="text-sm text-muted-foreground">
          Visualize e edite seus lançamentos. Clique em <Pencil className="inline h-3 w-3" aria-hidden="true" /> para alterar quantidades e valores.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div>
          <label htmlFor="date-from" className="mb-1 block text-xs text-muted-foreground">De</label>
          <input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Filtrar histórico a partir desta data"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label htmlFor="date-to" className="mb-1 block text-xs text-muted-foreground">Até</label>
          <input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            aria-label="Filtrar histórico até esta data"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">Data</th>
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">Seguros (qtd)</th>
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">Consignado (R$)</th>
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">Recuperação (R$)</th>
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">PJ (qtd)</th>
              <th className="px-3 py-3 text-right font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum lançamento encontrado</td></tr>
            ) : (
              reports.map((r) => {
                const isEditing = editingId === r.id;
                const totalSeguros = (r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0);
                const totalRecup = Number(r.recuperacao_estagio_2 ?? 0) + Number(r.recuperacao_estagio_3 ?? 0);
                const totalPJ = (r.pj_conta_empresarial ?? 0) + (r.pj_maquina_vero ?? 0);
                return (
                  <Fragment key={r.id}>
                    <tr className="border-b border-border last:border-0">
                      <td className="px-3 py-3 text-foreground">{new Date(r.report_date + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                      <td className="px-3 py-3 text-foreground">{totalSeguros}</td>
                      <td className="px-3 py-3 text-foreground">{fmtBRL(r.consignado_volume)}</td>
                      <td className="px-3 py-3 text-foreground">{fmtBRL(totalRecup)}</td>
                      <td className="px-3 py-3 text-foreground">{totalPJ}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => isEditing ? cancelEdit() : startEdit(r)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={isEditing ? "Cancelar edição deste lançamento" : "Editar este lançamento"}
                            aria-label={isEditing ? "Cancelar edição deste lançamento" : "Editar este lançamento"}
                          >
                            {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => deleteRow(r.id)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Excluir este lançamento permanentemente"
                            aria-label="Excluir este lançamento permanentemente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isEditing && (
                      <tr key={r.id + "-edit"} className="border-b border-border bg-muted/20">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {NUMERIC_FIELDS.map((f) => {
                              const isCurrency = CURRENCY_FIELDS.has(f);
                              const val = (draft as Record<string, unknown>)[f];
                              return (
                                <div key={f}>
                                  <label className="mb-1 block text-xs text-muted-foreground">{FIELD_LABELS[f]}</label>
                                  <input
                                    type="number"
                                    step={isCurrency ? "0.01" : "1"}
                                    min="0"
                                    value={typeof val === "number" ? val : 0}
                                    onChange={(e) => handleField(f, e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <button
                              onClick={cancelEdit}
                              className="h-9 rounded-md border border-input bg-background px-4 text-sm text-foreground hover:bg-muted"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                              <Save className="h-4 w-4" />
                              {saving ? "Salvando..." : "Salvar alterações"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
