// ============================================================
// ADMIN AUDIT TRAIL (Module 48)
// ============================================================
//
// APPEND-ONLY in-session audit store. This is the prototype's
// backend-authoritative security record: mutation services write a
// row HERE, at the same boundary a real NestJS audit interceptor
// would write — AFTER the backend authorizes and performs the
// action. Nothing in this module edits, deletes, clears, or
// synthesizes events from UI clicks.
//
// The store starts EMPTY for a session and grows one row per real
// privileged action. No PRNG, no seed stories, no fabrication: a
// fresh session's audit log is legitimately empty until an admin
// actually performs an auditable action.
//
// IP address, user agent, request IDs and correlation IDs are NOT
// captured by any prototype store — those are documented backend
// gaps (see MODULE-48-BACKEND-GAPS.md), never placeholder columns.
// ============================================================

import {
  AdminAuditAction,
  AdminAuditEvent,
  AdminAuditEventActor,
  AdminAuditEventInput,
  AdminAuditMetrics,
  AdminAuditQuery,
  AdminAuditResourceType,
  AdminAuditSeverity,
  ListQuery,
  Paginated,
} from "@/types/admin";
import { applySearch, applySort, paginate } from "@/lib/admin/api";

/** Backend-assigned severity per action — the UI never computes it. */
export const ADMIN_AUDIT_SEVERITY: Record<AdminAuditAction, AdminAuditSeverity> = {
  USER_SUSPENDED: "high",
  USER_ACTIVATED: "medium",
  USER_DEACTIVATED: "high",
  USER_MARKED_PENDING: "medium",
  USER_PROFILE_UPDATED: "low",
  USER_STATE_RESET: "high",
  VENDOR_APPROVED: "medium",
  VENDOR_REJECTED: "medium",
  VENDOR_SUSPENDED: "high",
  VENDOR_ACTIVATED: "medium",
  VENDOR_DEACTIVATED: "high",
  FREELANCER_SUSPENDED: "high",
  FREELANCER_ACTIVATED: "medium",
  FREELANCER_DEACTIVATED: "high",
  FREELANCER_FEATURED: "low",
  FREELANCER_UNFEATURED: "low",
  EMPLOYER_SUSPENDED: "high",
  EMPLOYER_RESTORED: "medium",
  EMPLOYER_APPROVED: "medium",
  EMPLOYER_REJECTED: "medium",
  NOTIFICATION_SENT: "low",
};

/** Security-relevant subset highlighted by the security-event filter. */
export const ADMIN_SECURITY_EVENT_ACTIONS: ReadonlySet<AdminAuditAction> =
  new Set<AdminAuditAction>([
    "USER_SUSPENDED",
    "USER_DEACTIVATED",
    "USER_STATE_RESET",
    "VENDOR_SUSPENDED",
    "VENDOR_DEACTIVATED",
    "FREELANCER_SUSPENDED",
    "FREELANCER_DEACTIVATED",
    "EMPLOYER_SUSPENDED",
  ]);

/**
 * Fallback actor used when a mutation runs without an explicit session
 * actor (legacy flows / contract tests). Mirrors the identity the
 * underlying data layers already attribute ("Platform Admin").
 */
export const DEFAULT_ADMIN_ACTOR: AdminAuditEventActor = {
  type: "admin",
  id: "platform-admin",
  name: "Platform Admin",
};

const SEVERITY_RANK: Record<AdminAuditSeverity, number> = {
  informational: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const store: AdminAuditEvent[] = [];
let seq = 0;

export function recordAdminAuditEvent(input: AdminAuditEventInput): AdminAuditEvent {
  const event: AdminAuditEvent = {
    id: `aev-${++seq}`,
    at: input.at ?? new Date().toISOString(),
    action: input.action,
    actor: input.actor,
    resource: input.resource,
    result: input.result ?? "success",
    severity: input.severity ?? ADMIN_AUDIT_SEVERITY[input.action],
    metadata: input.metadata ?? {},
  };
  store.push(event);
  return event;
}

export function getAuditEventById(id: string): AdminAuditEvent | null {
  const row = store.find((e) => e.id === id);
  return row ? { ...row, metadata: { ...row.metadata } } : null;
}

function splitOf(v: string | undefined): string | undefined {
  return v && v !== "all" ? v : undefined;
}

function inDateRange(isoDate: string, from?: string, to?: string): boolean {
  const t = new Date(isoDate).getTime();
  if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && t > new Date(`${to}T23:59:59`).getTime()) return false;
  return true;
}

export function filterAuditEvents(query: AdminAuditQuery = {}): Paginated<AdminAuditEvent> {
  const {
    search,
    actorId,
    action,
    resourceType,
    result,
    severity,
    dateFrom,
    dateTo,
    securityOnly,
    sortBy,
    sortDir = "desc",
    page,
    pageSize,
  } = query;

  const actorMatch = splitOf(actorId);
  const actionMatch = splitOf(action);
  const resourceMatch = splitOf(resourceType) as AdminAuditResourceType | undefined;
  const resultMatch = splitOf(result);
  const severityMatch = splitOf(severity) as AdminAuditSeverity | undefined;

  let rows = store.filter((e) => {
    if (securityOnly && !ADMIN_SECURITY_EVENT_ACTIONS.has(e.action)) return false;
    if (actorMatch && e.actor.id !== actorMatch) return false;
    if (actionMatch && e.action !== actionMatch) return false;
    if (resourceMatch && e.resource.type !== resourceMatch) return false;
    if (resultMatch && e.result !== resultMatch) return false;
    if (severityMatch && e.severity !== severityMatch) return false;
    if (!inDateRange(e.at, dateFrom, dateTo)) return false;
    return true;
  });

  rows = applySearch(rows, search, (e) => [
    e.id,
    e.action,
    e.actor.name,
    e.resource.id,
    e.resource.label ?? "",
  ]);

  rows = applySort(
    rows,
    sortBy,
    sortDir,
    {
      at: (e) => new Date(e.at).getTime(),
      severity: (e) => SEVERITY_RANK[e.severity],
      action: (e) => e.action,
      actor: (e) => e.actor.name.toLowerCase(),
      resource: (e) => `${e.resource.type}:${e.resource.id}`,
    },
    "at"
  );

  return paginate(rows, { page, pageSize } as ListQuery);
}

export function buildAuditMetrics(): AdminAuditMetrics {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  let total = 0;
  let todayCount = 0;
  let highSeverity = 0;
  let securityEvents = 0;
  let failed = 0;
  let denied = 0;

  for (const e of store) {
    total += 1;
    if (e.at.slice(0, 10) === today) todayCount += 1;
    if (e.severity === "high" || e.severity === "critical") highSeverity += 1;
    if (ADMIN_SECURITY_EVENT_ACTIONS.has(e.action)) securityEvents += 1;
    if (e.result === "failed") failed += 1;
    if (e.result === "denied") denied += 1;
  }

  return { total, today: todayCount, highSeverity, securityEvents, failed, denied };
}

export function getAuditActorOptions(): AdminAuditEventActor[] {
  const seen = new Map<string, AdminAuditEventActor>();
  for (const e of store) {
    const key = e.actor.id;
    if (!seen.has(key)) {
      seen.set(key, { type: e.actor.type, id: e.actor.id, name: e.actor.name, role: e.actor.role });
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Test/restart hook — SAFE because the trail is an in-session artifact, not persisted evidence. */
export function resetAdminAuditTrail(): void {
  store.length = 0;
  seq = 0;
}