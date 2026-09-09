import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedFreelancer,
  FreelancerActivityKind,
  FreelancerBucket,
  FreelancerConsoleStatus,
} from "@/types/admin";

// ------------------------------------------------------------
// LABELS
// ------------------------------------------------------------

export const FREELANCER_STATUS_LABELS: Record<FreelancerConsoleStatus, string> = {
  approved: "Approved",
  pending_review: "Pending review",
  suspended: "Suspended",
  rejected: "Rejected",
};

/** Console buckets shown as tabs. */
export const FREELANCER_QUEUE_LABELS: Record<FreelancerBucket | "all", string> = {
  all: "All freelancers",
  approved: "Approved",
  pending_review: "Pending review",
  suspended: "Suspended",
  rejected: "Rejected",
};

export const FREELANCER_ACTIVITY_LABELS: Record<FreelancerActivityKind, string> = {
  service: "Services",
  booking: "Bookings",
  review: "Reviews",
  verification: "Verification",
  profile: "Profile",
  admin: "Admin actions",
  auth: "Account",
};

export function freelancerStatusLabel(status: FreelancerConsoleStatus): string {
  return FREELANCER_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

// ------------------------------------------------------------
// BADGE VARIANTS
// ------------------------------------------------------------

export function freelancerStatusBadgeVariant(
  status: FreelancerConsoleStatus
): BadgeVariant {
  switch (status) {
    case "approved":
      return "success";
    case "pending_review":
      return "warning";
    case "suspended":
      return "error";
    case "rejected":
      return "neutral";
  }
}

// ------------------------------------------------------------
// ACTION AVAILABILITY
// ------------------------------------------------------------

export interface FreelancerActionAvailability {
  canSuspend: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canFeature: boolean;
  canUnfeature: boolean;
}

export function getFreelancerActionAvailability(
  freelancer: ManagedFreelancer
): FreelancerActionAvailability {
  return {
    canSuspend: freelancer.status === "approved",
    canActivate: freelancer.status === "suspended" || freelancer.status === "pending_review",
    canDeactivate: freelancer.status === "approved" || freelancer.status === "pending_review",
    canFeature: freelancer.status === "approved" && !freelancer.featured,
    canUnfeature: freelancer.status === "approved" && freelancer.featured,
  };
}