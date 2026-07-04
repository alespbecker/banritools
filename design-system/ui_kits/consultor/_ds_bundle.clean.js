/* @ds-bundle: {"format":3,"namespace":"BanritoolsDesignSystem_38adfd","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"CurrencyBRL","sourcePath":"components/data/CurrencyBRL.jsx"},{"name":"ListRow","sourcePath":"components/data/ListRow.jsx"},{"name":"RankRow","sourcePath":"components/data/RankRow.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"AppBar","sourcePath":"components/navigation/AppBar.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"bd51411ab5ed","components/core/Badge.jsx":"b4dd499e1e60","components/core/Button.jsx":"a26f9ec36723","components/core/Card.jsx":"a86fd4fe3905","components/core/Icon.jsx":"780d04b66d66","components/core/IconButton.jsx":"77038091d216","components/core/ProgressBar.jsx":"aa3377563cc2","components/data/CurrencyBRL.jsx":"f9cfd6fc4273","components/data/ListRow.jsx":"8dba8d66fd15","components/data/RankRow.jsx":"3cf5cc63c7db","components/data/StatCard.jsx":"717153b529cd","components/feedback/Banner.jsx":"5b796743fec8","components/feedback/Dialog.jsx":"46d6267ee414","components/forms/Checkbox.jsx":"7aab7e730315","components/forms/Input.jsx":"6c211f074294","components/forms/Select.jsx":"d69045242b21","components/forms/Switch.jsx":"43261f13e5bc","components/navigation/AppBar.jsx":"ca6011e009f2","components/navigation/BottomNav.jsx":"b8e61aea2501","components/navigation/SegmentedControl.jsx":"8ba5c4f4aede","components/navigation/Tabs.jsx":"1ead338e463f","ui_kits/admin/app.jsx":"55627fffa46f","ui_kits/admin/screens.jsx":"66ff68f047a9","ui_kits/consultor/app.jsx":"0d319fe2126b","ui_kits/consultor/screens.jsx":"7ce6a0034e47"},"inlinedExternals":[],"unexposedExports":[]} */

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

// ui_kits/admin/app.jsx
try { (() => {
/* Banritools — Painel Admin shell: sidebar + topbar + content routing. Light. */
const NS = window.BanritoolsDesignSystem_38adfd;
const {
  Icon,
  IconButton,
  Avatar,
  Badge
} = NS;
const SIDE = [{
  value: "painel",
  label: "Painel",
  icon: "layout-dashboard"
}, {
  value: "produtos",
  label: "Produtos",
  icon: "package"
}, {
  value: "usuarios",
  label: "Usuários",
  icon: "users"
}, {
  value: "metas",
  label: "Metas",
  icon: "target"
}, {
  value: "relatorios",
  label: "Relatórios",
  icon: "file-bar-chart"
}];
function Sidebar({
  active,
  onNav
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "admin-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-side__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    width: "28",
    height: "28",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", null, "banritools")), /*#__PURE__*/React.createElement("nav", {
    className: "admin-side__nav"
  }, SIDE.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    className: `admin-navitem ${active === it.value || active === "produto-edit" && it.value === "produtos" ? "admin-navitem--active" : ""}`,
    onClick: () => onNav(it.value)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, it.label)))), /*#__PURE__*/React.createElement("div", {
    className: "admin-side__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-agency"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-icontile",
    style: {
      width: 36,
      height: 36
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "building-2",
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: "var(--text)"
    }
  }, "Ag\xEAncia 0427"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, "Porto Alegre \u2014 RS")))));
}
function Topbar() {
  return /*#__PURE__*/React.createElement("header", {
    className: "admin-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "admin-search"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 18
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Buscar produtos, pessoas, lan\xE7amentos\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Atualizar"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "refresh-cw"
  })), /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Notifica\xE7\xF5es",
    className: "bt-appbar__dot"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      paddingLeft: 8,
      borderLeft: "1px solid var(--border)",
      marginLeft: 4
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Ana Gestora",
    size: "sm",
    color: "navy"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14,
      color: "var(--text)"
    }
  }, "Ana Gestora"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, "Administradora"))));
}
function AdminApp() {
  const [route, setRoute] = React.useState("painel");
  const [editing, setEditing] = React.useState(null);
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [route]);
  function nav(r) {
    setRoute(r);
  }
  function edit(p) {
    setEditing(p);
    setRoute("produto-edit");
  }
  let content = null;
  if (route === "painel") content = /*#__PURE__*/React.createElement(PainelScreen, null);else if (route === "produtos") content = /*#__PURE__*/React.createElement(ProdutosScreen, {
    onEdit: edit
  });else if (route === "produto-edit") content = /*#__PURE__*/React.createElement(ProdutoEditScreen, {
    produto: editing,
    onBack: () => setRoute("produtos")
  });else content = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
      color: "var(--text-subtle)",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-icontile bt-icontile--lg"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "construction",
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 20,
      color: "var(--text-muted)"
    }
  }, "Em constru\xE7\xE3o"), /*#__PURE__*/React.createElement("p", null, "Esta se\xE7\xE3o faz parte do roadmap do painel."));
  return /*#__PURE__*/React.createElement("div", {
    className: "admin"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: route,
    onNav: nav
  }), /*#__PURE__*/React.createElement("div", {
    className: "admin-main"
  }, /*#__PURE__*/React.createElement(Topbar, null), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    className: "admin-content"
  }, content)));
}
/* render removed for standalone */
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/screens.jsx
try { (() => {
/* Banritools — Painel Admin (web). Screens. Light mode. */
const NS = window.BanritoolsDesignSystem_38adfd;
const {
  Icon,
  Card,
  Badge,
  Button,
  IconButton,
  StatCard,
  RankRow,
  ListRow,
  Avatar,
  ProgressBar,
  CurrencyBRL,
  Input,
  Select,
  Tabs,
  SegmentedControl,
  Banner,
  Checkbox
} = NS;
function PageHead({
  eyebrow,
  title,
  subtitle,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: "purple",
    size: "md"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "users",
    size: 14
  }), " ", eyebrow), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14,
      marginLeft: 6
    }
  }, "Junho de 2026")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 34
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      marginTop: 6,
      fontSize: 17,
      maxWidth: 560
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, actions));
}

