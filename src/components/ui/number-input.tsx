import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumberInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
  value: number | string;
  onValueChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onValueChange, step = 1, min, max, decimals = 0, ...props }, ref) => {
    const clamp = (n: number) => {
      if (Number.isNaN(n)) return 0;
      if (typeof min === "number" && n < min) return min;
      if (typeof max === "number" && n > max) return max;
      return n;
    };
    const round = (n: number) => {
      const f = Math.pow(10, decimals);
      return Math.round(n * f) / f;
    };
    const current = typeof value === "number" ? value : Number(value) || 0;
    const bump = (dir: 1 | -1) => onValueChange(clamp(round(current + dir * step)));

    return (
      <div className={cn("relative group", className)}>
        <Input
          ref={ref}
          type="number"
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value) || 0)}
          className="pr-7"
          {...props}
        />
        <div className="absolute inset-y-0 right-1 flex flex-col justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Aumentar"
            onClick={() => bump(1)}
            className="flex h-3.5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent/40"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Diminuir"
            onClick={() => bump(-1)}
            className="flex h-3.5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent/40"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
