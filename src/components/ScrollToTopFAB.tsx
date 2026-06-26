import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/**
 * Botão flutuante "voltar ao topo" — apenas mobile.
 * Aparece quando o scroll passa de metade da altura da viewport.
 * Posicionado acima do FAB de registrar produção.
 */
export function ScrollToTopFAB() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Espaço maior quando o FAB Plus está visível (todas as rotas exceto /registrar-producao*)
  const hasPlusFab = !location.pathname.startsWith("/registrar-producao");

  useEffect(() => {
    if (!isMobile) return;
    // O scroll real acontece dentro do <main> em _authenticated.tsx
    const scroller =
      (document.querySelector("[data-app-scroll]") as HTMLElement | null) ?? null;
    const target: HTMLElement | Window = scroller ?? window;

    const check = () => {
      const scrollTop = scroller ? scroller.scrollTop : window.scrollY;
      const viewportH = scroller ? scroller.clientHeight : window.innerHeight;
      setVisible(scrollTop > viewportH / 2);
    };

    check();
    target.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      target.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [location.pathname, isMobile]);

  if (!isMobile) return null;

  const handleClick = () => {
    const scroller = document.querySelector("[data-app-scroll]") as HTMLElement | null;
    if (scroller) scroller.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className={cn(
        "fixed right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-lg backdrop-blur transition-all hover:bg-accent active:scale-95 sm:hidden",
        hasPlusFab ? "bottom-24" : "bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
