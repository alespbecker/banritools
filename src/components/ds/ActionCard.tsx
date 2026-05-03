import * as React from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  ctaLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Card focado em uma ação principal.
 * Clique no card inteiro dispara a ação (a11y como botão).
 */
export function ActionCard({
  title,
  description,
  icon: Icon,
  ctaLabel = "Acessar",
  onAction,
  disabled,
  className,
}: ActionCardProps) {
  const interactive = !!onAction && !disabled;

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onAction : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAction?.();
              }
            }
          : undefined
      }
      className={cn(
        "group flex h-full flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5",
        "transition-all duration-200",
        interactive && "card-hover cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="space-y-2">
        {Icon && (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {onAction && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-primary hover:text-primary"
          tabIndex={-1}
          disabled={disabled}
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      )}
    </div>
  );
}
