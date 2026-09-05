"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { subscribeToConversationChanges } from "@/data/conversations";
import { messageKeys } from "@/lib/query-keys";

/**
 * Bridges the authoritative in-memory messaging store to the TanStack Query
 * cache. There is no backend push channel (WebSockets/SSE not supported), so
 * store mutation events (send, mark-as-read) are the freshness signal — they
 * invalidate the whole messaging key tree and badges, lists and threads
 * refresh together without polling.
 *
 * When a future real-time channel ships, the same key invalidation is
 * triggered by inbound push events instead of store mutations.
 *
 * Renders null; mounted once at the app root.
 */
export function MessageSyncBridge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const signedInUserRef = useRef<string | null>(userId);

  useEffect(() => {
    return subscribeToConversationChanges(() => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    });
  }, [queryClient]);

  // Scrub the previous user's messaging cache the moment the session
  // changes so private conversations and drafts can never leak across
  // accounts.
  useEffect(() => {
    const previous = signedInUserRef.current;
    signedInUserRef.current = userId;
    if (previous !== userId) {
      queryClient.removeQueries({ queryKey: messageKeys.all });
    }
  }, [userId, queryClient]);

  return null;
}