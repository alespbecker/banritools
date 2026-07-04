import React from "react";

/**
 * Avatar — user identity chip. Shows a photo when `src` is given,
 * otherwise the `name`'s initials on a brand fill.
 */
export function Avatar({
  name = "",
  src = null,
  size = "md",
  color = "brand",
  className = "",
  ...rest
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const cls = [
    "bt-avatar",
    `bt-avatar--${size}`,
    color !== "brand" ? `bt-avatar--${color}` : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} aria-label={name || undefined} role={name ? "img" : undefined} {...rest}>
      {src ? <img src={src} alt={name} /> : initials}
    </span>
  );
}
