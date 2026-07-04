import * as React from "react";

export interface RankRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 1-based standing. 1/2/3 get medal tints. */
  position: number;
  /** Participant name (Exo 2). */
  name: string;
  /** Points string, e.g. "9.150 pts" (use tabular-nums). */
  points: React.ReactNode;
  /** Optional <Avatar />. */
  avatar?: React.ReactNode;
  /** Optional tag nodes (e.g. <Badge>Você</Badge>). */
  tags?: React.ReactNode;
  /** Highlight as the current user's row. */
  me?: boolean;
  /** Optional <ProgressBar /> rendered under the name. */
  progress?: React.ReactNode;
}

/**
 * @startingPoint section="Data" subtitle="Ranking / leaderboard row" viewport="700x150"
 * Leaderboard row with medal positions, avatar, tags and progress.
 */
export function RankRow(props: RankRowProps): JSX.Element;
