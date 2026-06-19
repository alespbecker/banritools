import { memo, useEffect, useRef, useState } from "react";

/**
 * Odometer-style rolling digit. Animates by translating a vertical stack
 * of 0..9 so the wheel passes through intermediate digits.
 */
function Digit({ d, duration = 700 }: { d: number; duration?: number }) {
  return (
    <span
      className="relative inline-block overflow-hidden align-baseline"
      style={{ height: "1em", width: "0.62em", lineHeight: 1 }}
      aria-hidden="true"
    >
      <span
        className="block will-change-transform"
        style={{
          transform: `translateY(-${d}em)`,
          transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block text-center" style={{ height: "1em", lineHeight: 1 }}>
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Tokenizes a string and animates only the digit characters. */
function AnimatedTextInner({ text, duration = 700 }: { text: string; duration?: number }) {
  return (
    <span className="inline-flex items-baseline tabular-nums">
      {Array.from(text).map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={i} d={Number(c)} duration={duration} />
        ) : (
          <span key={i} aria-hidden="true">
            {c}
          </span>
        ),
      )}
      <span className="sr-only">{text}</span>
    </span>
  );
}

export const AnimatedText = memo(AnimatedTextInner);

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  /** When true, ticks through intermediate integer values (great for small KPIs). */
  tween?: boolean;
  /** Max duration in ms for big jumps. */
  maxDuration?: number;
}

function AnimatedNumberInner({ value, format, tween = false, maxDuration = 1200 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(value);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    if (!tween) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }

    const diff = Math.abs(to - from);
    const duration = Math.min(maxDuration, 300 + diff * 40);
    startRef.current = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, tween, maxDuration]);

  const text = format ? format(tween ? display : value) : (tween ? Math.round(display) : value).toLocaleString("pt-BR");
  // When tweening, render as plain text to avoid wheel noise; otherwise use odometer.
  if (tween) return <span className="tabular-nums">{text}</span>;
  return <AnimatedText text={text} />;
}

export const AnimatedNumber = memo(AnimatedNumberInner);

// Convenience formatters
export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const fmtPts = (n: number) => `${Math.round(n).toLocaleString("pt-BR")} pts`;
export const fmtPct = (n: number) => `${Math.round(n)}%`;
