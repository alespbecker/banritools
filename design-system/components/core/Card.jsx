import React from "react";

/**
 * Card — the base surface shell: white (light) / gray-900 (dark),
 * subtle border, lg radius, short shadow.
 */
export function Card({
  interactive = false,
  variant = "default",
  padding = "md",
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "bt-card",
    padding === "lg" ? "bt-card--lg" : "",
    padding === "none" ? "bt-card--flush" : "",
    interactive ? "bt-card--interactive" : "",
    variant === "inverse" ? "bt-card--inverse" : "",
    variant === "accent" ? "bt-card--accent" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
