import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, History, Trophy, Users,
  Wrench, Settings, LogOut,
  Sun, Moon, Shield, Package, Target, Megaphone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/features/auth/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Navegação principal — experiência atual do produto.
const navItems = [
  { label: "Início", to: "/dashboard-v3", icon: LayoutDashboard, adminOnly: false, hint: "Sua central executiva" },
  { label: "Painel da Agência", to: "/admin", icon: Shield, adminOnly: true, hint: "Visão consolidada do time + gestão de usuários" },
  { label: "Registrar Produção", to: "/registrar-producao-v3", icon: FileText, adminOnly: false, hint: "Lançar vendas e produtos do dia" },
  { label: "Histórico", to: "/historico", icon: History, adminOnly: false, hint: "Ver e editar lançamentos passados" },
  { label: "Ranking", to: "/ranking-v3", icon: Trophy, adminOnly: false, hint: "Classificação mensal da agência" },
  { label: "Contatos", to: "/contacts-v3", icon: Users, adminOnly: false, hint: "Gerenciar contatos e follow-ups" },
  { label: "Campanhas", to: "/campanhas", icon: Megaphone, adminOnly: false, hint: "Campanhas comerciais da agência" },
  { label: "Metas", to: "/metas", icon: Target, adminOnly: false, hint: "Metas individuais e da agência" },
  { label: "Ferramentas", to: "/tools", icon: Wrench, adminOnly: false, hint: "Acessar ferramentas auxiliares" },
  { label: "Produtos", to: "/admin/produtos", icon: Package, adminOnly: true, hint: "Catálogo de métricas (admin)" },
  { label: "Configurações", to: "/settings", icon: Settings, adminOnly: false, hint: "Editar perfil e preferências" },
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

  // Tooltip helper: só ativa quando o menu está recolhido (no expanded a label já aparece).
  const MaybeTooltip = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => {
    if (isExpanded) return <>{children}</>;
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="bg-popover text-popover-foreground border border-border">
          <div className="flex flex-col">
            <span className="text-xs font-medium">{label}</span>
            {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
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
        <div className="flex h-14 items-center gap-3 border-b border-border/60 px-4">
          {/* Placeholder do logotipo do banco */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/30 text-[10px] font-medium text-muted-foreground"
            aria-label="Logotipo (placeholder)"
            title="Logotipo (placeholder)"
          >
            logo
          </div>
          {isExpanded && (
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-sidebar-foreground">
              Banritools
            </span>
          )}
        </div>

        <nav aria-label="Menu" className="flex-1 overflow-y-auto space-y-1 p-2">
          {navItems.filter((i) => !i.adminOnly || isAdminLike).map((item) => {
            const isActive = isRouteActive(item.to);
            return (
              <MaybeTooltip key={item.to} label={item.label} hint={item.hint}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  aria-label={`${item.label} — ${item.hint}`}
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
              </MaybeTooltip>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-2 space-y-1">
          {onToggleTheme && (
            <MaybeTooltip
              label={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
              hint={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
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
            </MaybeTooltip>
          )}
          <MaybeTooltip label="Sair" hint="Encerrar a sessão e voltar ao login">
            <button
              onClick={onSignOut}
              aria-label="Sair da conta"
              className="flex w-full items-center gap-3 rounded-md h-9 pl-4 pr-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              {isExpanded && <span className="whitespace-nowrap">Sair</span>}
            </button>
          </MaybeTooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
