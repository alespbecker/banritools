import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Trophy,
  Wrench, LogOut,
  Sun, Moon, Shield, Package, Target, Megaphone, Palette, Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/features/auth/types";
import { Logo } from "@/components/Logo";

// Navegação principal — experiência atual do produto.
// `adminOnly`: visível para admin OU gerente (gestão da agência)
// `ownerOnly`: visível somente para admin (seções técnicas / internas)
const navItems = [
  { label: "Início", to: "/dashboard-v3", icon: LayoutDashboard, adminOnly: false, ownerOnly: false },
  { label: "Painel da Agência", to: "/admin", icon: Shield, adminOnly: true, ownerOnly: false },
  { label: "Registrar Produção", to: "/registrar-producao-v3", icon: FileText, adminOnly: false, ownerOnly: false },
  { label: "Ranking", to: "/ranking-v3", icon: Trophy, adminOnly: false, ownerOnly: false },
  { label: "Campanhas", to: "/campanhas", icon: Megaphone, adminOnly: false, ownerOnly: false },
  { label: "Metas", to: "/metas", icon: Target, adminOnly: false, ownerOnly: false },
  { label: "Ferramentas", to: "/tools", icon: Wrench, adminOnly: false, ownerOnly: false },
  { label: "Produtos", to: "/admin/produtos", icon: Package, adminOnly: true, ownerOnly: false },
  { label: "Usuários", to: "/admin/convites", icon: Users, adminOnly: true, ownerOnly: false },
  { label: "Design System", to: "/design-system", icon: Palette, adminOnly: true, ownerOnly: true },
] as const;

interface DashboardSidebarProps {
  onSignOut: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  onNavigate?: () => void;
  forceExpanded?: boolean;
  userRole?: AppRole | null;
}

export function DashboardSidebar({ onSignOut, theme, onToggleTheme, onNavigate, forceExpanded, userRole }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const { user: _user } = useAuth();

  const isExpanded = forceExpanded || !collapsed;
  const isAdminLike = userRole === "admin" || userRole === "gerente";

  const isRouteActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    const hasSubroutes = navItems.some(
      (i) => i.to !== to && i.to.startsWith(to + "/")
    );
    if (hasSubroutes) return location.pathname === to;
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  return (
    <aside
      onMouseEnter={() => !forceExpanded && setCollapsed(false)}
      onMouseLeave={() => !forceExpanded && setCollapsed(true)}
      aria-label="Navegação principal"
      aria-expanded={isExpanded}
      className={cn(
        "flex h-full flex-col border border-border/60 bg-sidebar/70 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/20 overflow-hidden transition-[width] duration-200 ease-out",
        isExpanded ? "w-60" : "w-16"
      )}
    >
      <div className="flex h-14 items-center gap-1 border-b border-border/60 pl-[14px] pr-4">
        {/* Logotipo BanriTools — centralizado com a coluna dos ícones do menu (nav p-2=8px + link pl-4=16px + metade ícone 8px = 32px; logo 36px com pl-[14px] → centro 14+18=32px) */}
        <Logo size={36} ariaLabel="BanriTools" className="rounded-md" />
        {isExpanded && (
          <span
            className="whitespace-nowrap text-base font-[450] tracking-[0.048em] text-sidebar-foreground"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            banritools
          </span>
        )}
      </div>

      <nav aria-label="Menu" className="flex-1 overflow-y-auto space-y-1 p-2">
        {navItems
          .filter((i) => {
            if (i.ownerOnly) return userRole === "admin";
            if (i.adminOnly) return isAdminLike;
            return true;
          })
          .map((item) => {
          const isActive = isRouteActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md h-9 pl-4 pr-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-2 space-y-1">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            className="flex w-full items-center gap-3 rounded-md h-9 pl-4 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
              : <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />}
            {isExpanded && (
              <span className="whitespace-nowrap">
                {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
              </span>
            )}
          </button>
        )}
        <button
          onClick={onSignOut}
          aria-label="Sair da conta"
          className="flex w-full items-center gap-3 rounded-md h-9 pl-4 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          {isExpanded && <span className="whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
