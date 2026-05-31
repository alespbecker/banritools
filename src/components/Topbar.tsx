import { Bell, Menu, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GlobalSearch } from "@/components/GlobalSearch";

interface TopbarProps {
  userName: string | null;
  userRole: string | null;
  onMenuClick?: () => void;
}

export function Topbar({ userName, userRole, onMenuClick }: TopbarProps) {
  const [syncing, setSyncing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await supabase.from("daily_reports").select("id").limit(1);
      toast.success("Dados atualizados!");
      window.dispatchEvent(new CustomEvent("banritools:sync"));
    } catch {
      toast.error("Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-transparent px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title="Abrir menu"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          title="Busca global (Ctrl/Cmd+K)"
        >
          <Search className="h-3.5 w-3.5" />
          Buscar...
          <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden rounded-md p-2 text-muted-foreground hover:bg-accent"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          title="Sincronizar"
          aria-label="Sincronizar"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        </button>
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title="Notificações (em breve)"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{userName ?? "Usuário"}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole ?? "user"}</p>
          </div>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
