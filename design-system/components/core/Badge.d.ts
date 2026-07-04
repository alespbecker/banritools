import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tone. Use brand for points pills, success for positive money/states, purple for roles (Admin/TIME). */
  variant?:
    | "neutral" | "brand" | "success" | "warning" | "error"
    | "purple" | "turquoise" | "solid";
  /** sm (default) or md. */
  size?: "sm" | "md";
  /** Square corners instead of pill. */
  square?: boolean;
  /** Render a leading status dot. */
  dot?: boolean;
}

/**
 * @startingPoint section="Core" subtitle="Badges & pills — status, roles, points" viewport="700x150"
 * Compact label for status, roles, and metrics. All tints are contrast-checked.
 */
export function Badge(props: BadgeProps): JSX.Element;
