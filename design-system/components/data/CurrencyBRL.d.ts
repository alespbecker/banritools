import * as React from "react";

export interface CurrencyBRLProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Numeric amount. */
  value: number;
  /** Tint green (use for positive production / commission values). */
  positive?: boolean;
  /** Tint red. */
  negative?: boolean;
  /** Currency prefix. Default "R$". */
  prefix?: string;
}

/** Brazilian Real formatter (1.250,00) with tabular-nums and subdued cents. */
export function CurrencyBRL(props: CurrencyBRLProps): JSX.Element;
