import React from "react";

/**
 * CurrencyBRL — formats a number as Brazilian Real with tabular-nums.
 * Positive values can be tinted green via `positive`.
 */
export function CurrencyBRL({
  value = 0,
  positive = false,
  negative = false,
  prefix = "R$",
  className = "",
  ...rest
}) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(Number(value) || 0);
  const [int, cents] = abs.toFixed(2).split(".");
  const intGrouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const tone = positive ? "bt-currency--positive" : negative || value < 0 ? "bt-currency--negative" : "";
  return (
    <span className={`bt-currency ${tone} ${className}`.trim()} {...rest}>
      {sign}{prefix}&nbsp;{intGrouped}<span className="bt-currency__cents">,{cents}</span>
    </span>
  );
}
