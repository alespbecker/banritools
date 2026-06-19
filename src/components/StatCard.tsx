import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber, AnimatedText } from "@/components/AnimatedNumber";

type Tone = "primary" | "teal" | "violet" | "warning" | "success" | "destructive" | "muted";

const toneStyles: Record<Tone, { bg: string; text: string }> = {
  primary:     { bg: "bg-primary/10",      text: "text-primary" },
  teal:        { bg: "bg-[var(--brand-teal)]/12",   text: "text-[var(--brand-teal)]" },
  violet:      { bg: "bg-[var(--brand-violet)]/12", text: "text-[var(--brand-violet)]" },
  warning:     { bg: "bg-warning/15",      text: "text-warning" },
  success:     { bg: "bg-success/12",      text: "text-success" },
  destructive: { bg: "bg-destructive/10",  text: "text-destructive" },
  muted:       { bg: "bg-muted",           text: "text-muted-foreground" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  tone?: Tone;
  loading?: boolean;
  /** title attribute / aria-label, explica para que serve o card */
  hint?: string;
}

export function StatCard({
  title, value, icon: Icon, description, className, tone = "primary", loading, hint,
}: StatCardProps) {
  const t = toneStyles[tone];

  if (loading) {
    return (
      <div
        className={cn("rounded-xl border border-border bg-card p-5", className)}
        aria-busy="true"
        aria-label={`Carregando ${title}`}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="mt-3 h-7 w-32" />
        {description && <Skeleton className="mt-2 h-3 w-20" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "card-hover animate-fade-in-up rounded-xl border border-border bg-card p-5",
        className,
      )}
      title={hint ?? title}
      aria-label={hint ?? title}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", t.bg)}>
          <Icon className={cn("h-4.5 w-4.5", t.text)} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-card-foreground">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : <AnimatedText text={String(value)} />}
      </p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