/* ---------- Painel da Agência ---------- */
function PainelScreen() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Time",
    title: "Painel da Ag\xEAncia",
    subtitle: "Vis\xE3o consolidada do time, ranking e gest\xE3o de usu\xE1rios.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Select, {
      defaultValue: "atual",
      "aria-label": "Per\xEDodo"
    }, /*#__PURE__*/React.createElement("option", {
      value: "atual"
    }, "M\xEAs Atual"), /*#__PURE__*/React.createElement("option", null, "Maio")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 16
      })
    }, "Exportar Relat\xF3rios"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 16
      })
    }, "Novo produto"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Engajamento",
    value: "78%",
    sub: "14 de 18 ativos",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "activity",
      size: 20
    }),
    trend: /*#__PURE__*/React.createElement(Badge, {
      variant: "success"
    }, "+9%")
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "M\xE9dia por ativo",
    value: "42",
    sub: "Unidades / colaborador",
    iconColor: "success",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "gauge",
      size: 20
    })
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Top performer",
    value: "Becker",
    sub: "9.150 pts no m\xEAs",
    iconColor: "purple",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "trophy",
      size: 20
    })
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Gap do ranking",
    value: "2.970",
    sub: "Pontos entre 1\xBA e \xFAltimo",
    iconColor: "turquoise",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "target",
      size: 20
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 20px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-icontile bt-icontile--purple"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trophy",
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 19,
      color: "var(--text)"
    }
  }, "Top 10 \u2014 Pontua\xE7\xE3o do m\xEAs"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, "Atualizado h\xE1 4 min"))), /*#__PURE__*/React.createElement(SegmentedControl, {
    value: "mes",
    onChange: () => {},
    items: [{
      value: "mes",
      label: "Mês"
    }, {
      value: "tri",
      label: "Trimestre"
    }]
  })), /*#__PURE__*/React.createElement(RankRow, {
    position: 1,
    name: "Alessandro Becker",
    points: "9.150 pts",
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Alessandro Becker"
    }),
    tags: /*#__PURE__*/React.createElement(Badge, {
      variant: "warning"
    }, "L\xEDder"),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 100,
      variant: "warning",
      label: "x"
    })
  }), /*#__PURE__*/React.createElement(RankRow, {
    position: 2,
    name: "Marina Petry",
    points: "8.830 pts",
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Marina Petry",
      color: "purple"
    }),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 96,
      label: "x"
    })
  }), /*#__PURE__*/React.createElement(RankRow, {
    position: 3,
    name: "Rafael Souza",
    points: "7.420 pts",
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Rafael Souza",
      color: "turquoise"
    }),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 81,
      label: "x"
    })
  }), /*#__PURE__*/React.createElement(RankRow, {
    position: 4,
    name: "Juliana Lima",
    points: "6.180 pts",
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Juliana Lima",
      color: "navy"
    }),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 67,
      label: "x"
    })
  }), /*#__PURE__*/React.createElement(RankRow, {
    position: 5,
    name: "Diego Fontes",
    points: "5.940 pts",
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Diego Fontes"
    }),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 65,
      label: "x"
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Total da ag\xEAncia"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 44,
      color: "var(--text)",
      lineHeight: 1,
      marginTop: 8,
      fontVariantNumeric: "tabular-nums"
    }
  }, "142.380"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14,
      marginTop: 4
    }
  }, "pontos \xB7 18 participantes"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 71,
    variant: "gradient",
    label: "meta"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 8,
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "71% da meta mensal"), /*#__PURE__*/React.createElement("span", {
    className: "tabular"
  }, "200.000"))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Comiss\xE3o prevista"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14
    }
  }, "Seguros"), /*#__PURE__*/React.createElement(CurrencyBRL, {
    value: 18250,
    positive: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14
    }
  }, "Capitaliza\xE7\xE3o"), /*#__PURE__*/React.createElement(CurrencyBRL, {
    value: 9480,
    positive: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14
    }
  }, "Cr\xE9dito"), /*#__PURE__*/React.createElement(CurrencyBRL, {
    value: 12300,
    positive: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      borderTop: "1px solid var(--border)",
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, "Total"), /*#__PURE__*/React.createElement(CurrencyBRL, {
    value: 40030,
    positive: true
  })))))));
}

