"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useApp } from "@/lib/app-context";
import { getVendorById } from "@/services/users";
import { formatNaira } from "@/lib/utils";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/atoms/Button";
import {
  VendorGroup,
  CartSummary,
  SavedForLater,
  EmptyCart,
} from "@/components/cart";

export default function CartPage() {
  const router = useRouter();
  const { selectedCampus } = useApp();
  const {
    items,
    savedItems,
    vendorGroups,
    summary,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    removeSavedItem,
    clearCart,
  } = useCart();

  const activeItems = useMemo(
    () => items.filter((i) => !i.savedForLater),
    [items]
  );

  const vendorNameCache = useMemo(() => {
    const cache: Record<string, { name: string; verified: boolean }> = {};
    vendorGroups.forEach((g) => {
      const vendor = getVendorById(g.vendorId);
      cache[g.vendorId] = {
        name: vendor?.storeName || "Unknown Vendor",
        verified: vendor?.verified || false,
      };
    });
    // Also resolve saved items' vendors
    savedItems.forEach((item) => {
      if (!cache[item.product.vendorId]) {
        const vendor = getVendorById(item.product.vendorId);
        cache[item.product.vendorId] = {
          name: vendor?.storeName || "Unknown Vendor",
          verified: vendor?.verified || false,
        };
      }
    });
    return cache;
  }, [vendorGroups, savedItems]);

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-kampmax-text">Cart</h1>
            <p className="text-xs text-kampmax-text-secondary">
              {summary.itemCount} {summary.itemCount === 1 ? "item" : "items"}
              {vendorGroups.length > 1 &&
                ` from ${vendorGroups.length} vendors`}
            </p>
          </div>
        </div>

        {activeItems.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs text-kampmax-text-secondary hover:text-kampmax-error transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear cart
          </button>
        )}
      </div>

      {activeItems.length === 0 && savedItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="space-y-6">
          {vendorGroups.length > 0 && (
            <div className="space-y-4">
              {vendorGroups.map((group) => (
                <VendorGroup
                  key={group.vendorId}
                  group={group}
                  vendorName={
                    vendorNameCache[group.vendorId]?.name || "Unknown Vendor"
                  }
                  vendorVerified={
                    vendorNameCache[group.vendorId]?.verified
                  }
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  onSaveForLater={saveForLater}
                />
              ))}
            </div>
          )}

          {activeItems.length > 0 && (
            <CartSummary summary={summary} />
          )}

          {activeItems.length > 0 && (
            <Button
              onClick={() => router.push("/checkout")}
              className="w-full bg-kampmax-blue text-white hover:bg-kampmax-blue/90 h-12 text-base font-semibold"
            >
              Proceed to Checkout —{" "}
              {formatNaira(summary.total)}
            </Button>
          )}

          {activeItems.length === 0 && savedItems.length > 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-kampmax-text-secondary mb-4">
                All items are saved for later. Move items to your cart to
                checkout.
              </p>
            </div>
          )}

          <SavedForLater
            items={savedItems}
            onMoveToCart={moveToCart}
            onRemove={removeSavedItem}
          />
        </div>
      )}
    </PageContainer>
  );
}
