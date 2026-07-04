import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label. When omitted, only the bare control renders. */
  label?: string;
  /** Append "(opcional)" hint to the label. */
  optional?: boolean;
  /** Leading icon node (e.g. <Icon name="dollar-sign" size={16} />). */
  icon?: React.ReactNode;
  /** Helper text below the field. */
  helper?: string;
  /** Error message — turns the field red and overrides helper. */
  error?: string;
}

/**
 * @startingPoint section="Forms" subtitle="Text fields — label, icon, helper, error" viewport="700x180"
 * Text input with label/helper/error. Focus ring = --primary; error = --error.
 */
export function Input(props: InputProps): JSX.Element;
