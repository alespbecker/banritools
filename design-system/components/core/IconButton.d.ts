import * as React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** subtle (transparent, hover surface) or solid (brand fill). */
  variant?: "subtle" | "solid";
  /** 32 / 40 / 44px. Default md. Use lg (44px) for primary touch targets. */
  size?: "sm" | "md" | "lg";
  /** REQUIRED for a11y — describes the action. */
  "aria-label": string;
}

/** Square, label-less action (app-bar, toolbars). Wrap an <Icon /> as children. */
export function IconButton(props: IconButtonProps): JSX.Element;
