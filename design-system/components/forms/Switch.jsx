import React from "react";

/**
 * Switch — on/off toggle. Label sits to the right of the track.
 */
export function Switch({ label, className = "", ...rest }) {
  return (
    <label className={`bt-switch ${className}`.trim()}>
      <input type="checkbox" role="switch" {...rest} />
      <span className="bt-switch__track" />
      {label && <span>{label}</span>}
    </label>
  );
}
