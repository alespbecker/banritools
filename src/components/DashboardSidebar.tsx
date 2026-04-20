import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, History, Trophy, Users,
  Wrench, Settings, LogOut, ChevronLeft, ChevronRight,
  Sun, Moon, Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { label: "Admin", to: "/admin", icon: Shield, adminOnly: true },
  { label: "Usuários", to: "/admin/users", icon: Users, adminOnly: true },
  { label: "Registrar Produção", to: "/registrar-producao", icon: FileText, adminOnly: false },
  { label: "Histórico", to: "/historico", icon: History, adminOnly: false },
  { label: "Ranking", to: "/ranking", icon: Trophy, adminOnly: false },
  { label: "Contatos", to: "/contacts", icon: Users, adminOnly: false },
  { label: "Ferramentas", to: "/tools", icon: Wrench, adminOnly: false },
  { label: "Configurações", to: "/settings", icon: Settings, adminOnly: false },
] as const;

interface DashboardSidebarProps {
  onSignOut: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  onNavigate?: () => void;
  forceExpanded?: boolean;
  userRole?: "admin" | "user" | null;
}

export function DashboardSidebar({ onSignOut, theme, onToggleTheme, onNavigate, forceExpanded, userRole }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isExpanded = forceExpanded || !collapsed;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar transition-all duration-200",
        isExpanded ? "w-60" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {isExpanded && (
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            BanriTools
          </span>
        )}
        {!forceExpanded && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.filter((i) => !i.adminOnly || userRole === "admin").map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {isExpanded && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2 space-y-1">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {isExpanded && <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
          </button>
        )}
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isExpanded && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
