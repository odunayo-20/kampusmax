"use client";

import { Verified, Truck } from "lucide-react";
import { VendorCartGroup } from "@/lib/cart-context";
import { CartItemCard } from "./CartItemCard";
import { formatNaira } from "@/lib/utils";

interface VendorGroupProps {
  group: VendorCartGroup;
  vendorName: string;
  vendorVerified?: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onSaveForLater: (productId: string) => void;
}

export function VendorGroup({
  group,
  vendorName,
  vendorVerified,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
}: VendorGroupProps) {
  return (
    <div className="bg-white rounded-xl border border-kampmax-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-kampmax-muted/50 border-b border-kampmax-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-kampmax-navy/10 flex items-center justify-center text-xs font-bold text-kampmax-navy">
            {vendorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-kampmax-text">
                {vendorName}
              </span>
              {vendorVerified && (
                <Verified className="w-3.5 h-3.5 text-kampmax-blue" />
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-kampmax-text-secondary">
              <Truck className="w-3 h-3" />
              <span>Est. {group.deliveryEstimate}</span>
            </div>
          </div>
        </div>
        <span className="text-xs font-medium text-kampmax-text-secondary">
          {group.items.length} {group.items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="divide-y divide-kampmax-border">
        {group.items.map((item) => (
          <CartItemCard
            key={item.product.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            onSaveForLater={onSaveForLater}
          />
        ))}
      </div>

      <div className="px-4 py-2.5 bg-kampmax-muted/50 border-t border-kampmax-border flex justify-between items-center">
        <span className="text-xs text-kampmax-text-secondary">
          Vendor subtotal
        </span>
        <span className="text-sm font-semibold text-kampmax-navy">
          {formatNaira(group.subtotal)}
        </span>
      </div>
    </div>
  );
}
