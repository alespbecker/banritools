import { memo } from "react";

/**
 * Odometer-style rolling digit. Animates by translating a vertical stack
 * of 0..9 so the wheel passes through intermediate digits.
 */
function Digit({ d }: { d: number }) {
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
          transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
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
function AnimatedTextInner({ text }: { text: string }) {
  return (
    <span className="inline-flex items-baseline tabular-nums">
      {Array.from(text).map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={i} d={Number(c)} />
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
}

function AnimatedNumberInner({ value, format }: AnimatedNumberProps) {
  const text = format ? format(value) : value.toLocaleString("pt-BR");
  return <AnimatedText text={text} />;
}

export const AnimatedNumber = memo(AnimatedNumberInner);
