import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Phone, MessageSquare, Calendar, FileText, Plus } from "lucide-react";

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
    const { error } = await supabase.from("contact_interactions").insert({
      contact_id: contactId,
      user_id: user.id,
      type,
      notes: notes || null,
      outcome: outcome || null,
      next_follow_up: nextFollowUp || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Interação registrada");
    setNotes(""); setOutcome(""); setNextFollowUp(""); setType("note");
    load();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>Interações — {contactName}</SheetTitle></SheetHeader>

        <form onSubmit={handleAdd} className="space-y-3 mt-4 pb-4 border-b border-border">
          <div>
            <Label>Tipo</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="note">Nota</option><option value="call">Ligação</option>
              <option value="message">Mensagem</option><option value="meeting">Reunião</option>
            </select>
          </div>
          <div><Label>Notas</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
          <div>
            <Label>Resultado</Label>
            <Input placeholder="Ex: Interessado, Sem retorno, Fechado..." value={outcome} onChange={(e) => setOutcome(e.target.value)} />
          </div>
          <div>
            <Label>Próximo follow-up</Label>
            <Input type="date" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)} />
          </div>
          <Button type="submit" className="w-full"><Plus className="h-4 w-4 mr-2" />Registrar</Button>
        </form>

        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma interação ainda.</p>}
          {items.map((i) => {
            const Icon = TYPE_ICON[i.type as keyof typeof TYPE_ICON] ?? FileText;
            return (
              <div key={i.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium"><Icon className="h-4 w-4 text-primary" />{TYPE_LABEL[i.type] ?? i.type}</div>
                  <span className="text-xs text-muted-foreground">{new Date(i.occurred_at).toLocaleString("pt-BR")}</span>
                </div>
                {i.notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{i.notes}</p>}
                {(i.outcome || i.next_follow_up) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {i.outcome && <span className="rounded-md bg-muted px-2 py-0.5">Resultado: {i.outcome}</span>}
                    {i.next_follow_up && <span className="rounded-md bg-muted px-2 py-0.5">Follow-up: {new Date(i.next_follow_up).toLocaleDateString("pt-BR")}</span>}
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
