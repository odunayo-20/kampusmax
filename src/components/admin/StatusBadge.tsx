import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "gold"
  | "blue";

const VARIANTS: Record<BadgeVariant, string> = {
  success: "bg-kampmax-success/10 text-kampmax-success",
  warning: "bg-kampmax-warning/10 text-amber-700",
  error: "bg-kampmax-error/10 text-kampmax-error",
  info: "bg-kampmax-info/10 text-kampmax-info",
  neutral: "bg-kampmax-muted text-kampmax-text-secondary",
  gold: "bg-kampmax-gold/15 text-kampmax-gold-dark",
  blue: "bg-kampmax-blue/10 text-kampmax-blue",
};

/** Pill background/text classes for a variant - reuse for custom chips. */
export function badgeVariantClasses(variant: BadgeVariant): string {
  return VARIANTS[variant];
}

const DOTS: Record<BadgeVariant, string> = {
  success: "bg-kampmax-success",
  warning: "bg-kampmax-warning",
  error: "bg-kampmax-error",
  info: "bg-kampmax-info",
  neutral: "bg-kampmax-text-secondary/60",
  gold: "bg-kampmax-gold",
  blue: "bg-kampmax-blue",
};

interface StatusBadgeProps {
  variant?: BadgeVariant;
  label: string;
  dot?: boolean;
  className?: string;
}

/** Compact status pill used across tables and detail panels. */
export function StatusBadge({
  variant = "neutral",
  label,
  dot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        VARIANTS[variant],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[variant])} />}
      {label}
    </span>
  );
}

// ------------------------------------------------------------
// Status → badge variant maps shared by entity pages
// ------------------------------------------------------------

type StatusLike = string;

function makeMapper(map: Record<StatusLike, BadgeVariant>) {
  return (status: StatusLike): BadgeVariant => map[status] ?? "neutral";
}

export const userStatusVariant = makeMapper({
  active: "success",
  suspended: "warning",
  banned: "error",
});

export const vendorStatusVariant = makeMapper({
  approved: "success",
  pending: "warning",
  suspended: "warning",
  rejected: "error",
});

export const productStatusVariant = makeMapper({
  available: "success",
  pending_review: "info",
  flagged: "error",
  sold: "neutral",
  removed: "neutral",
});

export const orderStatusVariant = makeMapper({
  placed: "info",
  confirmed: "blue",
  preparing: "gold",
  out_for_delivery: "warning",
  delivered: "success",
  cancelled: "error",
});

export const paymentStatusVariant = makeMapper({
  paid: "success",
  successful: "success",
  pending: "warning",
  failed: "error",
  refunded: "info",
});

export const withdrawalStatusVariant = makeMapper({
  pending: "warning",
  processing: "info",
  approved: "blue",
  paid: "success",
  rejected: "error",
});

export const disputeStatusVariant = makeMapper({
  open: "error",
  under_review: "warning",
  awaiting_customer: "info",
  resolved: "success",
  closed: "neutral",
});

export const reportStatusVariant = makeMapper({
  open: "error",
  reviewing: "warning",
  resolved: "success",
  dismissed: "neutral",
});

export const reviewStatusVariant = makeMapper({
  published: "success",
  pending: "warning",
  flagged: "error",
  removed: "neutral",
});

export const postStatusVariant = makeMapper({
  published: "success",
  flagged: "error",
  pending: "warning",
  removed: "neutral",
});

export const promotionStatusVariant = makeMapper({
  scheduled: "info",
  active: "success",
  paused: "warning",
  ended: "neutral",
});

export const priorityVariant = makeMapper({
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "error",
});