/* ---------- Produtos ---------- */
const PRODUTOS = [{
  name: "Seguro Vida",
  cat: "Seguros",
  pts: 50,
  metric: "Quantidade + Valor",
  icon: "shield",
  color: "purple",
  on: true
}, {
  name: "Capitalização",
  cat: "Capitalização",
  pts: 20,
  metric: "Quantidade + Valor",
  icon: "piggy-bank",
  color: "brand",
  on: true
}, {
  name: "Cheque Especial",
  cat: "Crédito",
  pts: 25,
  metric: "Quantidade",
  icon: "credit-card",
  color: "turquoise",
  on: true
}, {
  name: "Crédito Minuto",
  cat: "Crédito",
  pts: 40,
  metric: "Volume R$",
  icon: "banknote",
  color: "turquoise",
  on: false
}, {
  name: "Consórcio",
  cat: "Consórcio",
  pts: 60,
  metric: "Quantidade + Valor",
  icon: "car",
  color: "purple",
  on: true
}];
function ProdutosScreen({
  onEdit
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    title: "Produtos",
    subtitle: "Gerencie o cat\xE1logo de produtos, pontua\xE7\xE3o e esquema de campos.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "search",
        size: 16
      })
    }, "Buscar"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 16
      })
    }, "Novo produto"))
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1.2fr 0.6fr",
      gap: 12,
      padding: "12px 20px",
      borderBottom: "1px solid var(--border)"
    }
  }, ["Produto", "Categoria", "Pts/unidade", "Métrica", "Ativo"].map(h => /*#__PURE__*/React.createElement("span", {
    key: h,
    className: "eyebrow"
  }, h))), PRODUTOS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    className: "bt-listrow bt-listrow--button",
    style: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1.2fr 0.6fr",
      gap: 12,
      alignItems: "center"
    },
    onClick: () => onEdit(p)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `bt-icontile ${p.color !== "brand" ? "bt-icontile--" + p.color : ""}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--text)"
    }
  }, p.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, p.cat), /*#__PURE__*/React.createElement("span", {
    className: "tabular",
    style: {
      fontWeight: 600
    }
  }, p.pts), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14
    }
  }, p.metric), /*#__PURE__*/React.createElement("span", null, p.on ? /*#__PURE__*/React.createElement(Badge, {
    variant: "success",
    dot: true
  }, "Ativo") : /*#__PURE__*/React.createElement(Badge, {
    variant: "neutral"
  }, "Inativo"))))));
}

/* ---------- Editar Produto ---------- */
function ProdutoEditScreen({
  produto,
  onBack
}) {
  const [tab, setTab] = React.useState("info");
  const p = produto || PRODUTOS[1];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "none",
      border: "none",
      color: "var(--link)",
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      padding: 0,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }), " Voltar para Produtos"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `bt-icontile bt-icontile--lg ${p.color !== "brand" ? "bt-icontile--" + p.color : ""}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.icon,
    size: 22
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, p.name), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-subtle)",
      fontSize: 14,
      fontFamily: "var(--font-mono)"
    }
  }, p.cat.toLowerCase(), " \xB7 legacy: ", p.name.toLowerCase().replace(/\s/g, "_")))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "18px 0 22px"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      value: "info",
      label: "Informações"
    }, {
      value: "var",
      label: "Variantes (5)"
    }, {
      value: "campos",
      label: "Esquema de campos"
    }]
  })), tab === "info" && /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Nome",
    defaultValue: p.name
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Descri\xE7\xE3o",
    defaultValue: `Títulos de ${p.cat.toLowerCase()}`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Categoria",
    defaultValue: p.cat
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Subcategoria",
    optional: true,
    placeholder: "\u2014"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Unidade",
    defaultValue: "unidade"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Pts/unidade",
    defaultValue: String(p.pts),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "star",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Ordem",
    defaultValue: "30"
  })), /*#__PURE__*/React.createElement(Select, {
    label: "Tipo de m\xE9trica",
    defaultValue: p.metric
  }, /*#__PURE__*/React.createElement("option", null, p.metric), /*#__PURE__*/React.createElement("option", null, "Quantidade"), /*#__PURE__*/React.createElement("option", null, "Volume R$")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--success-soft)",
      border: "1px solid var(--success-border)",
      borderRadius: "var(--radius-md)",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--success)",
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Comiss\xE3o prevista do vendedor"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "R$ por unidade",
    defaultValue: "10",
    helper: "Valor fixo por unidade"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "% sobre o valor",
    defaultValue: "0",
    helper: "Percentual aplicado ao valor"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onBack
  }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "save",
      size: 16
    })
  }, "Salvar altera\xE7\xF5es"))), tab === "var" && /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, ["Plano Mensal", "Plano Anual", "Plano Premium", "Plano Família", "Plano Empresa"].map((v, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: v,
    leading: /*#__PURE__*/React.createElement("span", {
      className: "bt-icontile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "layers",
      size: 18
    })),
    title: v,
    subtitle: `${20 + i * 10} pts · ativo`,
    trailing: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 18
    }),
    onClick: () => {}
  }))), tab === "campos" && /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(Banner, {
    tone: "info",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 18
    }),
    title: "Esquema de campos"
  }, "Defina quais campos o consultor preenche ao lan\xE7ar este produto."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, [["Quantidade", true], ["Valor (R$)", true], ["Subtipo", false], ["Observação", false]].map(([f, req]) => /*#__PURE__*/React.createElement("div", {
    key: f,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--text)"
    }
  }, f), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Obrigat\xF3rio",
    defaultChecked: req
  }))))));
}
Object.assign(window, {
  PainelScreen,
  ProdutosScreen,
  ProdutoEditScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/consultor/app.jsx
try { (() => {
/* Banritools — App do Consultor shell: login + phone frame + bottom-nav routing. */
const NS = window.BanritoolsDesignSystem_38adfd;
const {
  AppBar,
  BottomNav,
  IconButton,
  Avatar,
  Icon,
  Button,
  Input,
  Checkbox
} = NS;
function StatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 22px",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tabular"
  }, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 6,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "signal",
    size: 15
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "wifi",
    size: 15
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "battery-full",
    size: 17
  })));
}
function LoginScreen({
  onLogin
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: "0 24px",
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/app-icon.svg",
    width: "68",
    height: "68",
    alt: "Banritools",
    style: {
      borderRadius: 18
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 28,
      letterSpacing: "-0.01em",
      marginTop: 16,
      color: "var(--text)"
    }
  }, "banritools"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      marginTop: 4,
      fontSize: 15
    }
  }, "Sua produ\xE7\xE3o comercial, em um s\xF3 lugar.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Matr\xEDcula",
    defaultValue: "042715",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "user",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Senha",
    type: "password",
    defaultValue: "123456",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 16
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Usar biometria",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 14
    }
  }, "Esqueci a senha")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true,
    onClick: onLogin,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    })
  }, "Entrar"))), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: "center",
      color: "var(--text-subtle)",
      fontSize: 12,
      padding: "20px 0 28px"
    }
  }, "Banrisul \xB7 Plataforma interna \xB7 v3.0"));
}
const NAV = [{
  value: "inicio",
  label: "Início",
  icon: /*#__PURE__*/React.createElement(Icon, {
    name: "house",
    size: 22
  })
}, {
  value: "registrar",
  label: "Registrar",
  icon: /*#__PURE__*/React.createElement(Icon, {
    name: "square-pen",
    size: 22
  })
}, {
  value: "ranking",
  label: "Ranking",
  icon: /*#__PURE__*/React.createElement(Icon, {
    name: "trophy",
    size: 22
  })
}, {
  value: "metas",
  label: "Metas",
  icon: /*#__PURE__*/React.createElement(Icon, {
    name: "target",
    size: 22
  })
}, {
  value: "perfil",
  label: "Perfil",
  icon: /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 22
  })
}];
function App() {
  const [authed, setAuthed] = React.useState(false);
  const [tab, setTab] = React.useState("inicio");
  const [toast, setToast] = React.useState(false);
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);
  const logo = /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    width: "24",
    height: "24",
    alt: ""
  });
  function save() {
    setToast(true);
    setTimeout(() => setToast(false), 2600);
  }
  let screen = null;
  if (tab === "inicio") screen = /*#__PURE__*/React.createElement(DashboardScreen, {
    onGoMetas: () => setTab("metas")
  });else if (tab === "registrar") screen = /*#__PURE__*/React.createElement(RegistrarScreen, {
    onSave: save
  });else if (tab === "ranking") screen = /*#__PURE__*/React.createElement(RankingScreen, null);else if (tab === "metas") screen = /*#__PURE__*/React.createElement(MetasScreen, null);else screen = /*#__PURE__*/React.createElement(PerfilScreen, {
    onLogout: () => setAuthed(false)
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "phone dark"
  }, /*#__PURE__*/React.createElement(StatusBar, null), !authed ? /*#__PURE__*/React.createElement(LoginScreen, {
    onLogin: () => {
      setAuthed(true);
      setTab("inicio");
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AppBar, {
    logo: logo,
    leading: /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Menu"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "menu"
    })),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Buscar"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search"
    })), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Notifica\xE7\xF5es",
      className: "bt-appbar__dot"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bell"
    })), /*#__PURE__*/React.createElement(Avatar, {
      name: "Alessandro Becker",
      size: "sm"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    className: "phone__scroll"
  }, screen), tab === "registrar" && /*#__PURE__*/React.createElement("div", {
    className: "savebar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "center",
      marginBottom: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "savebar__pill"
  }, "1 produto"), /*#__PURE__*/React.createElement("span", {
    className: "savebar__pill"
  }, "R$ 50,00"), /*#__PURE__*/React.createElement("span", {
    className: "savebar__pill"
  }, "+2.550 pts")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    block: true,
    onClick: save,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "save",
      size: 18
    }),
    style: {
      background: "#fff",
      color: "var(--primary-700)",
      borderColor: "transparent"
    }
  }, "Salvar lan\xE7amento")), (tab === "inicio" || tab === "ranking") && /*#__PURE__*/React.createElement("button", {
    className: "bt-fab fab",
    "aria-label": "Novo lan\xE7amento",
    onClick: () => setTab("registrar")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 26
  })), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-icontile bt-icontile--success",
    style: {
      width: 32,
      height: 32
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18
  })), /*#__PURE__*/React.createElement("span", null, "Lan\xE7amento salvo \xB7 ", /*#__PURE__*/React.createElement("strong", null, "+2.550 pts"))), /*#__PURE__*/React.createElement(BottomNav, {
    value: tab,
    onChange: setTab,
    items: NAV
  })));
}
/* render removed for standalone */
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/consultor/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/consultor/screens.jsx
try { (() => {
/* Banritools — App do Consultor (mobile). Screens.
   Reads components from the DS namespace; exports screens to window. */
const NS = window.BanritoolsDesignSystem_38adfd;
const {
  AppBar,
  BottomNav,
  IconButton,
  Avatar,
  Icon,
  Card,
  Badge,
  Button,
  StatCard,
  RankRow,
  ListRow,
  ProgressBar,
  CurrencyBRL,
  Input,
  Select,
  Banner
} = NS;

/* ---------- shared bits ---------- */
function ScreenHeader({
  icon,
  iconColor = "brand",
  title,
  subtitle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      padding: "20px 20px 8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `bt-icontile bt-icontile--lg ${iconColor !== "brand" ? "bt-icontile--" + iconColor : ""}`
  }, icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      lineHeight: 1.1
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      marginTop: 4,
      fontSize: 16
    }
  }, subtitle)));
}
function SectionLabel({
  children,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 20px 10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, children), right);
}

