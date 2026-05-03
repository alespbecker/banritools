import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type Tone = "primary" | "success" | "warning" | "danger" | "muted";

interface ProgressWithLabelProps {
  label?: string;
  /** 0-100. */
  value: number;
  /** Texto à direita (ex.: "85%" ou "85 / 100"). Auto se omitido. */
  valueLabel?: string;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  /** Define automaticamente o tom: <40 danger, <70 warning, >=70 success. */
  autoTone?: boolean;
  className?: string;
}

export function ProgressWithLabel({
  label,
  value,
  valueLabel,
  tone = "primary",
  size = "md",
  autoTone,
  className,
}: ProgressWithLabelProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const finalTone: Tone = autoTone
    ? clamped >= 70
      ? "success"
      : clamped >= 40
        ? "warning"
        : "danger"
    : tone;

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || valueLabel || value != null) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-foreground">{label}</span>}
          <span className="text-muted-foreground">
            {valueLabel ?? `${Math.round(clamped)}%`}
          </span>
        </div>
      )}
      <Progress value={clamped} tone={finalTone} size={size} />
    </div>
  );
}
