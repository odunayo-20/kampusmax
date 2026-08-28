import type { Product } from "@/types";
import { getVendorById } from "@/services/users";
import { getProductById } from "@/services/products";
import { getStockForSelection } from "@/components/marketplace/product-detail/types";
import {
  type CartLineItem,
  type CartVendorGroup,
  type CartPricingSummary,
  type CartMergeResult,
  type CartItemValidationStatus,
  type AvailabilityStatus,
} from "@/types/cart";

/**
 * Cart service layer.
 *
 * All cart data flow is isolated behind this module. The calls are
 * intentionally structured to map 1:1 to the future backend endpoints:
 *
 *   GET    /cart            -> getServerCart()
 *   POST   /cart/items      -> addToServerCart()
 *   PATCH  /cart/items/:id  -> updateServerCartItem()
 *   DELETE /cart/items/:id  -> removeServerCartItem()
 *   POST   /cart/merge      -> mergeCarts()
 *   POST   /cart/validate   -> validateCartItems()
 *
 * Until the API exists, these operate on local state and the synchronous
 * product/vendor services already in the codebase. No fake backend entities
 * are introduced here.
 */

// ── Local helpers (no I/O) ────────────────────────────────────────────────

const PLATFORM_FEE_RATE = 0.025;
const PLATFORM_FEE_MIN = 50;
const PLATFORM_FEE_MAX = 2000;
const DELIVERY_FEE_HOSTEL = 500;

export function computePlatformFee(subtotal: number): number {
  const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
  return Math.max(PLATFORM_FEE_MIN, Math.min(PLATFORM_FEE_MAX, fee));
}

export function buildPricingSummary(items: CartLineItem[]): CartPricingSummary {
  const itemsSubtotal = items.reduce(
    (sum, i) => sum + (i.unitPrice ?? i.product.price) * i.quantity,
    0
  );
  const hasItems = items.length > 0;
  const deliveryFee = hasItems ? DELIVERY_FEE_HOSTEL : 0;
  const platformFee = hasItems ? computePlatformFee(itemsSubtotal) : 0;
  const discountTotal = 0; // established at checkout / coupon application
  const total = itemsSubtotal + deliveryFee + platformFee - discountTotal;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { itemsSubtotal, platformFee, deliveryFee, discountTotal, total, itemCount };
}

const DELIVERY_ESTIMATES: Record<string, string> = {
  v1: "1-2 hours",
  v2: "1-3 hours",
  v3: "30-60 minutes",
  v4: "2-4 hours",
  v5: "2-4 hours",
  v6: "1-2 hours",
  v7: "2-3 hours",
};

export function estimateDelivery(vendorId: string): string {
  return DELIVERY_ESTIMATES[vendorId] || "1-3 hours";
}

export function groupItemsByVendor(
  items: CartLineItem[]
): CartVendorGroup[] {
  const map = new Map<string, CartLineItem[]>();
  for (const item of items) {
    const vid = item.vendorId;
    if (!map.has(vid)) map.set(vid, []);
    map.get(vid)!.push(item);
  }
  return Array.from(map.entries()).map(([vendorId, groupItems]) => {
    const vendor = getVendorById(vendorId);
    return {
      vendorId,
      vendorName: vendor?.storeName,
      verified: vendor?.verified,
      items: groupItems,
      subtotal: groupItems.reduce(
        (sum, i) => sum + (i.unitPrice ?? i.product.price) * i.quantity,
        0
      ),
      delivery: {
        deliveryAvailable: true,
        deliveryMethod: "campus_pickup",
        deliveryFee: 0,
        estimatedDelivery: estimateDelivery(vendorId),
        status: "available",
      },
    };
  });
}

export function makeLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Turn a selected product + quantity into a cart line, enriching it with
 * stock/availability computed from the current catalog.
 */
export function buildCartLine(
  product: Product,
  quantity: number,
  options?: {
    variantLabel?: string;
    selectedVariants?: Record<string, string>;
    unitPrice?: number;
  }
): CartLineItem {
  const selectedVariants = options?.selectedVariants;
  const stock = selectedVariants
    ? getStockForSelection(product.id, selectedVariants)
    : undefined;

  const availabilityStatus: AvailabilityStatus =
    product.status !== "available"
      ? "unavailable"
      : stock === 0
      ? "out_of_stock"
      : "available";

  const maxPurchaseQuantity =
    availabilityStatus === "available" ? Math.min(10, stock ?? 10) : 0;

  return {
    id: makeLineId(),
    productId: product.id,
    vendorId: product.vendorId,
    product,
    quantity: Math.max(1, quantity),
    variantLabel: options?.variantLabel,
    selectedVariants,
    savedForLater: false,
    availableStock: stock,
    maxPurchaseQuantity,
    availabilityStatus,
    validationStatus: "valid",
    unitPrice: options?.unitPrice ?? product.price,
  };
}

