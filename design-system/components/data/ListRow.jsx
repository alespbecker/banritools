import React from "react";

/**
 * ListRow — generic list item: leading icon/avatar, title + subtitle,
 * trailing content. Becomes a button when `onClick` is given.
 */
export function ListRow({
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
  return (
    <Tag
      className={`bt-listrow ${isButton ? "bt-listrow--button" : ""} ${className}`.trim()}
      onClick={onClick}
      type={isButton ? "button" : undefined}
      {...rest}
    >
      {leading}
      <div className="bt-listrow__body">
        <div className="bt-listrow__title">{title}</div>
        {subtitle && <div className="bt-listrow__sub">{subtitle}</div>}
      </div>
      {trailing && <div className="bt-listrow__trail">{trailing}</div>}
    </Tag>
  );
}
