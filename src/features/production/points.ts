/**
 * Cálculo de pontos da produção — fonte única de verdade.
 *
 * Fórmula:
 *   pts = quantity * points_per_quantity
 *       + (amount / amount_bucket) * points_per_amount
 *
 * Compatibilidade: se as novas colunas vierem zeradas (produto antigo
 * ainda não migrado), usamos o legado `points_per_unit` para não quebrar.
 */

export type ProductPointsConfig = {
  points_per_quantity?: number | null;
  points_per_amount?: number | null;
  amount_bucket?: number | null;
  /** legado */
  points_per_unit?: number | null;
};

export type EntryPointsInput = {
  quantity?: number | null;
  amount?: number | null;
};

export function calcEntryPoints(
  entry: EntryPointsInput,
  product: ProductPointsConfig | null | undefined
): number {
  if (!product) return 0;
  const q = Number(entry.quantity ?? 0) || 0;
  const a = Number(entry.amount ?? 0) || 0;

  const ppq = Number(product.points_per_quantity ?? 0) || 0;
  const ppa = Number(product.points_per_amount ?? 0) || 0;
  const bucket = Number(product.amount_bucket ?? 1000) || 1000;

  if (ppq === 0 && ppa === 0) {
    // Fallback para produto ainda não calibrado: usa o legado.
    const ppu = Number(product.points_per_unit ?? 0) || 0;
    return Math.round((q + a) * ppu);
  }

  const pts = q * ppq + (a / bucket) * ppa;
  return Math.round(pts);
}

/** Texto curto para mostrar a regra ao gestor. */
export function describePointsRule(product: ProductPointsConfig | null | undefined): string {
  if (!product) return "";
  const ppq = Number(product.points_per_quantity ?? 0) || 0;
  const ppa = Number(product.points_per_amount ?? 0) || 0;
  const bucket = Number(product.amount_bucket ?? 1000) || 1000;
  const parts: string[] = [];
  if (ppq > 0) parts.push(`${ppq} pts/unidade`);
  if (ppa > 0) {
    const bucketLabel = bucket >= 1000 ? `R$ ${(bucket / 1000).toLocaleString("pt-BR")}k` : `R$ ${bucket}`;
    parts.push(`${ppa} pts a cada ${bucketLabel}`);
  }
  if (parts.length === 0) {
    const ppu = Number(product.points_per_unit ?? 0) || 0;
    if (ppu > 0) parts.push(`${ppu} pts (legado)`);
  }
  return parts.join(" + ");
}
