"use client";

import { useState, useCallback, useEffect } from "react";
import { getProducts } from "@/services/products";
import type { Product } from "@/types";

/**
 * Wishlist service (mock-backed, mirrors a future `GET /me/wishlist`,
 * `POST /me/wishlist`, `DELETE /me/wishlist/:id` API).
 *
 * A wishlist is a list of saved products the customer is interested in — it is
 * deliberately kept separate from the cart's "Save for later" (which holds
 * items with chosen quantity/variant for easy move-to-cart).
 *
 * SECURITY NOTE: this is client-side mock data for the prototype. Which items a
 * user can see/remove and whether the product is available must be enforced by
 * the backend in production. The frontend only *displays* backend-authorized
 * data.
 */

let wishlist: string[] = ["p1", "p3", "p5", "p8", "p12", "p17"];

export function getWishlist(userId: string): Product[] {
  const byId = getProducts().reduce<Record<string, Product>>(
    (acc, p) => ((acc[p.id] = p), acc),
    {}
  );
  return wishlist
    .map((id) => byId[id])
    .filter((p): p is Product => Boolean(p));
}

export function getWishlistIds(userId: string): string[] {
  return [...wishlist];
}

export function getWishlistCount(userId: string): number {
  return wishlist.length;
}

export function isWishlisted(productId: string): boolean {
  return wishlist.includes(productId);
}

export function addToWishlist(productId: string): void {
  if (!wishlist.includes(productId)) wishlist = [...wishlist, productId];
}

export function removeFromWishlist(productId: string): void {
  wishlist = wishlist.filter((id) => id !== productId);
}

export function toggleWishlist(productId: string): boolean {
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter((id) => id !== productId);
    return false;
  }
  wishlist = [...wishlist, productId];
  return true;
}

/**
 * Lightweight client-side wishlist hook that keeps a component's local state in
 * sync with the service list (any external change re-reads the list).
 */
export function useWishlist(userId: string) {
  const [items, setItems] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    setItems(getWishlist(userId));
    setLoaded(true);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const remove = useCallback(
    (productId: string) => {
      removeFromWishlist(productId);
      reload();
    },
    [reload]
  );

  const add = useCallback(
    (productId: string) => {
      addToWishlist(productId);
      reload();
    },
    [reload]
  );

  const toggle = useCallback(
    (productId: string) => {
      toggleWishlist(productId);
      reload();
    },
    [reload]
  );

  return {
    items,
    count: items.length,
    loaded,
    remove,
    add,
    toggle,
    reload,
  };
}
