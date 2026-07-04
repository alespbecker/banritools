import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Field label. */
  label?: string;
  /** Helper text below. */
  helper?: string;
  /** Error message — turns red, overrides helper. */
  error?: string;
}

/** Native select styled to match Input, with a chevron. Pass <option> children. */
export function Select(props: SelectProps): JSX.Element;