/* ---------- Dashboard (Início) ---------- */
function DashboardScreen({
  onGoMetas
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "house",
      size: 24
    }),
    title: "In\xEDcio",
    subtitle: "Sua central de opera\xE7\xF5es"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bt-hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-hero__eyebrow"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 14
  }), " Resumo de hoje"), /*#__PURE__*/React.createElement("div", {
    className: "bt-hero__title"
  }, "Bom dia, Alessandro"), /*#__PURE__*/React.createElement("p", {
    className: "bt-hero__text"
  }, "Aqui est\xE1 sua situa\xE7\xE3o hoje e sua pr\xF3xima melhor a\xE7\xE3o."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      color: "rgba(255,255,255,.72)"
    }
  }, "Produ\xE7\xE3o de hoje"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 12,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 44,
      fontWeight: 700,
      color: "#fff",
      fontVariantNumeric: "tabular-nums"
    }
  }, "1"), /*#__PURE__*/React.createElement(Badge, {
    variant: "solid"
  }, "+2.550 pts"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      background: "rgba(14,110,59,.22)",
      border: "1px solid rgba(31,184,102,.35)",
      borderRadius: "var(--radius-lg)",
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      color: "var(--success-500)"
    }
  }, "Pr\xF3xima melhor a\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--success-500)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "bt-icontile bt-icontile--success"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 20,
      color: "#fff"
    }
  }, "Tudo em dia"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.78)",
      fontSize: 14,
      marginTop: 2
    }
  }, "Aproveite para revisar metas e novas oportunidades."), /*#__PURE__*/React.createElement("button", {
    onClick: onGoMetas,
    style: {
      marginTop: 10,
      background: "none",
      border: "none",
      color: "var(--success-500)",
      fontWeight: 700,
      fontSize: 15,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      padding: 0
    }
  }, "Ver metas ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 16
  }))))))), /*#__PURE__*/React.createElement(SectionLabel, {
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--text-muted)"
      }
    }, "3 lan\xE7amentos")
  }, "Sua performance no m\xEAs"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Pontos",
    value: "9.150",
    sub: "1\xBA lugar na ag\xEAncia",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "trophy",
      size: 20
    }),
    iconColor: "purple"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Produ\xE7\xE3o",
    value: /*#__PURE__*/React.createElement(CurrencyBRL, {
      value: 11050.5,
      positive: true
    }),
    sub: "Acumulado de junho",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "trending-up",
      size: 20
    }),
    iconColor: "success"
  })), /*#__PURE__*/React.createElement(SectionLabel, null, "\xDAltimos lan\xE7amentos"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement("span", {
      className: "bt-icontile bt-icontile--purple"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "shield",
      size: 18
    })),
    title: "Seguro Vida",
    subtitle: "Hoje \xB7 1 unidade",
    trailing: /*#__PURE__*/React.createElement(Badge, {
      variant: "brand"
    }, "+2.550")
  }), /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement("span", {
      className: "bt-icontile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "piggy-bank",
      size: 18
    })),
    title: "Capitaliza\xE7\xE3o",
    subtitle: "Ontem \xB7 3 unidades",
    trailing: /*#__PURE__*/React.createElement(Badge, {
      variant: "brand"
    }, "+60")
  }), /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement("span", {
      className: "bt-icontile bt-icontile--turquoise"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "credit-card",
      size: 18
    })),
    title: "Cheque Especial",
    subtitle: "12/06 \xB7 2 unidades",
    trailing: /*#__PURE__*/React.createElement(Badge, {
      variant: "brand"
    }, "+50")
  }))));
}

