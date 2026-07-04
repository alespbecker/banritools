import * as React from "react";

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon name, kebab or PascalCase (e.g. "trophy", "trending-up"). */
  name: string;
  /** Pixel size of the square glyph. Default 20. */
  size?: number;
  /** Stroke width. Default 2 (Banritools standard line weight). */
  strokeWidth?: number;
}

/**
 * Lucide glyph renderer. Inherits color via currentColor.
 * Requires window.lucide (CDN UMD) to be loaded.
 */
export function Icon(props: IconProps): JSX.Element;
