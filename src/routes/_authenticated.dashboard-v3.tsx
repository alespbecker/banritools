import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/PageSkeleton";
import {
  Sparkles, TrendingUp, Trophy, Package, DollarSign, ArrowRight,
} from "lucide-react";
import { ErrorState } from "@/components/states/ErrorState";
import {
  PageContainer,
  PageHeader,
  DashboardGrid,
  KpiCard,
  InfoCard,
  AlertCard,
  ProgressWithLabel,
} from "@/components/ds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard-v3")({
  head: () => ({ meta: [{ title: "Dashboard v3 — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={4} rows={4} />,
});

interface Row {
  product_id: string;
  quantity: number;
  amount: number | null;
  entry_date: string;
  products: { name: string; category: string | null; points_per_unit: number } | null;
}

function Page() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) return;
    setLoading(true); setError(null);
    const start = new Date(); start.setDate(1);
    const startStr = start.toISOString().split("T")[0];
    supabase
      .from("production_entries")
      .select("product_id, quantity, amount, entry_date, products(name, category, points_per_unit)")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .gte("entry_date", startStr)
      .order("entry_date", { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        setRows((data ?? []) as never);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <PageSkeleton kpis={4} rows={4} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const totalEntries = rows.length;
  const totalQty = rows.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const totalAmt = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalPts = rows.reduce((s, r) => {
    const ppu = r.products?.points_per_unit ?? 0;
    return s + (Number(r.quantity || 0) + Number(r.amount || 0)) * ppu;
  }, 0);

  const byCat = new Map<string, number>();
  rows.forEach((r) => {
    const cat = r.products?.category ?? "Outros";
    byCat.set(cat, (byCat.get(cat) ?? 0) + Number(r.quantity || 0) + Number(r.amount || 0));
  });
  const catTotal = Array.from(byCat.values()).reduce((a, b) => a + b, 0);

  return (
    <PageContainer>
      <PageHeader
        icon={<Sparkles className="h-5 w-5" />}
        title="Dashboard"
        description="Sua produção do mês corrente — visão consolidada (v3)"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">Versão antiga</Link>
          </Button>
        }
      />

      {totalEntries === 0 && (
        <AlertCard
          tone="info"
          title="Nenhum lançamento neste mês"
          description="Comece registrando sua produção para acompanhar metas e ranking."
          actions={
            <Button asChild size="sm">
              <Link to="/registrar-producao-v3">
                Registrar produção <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
      )}

      <DashboardGrid cols={4}>
        <KpiCard
          label="Lançamentos"
          value={totalEntries}
          icon={Package}
          tone="primary"
          description="no mês"
        />
        <KpiCard
          label="Quantidade total"
          value={totalQty.toLocaleString("pt-BR")}
          icon={TrendingUp}
          tone="accent"
        />
        <KpiCard
          label="Valor (R$)"
          value={totalAmt.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          icon={DollarSign}
          tone="success"
        />
        <KpiCard
          label="Pontos estimados"
          value={totalPts.toFixed(0)}
          icon={Trophy}
          tone="warning"
        />
      </DashboardGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard
          title="Por categoria"
          description="Distribuição da produção do mês"
        >
          {byCat.size === 0 ? (
            <p className="text-sm text-muted-foreground">Sem lançamentos no mês.</p>
          ) : (
            <div className="space-y-3">
              {Array.from(byCat.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([cat, val]) => (
                  <ProgressWithLabel
                    key={cat}
                    label={cat}
                    value={catTotal > 0 ? (val / catTotal) * 100 : 0}
                    valueLabel={val.toLocaleString("pt-BR")}
                    tone="primary"
                  />
                ))}
            </div>
          )}
        </InfoCard>

        <InfoCard
          title="Últimos lançamentos"
          description="10 mais recentes"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/registrar-producao-v3">Novo</Link>
            </Button>
          }
          bodyless
        >
          {rows.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">Nenhum lançamento.</div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.slice(0, 10).map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.products?.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.entry_date).toLocaleDateString("pt-BR")}
                      {r.products?.category && ` · ${r.products.category}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    {r.quantity ? (
                      <Badge variant="neutral">{r.quantity} un</Badge>
                    ) : null}
                    {r.amount ? (
                      <Badge variant="success">
                        R$ {Number(r.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </Badge>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </InfoCard>
      </div>
    </PageContainer>
  );
}
