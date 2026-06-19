// Cargos (job titles) selecionáveis pelo usuário ao se cadastrar.
// Independente do `role` (nível de acesso), que continua em user_roles.

export type CargoValue =
  | "gerente_geral"
  | "gerente_adjunta"
  | "gerente_mercado"
  | "supervisor"
  | "tecn_pf"
  | "tecn_juridica";

export type CargoEspecialidade = "PJ" | "PF";

export interface CargoOption {
  value: CargoValue;
  label: string;
  requiresEspecialidade?: boolean;
}

export const CARGO_OPTIONS: readonly CargoOption[] = [
  { value: "gerente_geral", label: "Gerente Geral" },
  { value: "gerente_adjunta", label: "Gerente Adjunta" },
  { value: "gerente_mercado", label: "Gerente de Mercado", requiresEspecialidade: true },
  { value: "supervisor", label: "Supervisor" },
  { value: "tecn_pf", label: "Técn. PF" },
  { value: "tecn_juridica", label: "Técn. Jurídica" },
] as const;

export function cargoLabel(value: CargoValue | null | undefined, esp?: CargoEspecialidade | null): string {
  if (!value) return "—";
  const base = CARGO_OPTIONS.find((c) => c.value === value)?.label ?? value;
  if (value === "gerente_mercado" && esp) return `${base} ${esp}`;
  return base;
}
