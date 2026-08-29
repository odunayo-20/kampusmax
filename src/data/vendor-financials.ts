import type {
  VendorPayoutAccount,
  VendorPayout,
  VendorPayoutAccountStatus,
  VendorPayoutStatus,
} from "@/types/vendor-financials";
import { VENDOR_FINANCIAL_LIMITS } from "@/types/vendor-financials";

// ============================================================
// VENDOR FINANCIALS SEED DATA  (Module 14)
// ============================================================
//
// This is the STAND-IN for the backend's payout/statement store.
// All payouts are owned by the authenticated vendor (v8). The service
// ALWAYS filters by the authenticated vendor.

export const INITIAL_PAYOUT_ACCOUNT: VendorPayoutAccount = {
  bankName: "Guaranty Trust Bank",
  bankCode: "058",
  accountName: "Adebayo Oluwaseun",
  maskedAccountNumber: "••••••••4317",
  status: "verified",
  verifiedAt: "2026-08-15T10:30:00.000Z",
  currency: "NGN",
  restrictions: [],
};

export const INITIAL_PAYOUTS: VendorPayout[] = [
  {
    id: "POUT-2001",
    amount: 9000,
    fee: VENDOR_FINANCIAL_LIMITS.PAYOUT_FEE,
    status: "successful",
    bankName: "Guaranty Trust Bank",
    maskedAccountNumber: "••••••••4317",
    requestedAt: "2026-08-24T12:00:00.000Z",
    processedAt: "2026-08-24T12:15:00.000Z",
    reference: "KMPPOUT-2001",
    idempotencyKey: "idem-2001-aug24",
  },
  {
    id: "POUT-2000",
    amount: 25000,
    fee: VENDOR_FINANCIAL_LIMITS.PAYOUT_FEE,
    status: "processing",
    bankName: "Guaranty Trust Bank",
    maskedAccountNumber: "••••••••4317",
    requestedAt: "2026-08-28T09:00:00.000Z",
    expectedAt: "2026-08-29T23:59:59.000Z",
    reference: "KMPPOUT-2000",
    idempotencyKey: "idem-2000-aug28",
  },
];

// ── Mutable in-memory store (prototype) ──────────────────────
// The service owns all mutations. Payouts requested in-session persist
// for the lifetime of the process (or until hot-reload).

export const financialsStore = {
  payouts: [...INITIAL_PAYOUTS] as VendorPayout[],
  idempotencyKeys: new Set<string>(INITIAL_PAYOUTS.map((p) => p.idempotencyKey)),
};