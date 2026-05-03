import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const toneMap: Record<
  Tone,
  { container: string; icon: string; Icon: LucideIcon }
> = {
  info: {
    container: "border-info/30 bg-info/10",
    icon: "text-info",
    Icon: Info,
  },
  success: {
    container: "border-success/30 bg-success/10",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  warning: {
    container: "border-warning/30 bg-warning/10",
    icon: "text-warning",
    Icon: AlertTriangle,
  },
  danger: {
    container: "border-destructive/30 bg-destructive/10",
    icon: "text-destructive",
    Icon: XCircle,
  },
};

interface AlertCardProps {
  tone?: Tone;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Card de status — feedback visual consistente.
 */
export function AlertCard({
  tone = "info",
  title,
  description,
  actions,
  className,
}: AlertCardProps) {
  const t = toneMap[tone];
  const Icon = t.Icon;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 transition-colors",
        t.container,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", t.icon)} aria-hidden="true" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {actions && <div className="pt-2">{actions}</div>}
      </div>
    </div>
  );
}
