import React from "react";

/**
 * Tabs — underline tab bar. Controlled via `value`/`onChange`.
 * `items` is an array of { value, label }.
 */
export function Tabs({ items = [], value, onChange, className = "", ...rest }) {
  return (
    <div className={`bt-tabs ${className}`.trim()} role="tablist" {...rest}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={value === it.value}
          className={`bt-tab ${value === it.value ? "bt-tab--active" : ""}`.trim()}
          onClick={() => onChange && onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
