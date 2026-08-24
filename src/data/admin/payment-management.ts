import { mockPayments } from "./commerce";
import { mockUsers } from "./people";
import { buildManagedOrderDataset } from "./order-management";
import { intBetween, seededRandom } from "@/lib/admin/api";
import type {
  ManagedOrder,
  ManagedPayment,
  ManagedPaymentDetail,
  ManagedPaymentMethod,
  ManagedPaymentStatus,
  ManagedPaymentTimelineEvent,
} from "@/types/admin";

/**
 * Payment management dataset (/admin/payments).
 *
 * Seeds from the shared commerce payments ledger and layers on console
 * fields: grouped method buckets (wallet / paystack / other), platform
 * fee split, gateway references, deterministic coverage of every
 * payment status, order linkage for order-scoped flows and a timeline.
 */

const rand = seededRandom(5152);

function mapStatus(seed: string, i: number): ManagedPaymentStatus {
  const base: ManagedPaymentStatus =
    seed === "successful"
      ? "successful"
      : seed === "pending"
        ? "pending"
        : seed === "failed"
          ? "failed"
          : "refunded";
  // Deterministic coverage overrides - every console status must appear
  // regardless of how the commerce seed rolled.
  if (i % 11 === 10) return "reversed";
  if (i % 8 === 6) return "partially_refunded";
  if (i % 9 === 7) return "refunded";
  return base;
}

function mapMethod(seedMethod: string): ManagedPaymentMethod {
  if (seedMethod === "paystack") return "paystack";
  if (seedMethod === "wallet") return "wallet";
  return "other";
}

function gatewayRef(method: ManagedPaymentMethod): string {
  switch (method) {
    case "paystack":
      return `PSP_${intBetween(rand, 100000, 999999).toString(36).toUpperCase()}`;
    case "wallet":
      return `WTX-${intBetween(rand, 10000, 99999)}`;
    default:
      return `NIP-${intBetween(rand, 100000000, 999999999)}`;
  }
}

function buildTimeline(
  status: ManagedPaymentStatus,
  method: ManagedPaymentMethod,
  refundedAmount: number,
  amount: number,
  createdAt: string
): ManagedPaymentTimelineEvent[] {
  const events: ManagedPaymentTimelineEvent[] = [];
  let cursorMinutes = 0;
  const base = new Date(createdAt).getTime();

  const push = (
    kind: ManagedPaymentTimelineEvent["kind"],
    label: string,
    detail: string | null,
    stepMinutes = intBetween(rand, 2, 40)
  ) => {
    cursorMinutes += events.length === 0 ? 0 : stepMinutes;
    events.push({
      id: `pevt-${events.length + 1}`,
      kind,
      label,
      detail,
      at: new Date(base + cursorMinutes * 60_000).toISOString(),
    });
  };

  push(
    "initiated",
    "Transaction initiated",
    method === "wallet" ? "Debit instruction on Kampmax wallet" : null
  );

  if (status === "pending") {
    push("processing", "Awaiting confirmation", "Provider has not confirmed the charge yet");
    return events;
  }

  if (status === "failed") {
    push("failure", "Charge failed", "Declined by provider - no funds captured");
    return events;
  }

  push("settled", "Funds settled", method === "paystack" ? "Paystack webhook received" : "Ledger updated");

  if (status === "reversed") {
    push("reversal", "Transaction reversed", "Full reversal issued - funds returned to source");
  }
  if (status === "refunded") {
    push(
      "refund",
      `Refund issued (${Math.round(refundedAmount).toLocaleString("en-NG")} naira)`,
      "Customer refunded in full",
      intBetween(rand, 60, 400)
    );
  }
  if (status === "partially_refunded") {
    push(
      "partial_refund",
      `Partial refund issued (${Math.round((refundedAmount / Math.max(amount, 1)) * 100)}% of value)`,
      "Resolved between support, vendor and buyer",
      intBetween(rand, 60, 400)
    );
  }

  return events;
}

export function buildManagedPaymentDataset(): {
  rows: ManagedPayment[];
  details: Map<string, ManagedPaymentDetail>;
} {
  const { rows: orders } = buildManagedOrderDataset();
  const ordersByVendor = new Map<string, ManagedOrder[]>();
  for (const order of orders) {
    const list = ordersByVendor.get(order.vendorName) ?? [];
    list.push(order);
    ordersByVendor.set(order.vendorName, list);
  }

  const rows: ManagedPayment[] = [];
  const details = new Map<string, ManagedPaymentDetail>();

  for (let i = 0; i < mockPayments.length; i++) {
    const seed = mockPayments[i];
    const status = mapStatus(seed.status, i);
    const method = mapMethod(seed.method);

    // Order linkage for order-scoped flows.
    let linkedOrder: Pick<
      ManagedOrder,
      "id" | "customerName" | "vendorName" | "total" | "status" | "createdAt"
    > | null = null;
    if (
      (seed.type === "order_payment" || seed.type === "refund" || seed.type === "commission") &&
      seed.counterparty
    ) {
      const candidates = ordersByVendor.get(seed.counterparty);
      if (candidates && candidates.length > 0) {
        const match = candidates[i % candidates.length];
        linkedOrder = {
          id: match.id,
          customerName: match.customerName,
          vendorName: match.vendorName,
          total: match.total,
          status: match.status,
          createdAt: match.createdAt,
        };
      }
    }

    const user = mockUsers.find((u) => u.id === seed.userId);

    const refundedAmount =
      status === "refunded" || status === "reversed"
        ? seed.amount
        : status === "partially_refunded"
          ? Math.round(seed.amount * (0.3 + rand() * 0.4))
          : 0;

    const row: ManagedPayment = {
      id: seed.id,
      type: seed.type,
      orderId: linkedOrder?.id ?? null,
      customerId: seed.userId,
      customerName: seed.userName,
      vendorId: null,
      vendorName:
        seed.counterparty && seed.type !== "wallet_funding" ? seed.counterparty : null,
      campusId:
        user?.campusId ??
        orders.find((o) => o.customerId === seed.userId)?.campusId ??
        "rugipo",
      amount: seed.amount,
      platformFee: seed.fee,
      vendorAmount: Math.max(0, seed.amount - seed.fee),
      method,
      status,
      reference: `KMPAY-${String(i + 1).padStart(5, "0")}`,
      gatewayRef: gatewayRef(method),
      refundedAmount,
      createdAt: seed.createdAt,
      updatedAt: seed.createdAt,
    };

    const timeline = buildTimeline(status, method, refundedAmount, row.amount, row.createdAt);
    row.updatedAt = timeline[timeline.length - 1].at;

    rows.push(row);
    details.set(row.id.toUpperCase(), JSON.parse(JSON.stringify({
      payment: row,
      order: linkedOrder,
      timeline,
    })) as ManagedPaymentDetail);
  }

  return { rows, details };
}
