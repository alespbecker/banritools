import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Tone = "primary" | "accent" | "success" | "warning" | "danger" | "muted";

const toneMap: Record<Tone, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  accent:  { bg: "bg-accent/15",  text: "text-accent" },
  success: { bg: "bg-success/15", text: "text-success" },
  warning: { bg: "bg-warning/15", text: "text-warning" },
  danger:  { bg: "bg-destructive/15", text: "text-destructive" },
  muted:   { bg: "bg-muted",       text: "text-muted-foreground" },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Ex.: "+12%" ou "-3%". O sinal define a cor. */
  trend?: string;
  description?: string;
  tone?: Tone;
  loading?: boolean;
  className?: string;
}

/**
 * Card de KPI com número grande, ícone, tendência e descrição.
 * Hierarquia: label (xs) → valor (3xl bold) → trend/desc (xs).
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  description,
  tone = "primary",
  loading,
  className,
}: KpiCardProps) {
  const t = toneMap[tone];

  if (loading) {
    return (
      <div
        className={cn("rounded-xl border border-border bg-card p-5", className)}
        aria-busy="true"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
    );
  }

  const trendUp = trend?.trim().startsWith("+");
  const trendDown = trend?.trim().startsWith("-");

  return (
    <div
      className={cn(
        "card-hover animate-fade-in-up rounded-xl border border-border bg-card p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", t.bg)}>
            <Icon className={cn("h-4 w-4", t.text)} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-card-foreground tabular-nums">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trendUp && "text-success",
              trendDown && "text-destructive",
            )}
          >
            {trendUp && <ArrowUpRight className="h-3 w-3" />}
            {trendDown && <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
        {description && <span>{description}</span>}
      </div>
    </div>
  );
}
