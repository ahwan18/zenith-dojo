/** 5-segment bar for accuracy (94% → 4 lit in Figma). */
export function accuracySegmentFill5(accuracyPercent: number): number {
  if (accuracyPercent <= 0) return 0;
  return Math.min(5, Math.floor((accuracyPercent + 4) / 20));
}

/** 5-segment bar for max combo (maps streak into ~0–5 lit segments). */
export function comboSegmentFill5(bestStreak: number): number {
  if (bestStreak <= 0) return 0;
  return Math.min(5, Math.max(0, Math.round(bestStreak / 14)));
}

/** Cosmetic leaderboard rank # (lower is “better” in this mock). */
export function sessionDisplayRank(score: number, hits: number): number {
  const base = 999 - Math.min(850, Math.floor(score / 120) + hits * 2);
  return Math.max(101, Math.min(999, base));
}

/** Teal badge copy under rank (no real ladder yet). */
export function sessionRankDeltaLabel(accuracyPercent: number, bestStreak: number): string {
  if (accuracyPercent >= 85 && bestStreak >= 8) return "2 RANK HIGHER";
  if (accuracyPercent >= 70 || bestStreak >= 5) return "1 RANK HIGHER";
  return "ON TRACK";
}
