import * as React from "react";

export interface SegmentItem {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 2-3 short options. */
  items: SegmentItem[];
  /** Active value. */
  value: string;
  /** Called with next value. */
  onChange?: (value: string) => void;
}

/** Compact pill toggle for 2-3 short options (e.g. Mês / Trimestre / Ano). */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
