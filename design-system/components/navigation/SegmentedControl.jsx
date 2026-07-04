import React from "react";

/**
 * SegmentedControl — compact pill toggle for 2-3 short options.
 * `items` is an array of { value, label }.
 */
export function SegmentedControl({ items = [], value, onChange, className = "", ...rest }) {
  return (
    <div className={`bt-segmented ${className}`.trim()} role="group" {...rest}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          aria-pressed={value === it.value}
          className={`bt-segmented__item ${value === it.value ? "bt-segmented__item--active" : ""}`.trim()}
          onClick={() => onChange && onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
