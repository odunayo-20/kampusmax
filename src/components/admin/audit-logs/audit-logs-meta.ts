import {
  BadgeCheck,
  Ban,
  Building2,
  EyeOff,
  FileClock,
  Headphones,
  Mail,
  Megaphone,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  User,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { BadgeVariant } from "@/components/admin/StatusBadge";
import {
  ADMIN_AUDIT_SEVERITY,
  ADMIN_SECURITY_EVENT_ACTIONS,
} from "@/data/admin/audit-trail";
import type {
  AdminAuditAction,
  AdminAuditEvent,
  AdminAuditResourceType,
  AdminAuditResult,
  AdminAuditSeverity,
} from "@/types/admin";

// ------------------------------------------------------------
// ACTIONS (canonical vocabulary — mirrors the backend enum)
// ------------------------------------------------------------

export const AUDIT_ACTION_LABELS: Record<AdminAuditAction, string> = {
  USER_SUSPENDED: "Suspended user",
  USER_ACTIVATED: "Activated user",
  USER_DEACTIVATED: "Deactivated user",
  USER_MARKED_PENDING: "Marked user pending",
  USER_PROFILE_UPDATED: "Updated user profile",
  USER_STATE_RESET: "Reset user state",
  VENDOR_APPROVED: "Approved vendor",
  VENDOR_REJECTED: "Rejected vendor",
  VENDOR_SUSPENDED: "Suspended vendor",
  VENDOR_ACTIVATED: "Activated vendor",
  VENDOR_DEACTIVATED: "Deactivated vendor",
  FREELANCER_SUSPENDED: "Suspended freelancer",
  FREELANCER_ACTIVATED: "Activated freelancer",
  FREELANCER_DEACTIVATED: "Deactivated freelancer",
  FREELANCER_FEATURED: "Featured freelancer",
  FREELANCER_UNFEATURED: "Unfeatured freelancer",
  EMPLOYER_SUSPENDED: "Suspended employer",
  EMPLOYER_RESTORED: "Restored employer",
  EMPLOYER_APPROVED: "Approved employer",
  EMPLOYER_REJECTED: "Rejected employer",
  NOTIFICATION_SENT: "Sent notification",
  SUPPORT_TICKET_ASSIGNED: "Assigned support ticket",
  SUPPORT_TICKET_STATUS_CHANGED: "Changed ticket status",
  SUPPORT_TICKET_PRIORITY_CHANGED: "Changed ticket priority",
  SUPPORT_TICKET_RESPONDED: "Replied to ticket",
  SUPPORT_TICKET_NOTE_ADDED: "Added internal note",
  SUPPORT_TICKET_ESCALATED: "Escalated support ticket",
  SUPPORT_TICKET_REOPENED: "Reopened support ticket",
};

export function auditActionLabel(action: AdminAuditAction): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export const AUDIT_ACTION_ICONS: Record<AdminAuditAction, LucideIcon> = {
  USER_SUSPENDED: Ban,
  USER_ACTIVATED: ShieldCheck,
  USER_DEACTIVATED: EyeOff,
  USER_MARKED_PENDING: FileClock,
  USER_PROFILE_UPDATED: Pencil,
  USER_STATE_RESET: RotateCcw,
  VENDOR_APPROVED: BadgeCheck,
  VENDOR_REJECTED: XCircle,
  VENDOR_SUSPENDED: Ban,
  VENDOR_ACTIVATED: Store,
  VENDOR_DEACTIVATED: EyeOff,
  FREELANCER_SUSPENDED: Ban,
  FREELANCER_ACTIVATED: ShieldCheck,
  FREELANCER_DEACTIVATED: EyeOff,
  FREELANCER_FEATURED: Sparkles,
  FREELANCER_UNFEATURED: Star,
  EMPLOYER_SUSPENDED: Ban,
  EMPLOYER_RESTORED: RotateCcw,
  EMPLOYER_APPROVED: BadgeCheck,
  EMPLOYER_REJECTED: XCircle,
  NOTIFICATION_SENT: Megaphone,
  SUPPORT_TICKET_ASSIGNED: User,
  SUPPORT_TICKET_STATUS_CHANGED: Pencil,
  SUPPORT_TICKET_PRIORITY_CHANGED: Star,
  SUPPORT_TICKET_RESPONDED: Mail,
  SUPPORT_TICKET_NOTE_ADDED: FileClock,
  SUPPORT_TICKET_ESCALATED: ShieldCheck,
  SUPPORT_TICKET_REOPENED: RotateCcw,
};

const SEVERITY_VARIANT: Record<AdminAuditSeverity, BadgeVariant> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "blue",
  informational: "neutral",
};

