"use client";

import { Bookmark, ShoppingCart, Trash2 } from "lucide-react";
import { CartItem } from "@/types";
import { formatNaira } from "@/lib/utils";

interface SavedForLaterProps {
  items: CartItem[];
  onMoveToCart: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export function SavedForLater({
  items,
  onMoveToCart,
  onRemove,
}: SavedForLaterProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-kampmax-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-kampmax-muted/50 border-b border-kampmax-border">
        <Bookmark className="w-4 h-4 text-kampmax-gold" />
        <span className="text-sm font-semibold text-kampmax-text">
          Saved for Later
        </span>
        <span className="text-xs text-kampmax-text-secondary">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </div>

      <div className="divide-y divide-kampmax-border">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-3 p-3">
            <div className="w-14 h-14 bg-kampmax-muted rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
              <div className="text-kampmax-text-secondary/40">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-kampmax-text line-clamp-1">
                {item.product.title}
              </h4>
              <p className="text-sm font-bold text-kampmax-navy mt-0.5">
                {formatNaira(item.product.price)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <button
                onClick={() => onMoveToCart(item.product.id)}
                className="flex items-center gap-1 text-xs text-kampmax-blue hover:underline"
              >
                <ShoppingCart className="w-3 h-3" />
                Move to cart
              </button>
              <button
                onClick={() => onRemove(item.product.id)}
                className="text-xs text-kampmax-text-secondary hover:text-kampmax-error"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
