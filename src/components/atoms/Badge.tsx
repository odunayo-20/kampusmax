import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: "bg-kampmax-navy text-white",
  success: "bg-green-50 text-kampmax-success border border-green-200",
  warning: "bg-amber-50 text-kampmax-warning border border-amber-200",
  error: "bg-red-50 text-kampmax-error border border-red-200",
  info: "bg-blue-50 text-kampmax-info border border-blue-200",
  outline: "bg-transparent border border-kampmax-border text-kampmax-text-secondary",
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
  New: "bg-blue-50 text-kampmax-info border border-blue-200",
  Used: "bg-amber-50 text-kampmax-warning border border-amber-200",
  Fair: "bg-gray-50 text-kampmax-text-secondary border border-gray-200",
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
  placed: "bg-blue-50 text-kampmax-info border border-blue-200",
  confirmed: "bg-indigo-50 text-indigo-600 border border-indigo-200",
  preparing: "bg-amber-50 text-kampmax-warning border border-amber-200",
  ready: "bg-purple-50 text-purple-600 border border-purple-200",
  delivered: "bg-green-50 text-kampmax-success border border-green-200",
  cancelled: "bg-red-50 text-kampmax-error border border-red-200",
};

const orderStatusLabels: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
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
