import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressWithLabel } from "./ProgressWithLabel";
import { AnimatedNumber, AnimatedText } from "@/components/AnimatedNumber";

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
        "animate-fade-in-up relative px-1 py-2 sm:px-2",
        className,
      )}
    >
      <div className="relative grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Resumo de hoje</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {greeting}
            </h1>
            {subtitle && (
              <p className="text-base text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {primaryLabel}
            </span>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums sm:text-6xl">
                {typeof primaryValue === "number" ? (
                  <AnimatedNumber value={primaryValue} />
                ) : (
                  <AnimatedText text={String(primaryValue)} />
                )}
              </span>
              {primaryHint && (
                <Badge variant="info" className="self-center">{primaryHint}</Badge>
              )}
            </div>
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
            aria-label={`Próxima melhor ação: ${nextAction.title}`}
            className={cn(
              "card-hover group flex w-full flex-col items-start gap-3 rounded-xl border p-6 text-left transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              actionTone[tone],
            )}
          >
            <div className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em]">
              <span>Próxima melhor ação</span>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            </div>
            <div className="flex items-start gap-3">
              {NextIcon && (
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/50 ring-1 ring-inset ring-current/10">
                  <NextIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  {nextAction.title}
                </p>
                {nextAction.description && (
                  <p className="text-sm text-muted-foreground">
                    {nextAction.description}
                  </p>
                )}
              </div>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 self-end text-sm font-semibold">
              {nextAction.ctaLabel ?? "Abrir"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
