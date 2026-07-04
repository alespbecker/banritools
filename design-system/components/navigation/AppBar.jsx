import React from "react";

/**
 * AppBar — top application bar: brand lockup on the left, action slot
 * on the right. 56px tall, sits flush at the top of a screen.
 */
export function AppBar({
  brand = "banritools",
  logo = null,
  leading = null,
  actions = null,
  className = "",
  ...rest
}) {
  return (
    <header className={`bt-appbar ${className}`.trim()} {...rest}>
      {leading}
      <div className="bt-appbar__brand">
        {logo}
        <span>{brand}</span>
      </div>
      <div className="bt-appbar__spacer" />
      {actions}
    </header>
  );
}
