import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Phone, MessageSquare, Calendar, FileText, Plus, Inbox } from "lucide-react";
import { EmptyState } from "@/components/states/EmptyState";

interface Interaction {
  id: string;
  type: string;
  notes: string | null;
  occurred_at: string;
  outcome: string | null;
  next_follow_up: string | null;
}

const TYPE_ICON = { call: Phone, message: MessageSquare, meeting: Calendar, note: FileText } as const;
const TYPE_LABEL: Record<string, string> = { call: "Ligação", message: "Mensagem", meeting: "Reunião", note: "Nota" };

export function ContactInteractionsDrawer({
  contactId, contactName, open, onOpenChange,
}: {
  contactId: string | null;
  contactName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState("note");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  const load = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    const { data } = await supabase
      .from("contact_interactions")
      .select("id, type, notes, occurred_at, outcome, next_follow_up")
      .eq("contact_id", contactId)
      .order("occurred_at", { ascending: false });
    setItems((data ?? []) as Interaction[]);
    setLoading(false);
  }, [contactId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contactId) return;
    setSubmitting(true);
    const { error } = await supabase.from("contact_interactions").insert({
      contact_id: contactId,
      user_id: user.id,
      type,
      notes: notes || null,
      outcome: outcome || null,
      next_follow_up: nextFollowUp || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Interação registrada");
    setNotes(""); setOutcome(""); setNextFollowUp(""); setType("note");
    load();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        <div className="border-b border-border px-6 py-4">
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle className="text-base">Interações</SheetTitle>
            <SheetDescription className="text-xs">{contactName}</SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={handleAdd} className="space-y-4 border-b border-border px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="int-type" className="text-xs font-medium text-muted-foreground">Tipo</Label>
            <select
              id="int-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="note">Nota</option>
              <option value="call">Ligação</option>
              <option value="message">Mensagem</option>
              <option value="meeting">Reunião</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="int-notes" className="text-xs font-medium text-muted-foreground">Notas</Label>
            <Textarea id="int-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="O que aconteceu nesta interação?" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="int-out" className="text-xs font-medium text-muted-foreground">Resultado</Label>
            <Input id="int-out" placeholder="Ex.: Interessado, Sem retorno, Fechado..." value={outcome} onChange={(e) => setOutcome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="int-next" className="text-xs font-medium text-muted-foreground">Próximo follow-up</Label>
            <Input id="int-next" type="date" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            <Plus className="h-4 w-4" />
            {submitting ? "Registrando..." : "Registrar interação"}
          </Button>
        </form>

        <div className="px-6 py-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Histórico {items.length > 0 && <span className="text-muted-foreground/70">· {items.length}</span>}
          </h4>
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && items.length === 0 && (
            <EmptyState
              icon={<Inbox className="h-7 w-7" />}
              title="Sem interações ainda"
              description="Registre acima a primeira interação com este contato."
            />
          )}
          {items.map((i) => {
            const Icon = TYPE_ICON[i.type as keyof typeof TYPE_ICON] ?? FileText;
            return (
              <div key={i.id} className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {TYPE_LABEL[i.type] ?? i.type}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {new Date(i.occurred_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {i.notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{i.notes}</p>}
                {(i.outcome || i.next_follow_up) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {i.outcome && <Badge variant="neutral">{i.outcome}</Badge>}
                    {i.next_follow_up && (
                      <Badge variant="info">
                        Follow-up {new Date(i.next_follow_up).toLocaleDateString("pt-BR")}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
