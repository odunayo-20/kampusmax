import {
  AdminOrder,
  AdminWalletTxn,
  PaymentRecord,
  WalletAccount,
  WithdrawalRequest,
} from "@/types/admin";
import { mockUsers, mockVendors } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// ORDERS
// ------------------------------------------------------------

const ORDER_STATUSES = [
  "placed", "confirmed", "preparing", "out_for_delivery",
  "delivered", "delivered", "delivered", "cancelled",
] as const;

const PAYMENT_METHODS = ["paystack", "wallet", "bank_transfer", "cod"] as const;

export function buildMockOrders(count = 38): AdminOrder[] {
  const rand = seededRandom(15);
  const orders: AdminOrder[] = [];
  const approved = mockVendors.filter((v) => v.status === "approved");

  for (let i = 0; i < count; i++) {
    const vendor = pick(rand, approved);
    const customer = mockUsers[intBetween(rand, 0, mockUsers.length - 1)];
    const status = pick(rand, ORDER_STATUSES);
    const method = pick(rand, PAYMENT_METHODS);
    const subtotal = intBetween(rand, 8, 900) * 250;
    const deliveryMethod = pick(rand, ["campus_pickup", "meetup", "delivery"] as const);
    const deliveryFee = deliveryMethod === "delivery" ? 500 : 0;
    const paymentStatus =
      status === "cancelled"
        ? rand() > 0.5 ? "refunded" : "failed"
        : method === "cod"
          ? status === "delivered" ? "paid" : "pending"
          : "paid";

    orders.push({
      id: `KMP-${2400 + i}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      vendorId: vendor.id,
      vendorName: vendor.storeName,
      campusId: vendor.campusId,
      itemsCount: intBetween(rand, 1, 6),
      itemsSummary: `${intBetween(rand, 1, 3)}× ${pick(rand, ["Textbook", "Power bank", "Hoodie", "Groceries box", "Earbuds", "Mattress", "Skincare kit", "Photocopy pack"])}`,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: method,
      paymentStatus,
      status,
      deliveryMethod,
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 45)),
    });
  }
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const mockOrders: AdminOrder[] = buildMockOrders();

// ------------------------------------------------------------
// PAYMENTS LEDGER
// ------------------------------------------------------------

const PAYMENT_TYPES = [
  "order_payment", "order_payment", "order_payment",
  "wallet_funding", "vendor_payout", "refund", "commission",
] as const;

function makeRef(rand: () => number): string {
  return `PSK-${intBetween(rand, 100000, 999999)}${String.fromCharCode(65 + intBetween(rand, 0, 25))}`;
}

export function buildMockPayments(count = 34): PaymentRecord[] {
  const rand = seededRandom(23);
  const payments: PaymentRecord[] = [];

  for (let i = 0; i < count; i++) {
    const user = mockUsers[intBetween(rand, 0, mockUsers.length - 1)];
    const type = pick(rand, PAYMENT_TYPES);
    const statusRoll = rand();
    const amount =
      type === "commission"
        ? intBetween(rand, 4, 60) * 100
        : intBetween(rand, 10, 1200) * 250;

    payments.push({
      id: `pay-${String(i + 1).padStart(3, "0")}`,
      reference: makeRef(rand),
      userId: user.id,
      userName: user.name,
      counterparty:
        type === "vendor_payout"
          ? pick(rand, mockVendors.filter((v) => v.status === "approved")).storeName
          : type === "order_payment" || type === "commission"
            ? pick(rand, mockVendors.filter((v) => v.status === "approved")).storeName
            : null,
      type,
      method:
        type === "vendor_payout"
          ? "bank_transfer"
          : pick(rand, ["paystack", "wallet"] as const),
      amount,
      fee: Math.round(amount * 0.015),
      status:
        statusRoll > 0.9 ? "pending" : statusRoll > 0.84 ? "failed" : statusRoll > 0.79 ? "refunded" : "successful",
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 30)),
    });
  }
  return payments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const mockPayments: PaymentRecord[] = buildMockPayments();

// ------------------------------------------------------------
// WALLET ACCOUNTS + TRANSACTIONS
// ------------------------------------------------------------

export function buildMockWalletAccounts(): WalletAccount[] {
  const rand = seededRandom(31);
  const accounts: WalletAccount[] = [];
  const pool = [...mockVendors.slice(0, 12), ...mockUsers.slice(0, 14)];

  pool.forEach((owner, i) => {
    const ownerType = "storeName" in owner ? "vendor" : "user";
    const balance = intBetween(rand, 2, 320) * 500;
    accounts.push({
      id: `wal-${String(i + 1).padStart(3, "0")}`,
      ownerType,
      ownerName: ownerType === "vendor" ? (owner as (typeof mockVendors)[number]).storeName : owner.name,
      ownerEmail: owner.email,
      campusId: owner.campusId,
      balance,
      totalCredited: balance + intBetween(rand, 50, 800) * 250,
      totalDebited: intBetween(rand, 50, 700) * 250,
      status: rand() > 0.93 ? "frozen" : "active",
      lastActivityAt: daysAgoIso(rand, intBetween(rand, 0, 14)),
    });
  });
  return accounts;
}

export const mockWalletAccounts: WalletAccount[] = buildMockWalletAccounts();

export function buildMockWalletTxns(count = 40): AdminWalletTxn[] {
  const rand = seededRandom(57);
  const txns: AdminWalletTxn[] = [];

  for (let i = 0; i < count; i++) {
    const acct = mockWalletAccounts[intBetween(rand, 0, mockWalletAccounts.length - 1)];
    const direction = rand() > 0.42 ? "credit" : "debit";
    const type =
      direction === "credit"
        ? pick(rand, ["deposit", "refund", "adjustment"] as const)
        : pick(rand, ["withdrawal", "purchase", "vendor_payout", "commission"] as const);
    const amount = intBetween(rand, 5, 480) * 250;
    const statusRoll = rand();

    txns.push({
      id: `wtx-${String(i + 1).padStart(3, "0")}`,
      accountId: acct.id,
      ownerName: acct.ownerName,
      ownerType: acct.ownerType,
      direction,
      type,
      amount,
      balanceAfter: Math.max(0, acct.balance + (direction === "credit" ? amount : -amount)),
      reference: `WTX-${intBetween(rand, 10000, 99999)}`,
      status: statusRoll > 0.88 ? "pending" : statusRoll > 0.82 ? "failed" : "completed",
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 21)),
    });
  }
  return txns.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const mockWalletTxns: AdminWalletTxn[] = buildMockWalletTxns();

// ------------------------------------------------------------
// WITHDRAWALS
// ------------------------------------------------------------

const BANKS = ["GTBank", "Access Bank", "Zenith Bank", "Kuda MFB", "Moniepoint MFB", "Opay", "UBA"] as const;

export function buildMockWithdrawals(count = 16): WithdrawalRequest[] {
  const rand = seededRandom(77);
  const withdrawals: WithdrawalRequest[] = [];
  const approvedVendors = mockVendors.filter((v) => v.status === "approved");

  for (let i = 0; i < count; i++) {
    const vendor = approvedVendors[intBetween(rand, 0, approvedVendors.length - 1)];
    const statusRoll = rand();
    const status =
      statusRoll > 0.75 ? "pending" : statusRoll > 0.55 ? "processing" : statusRoll > 0.35 ? "approved" : statusRoll > 0.12 ? "paid" : "rejected";

    withdrawals.push({
      id: `wdr-${String(i + 1).padStart(3, "0")}`,
      vendorId: vendor.id,
      vendorName: vendor.storeName,
      bankName: pick(rand, BANKS),
      accountNumberMasked: `****${intBetween(rand, 1000, 9999)}`,
      accountName: vendor.ownerName,
      amount: intBetween(rand, 20, 600) * 500,
      fee: 100,
      status,
      requestedAt: daysAgoIso(rand, intBetween(rand, 0, 18)),
      processedAt: ["approved", "paid", "rejected"].includes(status)
        ? daysAgoIso(rand, intBetween(rand, 0, 10))
        : null,
      note:
        status === "rejected"
          ? "Account name mismatch with BVN records"
          : null,
    });
  }
  return withdrawals.sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}

export const mockWithdrawals: WithdrawalRequest[] = buildMockWithdrawals();
