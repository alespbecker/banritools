/* @ds-bundle: {"format":4,"namespace":"BanritoolsDesignSystem_38adfd","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"CurrencyBRL","sourcePath":"components/data/CurrencyBRL.jsx"},{"name":"ListRow","sourcePath":"components/data/ListRow.jsx"},{"name":"RankRow","sourcePath":"components/data/RankRow.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"AppBar","sourcePath":"components/navigation/AppBar.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"bd51411ab5ed","components/core/Badge.jsx":"b4dd499e1e60","components/core/Button.jsx":"a26f9ec36723","components/core/Card.jsx":"a86fd4fe3905","components/core/Icon.jsx":"780d04b66d66","components/core/IconButton.jsx":"77038091d216","components/core/ProgressBar.jsx":"aa3377563cc2","components/data/CurrencyBRL.jsx":"f9cfd6fc4273","components/data/ListRow.jsx":"8dba8d66fd15","components/data/RankRow.jsx":"3cf5cc63c7db","components/data/StatCard.jsx":"717153b529cd","components/feedback/Banner.jsx":"5b796743fec8","components/feedback/Dialog.jsx":"46d6267ee414","components/forms/Checkbox.jsx":"7aab7e730315","components/forms/Input.jsx":"6c211f074294","components/forms/Select.jsx":"d69045242b21","components/forms/Switch.jsx":"43261f13e5bc","components/navigation/AppBar.jsx":"ca6011e009f2","components/navigation/BottomNav.jsx":"b8e61aea2501","components/navigation/SegmentedControl.jsx":"8ba5c4f4aede","components/navigation/Tabs.jsx":"1ead338e463f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BanritoolsDesignSystem_38adfd = window.BanritoolsDesignSystem_38adfd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Avatar — user identity chip. Shows a photo when `src` is given,
 * otherwise the `name`'s initials on a brand fill.
 */
