import React from "react";

/**
 * Icon — renders a Lucide glyph by name.
 * Banritools standardizes on Lucide (line icons, 2px stroke), loaded from CDN.
 * Expects `window.lucide` (UMD build) to be present; renders nothing until it is.
 * Inherits color via `currentColor` and sizes via the `size` prop.
 */
export function Icon({ name, size = 20, strokeWidth = 2, className = "", style = {}, ...rest }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const lucide = typeof window !== "undefined" ? window.lucide : null;
    if (!lucide) return;

    const toPascal = (n) =>
      String(n)
        .split(/[-_ ]/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("");

    const node =
      (lucide.icons && (lucide.icons[toPascal(name)] || lucide.icons[name])) || null;

    host.replaceChildren();
    if (node && typeof lucide.createElement === "function") {
      const svg = lucide.createElement(node);
      svg.setAttribute("width", size);
      svg.setAttribute("height", size);
      svg.setAttribute("stroke-width", strokeWidth);
      host.appendChild(svg);
    } else {
      // Fallback: data-attribute + global scan
      const i = document.createElement("i");
      i.setAttribute("data-lucide", name);
      host.appendChild(i);
      if (typeof lucide.createIcons === "function") {
        try { lucide.createIcons({ root: host }); } catch (e) { /* noop */ }
      }
    }
  }, [name, size, strokeWidth]);

  return (
    <span
      ref={ref}
      className={`bt-icon ${className}`}
      aria-hidden="true"
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        flex: "none",
        lineHeight: 0,
        ...style,
      }}
      {...rest}
    />
  );
}
