import confetti from "canvas-confetti";

/**
 * Fires a celebratory confetti burst from the center of the given element.
 * Respects prefers-reduced-motion.
 */
export function fireConfettiFromElement(el: HTMLElement | null) {
  if (!el) return;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const rect = el.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  // Brand-ish colors. Pulled from primary/success/accent palette.
  const colors = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ec4899"];

  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 45,
    origin: { x, y },
    colors,
    scalar: 0.9,
    ticks: 180,
    zIndex: 9999,
  });
  // Secondary lighter burst for depth
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 100,
      startVelocity: 30,
      origin: { x, y },
      colors,
      scalar: 0.7,
      ticks: 140,
      zIndex: 9999,
    });
  }, 120);
}

export function useConfetti() {
  return { fireConfettiFromElement };
}
