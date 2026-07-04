import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Text label rendered beside the box. */
  label?: string;
  /** Render as a radio (round, dot indicator) instead of a checkbox. */
  radio?: boolean;
}

/** Labeled checkbox / radio. Checked fill uses --primary-strong. */
export function Checkbox(props: CheckboxProps): JSX.Element;
