import React from "react";

/**
 * Button — primary action control.
 * Solid uses --primary-strong (#0077DB) with a white label (WCAG AA).
 * Never use bare #0094FF as a button fill.
 */
export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "bt-btn",
    `bt-btn--${variant}`,
    `bt-btn--${size}`,
    block ? "bt-btn--block" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="bt-btn__spinner" aria-hidden="true" />}
      {!loading && iconLeft}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </button>
  );
}
