import type { CartLineItem } from "@/types/cart";
import { getVendorById, getUserById } from "@/services/users";
import { estimateDelivery } from "@/services/cart";
import type {
  CheckoutSession,
  CheckoutSessionOptions,
  CheckoutVendorGroup,
  VendorDeliveryOption,
  VendorDeliverySelection,
  CheckoutActionResult,
  CheckoutErrorInfo,
  CouponState,
  CouponCheckoutStatus,
  PaymentVerificationResult,
  DeliveryAddress,
} from "@/types/checkout";

/**
 * Checkout service layer (repository).
 *
 * All checkout API communication is isolated behind this module and maps 1:1
 * to the future Kampmax backend:
 *
 *   POST /checkout/session           -> createCheckoutSession()
 *   GET  /checkout/session/:id       -> getCheckoutSession()
 *   POST /checkout/validate          -> validateCheckout()
 *   POST /checkout/coupons/apply     -> applyCoupon()
 *   POST /checkout/coupons/remove    -> removeCoupon()
 *   POST /checkout/delivery/select   -> selectDelivery()
 *   POST /checkout/payments/initialize -> initializePaystackPayment()
 *   GET  /checkout/payments/:ref     -> getPaymentStatus()
 *
 * There is NO real backend yet, so:
 *  - A local, synchronous *presentation* session is derived from the live cart
 *    so the UI can be exercised (marked clearly as display-only).
 *  - Every financial operation that would normally be backend-authoritative
 *    returns a typed "not available until backend" result. The frontend never
 *    fabricates coupon validation, coin conversion, or payment success.
 *
 * Configuration:
 *  - `COUPON_VALIDATION_ENABLED` / `KAMPmax_COIN_ENABLED` / `LOYALTY_ENABLED`
 *    represent backend feature flags (default off) so the UI can degrade
 *    gracefully rather than guess.
 */

const CHECKOUT_SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const PLATFORM_FEE_RATE = 0.025;
const PLATFORM_FEE_MIN = 50;
const PLATFORM_FEE_MAX = 2000;

// Feature flags — these would come from backend config. Defaults keep the
// frontend from hard-coding unavailable money features.
interface CheckoutFeatureFlags {
  couponValidationEnabled: boolean;
  kampmaxCoinEnabled: boolean;
  loyaltyEnabled: boolean;
  paystackEnabled: boolean;
}

const FEATURE_FLAGS: CheckoutFeatureFlags = {
  couponValidationEnabled: false,
  kampmaxCoinEnabled: false,
  loyaltyEnabled: true,
  paystackEnabled: true,
};

// ── Error helpers (sanitised for the UI) ──────────────────────────────────

