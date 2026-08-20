"use client";

import { Package } from "lucide-react";
import { CartItem } from "@/types";
import { formatNaira, cn } from "@/lib/utils";

interface OrderItemsProps {
  items: CartItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={item.product.id}
          className={cn(
            "flex items-center gap-3",
            idx < items.length - 1 && "pb-3 border-b border-kampmax-border"
          )}
        >
          <div className="w-14 h-14 bg-kampmax-muted rounded-lg flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-kampmax-text line-clamp-1">
              {item.product.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-kampmax-text-secondary">
                Qty: {item.quantity}
              </span>
              <span className="text-[10px] text-kampmax-text-secondary/50">·</span>
              <span className="text-xs text-kampmax-text-secondary">
                {formatNaira(item.product.price)} each
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold text-kampmax-navy shrink-0 tabular-nums">
            {formatNaira(item.product.price * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  );
}
