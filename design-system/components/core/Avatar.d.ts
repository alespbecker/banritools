import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — initials are derived when no photo is set. */
  name?: string;
  /** Optional photo URL. */
  src?: string | null;
  /** 32 / 40 / 56px. */
  size?: "sm" | "md" | "lg";
  /** Fallback fill color. */
  color?: "brand" | "navy" | "turquoise" | "purple";
}

/** User identity chip: photo or initials on a brand fill. */
export function Avatar(props: AvatarProps): JSX.Element;
