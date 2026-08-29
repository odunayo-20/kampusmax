"use client";

import { useEffect, useRef } from "react";

export function useUnsavedChangesWarning(isDirty: boolean, message?: string) {
  const messageRef = useRef(message);
  messageRef.current = message;

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const msg = messageRef.current || "You have unsaved changes. Are you sure you want to leave?";
      e.returnValue = msg;
      return msg;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handleRouteChange = () => {
      if (!window.confirm(messageRef.current || "You have unsaved changes. Are you sure you want to leave?")) {
        // Note: In Next.js App Router, we can't fully prevent navigation from here
        // but the beforeunload will catch browser-level navigation
        return false;
      }
      return true;
    };

    // Listen for Next.js router events (if available)
    // This is a best-effort approach for SPA navigation
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, [isDirty]);
}