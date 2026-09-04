import type {
  FlPayout,
  FlPayoutAccount,
} from "@/types/freelancer-financials";
import { FL_FINANCIAL_LIMITS } from "@/types/freelancer-financials";

// ============================================================
// FREELANCER FINANCIALS SEED DATA  (Module 25)
// ============================================================
//
// This is the STAND-IN for the backend's payout/statement store. All payouts
// are owned by the authenticated freelancer. The service ALWAYS filters by the
// authenticated identity. Timestamps are relative to process start so the store
// stays coherent with the relative contract ledger (Module 24).

const NOW_MS = Date.now();
const DAY_MS = 24 * 3_600_000;

const daysAgo = (days: number, hourUtc = 9): string => {
  const d = new Date(NOW_MS - days * DAY_MS);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toISOString();
};
const daysAgoPlus = (days: number, minutes: number): string =>
  new Date(new Date(daysAgo(days)).getTime() + minutes * 60_000).toISOString();

export const INITIAL_FL_PAYOUT_ACCOUNT: FlPayoutAccount = {
  bankName: "Guaranty Trust Bank",
  bankCode: "058",
  accountName: "Adebayo Oluwaseun",
  maskedAccountNumber: "••••••••4317",
  status: "verified",
  verifiedAt: daysAgo(40),
  currency: "NGN",
  restrictions: [],
};

const baseEvents = (p: {
  id: string;
  status: FlPayout["status"];
  amount: number;
  fee: number;
  requestedAt: string;
  processedAt?: string;
  failedReason?: string;
  reversalReason?: string;
}): FlPayout["events"] => {
  const events: FlPayout["events"] = [
    { id: `${p.id}-req`, title: "Withdrawal requested", detail: `Amount requested and queued for processing.`, at: p.requestedAt },
  ];
  if (p.status === "processing") {
    events.push({ id: `${p.id}-proc`, title: "Processing", detail: "Your withdrawal is being processed by the payout system.", at: p.requestedAt });
  }
  if (p.processedAt && (p.status === "completed" || p.status === "reversed")) {
    events.push({ id: `${p.id}-done`, title: "Processed", detail: p.status === "reversed" ? "Payout sent to bank, then reversed by the payment system." : "Funds sent to your bank account.", at: p.processedAt });
  }
  if (p.failedReason) {
    events.push({ id: `${p.id}-fail`, title: "Failed", detail: p.failedReason, at: p.processedAt ?? p.requestedAt });
  }
  if (p.reversalReason) {
    events.push({ id: `${p.id}-rev`, title: "Reversed", detail: p.reversalReason, at: p.processedAt ?? p.requestedAt });
  }
  return events;
};

export const INITIAL_FL_PAYOUTS: FlPayout[] = (
  [
    {
      id: "FLPOUT-4003",
      amount: 120000,
      fee: FL_FINANCIAL_LIMITS.PAYOUT_FEE,
      status: "completed",
      bankName: "Guaranty Trust Bank",
      maskedAccountNumber: "••••••••4317",
      requestedAt: daysAgo(14, 9),
      processedAt: daysAgoPlus(14, 45),
      reference: "KMP-FLPOUT-4003",
      idempotencyKey: "fl-idem-4003",
      events: [],
    },
    {
      id: "FLPOUT-4002",
      amount: 60000,
      fee: FL_FINANCIAL_LIMITS.PAYOUT_FEE,
      status: "completed",
      bankName: "Guaranty Trust Bank",
      maskedAccountNumber: "••••••••4317",
      requestedAt: daysAgo(30, 8),
      processedAt: daysAgoPlus(30, 30),
      reference: "KMP-FLPOUT-4002",
      idempotencyKey: "fl-idem-4002",
      events: [],
    },
    {
      id: "FLPOUT-4001",
      amount: 50000,
      fee: FL_FINANCIAL_LIMITS.PAYOUT_FEE,
      status: "failed",
      bankName: "Guaranty Trust Bank",
      maskedAccountNumber: "••••••••4317",
      requestedAt: daysAgo(38, 11),
      processedAt: daysAgoPlus(38, 120),
      failedReason: "The recipient bank could not complete the transfer on time.",
      reference: "KMP-FLPOUT-4001",
      idempotencyKey: "fl-idem-4001",
      events: [],
    },
  ] satisfies FlPayout[]
).map((p) => ({ ...p, events: baseEvents(p) }));

// ── Mutable in-memory store (prototype) ──────────────────────
// The service owns all mutations. Payouts requested in-session persist
// for the lifetime of the process (or until hot-reload).

export const flFinancialsStore = {
  account: { ...INITIAL_FL_PAYOUT_ACCOUNT } as FlPayoutAccount,
  payouts: [...INITIAL_FL_PAYOUTS] as FlPayout[],
  idempotencyKeys: new Set<string>(INITIAL_FL_PAYOUTS.map((p) => p.idempotencyKey)),
};

/** Mask a raw account number for display. Non-digits are stripped first. */
export function maskAccountNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 4) return "••••••••••";
  return `••••••••${digits.slice(-4)}`;
}
