import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Adds hover lift + pointer affordance. */
  interactive?: boolean;
  /** default (surface) · inverse (navy hero) · accent (success-tinted "next action"). */
  variant?: "default" | "inverse" | "accent";
  /** Inner padding. md=20px (default), lg=24px, none for flush media/lists. */
  padding?: "md" | "lg" | "none";
  /** Render as a different element (e.g. "a", "section", "button"). */
  as?: React.ElementType;
}

/**
 * @startingPoint section="Core" subtitle="Card surfaces — default, inverse, accent" viewport="700x220"
 * Base content surface. Compose KPI, ranking, list and form blocks inside it.
 */
export function Card(props: CardProps): JSX.Element;
