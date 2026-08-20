"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui";
import { CartItemCard } from "@/components/shared";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  const deliveryFee = 500;
  const grandTotal = total + (items.length > 0 ? deliveryFee : 0);

  return (
    <div className="min-h-screen bg-kampmax-bg">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-kampmax-text">Cart</h1>
            <p className="text-xs text-kampmax-text-secondary">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-kampmax-border mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-kampmax-text mb-1">
              Your cart is empty
            </h2>
            <p className="text-sm text-kampmax-text-secondary mb-6">
              Browse the marketplace to find something you like
            </p>
            <Button
              onClick={() => router.push("/marketplace")}
              variant="primary"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={item.product.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="bg-white rounded-lg border border-kampmax-border p-4 space-y-3">
              <h3 className="text-sm font-semibold text-kampmax-text">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-kampmax-text-secondary">Subtotal</span>
                  <span className="text-kampmax-text">{formatNaira(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kampmax-text-secondary">Delivery (Campus Pickup)</span>
                  <span className="text-kampmax-text">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kampmax-text-secondary">Hostel Delivery</span>
                  <span className="text-kampmax-text">{formatNaira(deliveryFee)}</span>
                </div>
                <div className="border-t border-kampmax-border pt-2 flex justify-between">
                  <span className="font-semibold text-kampmax-text">Total</span>
                  <span className="font-bold text-kampmax-navy">
                    {formatNaira(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push("/checkout")}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Proceed to Checkout — {formatNaira(grandTotal)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
