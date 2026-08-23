import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  CampusActivityKind,
  CampusAdminAssignment,
  CampusStatus,
  ManagedCampus,
} from "@/types/admin";

// ------------------------------------------------------------
// LABELS
// ------------------------------------------------------------

export const CAMPUS_STATUS_LABELS: Record<CampusStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const CAMPUS_ACTIVITY_LABELS: Record<CampusActivityKind, string> = {
  order: "Commerce",
  vendor: "Vendors",
  user: "Students",
  listing: "Catalog",
  moderation: "Trust & Safety",
  admin: "Admin actions",
};

export function campusStatusLabel(status: CampusStatus): string {
  return CAMPUS_STATUS_LABELS[status] ?? status;
}

// ------------------------------------------------------------
// BADGE VARIANTS
// ------------------------------------------------------------

export function campusStatusBadgeVariant(status: CampusStatus): BadgeVariant {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "neutral";
  }
}

export function assignmentStatusBadgeVariant(
  status: CampusAdminAssignment["status"]
): BadgeVariant {
  return status === "active" ? "success" : "info";
}

// ------------------------------------------------------------
// AVATARS (logo tile fallback = shortName monogram)
// ------------------------------------------------------------

const LOGO_TINTS = [
  "bg-kampmax-blue/15 text-kampmax-blue",
  "bg-kampmax-gold/20 text-kampmax-gold-dark",
  "bg-kampmax-success/10 text-kampmax-success",
  "bg-kampmax-info/10 text-kampmax-info",
  "bg-rose-100 text-rose-600",
  "bg-violet-100 text-violet-600",
];

export function logoTint(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return LOGO_TINTS[hash % LOGO_TINTS.length];
}

// ------------------------------------------------------------
// ACTION AVAILABILITY (mirrors future API-side policy)
// ------------------------------------------------------------

export interface CampusActionAvailability {
  canActivate: boolean;
  canDeactivate: boolean;
  canAssignAdmin: boolean;
  canRemoveAdmin: boolean;
}

export function getCampusActionAvailability(
  campus: Pick<ManagedCampus, "status" | "admins">
): CampusActionAvailability {
  return {
    canActivate: campus.status !== "active",
    canDeactivate: campus.status === "active",
    canAssignAdmin: true,
    canRemoveAdmin: campus.admins.length > 0,
  };
}
