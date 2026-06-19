import { Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import defaultAvatar from "@/assets/default-avatar.png";

interface TopbarProps {
  userName: string | null;
  userRole: string | null;
  onMenuClick?: () => void;
}

export function Topbar({ userName, userRole, onMenuClick }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { profile } = useAuth();

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

  const avatarSrc = profile?.avatar_url || defaultAvatar;

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between gap-3 bg-background/60 px-4 backdrop-blur-md sm:px-6">
      {/* MOBILE: logo centralizado absoluto */}
      <Link
        to="/dashboard-v3"
        aria-label="BanriTools — Início"
        className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden"
      >
        <Logo size={28} />
      </Link>

      {/* LEFT: menu + search (aligned with content) */}
      <div className="flex flex-1 items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            title="Abrir menu"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden h-9 w-full max-w-[28rem] items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/40 hover:text-foreground sm:flex"
          title="Busca global (Ctrl/Cmd+K)"
          aria-label="Abrir busca global"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Buscar...</span>
          <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground sm:hidden"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* RIGHT: profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/perfil"
          className="flex items-center gap-3 rounded-full p-1 pr-2 transition-colors hover:bg-accent/60 sm:pr-3"
          aria-label="Abrir meu perfil"
          title="Meu Perfil"
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground">
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-tight text-foreground">{userName ?? "Usuário"}</p>
            <p className="text-xs leading-tight text-muted-foreground capitalize">{userRole ?? "user"}</p>
          </div>
        </Link>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
