import * as React from "react";

export interface ListRowProps extends React.HTMLAttributes<HTMLElement> {
  /** Leading node — icon tile or avatar. */
  leading?: React.ReactNode;
  /** Primary text. */
  title: React.ReactNode;
  /** Secondary text. */
  subtitle?: React.ReactNode;
  /** Trailing node — badge, value, chevron. */
  trailing?: React.ReactNode;
  /** Makes the row an interactive button with hover state. */
  onClick?: () => void;
}

/** Generic list item: leading visual, title/subtitle, trailing. Stack inside a flush Card. */
export function ListRow(props: ListRowProps): JSX.Element;
