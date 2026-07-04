import * as React from "react";

export interface TabItem {
  value: string;
  label: React.ReactNode;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tab definitions. */
  items: TabItem[];
  /** Active tab value. */
  value: string;
  /** Called with the next value on click. */
  onChange?: (value: string) => void;
}

/** Underline tab bar (e.g. Informações / Variantes / Esquema de campos). */
export function Tabs(props: TabsProps): JSX.Element;
