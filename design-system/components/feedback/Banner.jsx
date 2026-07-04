import React from "react";

/**
 * Banner — inline alert / callout. Tones: info, success, warning, error, neutral.
 */
export function Banner({
  tone = "neutral",
  icon = null,
  title,
  children,
  action = null,
  className = "",
  ...rest
}) {
  return (
    <div
      className={`bt-banner ${tone !== "neutral" ? `bt-banner--${tone}` : ""} ${className}`.trim()}
      role={tone === "error" ? "alert" : "status"}
      {...rest}
    >
      {icon && <span className="bt-banner__icon">{icon}</span>}
      <div className="bt-banner__body">
        {title && <div className="bt-banner__title">{title}</div>}
        {children && <div className="bt-banner__text">{children}</div>}
      </div>
      {action}
    </div>
  );
}
