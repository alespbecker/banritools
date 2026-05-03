import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressWithLabel } from "./ProgressWithLabel";

interface HeroPerformanceProps {
  greeting: string;
  subtitle?: string;
  /** Métrica principal (ex.: produção do dia). */
  primaryLabel: string;
  primaryValue: string | number;
  primaryHint?: string;
  /** Progresso 0–100 (meta diária ou mensal). */
  progress?: number;
  progressLabel?: string;
  progressCaption?: string;
  /** Próxima melhor ação destacada. */
  nextAction?: {
    title: string;
    description?: string;
    icon?: LucideIcon;
    onClick?: () => void;
    ctaLabel?: string;
    tone?: "primary" | "warning" | "danger" | "success";
  };
  className?: string;
}

const actionTone: Record<NonNullable<HeroPerformanceProps["nextAction"]>["tone"] & string, string> = {
  primary: "border-primary/40 bg-primary/10 text-primary",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
  success: "border-success/40 bg-success/10 text-success",
};

/**
 * Hero principal da dashboard: saudação + métrica forte + progresso + próxima ação.
 * Comunica em uma dobra: "como você está hoje e o que fazer agora".
 */
export function HeroPerformance({
  greeting,
  subtitle,
  primaryLabel,
  primaryValue,
  primaryHint,
  progress,
  progressLabel,
  progressCaption,
  nextAction,
  className,
}: HeroPerformanceProps) {
  const NextIcon = nextAction?.icon;
  const tone = nextAction?.tone ?? "primary";
  return (
    <section
      className={cn(
        "animate-fade-in-up relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/10 p-6 sm:p-7",
        className,
      )}
    >
      {/* glow decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Resumo de hoje</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {greeting}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {primaryLabel}
            </span>
            <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {primaryValue}
            </span>
            {primaryHint && (
              <Badge variant="neutral" className="ml-1">{primaryHint}</Badge>
            )}
          </div>

          {progress != null && (
            <div className="max-w-md">
              <ProgressWithLabel
                value={progress}
                label={progressLabel}
                valueLabel={progressCaption}
                autoTone
                size="md"
              />
            </div>
          )}
        </div>

        {nextAction && (
          <button
            type="button"
            onClick={nextAction.onClick}
            className={cn(
              "card-hover group flex w-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              actionTone[tone],
            )}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <span>Próxima melhor ação</span>
            </div>
            <div className="flex items-start gap-3">
              {NextIcon && (
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/40">
                  <NextIcon className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  {nextAction.title}
                </p>
                {nextAction.description && (
                  <p className="text-sm text-muted-foreground">
                    {nextAction.description}
                  </p>
                )}
              </div>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium">
              {nextAction.ctaLabel ?? "Abrir"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
