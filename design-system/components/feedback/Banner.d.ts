import * as React from "react";

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Color tone. */
  tone?: "neutral" | "info" | "success" | "warning" | "error";
  /** Leading icon node. */
  icon?: React.ReactNode;
  /** Bold title line. */
  title?: React.ReactNode;
  /** Trailing action (e.g. a ghost Button or IconButton). */
  action?: React.ReactNode;
}

/** Inline alert / callout with tone, icon, title and body. */
export function Banner(props: BannerProps): JSX.Element;
