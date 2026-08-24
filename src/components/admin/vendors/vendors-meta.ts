import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedVendor,
  VendorActivityKind,
  VendorBucket,
  VendorDocState,
  VendorStoreLifecycle,
  VendorVerificationStatus,
} from "@/types/admin";

// ------------------------------------------------------------
// LABELS
// ------------------------------------------------------------

export const VERIFICATION_LABELS: Record<VendorVerificationStatus, string> = {
  pending_verification: "Pending verification",
  verified: "Verified",
  rejected: "Rejected",
};

export const STORE_STATUS_LABELS: Record<VendorStoreLifecycle, string> = {
  active: "Active",
  suspended: "Suspended",
  deactivated: "Deactivated",
};

/** Console buckets shown as tabs - collapse both lifecycle axes. */
export const VENDOR_QUEUE_LABELS: Record<
  VendorBucket | "all",
  string
> = {
  all: "All vendors",
  pending_verification: "Pending verification",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
  deactivated: "Deactivated",
};

export const VENDOR_ACTIVITY_LABELS: Record<VendorActivityKind, string> = {
  order: "Commerce",
  product: "Catalog",
  wallet: "Wallet",
  moderation: "Moderation",
  admin: "Admin actions",
  auth: "Account",
};

export function verificationLabel(status: VendorVerificationStatus): string {
  return VERIFICATION_LABELS[status] ?? status.replace(/_/g, " ");
}

export function storeStatusLabel(status: VendorStoreLifecycle): string {
  return STORE_STATUS_LABELS[status] ?? status;
}

// ------------------------------------------------------------
// BADGE VARIANTS
// ------------------------------------------------------------

export function verificationBadgeVariant(
  status: VendorVerificationStatus
): BadgeVariant {
  switch (status) {
    case "verified":
      return "success";
    case "pending_verification":
      return "warning";
    case "rejected":
      return "error";
  }
}

export function storeStatusBadgeVariant(
  status: VendorStoreLifecycle
): BadgeVariant {
  switch (status) {
    case "active":
      return "success";
    case "suspended":
      return "warning";
    case "deactivated":
      return "neutral";
  }
}

export function docStateBadgeVariant(state: VendorDocState): BadgeVariant {
  switch (state) {
    case "approved":
      return "success";
    case "submitted":
      return "info";
    case "rejected":
      return "error";
    case "missing":
      return "neutral";
  }
}

// ------------------------------------------------------------
// ACTION AVAILABILITY (mirrors future API-side policy)
// ------------------------------------------------------------

export interface VendorActionAvailability {
  canApprove: boolean;
  canReject: boolean;
  canReviewVerification: boolean;
  canSuspend: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canViewStorefront: boolean;
}

export function getVendorActionAvailability(
  vendor: Pick<ManagedVendor, "verificationStatus" | "storeStatus">
): VendorActionAvailability {
  const { verificationStatus, storeStatus } = vendor;
  return {
    canApprove: verificationStatus === "pending_verification",
    canReject: verificationStatus === "pending_verification",
    canReviewVerification:
      verificationStatus === "pending_verification" ||
      verificationStatus === "rejected",
    canSuspend: verificationStatus === "verified" && storeStatus === "active",
    canActivate:
      verificationStatus === "verified" && storeStatus !== "active",
    canDeactivate:
      verificationStatus === "verified" && storeStatus === "active",
    canViewStorefront: verificationStatus === "verified",
  };
}
