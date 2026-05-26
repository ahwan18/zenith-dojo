import type { ReactElement } from "react";

import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

export function SessionSummaryPlaceholder(): ReactElement {
  return (
    <EmptyState
      title="No session stats yet"
      message="Session persistence and metrics will be wired in later."
    />
  );
}

