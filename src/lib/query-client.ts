"use client";

import { QueryClient, QueryClientConfig } from "@tanstack/react-query";

/**
 * Exponential backoff for retried queries:
 * 1s, 2s, 4s, ... capped at 8s.
 */
const RETRY_BACKOFF_HANDLER = (attempt: number) =>
  Math.min(1000 * 2 ** attempt, 8000);

/**
 * Kampmax-wide TanStack Query defaults.
 *
 * Sensible, non-aggressive defaults: notifications and other feeds are
 * cached for 30s, refetch on window focus/reconnect, and are never polled.
 * Readers are never retried on failure; writers are never auto-retried
 * (a retried mutation would duplicate the side effect).
 */
export const QUERY_CLIENT_DEFAULTS: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      retryDelay: RETRY_BACKOFF_HANDLER,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
};

/**
 * Creates the single QueryClient instance for the app. Consumed exactly once
 * by `<Providers>` (via useState) so the instance survives re-renders without
 * leaking cached user data across SSR requests.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(QUERY_CLIENT_DEFAULTS);
}