"use client";

import { useEffect } from "react";

import { ErrorState } from "@/shared/components/ErrorState/ErrorState";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Intentionally no console.log; this is where Sentry capture would go later.
    void error;
  }, [error]);

  return <ErrorState title="Something went wrong" message={error.message} onRetry={reset} />;
}