function severityVariant(severity: AdminAuditSeverity): BadgeVariant {
  return SEVERITY_VARIANT[severity] ?? "blue";
}

/** Badge color reflects the backend-assigned severity of the action. */
export function auditActionVariant(action: AdminAuditAction): BadgeVariant {
  return severityVariant(ADMIN_AUDIT_SEVERITY[action] ?? "low");
}

export const AUDIT_ACTION_FILTER_ORDER: AdminAuditAction[] = [
  "USER_SUSPENDED",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "USER_MARKED_PENDING",
  "USER_PROFILE_UPDATED",
  "USER_STATE_RESET",
  "VENDOR_APPROVED",
  "VENDOR_REJECTED",
  "VENDOR_SUSPENDED",
  "VENDOR_ACTIVATED",
  "VENDOR_DEACTIVATED",
  "FREELANCER_SUSPENDED",
  "FREELANCER_ACTIVATED",
  "FREELANCER_DEACTIVATED",
  "FREELANCER_FEATURED",
  "FREELANCER_UNFEATURED",
  "EMPLOYER_SUSPENDED",
  "EMPLOYER_RESTORED",
  "EMPLOYER_APPROVED",
  "EMPLOYER_REJECTED",
  "NOTIFICATION_SENT",
  "SUPPORT_TICKET_ASSIGNED",
  "SUPPORT_TICKET_STATUS_CHANGED",
  "SUPPORT_TICKET_PRIORITY_CHANGED",
  "SUPPORT_TICKET_RESPONDED",
  "SUPPORT_TICKET_NOTE_ADDED",
  "SUPPORT_TICKET_ESCALATED",
  "SUPPORT_TICKET_REOPENED",
];

/** True for actions the backend classifies as security-sensitive events. */
export function isSecurityAction(action: AdminAuditAction): boolean {
  return ADMIN_SECURITY_EVENT_ACTIONS.has(action);
}

// ------------------------------------------------------------
// RESOURCES
// ------------------------------------------------------------

export const AUDIT_RESOURCE_LABELS: Record<AdminAuditResourceType, string> = {
  user: "User",
  vendor: "Vendor",
  freelancer: "Freelancer",
  employer: "Employer",
  notification: "Notification",
  ticket: "Support ticket",
};

export function auditResourceLabel(resource: AdminAuditResourceType): string {
  return AUDIT_RESOURCE_LABELS[resource] ?? resource;
}

export const AUDIT_RESOURCE_ICONS: Record<AdminAuditResourceType, LucideIcon> = {
  user: User,
  vendor: Store,
  freelancer: Users,
  employer: Building2,
  notification: Megaphone,
  ticket: Headphones,
};

export const AUDIT_RESOURCE_FILTER_ORDER: AdminAuditResourceType[] = [
  "user",
  "vendor",
  "freelancer",
  "employer",
  "notification",
  "ticket",
];

// ------------------------------------------------------------
// RESULTS & SEVERITY
// ------------------------------------------------------------

export const AUDIT_RESULT_LABELS: Record<AdminAuditResult, string> = {
  success: "Success",
  failed: "Failed",
  denied: "Denied",
};

export function auditResultVariant(result: AdminAuditResult): BadgeVariant {
  switch (result) {
    case "success":
      return "success";
    case "failed":
      return "warning";
    default:
      return "error"; // denied
  }
}

// ------------------------------------------------------------
// HUMAN-READABLE SUMMARY
// ------------------------------------------------------------

const STATUS_WORDS: Record<string, string> = {
  active: "active",
  suspended: "suspended",
  pending_verification: "pending verification",
  deactivated: "deactivated",
  rejected: "rejected",
  approved: "approved",
  verified: "verified",
  featured: "featured",
  not_featured: "not featured",
};

function sanitizeFragment(value?: string): string | null {
  if (!value) return null;
  const text = value.trim();
  if (!text) return null;
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

/**
 * One-line, plain-text summary of an audit event built only from
 * allowlisted fields. Used in table rows and mobile cards. Never
 * interpolates raw user-provided strings beyond the label, which is
 * rendered as plain text (React escapes it).
 */
export function auditEventSummary(event: AdminAuditEvent): string {
  const action = auditActionLabel(event.action);
  const target = event.resource.label
    ? `${event.resource.label} (${event.resource.id})`
    : event.resource.id;
  let out = `${action} — ${target}`;

  const reason = sanitizeFragment(event.metadata?.reason);
  if (reason) out += ` · ${reason}`;

  const prev = event.metadata?.previousStatus;
  const next = event.metadata?.newStatus;
  if (prev && next) {
    out += ` · ${STATUS_WORDS[prev] ?? prev} → ${STATUS_WORDS[next] ?? next}`;
  }
  return out;
}

export function auditSeverityLabel(severity: AdminAuditSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}