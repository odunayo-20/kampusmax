"use client";

import { useState, useMemo, useCallback } from "react";
import {
  CheckoutFormData,
  CheckoutValidation,
  CheckoutSummary,
  DeliveryMethod,
  PaymentMethod,
  PickupLocation,
  PromoCode,
} from "@/types";
import { useCart, VendorCartGroup } from "@/lib/cart-context";
import { getVendorById } from "@/services/users";
import { getWalletBalance } from "@/services/wallet";

// ── Mock promo codes (will be replaced by API) ──
const VALID_PROMO_CODES: Record<string, PromoCode> = {
  CAMPUS10: {
    code: "CAMPUS10",
    discountType: "percentage",
    discountValue: 10,
    maxDiscount: 2000,
    minOrderAmount: 5000,
    description: "10% off (up to ₦2,000)",
    expiresAt: "2026-12-31",
  },
  WELCOME500: {
    code: "WELCOME500",
    discountType: "fixed",
    discountValue: 500,
    minOrderAmount: 3000,
    description: "₦500 off your order",
    expiresAt: "2026-12-31",
  },
  RUGIPO20: {
    code: "RUGIPO20",
    discountType: "percentage",
    discountValue: 20,
    maxDiscount: 5000,
    minOrderAmount: 10000,
    description: "20% off for RUGIPO students (up to ₦5,000)",
    expiresAt: "2026-06-30",
  },
};

// ── Mock loyalty config ──
const LOYALTY_RATE = 1; // 1 point = ₦1
const LOYALTY_EARN_RATE = 0.05; // earn 5% of spend as points
const MAX_LOYALTY_PERCENTAGE = 0.3; // max 30% of order can be paid with points

const INITIAL_FORM: CheckoutFormData = {
  deliveryMethod: "campus_pickup",
  pickupLocation: "main_gate",
  deliveryAddress: "",
  campusId: "rugipo",
  paymentMethod: "paystack",
  promoCode: "",
  loyaltyPointsToUse: 0,
  notes: "",
};

