import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: "bg-kampmax-navy text-white",
  success: "bg-kampmax-success/10 text-kampmax-success border border-kampmax-success/20",
  warning: "bg-kampmax-warning/10 text-kampmax-warning border border-kampmax-warning/20",
  error: "bg-kampmax-error/10 text-kampmax-error border border-kampmax-error/20",
  info: "bg-kampmax-info/10 text-kampmax-info border border-kampmax-info/20",
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
  New: "bg-kampmax-blue/10 text-kampmax-blue border border-kampmax-blue/20",
  Used: "bg-kampmax-warning/10 text-kampmax-warning border border-kampmax-warning/20",
  Fair: "bg-kampmax-muted text-kampmax-text-secondary border border-kampmax-border",
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
  placed: "bg-kampmax-info/10 text-kampmax-info border border-kampmax-info/20",
  confirmed: "bg-kampmax-blue/10 text-kampmax-blue border border-kampmax-blue/20",
  preparing: "bg-kampmax-gold/10 text-kampmax-gold-dark border border-kampmax-gold/30",
  ready: "bg-kampmax-gold/10 text-kampmax-gold-dark border border-kampmax-gold/30",
  out_for_delivery: "bg-kampmax-info/10 text-kampmax-info border border-kampmax-info/20",
  delivered: "bg-kampmax-success/10 text-kampmax-success border border-kampmax-success/20",
  cancelled: "bg-kampmax-error/10 text-kampmax-error border border-kampmax-error/20",
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
