import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Número de colunas no breakpoint lg. Default 4. */
  cols?: 2 | 3 | 4;
}

const colsMap: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Grid responsivo padrão de dashboards v3.
 * Mobile-first, escala 8pt para gap.
 */
export function DashboardGrid({
  className,
  cols = 4,
  children,
  ...props
}: DashboardGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4", colsMap[cols], className)}
      {...props}
    >
      {children}
    </div>
  );
}
