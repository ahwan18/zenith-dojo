import type { ReactElement } from "react";

import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

export function LeaderboardPlaceholder(): ReactElement {
  return (
    <EmptyState
      title="Leaderboard not connected"
      message="Firestore integration will supply top scores here."
    />
  );
}

