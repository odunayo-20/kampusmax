"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCheckout } from "@/hooks/useCheckout";
import { useCart } from "@/lib/cart-context";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/atoms/Button";
import {
  DeliverySection,
  DeliveryMethodSection,
  VendorOrderGroup,
  PromoCodeSection,
  LoyaltyPointsSection,
  PaymentMethodSection,
  OrderSummarySection,
  ConfirmationSection,
} from "@/components/checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();
  const activeItems = useMemo(
    () => items.filter((i) => !i.savedForLater),
    [items]
  );

  const {
    form,
    errors,
    isPlacing,
    checkoutSummary,
    vendorGroupsResolved,
    walletBalance,
    loyaltyPoints,
    maxLoyaltyPoints,
    useAllPoints,
    appliedPromo,
    promoError,
    setField,
    applyPromoCode,
    removePromoCode,
    setLoyaltyPointsToUse,
    toggleUseAllPoints,
    placeOrder,
  } = useCheckout();

  async function handlePlaceOrder() {
    const success = await placeOrder();
    if (success) {
      router.push("/orders");
    }
  }

  // Empty cart guard
  if (activeItems.length === 0 && !isPlacing) {
    return (
      <PageContainer narrow>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-kampmax-text mb-1">
            Your cart is empty
          </h2>
          <p className="text-sm text-kampmax-text-secondary max-w-xs mb-6">
            Add some items to your cart before checking out.
          </p>
          <Button
            onClick={() => router.push("/marketplace")}
            className="bg-kampmax-navy text-white hover:bg-kampmax-navy/90"
          >
            Browse Marketplace
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-kampmax-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-kampmax-text">Checkout</h1>
            <p className="text-xs text-kampmax-text-secondary">
              {checkoutSummary.itemCount} {checkoutSummary.itemCount === 1 ? "item" : "items"}
              {vendorGroupsResolved.length > 1 &&
                ` from ${vendorGroupsResolved.length} vendors`}
            </p>
          </div>
        </div>

        {/* 1. Delivery Method */}
        <DeliveryMethodSection
          form={form}
          errors={errors}
          onFieldChange={setField}
        />

        {/* 2. Delivery Details (address / campus / pickup) */}
        <DeliverySection
          form={form}
          errors={errors}
          onFieldChange={setField}
        />

        {/* 3. Vendor/Order Grouping */}
        <VendorOrderGroup groups={vendorGroupsResolved} />

        {/* 4. Promo Code */}
        <PromoCodeSection
          appliedPromo={appliedPromo}
          promoError={promoError}
          promoCode={form.promoCode}
          onPromoCodeChange={(v) => setField("promoCode", v)}
          onApply={applyPromoCode}
          onRemove={removePromoCode}
        />

        {/* 5. Loyalty Points */}
        <LoyaltyPointsSection
          availablePoints={loyaltyPoints}
          maxPoints={maxLoyaltyPoints}
          pointsToUse={form.loyaltyPointsToUse}
          useAllPoints={useAllPoints}
          onPointsChange={setLoyaltyPointsToUse}
          onToggleAll={toggleUseAllPoints}
        />

        {/* 6. Payment Method */}
        <PaymentMethodSection
          form={form}
          errors={errors}
          walletBalance={walletBalance}
          finalTotal={checkoutSummary.finalTotal}
          onFieldChange={setField}
        />

        {/* 7. Order Summary */}
        <OrderSummarySection summary={checkoutSummary} />

        {/* 8. Confirmation */}
        <ConfirmationSection
          finalTotal={checkoutSummary.finalTotal}
          isPlacing={isPlacing}
          paymentMethod={form.paymentMethod}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </PageContainer>
  );
}
