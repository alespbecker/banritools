import { ShieldAlert } from "lucide-react";

interface UnauthorizedStateProps {
  title?: string;
  message?: string;
}

export function UnauthorizedState({
  title = "Acesso negado",
  message = "Você não tem permissão para visualizar esta área. Entre em contato com um administrador.",
}: UnauthorizedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-10 text-center">
      <ShieldAlert className="mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