/* ---------- Registrar Produção ---------- */
const PRODUCTS = [{
  group: "Seguros",
  count: 2,
  items: [{
    name: "Seguro Vida",
    cat: "Seguros · Mixed",
    pts: "50 pts/unidade",
    filled: true,
    color: "purple",
    icon: "shield"
  }, {
    name: "Seguro Residencial",
    cat: "Seguros · Mixed",
    pts: "30 pts/unidade",
    filled: false,
    color: "purple",
    icon: "house-plug"
  }]
}, {
  group: "Crédito",
  count: 2,
  items: [{
    name: "Cheque Especial",
    cat: "Crédito · Mixed",
    pts: "25 pts/unidade",
    filled: false,
    color: "turquoise",
    icon: "credit-card"
  }, {
    name: "Crédito Minuto — Empréstimo Pessoal",
    cat: "Crédito · Mixed",
    pts: "40 pts/volume",
    filled: false,
    color: "turquoise",
    icon: "banknote"
  }]
}];
function ProductCard({
  p
}) {
  const [qty, setQty] = React.useState(p.filled ? "1" : "0");
  const [val, setVal] = React.useState(p.filled ? "50" : "");
  return /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: p.filled ? {
      borderColor: "var(--success-border)",
      boxShadow: "0 0 0 1px var(--success-border)"
    } : null
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 19,
      color: "var(--text)"
    }
  }, p.name), p.filled && /*#__PURE__*/React.createElement(Badge, {
    variant: "success",
    dot: true
  }, "Preenchido")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14,
      marginTop: 2
    }
  }, p.cat)), /*#__PURE__*/React.createElement(Badge, {
    variant: "neutral"
  }, p.pts)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Quantidade",
    inputMode: "numeric",
    value: qty,
    onChange: e => setQty(e.target.value)
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Valor (R$)",
    inputMode: "decimal",
    placeholder: "0,00",
    value: val,
    onChange: e => setVal(e.target.value),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "dollar-sign",
      size: 16
    })
  })));
}
function RegistrarScreen({
  onSave
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 140
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "square-pen",
      size: 24
    }),
    title: "Registrar Produ\xE7\xE3o",
    subtitle: "Lance suas vendas do dia em segundos"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 20px 0",
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 160px",
      minWidth: 160
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Data do lan\xE7amento",
    defaultValue: "hoje"
  }, /*#__PURE__*/React.createElement("option", {
    value: "hoje"
  }, "13/06/2026"), /*#__PURE__*/React.createElement("option", {
    value: "ontem"
  }, "12/06/2026"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      paddingTop: 22
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: "success",
    dot: true
  }, "1 preenchido"), /*#__PURE__*/React.createElement(Badge, {
    variant: "brand"
  }, "+2.550 pts"))), PRODUCTS.map(sec => /*#__PURE__*/React.createElement("div", {
    key: sec.group
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    right: sec.group === "Seguros" ? /*#__PURE__*/React.createElement(Badge, {
      variant: "success",
      dot: true
    }, "1 preenchido") : null
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "package",
    size: 15
  }), " ", sec.group, " \xB7 ", sec.count)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, sec.items.map(p => /*#__PURE__*/React.createElement(ProductCard, {
    key: p.name,
    p: p
  }))))));
}

