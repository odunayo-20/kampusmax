"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Truck, Store as StoreIcon, CreditCard,
  Building2, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui";
import { useCart } from "@/lib/cart-context";
import { formatNaira, generateOrderId } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DeliveryMethod, PaymentMethod } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("campus_pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [address, setAddress] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  const deliveryFee = deliveryMethod === "delivery" ? 500 : 0;
  const grandTotal = total + deliveryFee;

  function handlePlaceOrder() {
    setIsPlacing(true);
    setTimeout(() => {
      clearCart();
      const orderId = generateOrderId();
      router.push(`/orders/${orderId}`);
    }, 1500);
  }

  if (items.length === 0 && !isPlacing) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-kampmax-text-secondary mb-4">
          Your cart is empty. Add items before checking out.
        </p>
        <Button onClick={() => router.push("/marketplace")} variant="primary">
          Browse Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kampmax-bg">
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-kampmax-text">Checkout</h1>
        </div>

        <section className="bg-white rounded-lg border border-kampmax-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
            <Truck className="h-4 w-4 text-kampmax-blue" />
            Delivery Method
          </h3>
          <div className="space-y-2">
            {([
              { id: "campus_pickup" as const, label: "Campus Pickup", desc: "Pick up at campus location", icon: StoreIcon, price: "Free" },
              { id: "delivery" as const, label: "Hostel Delivery", desc: "Delivered to your hostel", icon: Truck, price: "₦500" },
            ]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDeliveryMethod(opt.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                  deliveryMethod === opt.id
                    ? "border-kampmax-blue bg-blue-50 ring-1 ring-kampmax-blue"
                    : "border-kampmax-border"
                )}
              >
                <opt.icon className="h-5 w-5 text-kampmax-blue flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-kampmax-text">{opt.label}</p>
                  <p className="text-xs text-kampmax-text-secondary">{opt.desc}</p>
                </div>
                <span className="text-sm font-medium text-kampmax-navy">{opt.price}</span>
              </button>
            ))}
          </div>

          {deliveryMethod === "delivery" && (
            <div className="pt-2">
              <label className="text-xs text-kampmax-text-secondary mb-1 block">
                Delivery Address
              </label>
              <input
                type="text"
                placeholder="e.g. Room 12, Block B, RUGIPO Hostel"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-kampmax-border rounded-lg focus:outline-none focus:border-kampmax-blue"
              />
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg border border-kampmax-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-kampmax-text flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-kampmax-blue" />
            Payment Method
          </h3>
          <div className="space-y-2">
            {([
              { id: "paystack" as const, label: "Paystack", desc: "Card, Bank Transfer, USSD" },
              { id: "bank_transfer" as const, label: "Direct Bank Transfer", desc: "Pay to Kampmax account" },
            ]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPaymentMethod(opt.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                  paymentMethod === opt.id
                    ? "border-kampmax-blue bg-blue-50 ring-1 ring-kampmax-blue"
                    : "border-kampmax-border"
                )}
              >
                <Building2 className="h-5 w-5 text-kampmax-blue flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-kampmax-text">{opt.label}</p>
                  <p className="text-xs text-kampmax-text-secondary">{opt.desc}</p>
                </div>
                {paymentMethod === opt.id && (
                  <CheckCircle2 className="h-5 w-5 text-kampmax-blue" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg border border-kampmax-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-kampmax-text">Order Summary</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-kampmax-text-secondary">
                  {item.quantity}x {item.product.title}
                </span>
                <span className="text-kampmax-text font-medium">
                  {formatNaira(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-kampmax-border pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-kampmax-text-secondary">Delivery</span>
              <span className="text-kampmax-text">
                {deliveryFee > 0 ? formatNaira(deliveryFee) : "Free"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-kampmax-text">Total</span>
              <span className="font-bold text-kampmax-navy text-lg">
                {formatNaira(grandTotal)}
              </span>
            </div>
          </div>
        </section>

        <Button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isPlacing ? "Placing Order..." : `Place Order — ${formatNaira(grandTotal)}`}
        </Button>
      </div>
    </div>
  );
}
