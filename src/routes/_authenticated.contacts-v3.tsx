import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Search, Plus, MessageSquare, AlertTriangle,
  CheckCircle2, Phone, Calendar,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/contacts-v3")({
  head: () => ({ meta: [{ title: "Contatos — BanriTools" }] }),
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

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  contato: "Em acompanhamento",
  negociando: "Negociando",
  fechado: "Concluído",
  perdido: "Perdido",
};

type FilterKey = "all" | "today" | "overdue" | "novo" | "contato" | "negociando" | "fechado";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function Page() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
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

  const counts = useMemo(() => {
    const c = {
      all: contacts.length,
      today: 0, overdue: 0,
      novo: 0, contato: 0, negociando: 0, fechado: 0,
    };
    contacts.forEach((x) => {
      if (isToday(x.next_follow_up)) c.today++;
      if (isOverdue(x.next_follow_up)) c.overdue++;
      if (x.status === "novo") c.novo++;
      if (x.status === "contato") c.contato++;
      if (x.status === "negociando") c.negociando++;
      if (x.status === "fechado") c.fechado++;
    });
    return c;
  }, [contacts, today]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contacts.filter((c) => {
      if (filter === "today" && !isToday(c.next_follow_up)) return false;
      if (filter === "overdue" && !isOverdue(c.next_follow_up)) return false;
      if (
        (filter === "novo" || filter === "contato" || filter === "negociando" || filter === "fechado") &&
        c.status !== filter
      ) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || (c.phone ?? "").toLowerCase().includes(q);
    });
  }, [contacts, search, filter, today]);

  if (loading) return <PageSkeleton kpis={3} rows={6} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const filters: { key: FilterKey; label: string; count: number; tone?: "danger" | "warning" }[] = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "today", label: "Hoje", count: counts.today, tone: "warning" },
    { key: "overdue", label: "A retomar", count: counts.overdue, tone: "danger" },
    { key: "novo", label: "Novos", count: counts.novo },
    { key: "contato", label: "Em acompanhamento", count: counts.contato },
    { key: "negociando", label: "Negociando", count: counts.negociando },
    { key: "fechado", label: "Concluídos", count: counts.fechado },
  ];

  return (
    <PageContainer>
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title="Contatos"
        description="Sua fila de trabalho comercial"
        actions={
          <Button asChild size="sm">
            <Link to="/contacts">
              <Plus className="h-4 w-4" /> Novo contato
            </Link>
          </Button>
        }
      />

      <DashboardGrid cols={4}>
        <KpiCard label="Total" value={counts.all} icon={Users} tone="primary" />
        <KpiCard label="Hoje" value={counts.today} icon={MessageSquare} tone="accent" />
        <KpiCard label="A retomar" value={counts.overdue} icon={AlertTriangle} tone="danger" />
        <KpiCard label="Concluídos" value={counts.fechado} icon={CheckCircle2} tone="success" />
      </DashboardGrid>

      {counts.overdue > 0 && (
        <AlertCard
          tone="warning"
          title={`${counts.overdue} contato${counts.overdue === 1 ? "" : "s"} para retomar`}
          description="Priorize esses contatos para não perder oportunidades."
          actions={
            <Button size="sm" variant="outline" onClick={() => setFilter("overdue")}>
              Ver atrasados
            </Button>
          }
        />
      )}

      <InfoCard
        title="Lista de contatos"
        description={`${filtered.length} de ${counts.all}`}
        actions={
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar nome ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 pl-7 text-sm"
            />
          </div>
        }
        bodyless
      >
        {/* Filtros como chips com contagem */}
        <div className="flex flex-wrap gap-1.5 border-b border-border px-5 py-3">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] tabular-nums",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : f.tone === "danger" && f.count > 0
                        ? "bg-destructive/15 text-destructive"
                        : f.tone === "warning" && f.count > 0
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground",
                  )}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

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
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 transition-colors",
                    overdue ? "bg-destructive/[0.03] hover:bg-destructive/10" : "hover:bg-accent/30",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(c.name) || "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                      {c.status && (
                        <Badge variant={statusTone}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
                      )}
                      {overdue && <Badge variant="danger">A retomar</Badge>}
                      {todayFlag && !overdue && <Badge variant="warning">Hoje</Badge>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {c.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {c.phone}
                        </span>
                      )}
                      {c.product_interest && <span>{c.product_interest}</span>}
                      {c.next_follow_up && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.next_follow_up).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
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