/* ---------- Ranking ---------- */
function RankingScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "trophy",
      size: 24
    }),
    title: "Ranking",
    subtitle: "Sua evolu\xE7\xE3o em junho"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 14
  }), " Sua posi\xE7\xE3o"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 56,
      fontWeight: 700,
      color: "var(--text)",
      lineHeight: 1
    }
  }, "1\xBA"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 18
    }
  }, "de 18")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      marginTop: 8,
      fontSize: 16
    }
  }, "Voc\xEA est\xE1 liderando o m\xEAs. Continue no ritmo!"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: "brand",
    size: "md"
  }, "9.150 pts")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 14,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--text)"
    }
  }, "Sua evolu\xE7\xE3o vs. l\xEDder"), /*#__PURE__*/React.createElement("span", {
    className: "tabular",
    style: {
      color: "var(--text-muted)"
    }
  }, "9.150 / 9.150 pts")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: 100,
    variant: "gradient",
    label: "evolu\xE7\xE3o"
  })))), /*#__PURE__*/React.createElement(SectionLabel, null, "Classifica\xE7\xE3o \xB7 pontua\xE7\xE3o no m\xEAs"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement(RankRow, {
    position: 1,
    name: "Alessandro Becker",
    points: "9.150 pts",
    me: true,
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Alessandro Becker"
    }),
    tags: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Badge, {
      variant: "brand"
    }, "Voc\xEA"), /*#__PURE__*/React.createElement(Badge, {
      variant: "warning"
    }, "L\xEDder")),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 100,
      variant: "warning",
      label: "evolu\xE7\xE3o"
    })
  }), /*#__PURE__*/React.createElement(RankRow, {
    position: 2,
    name: "Marina Petry",
    points: "8.830 pts",
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Marina Petry",
      color: "purple"
    }),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 96,
      label: "evolu\xE7\xE3o"
    })
  }), /*#__PURE__*/React.createElement(RankRow, {
    position: 3,
    name: "Rafael Souza",
    points: "7.420 pts",
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Rafael Souza",
      color: "turquoise"
    }),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 81,
      label: "evolu\xE7\xE3o"
    })
  }), /*#__PURE__*/React.createElement(RankRow, {
    position: 4,
    name: "Juliana Lima",
    points: "6.180 pts",
    avatar: /*#__PURE__*/React.createElement(Avatar, {
      name: "Juliana Lima",
      color: "navy"
    }),
    progress: /*#__PURE__*/React.createElement(ProgressBar, {
      value: 67,
      label: "evolu\xE7\xE3o"
    })
  }))));
}

