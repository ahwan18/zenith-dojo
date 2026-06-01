"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { AuthRedirectHandler } from "@/features/auth";
import { queryClient } from "@/lib/queryClient";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthRedirectHandler />
      {children}
    </QueryClientProvider>
  );
}
