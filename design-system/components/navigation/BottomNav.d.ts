import * as React from "react";

export interface BottomNavItem {
  value: string;
  label: React.ReactNode;
  icon: React.ReactNode;
}

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Tab items (3-5). */
  items: BottomNavItem[];
  /** Active value. */
  value: string;
  /** Called with next value. */
  onChange?: (value: string) => void;
}

/**
 * @startingPoint section="Navigation" subtitle="Mobile bottom tab bar" viewport="390x88"
 * Mobile bottom navigation. Active item tinted --primary.
 */
export function BottomNav(props: BottomNavProps): JSX.Element;