/* ---------- Metas ---------- */
function MetasScreen() {
  const metas = [{
    name: "Seguros",
    icon: "shield",
    color: "purple",
    cur: 5,
    goal: 8,
    pct: 62
  }, {
    name: "Capitalização",
    icon: "piggy-bank",
    color: "brand",
    cur: 12,
    goal: 12,
    pct: 100
  }, {
    name: "Crédito",
    icon: "credit-card",
    color: "turquoise",
    cur: 3,
    goal: 10,
    pct: 30
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "target",
      size: 24
    }),
    iconColor: "success",
    title: "Metas",
    subtitle: "Seu progresso de junho por categoria"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    tone: "info",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 18
    }),
    title: "Faltam 17 dias"
  }, "Mantendo o ritmo atual, voc\xEA bate 2 de 3 metas no m\xEAs.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 0",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, metas.map(m => /*#__PURE__*/React.createElement(Card, {
    key: m.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `bt-icontile ${m.color !== "brand" ? "bt-icontile--" + m.color : ""}`
  }, /*#__PURE__*/React.createElement(Icon, {
    name: m.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: "var(--text)"
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    className: "tabular",
    style: {
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, m.cur, " de ", m.goal, " unidades")), m.pct >= 100 ? /*#__PURE__*/React.createElement(Badge, {
    variant: "success",
    dot: true
  }, "Batida") : /*#__PURE__*/React.createElement(Badge, {
    variant: "neutral"
  }, m.pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: m.pct,
    variant: m.pct >= 100 ? "success" : "default",
    label: m.name
  }))))));
}

