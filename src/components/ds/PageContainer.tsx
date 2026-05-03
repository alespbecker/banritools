import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "full";
}

const sizeMap = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  full: "max-w-none",
} as const;

/**
 * Container principal de páginas v3.
 * - max-width controlado
 * - padding consistente (escala 8pt)
 * - animação suave de entrada
 */
export function PageContainer({
  className,
  size = "lg",
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full animate-fade-in space-y-6",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
