import React from "react";

/**
 * BottomNav — mobile bottom tab bar. `items` is an array of
 * { value, label, icon }. Active item is tinted with --primary.
 */
export function BottomNav({ items = [], value, onChange, className = "", ...rest }) {
  return (
    <nav className={`bt-bottomnav ${className}`.trim()} {...rest}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          aria-current={value === it.value ? "page" : undefined}
          className={`bt-bottomnav__item ${value === it.value ? "bt-bottomnav__item--active" : ""}`.trim()}
          onClick={() => onChange && onChange(it.value)}
        >
          {it.icon}
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