/* ---------- Perfil ---------- */
function PerfilScreen({
  onLogout
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "user",
      size: 24
    }),
    iconColor: "turquoise",
    title: "Perfil",
    subtitle: "Conta e prefer\xEAncias"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Alessandro Becker",
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 20,
      color: "var(--text)"
    }
  }, "Alessandro Becker"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-muted)",
      fontSize: 14
    }
  }, "Ag\xEAncia 0427 \xB7 Porto Alegre"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: "purple"
  }, "Consultor")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement("span", {
      className: "bt-icontile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bell",
      size: 18
    })),
    title: "Notifica\xE7\xF5es",
    trailing: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 18
    }),
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement("span", {
      className: "bt-icontile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "shield-check",
      size: 18
    })),
    title: "Seguran\xE7a",
    trailing: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 18
    }),
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement("span", {
      className: "bt-icontile"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-help",
      size: 18
    })),
    title: "Ajuda e suporte",
    trailing: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 18
    }),
    onClick: () => {}
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    block: true,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "log-out",
      size: 16
    }),
    onClick: onLogout
  }, "Sair")));
}
Object.assign(window, {
  DashboardScreen,
  RegistrarScreen,
  RankingScreen,
  MetasScreen,
  PerfilScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/consultor/screens.jsx", error: String((e && e.message) || e) }); }

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
