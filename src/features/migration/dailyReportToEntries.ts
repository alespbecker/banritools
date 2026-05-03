/**
 * Utilidades para conversão futura de daily_reports → production_entries.
 * NÃO executa nada agora. Serve como base para um backfill controlado.
 */

import type { Database } from "@/integrations/supabase/types";

type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"];

/** Mapeia colunas do daily_reports para slugs de produtos no novo modelo. */
export const DAILY_REPORT_FIELD_TO_PRODUCT: Record<string, { slug: string; metric: "quantity" | "amount" }> = {
  seguro_vida: { slug: "seguro-vida", metric: "quantity" },
  seguro_ap_smart: { slug: "seguro-ap-smart", metric: "quantity" },
  capitalizacao: { slug: "capitalizacao", metric: "quantity" },
  credito_minuto_aumento: { slug: "credito-minuto", metric: "quantity" },
  pj_conta_empresarial: { slug: "pj-conta", metric: "quantity" },
  pj_maquina_vero: { slug: "pj-maquina-vero", metric: "quantity" },
  consignado_volume: { slug: "consignado", metric: "amount" },
  credito_fidelidade_volume: { slug: "credito-fidelidade", metric: "amount" },
  recuperacao_estagio_2: { slug: "recuperacao-est2", metric: "amount" },
  recuperacao_estagio_3: { slug: "recuperacao-est3", metric: "amount" },
};

export interface PendingEntry {
  user_id: string;
  agency_id: string | null;
  entry_date: string;
  product_slug: string;
  quantity: number;
  amount: number;
  source_report_id: string;
}

/** Explode um daily_report em várias entradas candidatas (não persiste). */
export function explodeDailyReport(r: DailyReport): PendingEntry[] {
  const out: PendingEntry[] = [];
  for (const [field, cfg] of Object.entries(DAILY_REPORT_FIELD_TO_PRODUCT)) {
    const v = Number((r as unknown as Record<string, unknown>)[field] ?? 0);
    if (!v) continue;
    out.push({
      user_id: r.user_id,
      agency_id: r.agency_id ?? null,
      entry_date: r.report_date,
      product_slug: cfg.slug,
      quantity: cfg.metric === "quantity" ? v : 0,
      amount: cfg.metric === "amount" ? v : 0,
      source_report_id: r.id,
    });
  }
  return out;
}

/** Verifica se um daily_report já tem entries equivalentes (a ser usado pelo backfill). */
export function buildDedupKey(e: { user_id: string; entry_date: string; product_slug: string }) {
  return `${e.user_id}|${e.entry_date}|${e.product_slug}`;
}
