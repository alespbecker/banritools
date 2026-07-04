import React from "react";

/**
 * Dialog — modal overlay. Renders nothing when `open` is false.
 * Provide `title`, body children, and a `footer` (usually buttons).
 */
export function Dialog({
  open = false,
  title,
  onClose,
  footer = null,
  closeOnOverlay = true,
  children,
  ...rest
}) {
  if (!open) return null;
  return (
    <div
      className="bt-dialog-overlay"
      onClick={closeOnOverlay && onClose ? onClose : undefined}
    >
      <div
        className="bt-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        <div className="bt-dialog__head">
          <span className="bt-dialog__title">{title}</span>
          {onClose && (
            <button type="button" className="bt-iconbtn bt-iconbtn--sm" aria-label="Fechar" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div className="bt-dialog__body">{children}</div>
        {footer && <div className="bt-dialog__foot">{footer}</div>}
      </div>
    </div>
  );
}
