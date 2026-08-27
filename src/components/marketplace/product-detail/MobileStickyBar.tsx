"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui";
import { formatNaira } from "@/lib/utils";

interface MobileStickyBarProps {
  price: number;
  quantity: number;
  hasDiscount: boolean;
  discountPct?: number;
  canAddToCart: boolean;
  buyLoading: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function MobileStickyBar({
  price,
  quantity,
  hasDiscount,
  discountPct,
  canAddToCart,
  buyLoading,
  onAddToCart,
  onBuyNow,
}: MobileStickyBarProps) {
  const total = price * quantity;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-neutral-200 safe-bottom">
      <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-extrabold text-primary-900 leading-none">{formatNaira(total)}</p>
          <p className="text-[11px] text-neutral-500">
            {quantity} × {formatNaira(price)} {hasDiscount && discountPct && <span className="text-success-600 font-medium">· {discountPct}% off</span>}
          </p>
        </div>
        <Button onClick={onAddToCart} disabled={!canAddToCart} variant="outline" className="h-10 px-4">
          <ShoppingCart className="h-4 w-4 mr-1.5" /> Add
        </Button>
        <Button onClick={onBuyNow} disabled={!canAddToCart || buyLoading} variant="primary" className="h-10 px-5 font-bold">
          {buyLoading ? "..." : "Buy now"}
        </Button>
      </div>
    </div>
  );
}