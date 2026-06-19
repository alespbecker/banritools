import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CARGO_OPTIONS,
  type CargoValue,
  type CargoEspecialidade,
} from "@/features/auth/cargos";

export interface CargoSelectValue {
  cargo: CargoValue | "";
  especialidade: CargoEspecialidade | "";
}

interface CargoSelectProps {
  value: CargoSelectValue;
  onChange: (next: CargoSelectValue) => void;
  error?: string;
  required?: boolean;
}

/**
 * Dropdown com lista de cargos + sub-seleção PJ/PF quando "Gerente de Mercado".
 * Usado em /login (cadastro) e em /convite/:code.
 */
export function CargoSelect({ value, onChange, error, required }: CargoSelectProps) {
  const needsEsp = value.cargo === "gerente_mercado";

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="cargo">
          Cargo {required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={value.cargo}
          onValueChange={(v) =>
            onChange({ cargo: v as CargoValue, especialidade: v === "gerente_mercado" ? value.especialidade : "" })
          }
        >
          <SelectTrigger id="cargo" className="mt-1">
            <SelectValue placeholder="Selecione seu cargo" />
          </SelectTrigger>
          <SelectContent>
            {CARGO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsEsp && (
        <div>
          <Label htmlFor="cargo-esp">Especialidade</Label>
          <Select
            value={value.especialidade}
            onValueChange={(v) => onChange({ ...value, especialidade: v as CargoEspecialidade })}
          >
            <SelectTrigger id="cargo-esp" className="mt-1">
              <SelectValue placeholder="PJ ou PF" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PJ">PJ</SelectItem>
              <SelectItem value="PF">PF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
