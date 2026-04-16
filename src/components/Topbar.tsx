import { Bell, Menu, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TopbarProps {
  userName: string | null;
  userRole: string | null;
  onMenuClick?: () => void;
}

export function Topbar({ userName, userRole, onMenuClick }: TopbarProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Force re-fetch by triggering a simple query — components listening to realtime will update
      await supabase.from("daily_reports").select("id").limit(1);
      toast.success("Dados atualizados!");
      // Dispatch custom event so pages can re-fetch
      window.dispatchEvent(new CustomEvent("banritools:sync"));
    } catch {
      toast.error("Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          title="Sincronizar dados"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        </button>
        <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
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
    </header>
  );
}
