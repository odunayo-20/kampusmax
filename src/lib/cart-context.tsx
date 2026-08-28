"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { CartItem, Product } from "@/types";
import type { CartLineItem } from "@/types/cart";
import {
  buildCartLine,
  buildPricingSummary,
  groupItemsByVendor,
  mergeCarts,
  validateCartItems,
  getServerCart,
  makeLineId,
} from "@/services/cart";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { getVendorById } from "@/services/users";
import { getProductById } from "@/services/products";

// ── Constants ──
const STORAGE_KEY = "kampmax_guest_cart_v2";

// ── Vendor Group (kept for existing components) ──
export interface VendorCartGroup {
  vendorId: string;
  vendorName: string;
  items: CartLineItem[];
  subtotal: number;
  deliveryEstimate: string;
}

// ── Cart Summary ──
export interface CartSummary {
  itemsSubtotal: number;
  platformFee: number;
  deliveryFee: number;
  discountTotal: number;
  total: number;
  itemCount: number;
  // campus context attached to the cart
  campusId?: string;
}

export type CartMutation =
  | "quantity"
  | "remove"
  | "save_for_later"
  | "move_to_cart"
  | null;

export interface CartFeedback {
  type: "success" | "error" | "info";
  message: string;
}

// ── Context ──
interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    options?: {
      variantLabel?: string;
      selectedVariants?: Record<string, string>;
      unitPrice?: number;
      openDrawer?: boolean;
    }
  ) => void;
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

  // Cart drawer
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Loading / mutation state
  isLoading: boolean;
  pendingId: string | null;
  pendingAction: CartMutation;

  // Feedback
  feedback: CartFeedback | null;
  dismissFeedback: () => void;

  // Validation & merge
  validateCart: () => void;
  mergeGuestWithServer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function readStoredCart(): CartItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const lines: CartLineItem[] = [];
    for (const entry of parsed) {
      const product = entry?.productId
        ? getProductById(entry.productId)
        : undefined;
      if (!product) continue; // product no longer in catalog — drop the line
      const qty = typeof entry?.quantity === "number" ? entry.quantity : 1;
      lines.push({
        id: makeLineId(),
        productId: product.id,
        vendorId: product.vendorId,
        product,
        quantity: qty,
        savedForLater: entry.savedForLater ?? false,
        variantLabel: entry.variantLabel,
        selectedVariants: entry.selectedVariants,
        unitPrice: typeof entry?.unitPrice === "number"
          ? entry.unitPrice
          : product.price,
        availabilityStatus: entry.availabilityStatus,
        maxPurchaseQuantity: entry.maxPurchaseQuantity,
      });
    }
    return lines.length ? lines : null;
  } catch {
    return null;
  }
}

function writeStoredCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    // Guest cart stores only minimum shopping info (product ref, qty, variant).
    const slim = items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
      savedForLater: i.savedForLater ?? false,
      variantLabel: (i as CartLineItem).variantLabel,
      selectedVariants: (i as CartLineItem).selectedVariants,
      unitPrice: (i as CartLineItem).unitPrice ?? i.product.price,
      availabilityStatus: (i as CartLineItem).availabilityStatus,
      maxPurchaseQuantity: (i as CartLineItem).maxPurchaseQuantity,
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    // private browsing / quota exceeded
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const { selectedCampus } = useApp();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<CartMutation>(null);
  const [feedback, setFeedback] = useState<CartFeedback | null>(null);
  const mergedRef = useRef<string | null>(null);

  // Load guest cart once on mount.
  useEffect(() => {
    const stored = readStoredCart();
    if (stored) {
      setItems(stored);
    }
    setIsLoading(false);
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (isLoading) return;
    writeStoredCart(items);
  }, [items, isLoading]);

  // Merge guest cart into user's server cart once when auth is established.
  const mergeGuestWithServer = useCallback(() => {
    if (status !== "authenticated" || !user) return;
    if (mergedRef.current === user.id) return;
    mergedRef.current = user.id;

    const server = getServerCart(user.id);
    const guest = items.filter((i) => !i.savedForLater) as CartLineItem[];
    if (guest.length === 0) return;

    const { mergedItems, adjustments } = mergeCarts(guest, server);
    const next = mergedItems.map((m) => {
      const asCartItem: CartItem = m;
      return asCartItem;
    });
    const saved = items.filter((i) => i.savedForLater);
    setItems([...next, ...saved]);

    if (adjustments.length > 0) {
      setFeedback({
        type: "info",
        message:
          "Some item quantities were adjusted to fit the available stock.",
      });
    }
  }, [status, user, items]);

  useEffect(() => {
    mergeGuestWithServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const setCartOpen = useCallback((open: boolean) => setIsCartOpen(open), []);
  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const addItem = useCallback(
    (
      product: Product,
      quantity = 1,
      options?: {
        variantLabel?: string;
        selectedVariants?: Record<string, string>;
        unitPrice?: number;
        openDrawer?: boolean;
      }
    ) => {
      const line = buildCartLine(product, quantity, {
        variantLabel: options?.variantLabel,
        selectedVariants: options?.selectedVariants,
        unitPrice: options?.unitPrice,
      });
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            !i.savedForLater &&
            i.product.id === product.id &&
            JSON.stringify((i as CartLineItem).selectedVariants ?? {}) ===
              JSON.stringify(options?.selectedVariants ?? {})
        );
        if (existing) {
          const nextQty = Math.min(
            (existing as CartLineItem).maxPurchaseQuantity ??
              existing.quantity + quantity,
            existing.quantity + quantity
          );
          return prev.map((i) =>
            i === existing
              ? { ...i, quantity: nextQty, ...(line.unitPrice !== undefined ? { unitPrice: line.unitPrice } : {}) }
              : i
          );
        }
        // If it was saved for later, move it back to the active cart.
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
        return [...prev, line];
      });

      setFeedback({ type: "success", message: `${product.title} added to cart.` });
      if (options?.openDrawer !== false) {
        setIsCartOpen(true);
      }
    },
    []
  );

  const removeItem = useCallback(
    (productId: string) => {
      setPendingId(productId);
      setPendingAction("remove");
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      setFeedback({ type: "info", message: "Item removed from your cart." });
      // Loading indicator clears on next render tick.
      queueMicrotask(() => {
        setPendingId(null);
        setPendingAction(null);
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
        return;
      }
      setPendingId(productId);
      setPendingAction("quantity");
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId && !i.savedForLater
            ? { ...i, quantity }
            : i
        )
      );
      queueMicrotask(() => {
        setPendingId(null);
        setPendingAction(null);
      });
    },
    []
  );

  const saveForLater = useCallback(
    (productId: string) => {
      setPendingId(productId);
      setPendingAction("save_for_later");
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, savedForLater: true } : i
        )
      );
      setFeedback({ type: "info", message: "Saved for later." });
      queueMicrotask(() => {
        setPendingId(null);
        setPendingAction(null);
      });
    },
    []
  );

  const moveToCart = useCallback(
    (productId: string) => {
      setPendingId(productId);
      setPendingAction("move_to_cart");
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, savedForLater: false } : i
        )
      );
      queueMicrotask(() => {
        setPendingId(null);
        setPendingAction(null);
      });
    },
    []
  );

  const removeSavedItem = useCallback(
    (productId: string) => {
      setPendingId(productId);
      setPendingAction("remove");
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      queueMicrotask(() => {
        setPendingId(null);
        setPendingAction(null);
      });
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const validateCart = useCallback(() => {
    const lines = items.filter((i) => !i.savedForLater) as CartLineItem[];
    const results = validateCartItems(lines);
    setItems((prev) =>
      prev.map((i) => {
        const line = i as CartLineItem;
        const res = results.find((r) => r.id === line.id) || {
          id: line.id,
          status: "valid",
        };
        return {
          ...i,
          validationStatus: res.status,
          // expose for the UI but keep the line intact; message only when invalid
          message:
            res.status === "valid" ? undefined : (res as { message?: string }).message,
        } as CartLineItem;
      })
    );
  }, [items]);

  const activeItems = useMemo(
    () => items.filter((i) => !i.savedForLater),
    [items]
  ) as CartLineItem[];

  const savedItems = useMemo(
    () => items.filter((i) => i.savedForLater),
    [items]
  ) as CartLineItem[];

  const vendorGroups = useMemo<VendorCartGroup[]>(() => {
    const groups = groupItemsByVendor(activeItems);
    return groups.map((g) => ({
      vendorId: g.vendorId,
      vendorName: g.vendorName ?? g.vendorId,
      items: g.items,
      subtotal: g.subtotal,
      deliveryEstimate: g.delivery.estimatedDelivery ?? "1-3 hours",
    }));
  }, [activeItems]);

  const summary = useMemo<CartSummary>(() => {
    const pricing = buildPricingSummary(activeItems);
    return {
      ...pricing,
      campusId: selectedCampus.id,
    };
  }, [activeItems, selectedCampus]);

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
        isCartOpen,
        openCart,
        closeCart,
        setCartOpen,
        isLoading,
        pendingId,
        pendingAction,
        feedback,
        dismissFeedback,
        validateCart,
        mergeGuestWithServer,
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
