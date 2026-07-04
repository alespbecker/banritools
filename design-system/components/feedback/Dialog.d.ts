import * as React from "react";

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controls visibility. */
  open: boolean;
  /** Header title. */
  title?: React.ReactNode;
  /** Close handler (also wired to the X and overlay). */
  onClose?: () => void;
  /** Footer node — typically the action buttons. */
  footer?: React.ReactNode;
  /** Close when the backdrop is clicked. Default true. */
  closeOnOverlay?: boolean;
}

/** Centered modal dialog over a navy backdrop. Renders null when closed. */
export function Dialog(props: DialogProps): JSX.Element | null;
