import * as React from "react";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value: number;
  /** Maximum value. Default 100. */
  max?: number;
  /** Fill style. default=brand blue, success=green, warning=amber, gradient=blue→turquoise. */
  variant?: "default" | "success" | "warning" | "gradient";
  /** Accessible label for the bar. */
  label?: string;
}

/** Accessible progress track. Fill is a solid AA color, not a thin light line. */
export function ProgressBar(props: ProgressBarProps): JSX.Element;