function Avatar({
  name = "",
  src = null,
  size = "md",
  color = "brand",
  className = "",
  ...rest
}) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
  const cls = ["bt-avatar", `bt-avatar--${size}`, color !== "brand" ? `bt-avatar--${color}` : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    "aria-label": name || undefined,
    role: name ? "img" : undefined
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge / Pill — compact status, role, or metric label.
 * Color variants are AA-safe (dark text on soft tint).
 */
function Badge({
  variant = "neutral",
  size = "sm",
  square = false,
  dot = false,
  className = "",
  children,
  ...rest
}) {
  const cls = ["bt-badge", `bt-badge--${variant}`, size === "md" ? "bt-badge--md" : "", square ? "bt-badge--square" : "", dot ? "bt-badge--dot" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — primary action control.
 * Solid uses --primary-strong (#0077DB) with a white label (WCAG AA).
 * Never use bare #0094FF as a button fill.
 */
function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const cls = ["bt-btn", `bt-btn--${variant}`, `bt-btn--${size}`, block ? "bt-btn--block" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled || loading
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    className: "bt-btn__spinner",
    "aria-hidden": "true"
  }), !loading && iconLeft, children && /*#__PURE__*/React.createElement("span", null, children), !loading && iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the base surface shell: white (light) / gray-900 (dark),
 * subtle border, lg radius, short shadow.
 */
function Card({
  interactive = false,
  variant = "default",
  padding = "md",
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) {
  const cls = ["bt-card", padding === "lg" ? "bt-card--lg" : "", padding === "none" ? "bt-card--flush" : "", interactive ? "bt-card--interactive" : "", variant === "inverse" ? "bt-card--inverse" : "", variant === "accent" ? "bt-card--accent" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Icon — renders a Lucide glyph by name.
 * Banritools standardizes on Lucide (line icons, 2px stroke), loaded from CDN.
 * Expects `window.lucide` (UMD build) to be present; renders nothing until it is.
 * Inherits color via `currentColor` and sizes via the `size` prop.
 */
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className = "",
  style = {},
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const lucide = typeof window !== "undefined" ? window.lucide : null;
    if (!lucide) return;
    const toPascal = n => String(n).split(/[-_ ]/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
    const node = lucide.icons && (lucide.icons[toPascal(name)] || lucide.icons[name]) || null;
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
        try {
          lucide.createIcons({
            root: host
          });
        } catch (e) {/* noop */}
      }
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", _extends({
    ref: ref,
    className: `bt-icon ${className}`,
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      width: size,
      height: size,
      flex: "none",
      lineHeight: 0,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — a square, label-less control for toolbar/app-bar actions.
 * Pass an Icon (or any node) as children. Always provide `aria-label`.
 */
function IconButton({
  variant = "subtle",
  size = "md",
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  const cls = ["bt-iconbtn", `bt-iconbtn--${size}`, variant === "solid" ? "bt-iconbtn--solid" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    disabled: disabled
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ProgressBar — accessible track + fill. Fill defaults to the solid
 * brand blue (not a thin light-green line). value/max are 0..100 by default.
 */
function ProgressBar({
  value = 0,
  max = 100,
  variant = "default",
  className = "",
  label,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const cls = ["bt-progress", variant !== "default" ? `bt-progress--${variant}` : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    "aria-label": label
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "bt-progress__fill",
    style: {
      width: `${pct}%`
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/CurrencyBRL.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CurrencyBRL — formats a number as Brazilian Real with tabular-nums.
 * Positive values can be tinted green via `positive`.
 */
function CurrencyBRL({
  value = 0,
  positive = false,
  negative = false,
  prefix = "R$",
  className = "",
  ...rest
}) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(Number(value) || 0);
  const [int, cents] = abs.toFixed(2).split(".");
  const intGrouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const tone = positive ? "bt-currency--positive" : negative || value < 0 ? "bt-currency--negative" : "";
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `bt-currency ${tone} ${className}`.trim()
  }, rest), sign, prefix, "\xA0", intGrouped, /*#__PURE__*/React.createElement("span", {
    className: "bt-currency__cents"
  }, ",", cents));
}
Object.assign(__ds_scope, { CurrencyBRL });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/CurrencyBRL.jsx", error: String((e && e.message) || e) }); }

// components/data/ListRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ListRow — generic list item: leading icon/avatar, title + subtitle,
 * trailing content. Becomes a button when `onClick` is given.
 */
function ListRow({
  leading = null,
  title,
  subtitle,
  trailing = null,
  onClick,
  className = "",
  ...rest
}) {
  const isButton = typeof onClick === "function";
  const Tag = isButton ? "button" : "div";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: `bt-listrow ${isButton ? "bt-listrow--button" : ""} ${className}`.trim(),
    onClick: onClick,
    type: isButton ? "button" : undefined
  }, rest), leading, /*#__PURE__*/React.createElement("div", {
    className: "bt-listrow__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bt-listrow__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "bt-listrow__sub"
  }, subtitle)), trailing && /*#__PURE__*/React.createElement("div", {
    className: "bt-listrow__trail"
  }, trailing));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/data/RankRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * RankRow — one row in a ranking / leaderboard: position medal, avatar,
 * name, points, optional tags ("Você", "Líder") and an optional progress bar.
 */
function RankRow({
  position,
  name,
  points,
  avatar = null,
  tags = null,
  me = false,
  progress = null,
  className = "",
  ...rest
}) {
  const posCls = position <= 3 ? `bt-rankrow__pos--${position}` : "";
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `bt-rankrow ${me ? "bt-rankrow--me" : ""} ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: `bt-rankrow__pos ${posCls}`.trim()
  }, position), avatar, /*#__PURE__*/React.createElement("div", {
    className: "bt-rankrow__body"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-rankrow__name"
  }, name), tags), /*#__PURE__*/React.createElement("span", {
    className: "bt-rankrow__pts"
  }, points), progress != null && /*#__PURE__*/React.createElement("div", {
    className: "bt-rankrow__bar"
  }, progress)));
}
Object.assign(__ds_scope, { RankRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RankRow.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatCard — a KPI tile: label, big tabular value, optional icon tile,
 * sub text, and an optional trend pill.
 */
function StatCard({
  label,
  value,
  sub,
  icon = null,
  iconColor = "brand",
  trend = null,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `bt-card bt-kpi ${className}`.trim()
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "bt-kpi__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-kpi__label"
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    className: `bt-icontile ${iconColor !== "brand" ? `bt-icontile--${iconColor}` : ""}`.trim()
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "10px",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-kpi__value"
  }, value), trend), sub && /*#__PURE__*/React.createElement("span", {
    className: "bt-kpi__sub"
  }, sub));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Banner — inline alert / callout. Tones: info, success, warning, error, neutral.
 */
function Banner({
  tone = "neutral",
  icon = null,
  title,
  children,
  action = null,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `bt-banner ${tone !== "neutral" ? `bt-banner--${tone}` : ""} ${className}`.trim(),
    role: tone === "error" ? "alert" : "status"
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    className: "bt-banner__icon"
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "bt-banner__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "bt-banner__title"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    className: "bt-banner__text"
  }, children)), action);
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Dialog — modal overlay. Renders nothing when `open` is false.
 * Provide `title`, body children, and a `footer` (usually buttons).
 */
function Dialog({
  open = false,
  title,
  onClose,
  footer = null,
  closeOnOverlay = true,
  children,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "bt-dialog-overlay",
    onClick: closeOnOverlay && onClose ? onClose : undefined
  }, /*#__PURE__*/React.createElement("div", _extends({
    className: "bt-dialog",
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation()
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "bt-dialog__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-dialog__title"
  }, title), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bt-iconbtn bt-iconbtn--sm",
    "aria-label": "Fechar",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "bt-dialog__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "bt-dialog__foot"
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Checkbox — labeled checkable control. Pass `radio` for a single-select dot.
 */
function Checkbox({
  label,
  radio = false,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `bt-check ${className}`.trim()
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: radio ? "radio" : "checkbox"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: `bt-check__box ${radio ? "bt-check__box--radio" : ""}`.trim()
  }, !radio && /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — text field with optional label, leading icon, helper/error text.
 * Focus ring uses --primary; error state uses --error.
 */
function Input({
  label,
  optional = false,
  icon = null,
  helper,
  error,
  id,
  className = "",
  ...rest
}) {
  const inputId = id || React.useId();
  const inputCls = ["bt-input", error ? "bt-input--error" : "", className].filter(Boolean).join(" ");
  const control = /*#__PURE__*/React.createElement("div", {
    className: `bt-inputwrap ${icon ? "bt-inputwrap--icon" : ""}`
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "bt-input__icon"
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    className: inputCls,
    "aria-invalid": !!error
  }, rest)));
  if (!label && !helper && !error) return control;
  return /*#__PURE__*/React.createElement("div", {
    className: "bt-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "bt-label",
    htmlFor: inputId
  }, label, optional && /*#__PURE__*/React.createElement("span", {
    className: "bt-label__opt"
  }, "(opcional)")), control, error ? /*#__PURE__*/React.createElement("span", {
    className: "bt-help bt-help--error"
  }, error) : helper ? /*#__PURE__*/React.createElement("span", {
    className: "bt-help"
  }, helper) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Select — native dropdown styled to match Input, with a chevron.
 * Pass <option> children. Supports the same label/helper/error pattern.
 */
function Select({
  label,
  helper,
  error,
  id,
  className = "",
  children,
  ...rest
}) {
  const selId = id || React.useId();
  const control = /*#__PURE__*/React.createElement("div", {
    className: "bt-selectwrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    className: ["bt-input", error ? "bt-input--error" : "", className].filter(Boolean).join(" "),
    "aria-invalid": !!error
  }, rest), children), /*#__PURE__*/React.createElement("span", {
    className: "bt-select__chevron",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  }))));
  if (!label && !helper && !error) return control;
  return /*#__PURE__*/React.createElement("div", {
    className: "bt-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "bt-label",
    htmlFor: selId
  }, label), control, error ? /*#__PURE__*/React.createElement("span", {
    className: "bt-help bt-help--error"
  }, error) : helper ? /*#__PURE__*/React.createElement("span", {
    className: "bt-help"
  }, helper) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Switch — on/off toggle. Label sits to the right of the track.
 */
function Switch({
  label,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `bt-switch ${className}`.trim()
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "bt-switch__track"
  }), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * AppBar — top application bar: brand lockup on the left, action slot
 * on the right. 56px tall, sits flush at the top of a screen.
 */
function AppBar({
  brand = "banritools",
  logo = null,
  leading = null,
  actions = null,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    className: `bt-appbar ${className}`.trim()
  }, rest), leading, /*#__PURE__*/React.createElement("div", {
    className: "bt-appbar__brand"
  }, logo, /*#__PURE__*/React.createElement("span", null, brand)), /*#__PURE__*/React.createElement("div", {
    className: "bt-appbar__spacer"
  }), actions);
}
Object.assign(__ds_scope, { AppBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * BottomNav — mobile bottom tab bar. `items` is an array of
 * { value, label, icon }. Active item is tinted with --primary.
 */
function BottomNav({
  items = [],
  value,
  onChange,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    className: `bt-bottomnav ${className}`.trim()
  }, rest), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    type: "button",
    "aria-current": value === it.value ? "page" : undefined,
    className: `bt-bottomnav__item ${value === it.value ? "bt-bottomnav__item--active" : ""}`.trim(),
    onClick: () => onChange && onChange(it.value)
  }, it.icon, /*#__PURE__*/React.createElement("span", null, it.label))));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SegmentedControl — compact pill toggle for 2-3 short options.
 * `items` is an array of { value, label }.
 */
function SegmentedControl({
  items = [],
  value,
  onChange,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `bt-segmented ${className}`.trim(),
    role: "group"
  }, rest), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    type: "button",
    "aria-pressed": value === it.value,
    className: `bt-segmented__item ${value === it.value ? "bt-segmented__item--active" : ""}`.trim(),
    onClick: () => onChange && onChange(it.value)
  }, it.label)));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tabs — underline tab bar. Controlled via `value`/`onChange`.
 * `items` is an array of { value, label }.
 */
function Tabs({
  items = [],
  value,
  onChange,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `bt-tabs ${className}`.trim(),
    role: "tablist"
  }, rest), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    type: "button",
    role: "tab",
    "aria-selected": value === it.value,
    className: `bt-tab ${value === it.value ? "bt-tab--active" : ""}`.trim(),
    onClick: () => onChange && onChange(it.value)
  }, it.label)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.CurrencyBRL = __ds_scope.CurrencyBRL;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.RankRow = __ds_scope.RankRow;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.AppBar = __ds_scope.AppBar;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
