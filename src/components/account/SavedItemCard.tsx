"use client";

import Image from "next/image";
import { ShoppingCart, Trash2 } from "lucide-react";
import type { CartItem, Product } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { getVendorById } from "@/services/users";

interface SavedItemCardProps {
  item: CartItem;
}

/** Product card for the "Saved for Later" list on the account. */
export function SavedItemCard({ item }: SavedItemCardProps) {
  const { addToCart, removeSavedItem } = useCart();
  const product = item.product;
  const vendor = product.vendorId ? getVendorById(product.vendorId) : undefined;
  const originalPrice = (product as Product).originalPrice;
  const image = (product as Partial<Product>).images?.[0];

  return (
    <li className="bg-white rounded-xl border border-kampmax-border p-3 flex gap-3">
      <div className="w-16 h-16 rounded-lg bg-kampmax-muted overflow-hidden shrink-0">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-kampmax-text-secondary/50 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-kampmax-text line-clamp-1">
          {product.title}
        </h3>
        {vendor && (
          <p className="text-xs text-kampmax-text-secondary truncate">
            {vendor.name}
          </p>
        )}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm font-bold text-kampmax-navy">
            {formatNaira(
              item.unitPrice ?? product.price
            )}
          </span>
          {originalPrice && originalPrice > (item.unitPrice ?? product.price) && (
            <span className="text-xs text-kampmax-text-muted line-through">
              {formatNaira(originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => addToCart(product, item.quantity)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kampmax-blue hover:underline"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Move to cart
          </button>
          <button
            type="button"
            onClick={() => removeSavedItem(product.id)}
            aria-label={`Remove ${product.title} from saved for later`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-muted hover:text-error-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
