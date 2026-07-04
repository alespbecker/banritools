import React from "react";

/**
 * Badge / Pill — compact status, role, or metric label.
 * Color variants are AA-safe (dark text on soft tint).
 */
export function Badge({
  variant = "neutral",
  size = "sm",
  square = false,
  dot = false,
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "bt-badge",
    `bt-badge--${variant}`,
    size === "md" ? "bt-badge--md" : "",
    square ? "bt-badge--square" : "",
    dot ? "bt-badge--dot" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
