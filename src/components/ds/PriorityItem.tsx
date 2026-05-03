import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";

type Tone = "danger" | "warning" | "info" | "success";

const toneMap: Record<Tone, { dot: string; ring: string; text: string }> = {
  danger: { dot: "bg-destructive", ring: "ring-destructive/20", text: "text-destructive" },
  warning: { dot: "bg-warning", ring: "ring-warning/20", text: "text-warning" },
  info: { dot: "bg-info", ring: "ring-info/20", text: "text-info" },
  success: { dot: "bg-success", ring: "ring-success/20", text: "text-success" },
};

interface PriorityItemProps {
  tone?: Tone;
  count?: number;
  title: string;
  description?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  ctaLabel?: string;
}

/**
 * Item de "fila operacional" — visual unificado para ações prioritárias.
 * Usado em lista, sem o ruído de múltiplos AlertCards soltos.
 */
export function PriorityItem({
  tone = "warning",
  count,
  title,
  description,
  icon: Icon,
  onClick,
  ctaLabel = "Abrir",
}: PriorityItemProps) {
  const t = toneMap[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-all",
        "hover:border-primary/40 hover:bg-accent/30 disabled:cursor-default disabled:hover:border-border disabled:hover:bg-card",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span className={cn("relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-4", t.ring)}>
        {Icon ? (
          <Icon className={cn("h-4 w-4", t.text)} aria-hidden="true" />
        ) : (
          <span className={cn("h-2.5 w-2.5 rounded-full", t.dot)} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {count != null && (
            <span className={cn("text-sm font-semibold", t.text)}>{count}</span>
          )}
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
        </div>
        {description && (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {onClick && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
          {ctaLabel}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </button>
  );
}
