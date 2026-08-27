import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: "bg-neutral-900 text-white",
  success: "bg-success-50 text-success-700 border border-success-100",
  warning: "bg-accent-50 text-accent-700 border border-accent-100",
  error: "bg-error-50 text-error-700 border border-error-100",
  info: "bg-info-50 text-info-700 border border-info-100",
  outline: "bg-transparent border border-neutral-300 text-neutral-600",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface ConditionBadgeProps {
  condition: "New" | "Used" | "Fair";
}

const conditionStyles = {
  New: "bg-primary-50 text-primary-700 border border-primary-100",
  Used: "bg-accent-50 text-accent-700 border border-accent-100",
  Fair: "bg-neutral-100 text-neutral-600 border border-neutral-200",
};

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded",
        conditionStyles[condition]
      )}
    >
      {condition}
    </span>
  );
}

interface OrderStatusBadgeProps {
  status: string;
}

const orderStatusStyles: Record<string, string> = {
  placed: "bg-info-50 text-info-700 border border-info-100",
  confirmed: "bg-primary-50 text-primary-700 border border-primary-100",
  preparing: "bg-accent-50 text-accent-700 border border-accent-100",
  ready: "bg-accent-50 text-accent-700 border border-accent-100",
  out_for_delivery: "bg-info-50 text-info-700 border border-info-100",
  delivered: "bg-success-50 text-success-700 border border-success-100",
  cancelled: "bg-error-50 text-error-700 border border-error-100",
};

const orderStatusLabels: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full",
        orderStatusStyles[status] || orderStatusStyles.placed
      )}
    >
      {orderStatusLabels[status] || status}
    </span>
  );
}
