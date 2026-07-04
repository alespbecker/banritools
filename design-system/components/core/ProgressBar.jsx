import React from "react";

/**
 * ProgressBar — accessible track + fill. Fill defaults to the solid
 * brand blue (not a thin light-green line). value/max are 0..100 by default.
 */
export function ProgressBar({
  value = 0,
  max = 100,
  variant = "default",
  className = "",
  label,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const cls = [
    "bt-progress",
    variant !== "default" ? `bt-progress--${variant}` : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <div
      className={cls}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      {...rest}
    >
      <div className="bt-progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
