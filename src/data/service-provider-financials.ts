import type {
  SpPayoutAccount,
  SpPayout,
  SpPayoutAccountStatus,
  SpPayoutStatus,
} from "@/types/service-provider-financials";
import { SP_FINANCIAL_LIMITS } from "@/types/service-provider-financials";

// ============================================================
// SERVICE PROVIDER FINANCIALS SEED DATA  (Module 20)
// ============================================================
//
// This is the STAND-IN for the backend's payout/statement store. All payouts
// are owned by the authenticated service provider (sp1). The service ALWAYS
// filters by the authenticated provider. Timestamps are relative to process
// start so the store stays coherent with the relative booking ledger.

const NOW_MS = Date.now();
const DAY_MS = 24 * 3_600_000;

const daysAgo = (days: number, hourUtc = 9): string => {
  const d = new Date(NOW_MS - days * DAY_MS);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toISOString();
};
const daysAgoPlus = (days: number, minutes: number): string =>
  new Date(new Date(daysAgo(days)).getTime() + minutes * 60_000).toISOString();

export const INITIAL_SP_PAYOUT_ACCOUNT: SpPayoutAccount = {
  bankName: "Guaranty Trust Bank",
  bankCode: "058",
  accountName: "Adebayo Oluwaseun",
  maskedAccountNumber: "••••••••4317",
  status: "verified",
  verifiedAt: daysAgo(40),
  currency: "NGN",
  restrictions: [],
};

export const INITIAL_SP_PAYOUTS: SpPayout[] = [
  {
    id: "SPOUT-2003",
    amount: 12000,
    fee: SP_FINANCIAL_LIMITS.PAYOUT_FEE,
    status: "successful",
    bankName: "Guaranty Trust Bank",
    maskedAccountNumber: "••••••••4317",
    requestedAt: daysAgo(9, 10),
    processedAt: daysAgoPlus(9, 15),
    reference: "KMP-SPOUT-2003",
    idempotencyKey: "sp-idem-2003",
  },
  {
    id: "SPOUT-2002",
    amount: 6000,
    fee: SP_FINANCIAL_LIMITS.PAYOUT_FEE,
    status: "successful",
    bankName: "Guaranty Trust Bank",
    maskedAccountNumber: "••••••••4317",
    requestedAt: daysAgo(2, 8),
    processedAt: daysAgoPlus(2, 10),
    reference: "KMP-SPOUT-2002",
    idempotencyKey: "sp-idem-2002",
  },
  {
    id: "SPOUT-2001",
    amount: 15000,
    fee: SP_FINANCIAL_LIMITS.PAYOUT_FEE,
    status: "failed",
    bankName: "Guaranty Trust Bank",
    maskedAccountNumber: "••••••••4317",
    requestedAt: daysAgo(16, 11),
    processedAt: daysAgoPlus(16, 30),
    failedReason: "Bank could not confirm the recipient account.",
    reference: "KMP-SPOUT-2001",
    idempotencyKey: "sp-idem-2001",
  },
];

// ── Mutable in-memory store (prototype) ──────────────────────
// The service owns all mutations. Payouts requested in-session persist
// for the lifetime of the process (or until hot-reload).

export const spFinancialsStore = {
  account: { ...INITIAL_SP_PAYOUT_ACCOUNT } as SpPayoutAccount,
  payouts: [...INITIAL_SP_PAYOUTS] as SpPayout[],
  idempotencyKeys: new Set<string>(INITIAL_SP_PAYOUTS.map((p) => p.idempotencyKey)),
};

/** Mask a raw account number for display. Non-digits are stripped first. */
export function maskAccountNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 4) return "••••••••••";
  return `••••••••${digits.slice(-4)}`;
}