function sanitizeError(err: unknown, fallback: string): CheckoutErrorInfo {
  if (err instanceof Error && err.message) {
    return { message: err.message };
  }
  return { message: fallback };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function makeSessionId(): string {
  return `cs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function platformFee(subtotal: number): number {
  return Math.max(
    PLATFORM_FEE_MIN,
    Math.min(PLATFORM_FEE_MAX, Math.round(subtotal * PLATFORM_FEE_RATE))
  );
}

/**
 * The default, non-authoritative vendor delivery options. Real prices must
 * come from the backend per vendor+campus. For the prototype we present the
 * options with the established hostel fee as a placeholder and vendor pickup
 * at zero — clearly display only. `selectDelivery` returns "backend required".
 */
function buildVendorDeliveryOptions(vendorId: string): VendorDeliveryOption[] {
  const estimated = estimateDelivery(vendorId);
  return [
    {
      id: `${vendorId}:campus_delivery`,
      method: "campus_delivery",
      label: "Campus Delivery",
      fee: 500, // placeholder — backend authoritative
      estimatedDelivery: estimated,
      state: "available",
    },
    {
      id: `${vendorId}:campus_pickup`,
      method: "campus_pickup",
      label: "Campus Pickup",
      fee: 0,
      estimatedDelivery: "Same day",
      state: "available",
    },
    {
      id: `${vendorId}:vendor_pickup`,
      method: "vendor_pickup",
      label: "Vendor Pickup",
      fee: 0,
      estimatedDelivery: "As agreed with vendor",
      state: "available",
    },
  ];
}

function groupVendorItems(
  items: CartLineItem[]
): { vendorId: string; items: CartLineItem[]; subtotal: number }[] {
  const map = new Map<string, { items: CartLineItem[]; subtotal: number }>();
  for (const item of items) {
    const vid = item.vendorId;
    if (!map.has(vid)) map.set(vid, { items: [], subtotal: 0 });
    const entry = map.get(vid)!;
    entry.items.push(item);
    entry.subtotal += (item.unitPrice ?? item.product.price) * item.quantity;
  }
  return Array.from(map.entries()).map(([vendorId, v]) => ({
    vendorId,
    items: v.items,
    subtotal: v.subtotal,
  }));
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Future: POST /checkout/session
 * Local presentation session from a live cart. Amounts are display-only.
 */
export function createCheckoutSession(options: CheckoutSessionOptions): CheckoutSession {
  const { items, campusId, customerId } = options;
  const active = items.filter((i) => !i.savedForLater);

  const vendorRaw = groupVendorItems(active);
  const itemsSubtotal = vendorRaw.reduce((s, v) => s + v.subtotal, 0);
  const itemCount = active.reduce((s, i) => s + i.quantity, 0);
  const deliveryTotal = 0; // computed after per-vendor delivery selection (backend)
  const platformFeeTotal = platformFee(itemsSubtotal);
  const discountTotal = 0; // backend authoritative
  const coinDeduction = 0; // backend authoritative
  const finalTotal =
    Math.max(0, itemsSubtotal + platformFeeTotal + deliveryTotal - discountTotal - coinDeduction);

  const vendorGroups: CheckoutVendorGroup[] = vendorRaw.map((v) => {
    const vendor = getVendorById(v.vendorId);
    const optionsList = buildVendorDeliveryOptions(v.vendorId);
    const defaultDelivery: VendorDeliverySelection = {
      vendorId: v.vendorId,
      method: "campus_pickup",
      optionId: `${v.vendorId}:campus_pickup`,
      fee: 0,
      estimatedDelivery: "Same day",
    };
    return {
      vendorId: v.vendorId,
      vendorName: vendor?.storeName || "Unknown Vendor",
      vendorVerified: vendor?.verified || false,
      items: v.items,
      subtotal: v.subtotal,
      deliveryOptions: optionsList,
      selectedDelivery: defaultDelivery,
      deliveryReady: true,
    };
  });

  return {
    sessionId: makeSessionId(),
    customerId,
    campusId,
    currency: "NGN",
    itemsSubtotal,
    deliveryTotal,
    discountTotal,
    coinDeduction,
    finalTotal,
    vendorGroups,
    pricing: {
      itemsSubtotal,
      platformFee: platformFeeTotal,
      deliveryTotal,
      discountTotal,
      coinDeduction,
      finalTotal,
      itemCount,
    },
    expiresAt: new Date(Date.now() + CHECKOUT_SESSION_TTL_MS).toISOString(),
    paystackEnabled: FEATURE_FLAGS.paystackEnabled,
  };
}

/**
 * Future: GET /checkout/session/:id
 * In the prototype the session is held locally (React state) so it is simply
 * returned. A real implementation would fetch/refresh from the backend.
 */
export function getCheckoutSession(session: CheckoutSession): CheckoutSession {
  return {
    ...session,
    expiresAt: new Date(Date.now() + CHECKOUT_SESSION_TTL_MS).toISOString(),
  };
}

export function isCheckoutSessionExpired(session: CheckoutSession): boolean {
  return new Date(session.expiresAt).getTime() < Date.now();
}

/**
 * Future: POST /checkout/validate
 * Backend-authoritative validation is required; we cannot confirm cart
 * validity, prices, delivery, or vendor availability client-side. This returns
 * a clearly-marked "backend required" outcome so the UI never asserts validity.
 */
export async function validateCheckout(
  session: CheckoutSession
): Promise<CheckoutActionResult> {
  // Simulate an async round-trip so the LOADING/VALIDATING states are real.
  await new Promise((r) => setTimeout(r, 600));
  void session;
  return {
    ok: false,
    error: {
      code: "backend_required",
      message: "Cart validation on the server is not available in this prototype.",
    },
  };
}

/**
 * Future: POST /checkout/coupons/apply
 * Coupon validation is backend-driven. Until the backend exists, applying a
 * coupon returns a "not applicable / backend required" result so we never
 * fabricate a fake discount.
 */
export async function applyCoupon(
  session: CheckoutSession,
  code: string
): Promise<CheckoutActionResult<CouponState>> {
  if (!FEATURE_FLAGS.couponValidationEnabled) {
    return {
      ok: false,
      data: {
        code,
        status: "not_applicable",
        message: "Promo codes are validated securely at checkout by the server.",
      },
      error: {
        code: "backend_required",
        message: "Coupon validation requires the checkout backend.",
      },
    };
  }
  void session;
  return {
    ok: false,
    data: { code, status: "not_applicable" },
    error: { code: "backend_required", message: "Coupon backend unavailable." },
  };
}

export async function removeCoupon(): Promise<CheckoutActionResult<CouponState>> {
  return {
    ok: true,
    data: { code: "", status: "idle" },
  };
}

/**
 * Future: POST /checkout/delivery/select
 * Delivery fees are backend-authoritative. This returns the selection for
 * local UI state only (expanding/collapsing vendor/fee display updates), with
 * a note that the authoritative fee is set server-side.
 */
export async function selectDelivery(
  session: CheckoutSession,
  selection: VendorDeliverySelection
): Promise<CheckoutActionResult<VendorDeliverySelection>> {
  await new Promise((r) => setTimeout(r, 300));
  void session;
  return {
    ok: true,
    data: selection,
    error: {
      code: "backend_required",
      message:
        "Delivery fee is display-only until the backend confirms the amount.",
    },
  };
}

export function getDefaultSelectedDelivery(
  vendorId: string
): VendorDeliverySelection {
  return {
    vendorId,
    method: "campus_pickup",
    optionId: `${vendorId}:campus_pickup`,
    fee: 0,
    estimatedDelivery: "Same day",
  };
}

/**
 * Future: POST /checkout/payments/initialize (Paystack)
 * The backend must create the payment session/reference. The frontend only
 * launches the provider flow. Without a backend, initialization is refused —
 * we never fake a payment reference.
 */
export async function initializePaystackPayment(
  session: CheckoutSession
): Promise<CheckoutActionResult> {
  await new Promise((r) => setTimeout(r, 400));
  void session;
  return {
    ok: false,
    error: {
      code: "backend_required",
      message:
        "Payment initialization requires the checkout backend. No real payment is processed in this prototype.",
    },
  };
}

/**
 * Future: GET /checkout/payments/:ref
 * Payment status must be confirmed by the backend (provider webhooks), never
 * from URL query params. Without a backend the status is verification-required.
 */
export async function getPaymentStatus(
  reference: string
): Promise<CheckoutActionResult<PaymentVerificationResult>> {
  void reference;
  return {
    ok: false,
    data: {
      status: "verification_required",
      reference,
      message:
        "Payment verification requires the backend. Please check your Orders page shortly.",
    },
    error: {
      code: "backend_required",
      message: "Payment verification requires the checkout backend.",
    },
  };
}

// ── Customer / address (reuses existing profile + auth data) ──────────────

export function getCustomerInfo(customerId?: string): {
  fullName: string;
  email: string;
  phone: string;
} {
  const user = customerId ? getUserById(customerId) : undefined;
  return {
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };
}

// Re-export address helpers so the UI layer imports from one place and can be
// swapped for an API later without touching components.
export {
  getSavedAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "@/services/profile";
export type { DeliveryAddress };

// ── Feature flags for the UI ──────────────────────────────────────────────

export function checkoutFeatureFlags(): CheckoutFeatureFlags {
  return FEATURE_FLAGS;
}

export function couponStatusLabel(status: CouponCheckoutStatus): string {
  const labels: Record<CouponCheckoutStatus, string> = {
    idle: "",
    loading: "Validating…",
    valid: "Promo code applied.",
    invalid: "This promo code isn't valid.",
    expired: "This promo code has expired.",
    minimum_not_reached:
      "This promo requires a minimum order value that wasn't reached.",
    vendor_specific: "This promo only applies to specific vendors.",
    product_specific: "This promo only applies to specific products.",
    already_used: "This promo code has already been used.",
    not_applicable: "This promo code can't be applied to this order.",
  };
  return labels[status];
}

/**
 * Display-only estimate of loyalty points a customer will earn on a subtotal.
 *
 * The real earn rate and any caps are defined by the backend's loyalty config
 * (NOT hard-coded on the client). This is a rough "you'll earn ~N points"
 * estimate shown before payment; the authoritative number is credited by the
 * server after the order is confirmed. When loyalty is disabled it returns 0.
 */
export function estimateLoyaltyPointsEarned(subtotal: number): number {
  if (!FEATURE_FLAGS.loyaltyEnabled) return 0;
  // Placeholder display rate (5% of spend). The server is the source of truth.
  return Math.round(subtotal * 0.05);
}
