import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, Plus, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ContactInteractionsDrawer } from "@/features/contacts/ContactInteractionsDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageContainer,
  PageHeader,
  DashboardGrid,
  KpiCard,
  InfoCard,
  AlertCard,
} from "@/components/ds";
import { ErrorState } from "@/components/states/ErrorState";
import { EmptyState } from "@/components/states/EmptyState";

export const Route = createFileRoute("/_authenticated/contacts-v3")({
  head: () => ({ meta: [{ title: "Contatos v3 — BanriTools" }] }),
  component: Page,
  pendingComponent: () => <PageSkeleton kpis={3} rows={6} />,
});

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  product_interest: string | null;
  status: string | null;
  next_follow_up: string | null;
  notes: string | null;
}

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "info"> = {
  novo: "info",
  contato: "info",
  negociando: "warning",
  fechado: "success",
  perdido: "danger",
};

function Page() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [interactionsFor, setInteractionsFor] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    const { data, error: e } = await supabase
      .from("contacts").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    if (e) setError(e.message);
    setContacts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const today = useMemo(() => new Date(new Date().toDateString()), []);
  const isOverdue = (d: string | null) => !!d && new Date(d) < today;
  const isToday = (d: string | null) =>
    !!d && new Date(d).toDateString() === today.toDateString();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || (c.phone ?? "").toLowerCase().includes(q);
    });
  }, [contacts, search, statusFilter]);

  const stats = useMemo(() => {
    const overdue = contacts.filter((c) => isOverdue(c.next_follow_up)).length;
    const todayN = contacts.filter((c) => isToday(c.next_follow_up)).length;
    const closed = contacts.filter((c) => c.status === "fechado").length;
    return { total: contacts.length, overdue, todayN, closed };
  }, [contacts, today]);

  if (loading) return <PageSkeleton kpis={3} rows={6} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const statuses = ["all", "novo", "contato", "negociando", "fechado", "perdido"];

  return (
    <PageContainer>
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title="Contatos"
        description="CRM de relacionamento com clientes (v3)"
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/contacts">Versão antiga</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/contacts">
                <Plus className="h-4 w-4" /> Novo contato
              </Link>
            </Button>
          </>
        }
      />

      <DashboardGrid cols={4}>
        <KpiCard label="Total" value={stats.total} icon={Users} tone="primary" />
        <KpiCard label="Follow-ups hoje" value={stats.todayN} icon={MessageSquare} tone="accent" />
        <KpiCard label="Atrasados" value={stats.overdue} icon={AlertTriangle} tone="danger" />
        <KpiCard label="Fechados" value={stats.closed} icon={CheckCircle2} tone="success" />
      </DashboardGrid>

      {stats.overdue > 0 && (
        <AlertCard
          tone="warning"
          title={`${stats.overdue} follow-up(s) em atraso`}
          description="Priorize os contatos vencidos para não perder oportunidades."
        />
      )}

      <InfoCard
        title="Lista de contatos"
        description={`${filtered.length} de ${contacts.length}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 pl-7 text-sm"
              />
            </div>
            <div className="hidden gap-1 md:flex">
              {statuses.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "default" : "ghost"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "all" ? "Todos" : s}
                </Button>
              ))}
            </div>
          </div>
        }
        bodyless
      >
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Nenhum contato encontrado"
              description="Ajuste os filtros ou cadastre um novo contato."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((c) => {
              const overdue = isOverdue(c.next_follow_up);
              const todayFlag = isToday(c.next_follow_up);
              const statusTone = STATUS_TONE[c.status ?? ""] ?? "neutral";
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-accent/30"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                      {c.status && <Badge variant={statusTone}>{c.status}</Badge>}
                      {overdue && <Badge variant="danger">Atrasado</Badge>}
                      {todayFlag && <Badge variant="warning">Hoje</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.phone ?? "—"}
                      {c.product_interest && ` · ${c.product_interest}`}
                      {c.next_follow_up && ` · follow-up ${new Date(c.next_follow_up).toLocaleDateString("pt-BR")}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setInteractionsFor({ id: c.id, name: c.name })}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Interações
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </InfoCard>

      {interactionsFor && (
        <ContactInteractionsDrawer
          contactId={interactionsFor.id}
          contactName={interactionsFor.name}
          open={!!interactionsFor}
          onOpenChange={(o) => !o && setInteractionsFor(null)}
        />
      )}
    </PageContainer>
  );
}
