import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedPaymentMethod,
  ManagedPaymentStatus,
  PaymentType,
} from "@/types/admin";

export const PAYMENT_STATUS_LABELS: Record<ManagedPaymentStatus, string> = {
  pending: "Pending",
  successful: "Successful",
  failed: "Failed",
  reversed: "Reversed",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

export function paymentStatusLabel(status: ManagedPaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function paymentStatusVariant(status: ManagedPaymentStatus): BadgeVariant {
  switch (status) {
    case "pending":
      return "warning";
    case "successful":
      return "success";
    case "failed":
      return "error";
    case "reversed":
      return "neutral";
    case "refunded":
    case "partially_refunded":
      return "info";
  }
}

export const PAYMENT_METHOD_LABELS: Record<ManagedPaymentMethod, string> = {
  wallet: "Kampmax Wallet",
  paystack: "Paystack",
  other: "Other methods",
};

export function paymentMethodLabel(method: ManagedPaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  order_payment: "Order payment",
  wallet_funding: "Wallet funding",
  vendor_payout: "Vendor payout",
  refund: "Refund",
  commission: "Commission",
};

export function paymentTypeLabel(type: PaymentType): string {
  return PAYMENT_TYPE_LABELS[type] ?? type;
}
