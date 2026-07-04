import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style.
   * - primary: solid #0077DB, white label (default CTA)
   * - secondary: outlined, neutral surface
   * - ghost: text-only, brand link color
   * - navy: deep #000050 fill (brand / dark CTA)
   * - danger: destructive red
   */
  variant?: "primary" | "secondary" | "ghost" | "navy" | "danger";
  /** Control height. Default "md" (40px). */
  size?: "sm" | "md" | "lg";
  /** Stretch to full container width. */
  block?: boolean;
  /** Show a spinner and disable interaction. */
  loading?: boolean;
  /** Leading icon node (e.g. <Icon name="save" size={16} />). */
  iconLeft?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
}

/**
 * @startingPoint section="Core" subtitle="Buttons — primary, secondary, ghost, navy, danger" viewport="700x150"
 * Primary action button. Solid fill uses the AA-safe --primary-strong, never raw #0094FF.
 */
export function Button(props: ButtonProps): JSX.Element;
