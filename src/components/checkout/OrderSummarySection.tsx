"use client";

import { Receipt, Info } from "lucide-react";
import { CheckoutSummary } from "@/types";
import { cn, formatNaira } from "@/lib/utils";

interface OrderSummarySectionProps {
  summary: CheckoutSummary;
}

export function OrderSummarySection({ summary }: OrderSummarySectionProps) {
  const hasDiscount = summary.discountAmount > 0;
  const hasLoyalty = summary.loyaltyDiscount > 0;
  const hasPromo = summary.appliedPromo !== null;

  return (
    <section className="bg-white rounded-xl border border-kampmax-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
        <Receipt className="h-4 w-4 text-kampmax-blue" />
        Price Breakdown
      </h3>

      <div className="space-y-2 text-sm">
        {/* Items subtotal */}
        <div className="flex justify-between">
          <span className="text-kampmax-text-secondary">
            Items ({summary.itemCount})
          </span>
          <span className="text-kampmax-text tabular-nums">
            {formatNaira(summary.itemsSubtotal)}
          </span>
        </div>

        {/* Platform fee */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1">
            <span className="text-kampmax-text-secondary">Platform fee</span>
            <div className="group relative">
              <Info className="w-3 h-3 text-kampmax-text-secondary cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-kampmax-navy text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                2.5% service fee (₦50–₦2,000)
              </div>
            </div>
          </div>
          <span className="text-kampmax-text tabular-nums">
            {formatNaira(summary.platformFee)}
          </span>
        </div>

        {/* Delivery fee */}
        <div className="flex justify-between">
          <span className="text-kampmax-text-secondary">Delivery</span>
          <span
            className={cn(
              "tabular-nums",
              summary.deliveryFee === 0
                ? "text-kampmax-success font-medium"
                : "text-kampmax-text"
            )}
          >
            {summary.deliveryFee === 0 ? "Free" : formatNaira(summary.deliveryFee)}
          </span>
        </div>

        {/* Promo discount */}
        {hasPromo && (
          <div className="flex justify-between text-kampmax-success">
            <span className="flex items-center gap-1">
              Promo ({summary.appliedPromo!.code})
            </span>
            <span className="tabular-nums font-medium">
              -{formatNaira(summary.discountAmount)}
            </span>
          </div>
        )}

        {/* Loyalty discount */}
        {hasLoyalty && (
          <div className="flex justify-between text-kampmax-success">
            <span className="flex items-center gap-1">
              Points used ({summary.loyaltyPointsUsed.toLocaleString()} pts)
            </span>
            <span className="tabular-nums font-medium">
              -{formatNaira(summary.loyaltyDiscount)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-kampmax-border pt-2">
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-kampmax-text">Total</span>
            <span className="font-bold text-kampmax-navy text-lg tabular-nums">
              {formatNaira(summary.finalTotal)}
            </span>
          </div>
        </div>

        {/* Points earned */}
        {summary.loyaltyPointsEarned > 0 && (
          <div className="flex justify-center">
            <span className="text-[10px] text-kampmax-text-secondary bg-kampmax-muted px-2 py-0.5 rounded-full">
              You&apos;ll earn {summary.loyaltyPointsEarned.toLocaleString()} points on this order
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
