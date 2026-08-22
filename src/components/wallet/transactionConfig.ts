import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Gift,
  ShoppingCart,
  Building2,
} from "lucide-react";

export const txConfig: Record<
  string,
  { icon: typeof ArrowUpRight; bg: string; color: string; label: string }
> = {
  deposit: {
    icon: ArrowDownLeft,
    bg: "bg-kampmax-success/10",
    color: "text-kampmax-success",
    label: "Deposit",
  },
  purchase: {
    icon: ShoppingCart,
    bg: "bg-kampmax-blue/10",
    color: "text-kampmax-blue",
    label: "Purchase",
  },
  payment: {
    icon: ShoppingCart,
    bg: "bg-kampmax-blue/10",
    color: "text-kampmax-blue",
    label: "Payment",
  },
  refund: {
    icon: RefreshCw,
    bg: "bg-kampmax-blue/10",
    color: "text-kampmax-blue",
    label: "Refund",
  },
  withdrawal: {
    icon: ArrowDownRight,
    bg: "bg-kampmax-warning/10",
    color: "text-kampmax-warning",
    label: "Withdrawal",
  },
  vendor_payout: {
    icon: Building2,
    bg: "bg-kampmax-success/10",
    color: "text-kampmax-success",
    label: "Vendor Payout",
  },
  loyalty_reward: {
    icon: Gift,
    bg: "bg-kampmax-gold/10",
    color: "text-kampmax-gold",
    label: "Loyalty Reward",
  },
  transfer: {
    icon: ArrowUpRight,
    bg: "bg-kampmax-muted",
    color: "text-kampmax-text-secondary",
    label: "Transfer",
  },
};

export const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "text-kampmax-success bg-kampmax-success/10" },
  pending: { label: "Pending", color: "text-kampmax-gold bg-kampmax-gold/10" },
  processing: { label: "Processing", color: "text-kampmax-blue bg-kampmax-blue/10" },
  failed: { label: "Failed", color: "text-kampmax-error bg-kampmax-error/10" },
  cancelled: { label: "Cancelled", color: "text-kampmax-text-secondary bg-kampmax-muted" },
};
