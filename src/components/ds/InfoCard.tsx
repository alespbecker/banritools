import * as React from "react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  title?: string;
  description?: string;
  /** Ações no header (ex.: filtros, link "ver tudo"). */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Remove o padding interno do corpo (útil para tabelas). */
  bodyless?: boolean;
}

/**
 * Card genérico para blocos de conteúdo (listas, tabelas, gráficos).
 */
export function InfoCard({
  title,
  description,
  actions,
  children,
  className,
  bodyless,
}: InfoCardProps) {
  return (
    <section
      className={cn(
        "animate-fade-in-up rounded-xl border border-border bg-card",
        className,
      )}
    >
      {(title || actions || description) && (
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="space-y-0.5">
            {title && (
              <h3 className="text-sm font-semibold text-card-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(!bodyless && "p-5")}>{children}</div>
    </section>
  );
}
