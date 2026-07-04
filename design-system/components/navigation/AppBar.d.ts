import * as React from "react";

export interface AppBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand wordmark text. Default "banritools". */
  brand?: string;
  /** Logo node placed before the wordmark. */
  logo?: React.ReactNode;
  /** Leading slot (e.g. a menu IconButton) before the brand. */
  leading?: React.ReactNode;
  /** Right-aligned actions (IconButtons, Avatar). */
  actions?: React.ReactNode;
}

/** Top app bar: leading + brand lockup, spacer, trailing actions. 56px tall. */
export function AppBar(props: AppBarProps): JSX.Element;
