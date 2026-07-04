import * as React from "react";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Text label rendered after the track. */
  label?: string;
}

/** On/off toggle. "On" track uses --primary-strong. */
export function Switch(props: SwitchProps): JSX.Element;
