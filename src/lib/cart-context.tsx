"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { CartItem, Product } from "@/types";

// ── Constants ──
const DELIVERY_FEE_PICKUP = 0;
const DELIVERY_FEE_HOSTEL = 500;
const PLATFORM_FEE_RATE = 0.025; // 2.5%
const PLATFORM_FEE_MIN = 50;
const PLATFORM_FEE_MAX = 2000;

// ── Vendor Group ──
export interface VendorCartGroup {
  vendorId: string;
  vendorName: string;
  items: CartItem[];
  subtotal: number;
  deliveryEstimate: string;
}

// ── Cart Summary ──
export interface CartSummary {
  itemsSubtotal: number;
  platformFee: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

// ── Context ──
interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSavedItem: (productId: string) => void;
  clearCart: () => void;
  vendorGroups: VendorCartGroup[];
  summary: CartSummary;
  /** @deprecated Use summary.itemCount */
  itemCount: number;
  /** @deprecated Use summary.itemsSubtotal */
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function computePlatformFee(subtotal: number): number {
  const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
  return Math.max(PLATFORM_FEE_MIN, Math.min(PLATFORM_FEE_MAX, fee));
}

function getVendorName(product: Product): string {
  // Vendor name is resolved from the service layer at the component level
  // Here we store just the ID; components resolve via getVendorById
  return product.vendorId;
}

function getDeliveryEstimate(vendorId: string): string {
  // Mock: vary by vendor for realism
  const estimates: Record<string, string> = {
    v1: "1-2 hours",
    v2: "1-3 hours",
    v3: "30-60 minutes",
    v4: "2-4 hours",
    v5: "2-4 hours",
    v6: "1-2 hours",
    v7: "2-3 hours",
  };
  return estimates[vendorId] || "1-3 hours";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && !i.savedForLater
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && !i.savedForLater
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      // If the item was saved for later, move it back to cart
      const saved = prev.find(
        (i) => i.product.id === product.id && i.savedForLater
      );
      if (saved) {
        return prev.map((i) =>
          i.product.id === product.id && i.savedForLater
            ? { ...i, quantity, savedForLater: false }
            : i
        );
      }
      return [...prev, { product, quantity, savedForLater: false }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && !i.savedForLater
          ? { ...i, quantity }
          : i
      )
    );
  }, []);

  const saveForLater = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, savedForLater: true }
          : i
      )
    );
  }, []);

  const moveToCart = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, savedForLater: false }
          : i
      )
    );
  }, []);

  const removeSavedItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const activeItems = useMemo(
    () => items.filter((i) => !i.savedForLater),
    [items]
  );

  const savedItems = useMemo(
    () => items.filter((i) => i.savedForLater),
    [items]
  );

  const vendorGroups = useMemo<VendorCartGroup[]>(() => {
    const groupMap = new Map<string, CartItem[]>();
    for (const item of activeItems) {
      const vid = item.product.vendorId;
      if (!groupMap.has(vid)) groupMap.set(vid, []);
      groupMap.get(vid)!.push(item);
    }
    return Array.from(groupMap.entries()).map(([vendorId, groupItems]) => ({
      vendorId,
      vendorName: vendorId, // resolved by components via getVendorById
      items: groupItems,
      subtotal: groupItems.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      ),
      deliveryEstimate: getDeliveryEstimate(vendorId),
    }));
  }, [activeItems]);

  const summary = useMemo<CartSummary>(() => {
    const itemsSubtotal = activeItems.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
    const hasItems = activeItems.length > 0;
    const deliveryFee = hasItems ? DELIVERY_FEE_HOSTEL : 0;
    const platformFee = hasItems ? computePlatformFee(itemsSubtotal) : 0;
    const total = itemsSubtotal + deliveryFee + platformFee;
    const itemCount = activeItems.reduce((sum, i) => sum + i.quantity, 0);
    return { itemsSubtotal, platformFee, deliveryFee, total, itemCount };
  }, [activeItems]);

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        addItem,
        removeItem,
        updateQuantity,
        saveForLater,
        moveToCart,
        removeSavedItem,
        clearCart,
        vendorGroups,
        summary,
        itemCount: summary.itemCount,
        total: summary.itemsSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