export function useCheckout(userId: string = "u1") {
  const { items, vendorGroups, summary: cartSummary, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<CheckoutValidation>({});
  const [isPlacing, setIsPlacing] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250); // mock balance
  const [useAllPoints, setUseAllPoints] = useState(false);

  // ── Derived vendor data ──
  const vendorGroupsResolved = useMemo(() => {
    return vendorGroups.map((g) => {
      const vendor = getVendorById(g.vendorId);
      return {
        ...g,
        vendorName: vendor?.storeName || "Unknown Vendor",
        vendorVerified: vendor?.verified || false,
      };
    });
  }, [vendorGroups]);

  // ── Delivery fee ──
  const deliveryFee = useMemo(() => {
    if (form.deliveryMethod === "campus_pickup" || form.deliveryMethod === "meetup") return 0;
    return 500;
  }, [form.deliveryMethod]);

  // ── Promo discount ──
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountType === "fixed") {
      return appliedPromo.discountValue;
    }
    const raw = Math.round(cartSummary.itemsSubtotal * (appliedPromo.discountValue / 100));
    return appliedPromo.maxDiscount ? Math.min(raw, appliedPromo.maxDiscount) : raw;
  }, [appliedPromo, cartSummary.itemsSubtotal]);

  // ── Loyalty points ──
  const maxLoyaltyPoints = useMemo(() => {
    const maxSpend = Math.round(cartSummary.itemsSubtotal * MAX_LOYALTY_PERCENTAGE);
    return Math.min(maxSpend, loyaltyPoints);
  }, [cartSummary.itemsSubtotal, loyaltyPoints]);

  const loyaltyPointsToUse = useMemo(() => {
    if (useAllPoints) return maxLoyaltyPoints;
    return Math.min(form.loyaltyPointsToUse, maxLoyaltyPoints);
  }, [useAllPoints, form.loyaltyPointsToUse, maxLoyaltyPoints]);

  const loyaltyDiscount = loyaltyPointsToUse * LOYALTY_RATE;

  // ── Final total ──
  const finalTotal = useMemo(() => {
    const sub = cartSummary.itemsSubtotal - discountAmount - loyaltyDiscount;
    return Math.max(0, sub + deliveryFee + cartSummary.platformFee);
  }, [cartSummary, discountAmount, loyaltyDiscount, deliveryFee]);

  // ── Points earned ──
  const loyaltyPointsEarned = useMemo(() => {
    const eligibleSpend = Math.max(0, cartSummary.itemsSubtotal - discountAmount);
    return Math.round(eligibleSpend * LOYALTY_EARN_RATE);
  }, [cartSummary.itemsSubtotal, discountAmount]);

  // ── Checkout summary ──
  const checkoutSummary: CheckoutSummary = useMemo(
    () => ({
      itemsSubtotal: cartSummary.itemsSubtotal,
      platformFee: cartSummary.platformFee,
      deliveryFee,
      discountAmount,
      loyaltyDiscount,
      finalTotal,
      itemCount: cartSummary.itemCount,
      appliedPromo,
      loyaltyPointsUsed: loyaltyPointsToUse,
      loyaltyPointsEarned,
    }),
    [
      cartSummary,
      deliveryFee,
      discountAmount,
      loyaltyDiscount,
      finalTotal,
      appliedPromo,
      loyaltyPointsToUse,
      loyaltyPointsEarned,
    ]
  );

  // ── Wallet balance ──
  const walletBalance = useMemo(() => getWalletBalance(userId), [userId]);

  // ── Form setters ──
  const setField = useCallback(
    <K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear related error
      if (key in errors) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [errors]
  );

  // ── Promo code ──
  const applyPromoCode = useCallback(() => {
    const code = form.promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Enter a promo code");
      return;
    }
    const promo = VALID_PROMO_CODES[code];
    if (!promo) {
      setPromoError("Invalid promo code");
      return;
    }
    if (promo.minOrderAmount && cartSummary.itemsSubtotal < promo.minOrderAmount) {
      setPromoError(`Minimum order: ₦${promo.minOrderAmount.toLocaleString()}`);
      return;
    }
    setAppliedPromo(promo);
    setPromoError(null);
  }, [form.promoCode, cartSummary.itemsSubtotal]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setForm((prev) => ({ ...prev, promoCode: "" }));
    setPromoError(null);
  }, []);

  // ── Loyalty points ──
  const setLoyaltyPointsToUse = useCallback(
    (pts: number) => {
      setUseAllPoints(false);
      setForm((prev) => ({ ...prev, loyaltyPointsToUse: pts }));
    },
    []
  );

  const toggleUseAllPoints = useCallback(() => {
    setUseAllPoints((prev) => !prev);
    if (!useAllPoints) {
      setForm((prev) => ({ ...prev, loyaltyPointsToUse: maxLoyaltyPoints }));
    } else {
      setForm((prev) => ({ ...prev, loyaltyPointsToUse: 0 }));
    }
  }, [useAllPoints, maxLoyaltyPoints]);

  // ── Validation ──
  const validate = useCallback((): boolean => {
    const errs: CheckoutValidation = {};

    if (form.deliveryMethod === "delivery" && !form.deliveryAddress.trim()) {
      errs.deliveryAddress = "Enter your delivery address";
    }
    if (form.deliveryMethod === "campus_pickup" && !form.pickupLocation) {
      errs.pickupLocation = "Select a pickup location";
    }
    if (form.paymentMethod === "wallet" && walletBalance < finalTotal) {
      errs.paymentMethod = `Insufficient wallet balance (₦${walletBalance.toLocaleString()})`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, walletBalance, finalTotal]);

  // ── Place order ──
  const placeOrder = useCallback(async () => {
    if (!validate()) return false;

    setIsPlacing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPlacing(false);
    clearCart();
    return true;
  }, [validate, clearCart]);

  return {
    // State
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

    // Actions
    setField,
    applyPromoCode,
    removePromoCode,
    setLoyaltyPointsToUse,
    toggleUseAllPoints,
    placeOrder,
  };
}
