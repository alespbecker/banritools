import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, History, Trophy, Users,
  Wrench, Settings, LogOut, ChevronLeft, ChevronRight,
  Sun, Moon, Shield, Sparkles, Package, Target, Megaphone,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, adminOnly: false, hint: "Sua produção pessoal e gamificação" },
  { label: "Painel da Agência", to: "/admin", icon: Shield, adminOnly: true, hint: "Visão consolidada do time + gestão de usuários" },
  { label: "Registrar Produção", to: "/registrar-producao", icon: FileText, adminOnly: false, hint: "Lançar vendas e produtos do dia" },
  { label: "Histórico", to: "/historico", icon: History, adminOnly: false, hint: "Ver e editar lançamentos passados" },
  { label: "Ranking", to: "/ranking", icon: Trophy, adminOnly: false, hint: "Classificação mensal da agência" },
  { label: "Contatos", to: "/contacts", icon: Users, adminOnly: false, hint: "Gerenciar contatos e follow-ups" },
  { label: "Campanhas", to: "/campanhas", icon: Megaphone, adminOnly: false, hint: "Campanhas comerciais da agência" },
  { label: "Metas", to: "/metas", icon: Target, adminOnly: false, hint: "Metas individuais e da agência" },
  { label: "Ferramentas", to: "/tools", icon: Wrench, adminOnly: false, hint: "Acessar ferramentas auxiliares" },
  { label: "Produtos", to: "/admin/produtos", icon: Package, adminOnly: true, hint: "Catálogo de métricas (admin)" },
  { label: "Configurações", to: "/settings", icon: Settings, adminOnly: false, hint: "Editar perfil e preferências" },
] as const;

const betaItems = [
  { label: "Dashboard (Novo)", to: "/dashboard-v2", icon: Sparkles, hint: "Dashboard do novo modelo" },
  { label: "Registrar (Novo)", to: "/registrar-producao-v2", icon: Sparkles, hint: "Registrar via catálogo de produtos" },
  { label: "Ranking (Novo)", to: "/ranking-v2", icon: Sparkles, hint: "Ranking do novo modelo" },
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
            title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 p-2">
        {navItems.filter((i) => !i.adminOnly || userRole === "admin").map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={item.hint}
              aria-label={`${item.label} — ${item.hint}`}
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

        {isExpanded && (
          <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-wide text-muted-foreground">Novo (beta)</div>
        )}
        {!isExpanded && <div className="my-2 border-t border-border" />}
        {betaItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={item.hint}
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
            title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {isExpanded && <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
          </button>
        )}
        <button
          onClick={onSignOut}
          title="Encerrar a sessão e voltar ao login"
          aria-label="Sair da conta"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isExpanded && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
