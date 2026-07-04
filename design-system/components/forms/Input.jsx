import React from "react";

/**
 * Input — text field with optional label, leading icon, helper/error text.
 * Focus ring uses --primary; error state uses --error.
 */
export function Input({
  label,
  optional = false,
  icon = null,
  helper,
  error,
  id,
  className = "",
  ...rest
}) {
  const inputId = id || React.useId();
  const inputCls = ["bt-input", error ? "bt-input--error" : "", className]
    .filter(Boolean).join(" ");
  const control = (
    <div className={`bt-inputwrap ${icon ? "bt-inputwrap--icon" : ""}`}>
      {icon && <span className="bt-input__icon">{icon}</span>}
      <input id={inputId} className={inputCls} aria-invalid={!!error} {...rest} />
    </div>
  );
  if (!label && !helper && !error) return control;
  return (
    <div className="bt-field">
      {label && (
        <label className="bt-label" htmlFor={inputId}>
          {label}
          {optional && <span className="bt-label__opt">(opcional)</span>}
        </label>
      )}
      {control}
      {error ? (
        <span className="bt-help bt-help--error">{error}</span>
      ) : helper ? (
        <span className="bt-help">{helper}</span>
      ) : null}
    </div>
  );
}
