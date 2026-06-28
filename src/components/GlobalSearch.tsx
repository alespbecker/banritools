import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FileText,
  Trophy,
  Wrench,
  Megaphone,
  Target,
  Package,
  Users,
  Shield,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const baseItems = [
  { label: "Início", to: "/dashboard-v3", icon: LayoutDashboard },
  { label: "Registrar Produção", to: "/registrar-producao-v3", icon: FileText },
  { label: "Ranking", to: "/ranking-v3", icon: Trophy },
  { label: "Campanhas", to: "/campanhas", icon: Megaphone },
  { label: "Metas", to: "/metas", icon: Target },
  { label: "Ferramentas", to: "/tools", icon: Wrench },
  { label: "Meu Perfil", to: "/perfil", icon: User },
];

const adminItems = [
  { label: "Painel da Agência", to: "/admin", icon: Shield },
  { label: "Produtos", to: "/admin/produtos", icon: Package },
  { label: "Usuários", to: "/admin/convites", icon: Users },
];

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isAdminLike = userRole === "admin" || userRole === "gerente";

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar páginas..." />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {baseItems.map((item) => (
            <CommandItem key={item.to} onSelect={() => go(item.to)}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        {isAdminLike && (
          <CommandGroup heading="Administração">
            {adminItems.map((item) => (
              <CommandItem key={item.to} onSelect={() => go(item.to)}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
