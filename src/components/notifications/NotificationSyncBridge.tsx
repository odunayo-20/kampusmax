"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { subscribeToNotificationChanges } from "@/data/notifications";
import { notificationKeys } from "@/lib/query-keys";

/**
 * Bridges the authoritative in-memory notification store to the TanStack
 * Query cache. Because there is no backend push channel (WebSockets/SSE not
 * supported), the store's mutation events are the freshness signal — any
 * push/read/delete through the notification services invalidates the whole
 * notification key tree, so badges, dropdowns and the center stay in sync
 * without polling.
 *
 * Rendering null; it is mounted once at the app root.
 */
export function NotificationSyncBridge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const signedInUserRef = useRef<string | null>(userId);

  useEffect(() => {
    return subscribeToNotificationChanges(() => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });
  }, [queryClient]);

  // Scrub the previous user's notification cache the moment the session
  // changes so data can never leak across accounts.
  useEffect(() => {
    const previous = signedInUserRef.current;
    signedInUserRef.current = userId;
    if (previous !== userId) {
      queryClient.removeQueries({ queryKey: notificationKeys.all });
    }
  }, [userId, queryClient]);

  return null;
}