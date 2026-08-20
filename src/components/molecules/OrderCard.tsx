import { Order } from "@/types";
import { formatNaira, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/atoms/Badge";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
  className?: string;
}

export function OrderCard({ order, className }: OrderCardProps) {
  const itemSummary = order.items
    .map((item) => `${item.quantity}x ${item.product.title}`)
    .join(", ");

  return (
    <div className={cn("p-4 bg-white rounded-lg border border-kampmax-border", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-kampmax-text">
          Order #{order.id}
        </span>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-xs text-kampmax-text-secondary line-clamp-1 mb-2">
        {itemSummary}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-kampmax-navy">
          {formatNaira(order.total)}
        </span>
        <span className="text-xs text-kampmax-text-secondary">
          {formatDate(new Date(order.createdAt))}
        </span>
      </div>
    </div>
  );
}
