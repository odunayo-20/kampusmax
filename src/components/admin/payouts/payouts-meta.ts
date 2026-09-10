import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedPayoutMethod,
  ManagedPayoutRecipientType,
  ManagedPayoutSortField,
  ManagedPayoutStatus,
} from "@/types/admin";

// ------------------------------------------------------------
// STATUS TABS
// ------------------------------------------------------------

export const PAYOUT_STATUS_TABS: (ManagedPayoutStatus | "all")[] = [
  "all",
  "successful",
  "pending",
  "processing",
  "failed",
];

export const STATUS_CARD_META: Record<
  ManagedPayoutStatus,
  { label: string; hint: string }
> = {
  successful: { label: "Successful", hint: "Wallet: completed · vendor: successful · freelancer: completed" },
  pending: { label: "Pending", hint: "Wallet: pending · freelancer: requested" },
  processing: { label: "Processing", hint: "Vendor/freelancer: processing" },
  failed: { label: "Failed", hint: "Freelancer: failed (with reason)" },
  reversed: { label: "Reversed", hint: "No reversed record in the seed data" },
  cancelled: { label: "Cancelled", hint: "No cancelled record in the seed data" },
};

export const PAYOUT_STATUS_LABELS: Record<ManagedPayoutStatus, string> = {
  successful: "Successful",
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
  reversed: "Reversed",
  cancelled: "Cancelled",
};

export function payoutStatusLabel(status: ManagedPayoutStatus): string {
  return PAYOUT_STATUS_LABELS[status] ?? status;
}

export function payoutStatusVariant(status: ManagedPayoutStatus): BadgeVariant {
  switch (status) {
    case "successful":
      return "success";
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "failed":
      return "error";
    case "reversed":
      return "gold";
    case "cancelled":
      return "neutral";
  }
}

// ------------------------------------------------------------
// RECIPIENT TYPE
// ------------------------------------------------------------

export const PAYOUT_RECIPIENT_TABS: (ManagedPayoutRecipientType | "all")[] = [
  "all",
  "vendor",
  "freelancer",
];

export const PAYOUT_RECIPIENT_LABELS: Record<ManagedPayoutRecipientType, string> = {
  vendor: "Vendor",
  freelancer: "Freelancer",
};

export function payoutRecipientLabel(type: ManagedPayoutRecipientType): string {
  return PAYOUT_RECIPIENT_LABELS[type] ?? type;
}

// ------------------------------------------------------------
// METHOD
// ------------------------------------------------------------

export const PAYOUT_METHOD_OPTIONS: (ManagedPayoutMethod | "all")[] = [
  "all",
  "wallet",
  "bank_transfer",
];

export const PAYOUT_METHOD_LABELS: Record<ManagedPayoutMethod, string> = {
  wallet: "Wallet",
  bank_transfer: "Bank transfer",
};

export function payoutMethodLabel(method: ManagedPayoutMethod): string {
  return PAYOUT_METHOD_LABELS[method] ?? method;
}

// ------------------------------------------------------------
// SORT
// ------------------------------------------------------------

export const PAYOUT_SORT_OPTIONS: {
  value: ManagedPayoutSortField;
  label: string;
}[] = [
  { value: "createdAt", label: "Date" },
  { value: "amount", label: "Amount" },
];

// ------------------------------------------------------------
// DATE FORMATTER
// ------------------------------------------------------------

export function formatPayoutDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}