/**
 * Merge a guest cart with an authenticated (server) cart.
 *
 * Rules:
 *  - Same product (+ same future variant) quantities are combined.
 *  - The combined quantity is capped by `maxPurchaseQuantity` / stock.
 *  - Capped lines are reported as adjustments with a clear message.
 *  - Server cart is never overwritten; guest contents are folded in.
 */
export function mergeCarts(
  guest: CartLineItem[],
  server: CartLineItem[]
): CartMergeResult {
  const adjustments: CartMergeResult["adjustments"] = [];
  const removedItems: string[] = [];

  const key = (i: CartLineItem) =>
    `${i.productId}::${JSON.stringify(i.selectedVariants ?? {})}`;

  const byKey = new Map<string, CartLineItem>();
  for (const item of server) byKey.set(key(item), { ...item });

  for (const g of guest) {
    const k = key(g);
    const existing = byKey.get(k);
    if (existing) {
      const combinedQty = existing.quantity + g.quantity;
      const cap = Math.max(
        1,
        (g.maxPurchaseQuantity ?? Number.POSITIVE_INFINITY) <
          (existing.maxPurchaseQuantity ?? Number.POSITIVE_INFINITY)
          ? g.maxPurchaseQuantity ?? existing.maxPurchaseQuantity ?? 1
          : existing.maxPurchaseQuantity ?? g.maxPurchaseQuantity ?? 1
      );
      const finalQty = Math.min(combinedQty, cap);
      existing.quantity = finalQty;
      if (finalQty !== combinedQty) {
        adjustments.push({
          productId: g.productId,
          from: combinedQty,
          to: finalQty,
          reason: "Quantity adjusted to respect the maximum purchase limit.",
        });
      }
    } else {
      byKey.set(k, { ...g, quantity: Math.min(g.quantity, g.maxPurchaseQuantity ?? g.quantity) });
    }
  }

  // Retain ordering of the server cart, then append new guest lines.
  const mergedItems = Array.from(byKey.values());

  return { mergedItems, adjustments, removedItems };
}

// ── Server cart proxies (map to future endpoints) ─────────────────────────

/**
 * Future: GET /cart
 * Currently returns an empty server cart, as no server cart exists yet.
 */
export function getServerCart(customerId?: string): CartLineItem[] {
  void customerId;
  return [];
}

/**
 * Validate cart lines against the current catalog (product status, stock).
 * Price changes are detected by comparing stored `unitPrice` to the
 * product's current price.
 */
export function validateCartItems(
  items: CartLineItem[]
): Array<{
  id: string;
  status: CartItemValidationStatus;
  message?: string;
}> {
  return items.map((item) => {
    const product = getProductById(item.productId);

    if (!product) {
      return {
        id: item.id,
        status: "unavailable",
        message: "This product is no longer available.",
      };
    }

    if (product.status !== "available") {
      return {
        id: item.id,
        status: "unavailable",
        message: "This product is no longer available.",
      };
    }

    const vendor = getVendorById(product.vendorId);
    if (!vendor) {
      return {
        id: item.id,
        status: "vendor_unavailable",
        message: "This vendor is currently unavailable.",
      };
    }

    const stock = item.selectedVariants
      ? getStockForSelection(product.id, item.selectedVariants)
      : undefined;
    if (stock === 0) {
      return {
        id: item.id,
        status: "out_of_stock",
        message: "Sorry, this item is out of stock.",
      };
    }

    const stored = item.unitPrice ?? product.price;
    if (stored !== product.price && item.unitPrice !== undefined) {
      const increased = product.price > stored;
      return {
        id: item.id,
        status: "price_changed",
        message: increased
          ? "This item's price increased since you added it to your cart."
          : "This item's price changed since you added it to your cart.",
      };
    }

    return { id: item.id, status: "valid" };
  });
}
