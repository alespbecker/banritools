import React from "react";

/**
 * Select — native dropdown styled to match Input, with a chevron.
 * Pass <option> children. Supports the same label/helper/error pattern.
 */
export function Select({
  label,
  helper,
  error,
  id,
  className = "",
  children,
  ...rest
}) {
  const selId = id || React.useId();
  const control = (
    <div className="bt-selectwrap">
      <select
        id={selId}
        className={["bt-input", error ? "bt-input--error" : "", className].filter(Boolean).join(" ")}
        aria-invalid={!!error}
        {...rest}
      >
        {children}
      </select>
      <span className="bt-select__chevron" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </span>
    </div>
  );
  if (!label && !helper && !error) return control;
  return (
    <div className="bt-field">
      {label && <label className="bt-label" htmlFor={selId}>{label}</label>}
      {control}
      {error ? <span className="bt-help bt-help--error">{error}</span>
        : helper ? <span className="bt-help">{helper}</span> : null}
    </div>
  );
}
