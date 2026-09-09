import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedVerificationApplicantType,
  ManagedVerificationSortField,
  ManagedVerificationStatus,
  ManagedVerificationType,
} from "@/types/admin";

// ------------------------------------------------------------
// STATUS TABS
// ------------------------------------------------------------

export const VERIFICATION_STATUS_TABS: (ManagedVerificationStatus | "all")[] = [
  "all",
  "awaiting_review",
  "verified",
  "rejected",
  "action_required",
];

export const VERIFICATION_STATUS_LABELS: Record<ManagedVerificationStatus, string> = {
  awaiting_review: "Awaiting review",
  verified: "Verified",
  rejected: "Rejected",
  action_required: "Action required",
};

export function verificationStatusLabel(status: ManagedVerificationStatus): string {
  return VERIFICATION_STATUS_LABELS[status] ?? status;
}

export const VERIFICATION_STATUS_DOTS: Record<ManagedVerificationStatus, string> = {
  awaiting_review: "bg-kampmax-info",
  verified: "bg-kampmax-success",
  rejected: "bg-kampmax-error",
  action_required: "bg-kampmax-warning",
};

export function verificationStatusVariant(status: ManagedVerificationStatus): BadgeVariant {
  switch (status) {
    case "awaiting_review":
      return "info";
    case "verified":
      return "success";
    case "rejected":
      return "error";
    case "action_required":
      return "warning";
  }
}

// ------------------------------------------------------------
// APPLICANT TYPE
// ------------------------------------------------------------

export const APPLICANT_TYPE_OPTIONS: (ManagedVerificationApplicantType | "all")[] = [
  "all",
  "vendor",
  "freelancer",
  "employer",
];

export const APPLICANT_TYPE_LABELS: Record<ManagedVerificationApplicantType, string> = {
  vendor: "Vendor",
  freelancer: "Freelancer",
  employer: "Employer",
};

export function applicantTypeLabel(type: ManagedVerificationApplicantType): string {
  return APPLICANT_TYPE_LABELS[type] ?? type;
}

export function applicantTypeVariant(type: ManagedVerificationApplicantType): BadgeVariant {
  switch (type) {
    case "vendor":
      return "gold";
    case "freelancer":
      return "blue";
    case "employer":
      return "info";
  }
}

// ------------------------------------------------------------
// VERIFICATION TYPE
// ------------------------------------------------------------

export const VERIFICATION_TYPE_OPTIONS: (ManagedVerificationType | "all")[] = [
  "all",
  "identity",
  "business",
  "address",
  "email",
  "professional",
];

export const VERIFICATION_TYPE_LABELS: Record<ManagedVerificationType, string> = {
  identity: "Identity",
  business: "Business",
  address: "Address",
  email: "Email",
  professional: "Professional",
};

export function verificationTypeLabel(type: ManagedVerificationType | null): string {
  return type ? (VERIFICATION_TYPE_LABELS[type] ?? type) : "—";
}

export function verificationTypeVariant(type: ManagedVerificationType): BadgeVariant {
  switch (type) {
    case "business":
      return "gold";
    case "identity":
      return "blue";
    case "email":
      return "info";
    case "professional":
      return "neutral";
    case "address":
    default:
      return "neutral";
  }
}

// ------------------------------------------------------------
// SORT
// ------------------------------------------------------------

export const VERIFICATION_SORT_OPTIONS: {
  value: ManagedVerificationSortField;
  label: string;
}[] = [
  { value: "applicantName", label: "Applicant" },
  { value: "submittedAt", label: "Submitted" },
  { value: "updatedAt", label: "Updated" },
  { value: "verificationType", label: "Type" },
];

// ------------------------------------------------------------
// DATE FORMATTER
// ------------------------------------------------------------

export function formatVerificationDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ------------------------------------------------------------
// PIPELINE STAT CARD HELPERS
// ------------------------------------------------------------

export const STATUS_CARD_META: Record<
  ManagedVerificationStatus,
  { label: string; hint: string }
> = {
  awaiting_review: { label: "Awaiting review", hint: "Real store status: pending" },
  verified: { label: "Verified", hint: "Verified in owning console" },
  rejected: { label: "Rejected", hint: "Rejected in owning console" },
  action_required: { label: "Action required", hint: "Employer console only" },
};
