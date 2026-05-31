import { Link, useLocation } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterFAB() {
  const location = useLocation();
  // Não mostra na própria tela de registrar
  if (location.pathname.startsWith("/registrar-producao")) return null;

  return (
    <Link
      to="/registrar-producao-v3"
      aria-label="Ir para a tela de registrar produção"
      title="Registrar nova produção do dia"
      className={cn(
        "fab-radar fixed bottom-6 right-6 z-40 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-95",
        // Mobile: 56x56 só ícone
        "h-14 w-14",
        // Desktop: pill com texto
        "sm:h-12 sm:w-auto sm:gap-2 sm:px-5"
      )}
    >
      <Plus className="h-6 w-6 sm:h-5 sm:w-5" />
      <span className="hidden text-sm font-semibold sm:inline">Registrar Produção</span>
    </Link>
  );
}
