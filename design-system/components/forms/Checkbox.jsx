import React from "react";

/**
 * Checkbox — labeled checkable control. Pass `radio` for a single-select dot.
 */
export function Checkbox({
  label,
  radio = false,
  className = "",
  ...rest
}) {
  return (
    <label className={`bt-check ${className}`.trim()}>
      <input type={radio ? "radio" : "checkbox"} {...rest} />
      <span className={`bt-check__box ${radio ? "bt-check__box--radio" : ""}`.trim()}>
        {!radio && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
