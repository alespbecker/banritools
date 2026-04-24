import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic page-level skeleton used as `pendingComponent` for routes.
 * Shows a header bar + KPI grid + content placeholder so transitions
 * never flash empty.
 */
export function PageSkeleton({ kpis = 4, rows = 6 }: { kpis?: number; rows?: number }) {
  return (
    <div className="animate-fade-in-up space-y-6" aria-busy="true" aria-label="Carregando conteúdo">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {kpis > 0 && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: kpis }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="mt-3 h-7 w-32" />
              <Skeleton className="mt-2 h-3 w-20" />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="mb-4 h-5 w-40" />
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
    <div className="animate-fade-in-up overflow-hidden rounded-lg border border-border" aria-busy="true">
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
