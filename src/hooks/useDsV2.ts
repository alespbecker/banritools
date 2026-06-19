import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ds:v2";

function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function apply(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("ds-v2", enabled);
}

/**
 * Feature flag para o novo Design System (paleta oficial do PDF).
 * Persiste em localStorage e aplica a classe `.ds-v2` no <html>.
 */
export function useDsV2() {
  const [enabled, setEnabled] = useState<boolean>(readInitial);

  useEffect(() => {
    apply(enabled);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    }
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { enabled, setEnabled, toggle };
}

/** Aplica a flag no boot (antes da árvore React montar valores), evita flash. */
export function bootDsV2() {
  if (typeof window === "undefined") return;
  apply(window.localStorage.getItem(STORAGE_KEY) === "1");
}
