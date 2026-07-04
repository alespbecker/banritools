import React from "react";

/**
 * RankRow — one row in a ranking / leaderboard: position medal, avatar,
 * name, points, optional tags ("Você", "Líder") and an optional progress bar.
 */
export function RankRow({
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
  return (
    <div className={`bt-rankrow ${me ? "bt-rankrow--me" : ""} ${className}`.trim()} {...rest}>
      <span className={`bt-rankrow__pos ${posCls}`.trim()}>{position}</span>
      {avatar}
      <div className="bt-rankrow__body">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="bt-rankrow__name">{name}</span>
          {tags}
        </div>
        <span className="bt-rankrow__pts">{points}</span>
        {progress != null && (
          <div className="bt-rankrow__bar">{progress}</div>
        )}
      </div>
    </div>
  );
}
