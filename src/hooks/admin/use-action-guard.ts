"use client";

// ------------------------------------------------------------
// ACTION GUARD (Module 52)
//
// Some admin actions (activate, approve, reject...) fire off a
// mutation without a confirm dialog, so a double-click can submit the
// same operation twice and produce duplicate side effects (e.g. two
// audit entries, two toasts). The guard de-duplicates an in-flight
// operation by key: the second concurrent call returns null instead of
// re-firing.
//
// `createActionGuard` is the framework-agnostic core so the dedupe
// rules can be unit-tested; `useActionGuard` wires it into a hook.
// UI-level loading feedback is handled separately via each mutation's
// own isPending state; this is a defensive boundary on the handler.
// ------------------------------------------------------------

import { useRef } from "react";

export interface ActionGuard {
  isInflight: (key: string) => boolean;
  runExclusive: <T>(key: string, fn: () => Promise<T>) => Promise<T | null>;
}

export function createActionGuard(): ActionGuard {
  const inflight = new Set<string>();
  return {
    isInflight: (key) => inflight.has(key),
    runExclusive: async (key, fn) => {
      if (inflight.has(key)) return null;
      inflight.add(key);
      try {
        return await fn();
      } finally {
        inflight.delete(key);
      }
    },
  };
}

export function useActionGuard(): ActionGuard {
  const guard = useRef<ActionGuard | null>(null);
  if (!guard.current) guard.current = createActionGuard();
  return guard.current;
}