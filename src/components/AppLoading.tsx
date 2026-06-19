import { useEffect, useState } from "react";

const MESSAGES = [
  "Preparando seu painel…",
  "Carregando suas metas…",
  "Sincronizando com a agência…",
  "Quase lá…",
];

interface AppLoadingProps {
  /** Texto inicial. Se não passado, usa rotação padrão. */
  label?: string;
  /** Mostrar mensagens rotativas (default true). */
  rotateMessages?: boolean;
}

/**
 * Tela de carregamento institucional do BanriTools.
 * Logo pulsante, barra indeterminada e mensagens rotativas para
 * comunicar progresso quando a sessão demora a hidratar.
 */
export function AppLoading({ label, rotateMessages = true }: AppLoadingProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!rotateMessages || label) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, [rotateMessages, label]);

  const message = label ?? MESSAGES[idx];

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6"
    >
      {/* Logo pulsante */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/30 blur-2xl animate-pulse-soft" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 animate-bounce-soft">
          <Logo size={40} ariaLabel="BanriTools" />
        </div>
      </div>

      {/* Barra de progresso indeterminada */}
      <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-loading-slide" />
      </div>

      {/* Texto */}
      <p
        key={message}
        className="mt-5 text-sm font-medium text-foreground/80 animate-fade-in"
      >
        {message}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">BanriTools</p>
    </div>
  );
}
