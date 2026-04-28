import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

/**
 * PageSkeleton — silhueta genérica usada como `pendingComponent` das rotas
 * e dentro do `DataGate` enquanto a página carrega seus dados iniciais.
 *
 * O fade-in/out é coordenado pelo DataGate: aqui o componente apenas existe.
 */
export function PageSkeleton({
  kpis = 4,
  rows = 6,
  showHeader = true,
}: {
  kpis?: number;
  rows?: number;
  showHeader?: boolean;
}) {
  return (
    <div
      className="space-y-7"
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
    <div className="overflow-hidden rounded-lg border border-border" aria-busy="true">
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
 * DataGate — orquestra a transição skeleton → conteúdo SEM flash.
 *
 * Garantias:
 * 1. Skeleton fica visível por pelo menos `minShowMs` (default 280ms).
 *    Evita "blink" quando os dados retornam quase instantaneamente.
 * 2. O conteúdo só é montado APÓS o skeleton iniciar o fade-out.
 *    Assim, sub-componentes que disparam fetches extras já mostram seus
 *    próprios estados consistentes desde o primeiro frame visível.
 * 3. Crossfade real: skeleton fade-out (220ms) e conteúdo fade-in (380ms)
 *    com leve overlap, usando o easing da marca.
 *
 * Uso:
 *   <DataGate loading={loading} skeleton={<PageSkeleton />}>
 *     <SuaPagina />
 *   </DataGate>
 */
export function DataGate({
  loading,
  skeleton,
  children,
  minShowMs = 280,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  minShowMs?: number;
}) {
  // 'skeleton' | 'fading' | 'content'
  const [phase, setPhase] = useState<"skeleton" | "fading" | "content">(
    loading ? "skeleton" : "content",
  );
  const mountedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (loading) {
      mountedAt.current = Date.now();
      setPhase("skeleton");
      return;
    }

    // Já deu loaded — respeitar tempo mínimo de exibição do skeleton
    const elapsed = Date.now() - mountedAt.current;
    const remaining = Math.max(0, minShowMs - elapsed);

    const t1 = window.setTimeout(() => {
      setPhase("fading");
      // Após o fade-out começar, monta o conteúdo (que entra com seu próprio fade-in)
      const t2 = window.setTimeout(() => setPhase("content"), 180);
      // cleanup interno
      return () => window.clearTimeout(t2);
    }, remaining);

    return () => window.clearTimeout(t1);
  }, [loading, minShowMs]);

  if (phase === "skeleton") {
    return <div className="animate-fade-in">{skeleton}</div>;
  }

  if (phase === "fading") {
    return <div className="fade-swap-exit pointer-events-none">{skeleton}</div>;
  }

  return <div className="animate-fade-in">{children}</div>;
}
