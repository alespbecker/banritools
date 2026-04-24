import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Generic page-level skeleton used as `pendingComponent` for routes,
 * AND while a loaded page is fetching its initial data. Designed to
 * mirror the silhouette of the real layout so the swap is invisible.
 *
 * Apparece com fade suave; some com fade-out quando os dados carregam
 * (controlado pelo container pai via `hidden` prop).
 */
export function PageSkeleton({
  kpis = 4,
  rows = 6,
  showHeader = true,
  hidden = false,
}: {
  kpis?: number;
  rows?: number;
  showHeader?: boolean;
  hidden?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-7",
        hidden ? "fade-swap-exit pointer-events-none" : "animate-fade-in",
      )}
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando conteúdo"
    >
      {showHeader && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-44" />
        </div>
      )}

      {kpis > 0 && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: kpis }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="mt-3 h-7 w-32" />
              <Skeleton className="mt-2 h-3 w-20" />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="mb-4 h-5 w-44" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Compact table skeleton */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-fade-in overflow-hidden rounded-lg border border-border" aria-busy="true">
      <div className="border-b border-border bg-muted/40 p-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-4 w-20" />)}
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
              {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-4 w-full" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Wrapper que faz o crossfade automático entre skeleton e conteúdo.
 * Use assim:
 *   <DataGate loading={loading} skeleton={<PageSkeleton />}>
 *     <SuaPagina />
 *   </DataGate>
 */
export function DataGate({
  loading,
  skeleton,
  children,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}) {
  if (loading) return <>{skeleton}</>;
  return <div className="animate-fade-in-up">{children}</div>;
}
