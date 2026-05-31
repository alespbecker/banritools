import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Package, FileText } from "lucide-react";

interface Result {
  id: string;
  label: string;
  hint?: string;
  to: string;
  group: "Campanhas" | "Produtos" | "Produção";
}

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const like = `%${term}%`;
    const [contacts, campaigns, products, entries] = await Promise.all([
      supabase.from("contacts").select("id, name, phone").ilike("name", like).limit(5),
      supabase.from("campaigns").select("id, name, status").ilike("name", like).limit(5),
      supabase.from("products").select("id, name, category").ilike("name", like).limit(5),
      supabase.from("production_entries").select("id, entry_date, notes, product_id, products(name)").ilike("notes", like).limit(5),
    ]);
    const out: Result[] = [];
    (contacts.data ?? []).forEach((c) => out.push({ id: c.id, label: c.name, hint: c.phone ?? "", to: "/contacts-v3", group: "Contatos" }));
    (campaigns.data ?? []).forEach((c) => out.push({ id: c.id, label: c.name, hint: c.status, to: "/campanhas", group: "Campanhas" }));
    (products.data ?? []).forEach((p) => out.push({ id: p.id, label: p.name, hint: p.category ?? "", to: "/admin/produtos", group: "Produtos" }));
    (entries.data ?? []).forEach((e) => {
      const prod = (e as unknown as { products?: { name?: string } }).products;
      out.push({ id: e.id, label: prod?.name ?? "Lançamento", hint: e.entry_date, to: "/dashboard-v3", group: "Produção" });
    });
    setResults(out);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(q), 200);
    return () => clearTimeout(t);
  }, [q, search]);

  const go = (to: string) => { onOpenChange(false); navigate({ to }); };

  const groups: Result["group"][] = ["Contatos", "Campanhas", "Produtos", "Produção"];
  const iconFor = (g: Result["group"]) => {
    if (g === "Contatos") return <Users className="h-4 w-4" />;
    if (g === "Campanhas") return <Megaphone className="h-4 w-4" />;
    if (g === "Produtos") return <Package className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar contatos, campanhas, produtos..." value={q} onValueChange={setQ} />
      <CommandList>
        {loading && <div className="p-3 text-xs text-muted-foreground">Buscando...</div>}
        {!loading && q.length >= 2 && results.length === 0 && <CommandEmpty>Nada encontrado.</CommandEmpty>}
        {groups.map((g) => {
          const items = results.filter((r) => r.group === g);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={g} heading={g}>
              {items.map((r) => (
                <CommandItem key={`${g}-${r.id}`} onSelect={() => go(r.to)} value={`${g}-${r.label}-${r.id}`}>
                  {iconFor(g)}
                  <span className="ml-2">{r.label}</span>
                  {r.hint && <span className="ml-auto text-xs text-muted-foreground">{r.hint}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
