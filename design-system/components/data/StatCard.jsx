import React from "react";

/**
 * StatCard — a KPI tile: label, big tabular value, optional icon tile,
 * sub text, and an optional trend pill.
 */
export function StatCard({
  label,
  value,
  sub,
  icon = null,
  iconColor = "brand",
  trend = null,
  className = "",
  ...rest
}) {
  return (
    <div className={`bt-card bt-kpi ${className}`.trim()} {...rest}>
      <div className="bt-kpi__head">
        <span className="bt-kpi__label">{label}</span>
        {icon && (
          <span className={`bt-icontile ${iconColor !== "brand" ? `bt-icontile--${iconColor}` : ""}`.trim()}>
            {icon}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
        <span className="bt-kpi__value">{value}</span>
        {trend}
      </div>
      {sub && <span className="bt-kpi__sub">{sub}</span>}
    </div>
  );
}
