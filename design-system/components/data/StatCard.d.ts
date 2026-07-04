import * as React from "react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase eyebrow label (e.g. "ENGAJAMENTO"). */
  label: string;
  /** Big value — string or node. Rendered in Exo 2 with tabular-nums. */
  value: React.ReactNode;
  /** Supporting text below the value. */
  sub?: string;
  /** Icon node shown in the corner tile. */
  icon?: React.ReactNode;
  /** Tile tint. */
  iconColor?: "brand" | "success" | "purple" | "turquoise" | "warning";
  /** Optional trend element, e.g. a <Badge>. */
  trend?: React.ReactNode;
}

/**
 * @startingPoint section="Data" subtitle="KPI / stat tile with icon and trend" viewport="700x180"
 * Dashboard KPI tile. Value uses Exo 2 + tabular-nums.
 */
export function StatCard(props: StatCardProps): JSX.Element;
