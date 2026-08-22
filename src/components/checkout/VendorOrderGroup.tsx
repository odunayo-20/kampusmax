"use client";

import { Package, Truck, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { VendorCartGroup } from "@/lib/cart-context";
import { cn, formatNaira } from "@/lib/utils";

interface VendorOrderGroupProps {
  groups: {
    vendorId: string;
    vendorName: string;
    vendorVerified: boolean;
    items: VendorCartGroup["items"];
    subtotal: number;
    deliveryEstimate: string;
  }[];
}

export function VendorOrderGroup({ groups }: VendorOrderGroupProps) {
  const [expandedVendor, setExpandedVendor] = useState<string | null>(
    groups.length === 1 ? groups[0]?.vendorId : null
  );

  if (groups.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
        <Package className="h-4 w-4 text-kampmax-blue" />
        Order Items
        <span className="text-xs font-normal text-kampmax-text-secondary">
          ({groups.length} {groups.length === 1 ? "vendor" : "vendors"})
        </span>
      </h3>

      {groups.map((group) => {
        const isExpanded = expandedVendor === group.vendorId;
        return (
          <div
            key={group.vendorId}
            className="bg-white rounded-xl border border-kampmax-border overflow-hidden"
          >
            {/* Vendor header */}
            <button
              onClick={() =>
                setExpandedVendor(isExpanded ? null : group.vendorId)
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-kampmax-muted/50 border-b border-kampmax-border text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-kampmax-navy/10 flex items-center justify-center text-xs font-bold text-kampmax-navy shrink-0">
                  {group.vendorName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-kampmax-text block truncate">
                    {group.vendorName}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-kampmax-text-secondary">
                    <Clock className="w-3 h-3" />
                    <span>Est. {group.deliveryEstimate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-kampmax-text-secondary">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-kampmax-text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-kampmax-text-secondary" />
                )}
              </div>
            </button>

            {/* Items */}
            {isExpanded && (
              <div className="divide-y divide-kampmax-border">
                {group.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="w-12 h-12 bg-kampmax-muted rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-kampmax-text-secondary/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-kampmax-text line-clamp-1">
                        {item.product.title}
                      </p>
                      <p className="text-xs text-kampmax-text-secondary">
                        Qty: {item.quantity} × {formatNaira(item.product.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-kampmax-navy shrink-0">
                      {formatNaira(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}

                {/* Vendor subtotal */}
                <div className="flex justify-between items-center px-4 py-2.5 bg-kampmax-muted/50">
                  <span className="text-xs text-kampmax-text-secondary">
                    Vendor subtotal
                  </span>
                  <span className="text-sm font-semibold text-kampmax-navy">
                    {formatNaira(group.subtotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
