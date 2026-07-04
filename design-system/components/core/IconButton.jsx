import React from "react";

/**
 * IconButton — a square, label-less control for toolbar/app-bar actions.
 * Pass an Icon (or any node) as children. Always provide `aria-label`.
 */
export function IconButton({
  variant = "subtle",
  size = "md",
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "bt-iconbtn",
    `bt-iconbtn--${size}`,
    variant === "solid" ? "bt-iconbtn--solid" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
