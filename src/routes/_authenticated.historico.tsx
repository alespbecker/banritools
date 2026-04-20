import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — BanriTools" },
      { name: "description", content: "Histórico de produção diária" },
    ],
  }),
  component: HistoricoPage,
});

function HistoricoPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchReports = useCallback(() => {
    if (!user) return;
    let query = supabase.from("daily_reports").select("*")
      .eq("user_id", user.id).order("report_date", { ascending: false });
    if (dateFrom) query = query.gte("report_date", dateFrom);
    if (dateTo) query = query.lte("report_date", dateTo);
    query.then(({ data }) => setReports(data ?? []));
  }, [user, dateFrom, dateTo]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    const handler = () => fetchReports();
    window.addEventListener("banritools:sync", handler);
    return () => window.removeEventListener("banritools:sync", handler);
  }, [fetchReports]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Histórico</h1>
        <p className="text-sm text-muted-foreground">Visualize seus relatórios anteriores</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">De</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Até</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seguros</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Crédito (R$)</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recuperação (R$)</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">PJ</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum relatório encontrado</td></tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{new Date(r.report_date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-foreground">{(r.seguro_vida ?? 0) + (r.seguro_ap_smart ?? 0) + (r.capitalizacao ?? 0)}</td>
                  <td className="px-4 py-3 text-foreground">{Number(r.consignado_volume ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-foreground">{(Number(r.recuperacao_estagio_2 ?? 0) + Number(r.recuperacao_estagio_3 ?? 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-foreground">{(r.pj_conta_empresarial ?? 0) + (r.pj_maquina_vero ?? 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
