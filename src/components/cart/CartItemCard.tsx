"use client";

import Link from "next/link";
import { Trash2, Bookmark } from "lucide-react";
import { CartItem } from "@/types";
import type { CartLineItem } from "@/types/cart";
import { cn, formatNaira } from "@/lib/utils";
import { QuantitySelector } from "./QuantitySelector";
import { CartValidationMessage } from "./CartValidationMessage";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onSaveForLater: (productId: string) => void;
  onUpdateToNewPrice?: (productId: string) => void;
  pending?: boolean;
  className?: string;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
  onUpdateToNewPrice,
  pending = false,
  className,
}: CartItemCardProps) {
  const line = item as CartLineItem;
  const unitPrice = line.unitPrice ?? item.product.price;
  const subtotal = unitPrice * item.quantity;
  const unavailable = line.validationStatus === "unavailable" || line.validationStatus === "vendor_unavailable";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 bg-white rounded-lg border border-kampmax-border",
        className
      )}
    >
      <div className="flex gap-3">
        <Link
          href={`/marketplace/${item.product.id}`}
          className={cn(
            "w-20 h-20 bg-kampmax-muted rounded-md overflow-hidden flex-shrink-0 relative",
            unavailable && "opacity-60"
          )}
        >
          <div className="w-full h-full flex items-center justify-center text-kampmax-text-secondary/40">
            <svg
              className="w-8 h-8"
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
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/marketplace/${item.product.id}`}
                className="text-sm font-medium text-kampmax-text line-clamp-2 leading-tight hover:text-kampmax-blue transition-colors"
              >
                {item.product.title}
              </Link>
              {line.variantLabel && (
                <p className="text-xs text-kampmax-text-secondary mt-0.5">
                  {line.variantLabel}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(item.product.id)}
              className="p-1 text-kampmax-text-secondary hover:text-kampmax-error transition-colors shrink-0"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-kampmax-text-secondary mt-0.5">
            {item.product.condition}
          </p>

          <div className="flex items-center justify-between mt-2">
            <QuantitySelector
              value={item.quantity}
              min={1}
              max={line.maxPurchaseQuantity}
              loading={pending}
              disabled={unavailable}
              onChange={(q) => onUpdateQuantity(item.product.id, q)}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSaveForLater(item.product.id)}
                className="flex items-center gap-1 text-xs text-kampmax-text-secondary hover:text-kampmax-blue transition-colors"
                aria-label="Save for later"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <span className="text-sm font-bold text-kampmax-navy tabular-nums">
                {formatNaira(subtotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CartValidationMessage
        line={line}
        onRemove={onRemove}
        onUpdateToNewPrice={onUpdateToNewPrice}
      />
    </div>
  );
}
