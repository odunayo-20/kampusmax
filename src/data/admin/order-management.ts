import { mockOrders } from "./commerce";
import { intBetween, pick, seededRandom } from "@/lib/admin/api";
import type {
  ManagedOrder,
  ManagedOrderDeliveryInfo,
  ManagedOrderDetail,
  ManagedOrderItem,
  ManagedOrderNote,
  ManagedOrderPayment,
  ManagedOrderPaymentStatus,
  ManagedOrderStatus,
  ManagedOrderTimelineEvent,
} from "@/types/admin";

/**
 * Order management dataset (/admin/orders).
 *
 * Seeds from the shared commerce orders and layers console-only depth:
 * full lifecycle status mapping (incl. ready_for_pickup + disputed),
 * itemised lines with coherent money math, payment records tied to the
 * ledger ids, delivery/pickup logistics, timelines and notes.
 */

const rand = seededRandom(4243);

interface ItemSeed {
  name: string;
  price: number;
}

const ITEM_POOL: ItemSeed[] = [
  { name: "Textbooks bundle (semester)", price: 8500 },
  { name: "Power bank 20,000mAh", price: 12500 },
  { name: "Wireless earbuds", price: 9800 },
  { name: "Hoodie (departmental)", price: 7500 },
  { name: "Groceries box (weekly)", price: 6000 },
  { name: "Photocopy pack (500 sheets)", price: 3500 },
  { name: "Skincare kit", price: 11000 },
  { name: "Foam mattress 6x3", price: 22000 },
  { name: "Reading lamp (rechargeable)", price: 5500 },
  { name: "Water dispenser (mini)", price: 18000 },
  { name: "Lab coat + goggles", price: 7000 },
  { name: "Phone charger 45W", price: 4800 },
];

const CANCEL_REASONS = [
  "Customer changed their mind before preparation started",
  "Vendor ran out of stock after acceptance",
  "Duplicate order - customer requested cancellation",
  "No response from customer at pickup point",
] as const;

const DISPUTE_REASONS = [
  "Item received differs from listing photos",
  "Package arrived damaged - buyer sent photo evidence",
  "Buyer claims non-delivery despite rider mark-off",
  "Partial refund agreed after missing item in box",
] as const;

const PICKUP_SPOTS = [
  "Main Campus Bookshop counter",
  "Student Affairs Building front desk",
  "Faculty of Science notice board stand",
  "Campus mini-mart pickup shelf",
] as const;

const MEETUP_SPOTS = [
  "School main gate (beside guard post)",
  "Faculty of Engineering car park",
  "New library entrance steps",
  "Sports complex gate",
] as const;

const ADDRESSES = [
  "Aluta Hostel Block C, Room 214",
  "Staff Quarters Flat 7, UNIOSUN axis",
  "Off-campus lodge behind Faith Foundation",
  "Postgraduate hostel, Room 05",
] as const;

const RIDERS = [
  { name: "Musa Ibrahim", phone: "+234 803 445 1120" },
  { name: "Tunde Alabi", phone: "+234 815 220 8834" },
  { name: "Chidi Okafor", phone: "+234 706 993 4415" },
  { name: "Aisha Bello", phone: "+234 902 771 6620" },
] as const;

const ADMIN_NOTES = [
  "Cross-checked with vendor ledger - figures reconcile.",
  "Rider GPS trace matches delivery confirmation.",
  "Escalated to support after second buyer complaint this week.",
] as const;

const CUSTOMER_NOTES = [
  "Please call when you get to the gate, network is poor inside.",
  "The last one came without a receipt - include it this time.",
  "Can someone else pick this up on my behalf?",
] as const;

const VENDOR_NOTES = [
  "Packaged in branded nylon, sealed at handover.",
  "Buyer paid with wallet - confirm credit before dispatch.",
  "Substituted blue colour for black with buyer consent.",
] as const;

function mapStatus(seedStatus: string, i: number): ManagedOrderStatus {
  let status: ManagedOrderStatus;
  switch (seedStatus) {
    case "placed":
      status = "pending";
      break;
    case "confirmed":
      status = "confirmed";
      break;
    case "preparing":
      status = "preparing";
      break;
    case "out_for_delivery":
      status = "out_for_delivery";
      break;
    case "delivered":
      status = "delivered";
      break;
    default:
      status = "cancelled";
  }
  // Force coverage of the two statuses the commerce seed lacks.
  if ((status === "confirmed" || status === "preparing") && i % 3 === 1) {
    status = "ready_for_pickup";
  }
  if (i % 11 === 10 && status !== "cancelled") {
    status = "disputed";
  }
  return status;
}

function mapPaymentStatus(
  seedPaymentStatus: string,
  status: ManagedOrderStatus,
  i: number
): ManagedOrderPaymentStatus {
  const base = seedPaymentStatus as ManagedOrderPaymentStatus;
  if (status === "disputed" && base === "paid" && i % 2 === 0) return "partially_refunded";
  if (base === "paid" && i % 17 === 16) return "partially_refunded";
  return base;
}

function buildItems(subtotal: number, itemsCount: number): ManagedOrderItem[] {
  const count = Math.max(1, Math.min(itemsCount, ITEM_POOL.length));
  const start = intBetween(rand, 0, ITEM_POOL.length - count);
  const chosen = ITEM_POOL.slice(start, start + count);

  // Split the order subtotal across lines deterministically.
  const weights = chosen.map(() => 0.5 + rand());
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const quantities = chosen.map(() => intBetween(rand, 1, 3));

  const items: ManagedOrderItem[] = [];
  let allocated = 0;
  for (let idx = 0; idx < count; idx++) {
    const isLast = idx === count - 1;
    const quantity = quantities[idx];
    let lineTotal: number;
    if (isLast) {
      lineTotal = Math.max(quantity * 100, subtotal - allocated);
      // Snap the remainder into clean units.
      const unit = Math.max(100, Math.round(lineTotal / quantity / 25) * 25);
      lineTotal = unit * quantity;
    } else {
      const share = (subtotal * weights[idx]) / weightSum;
      const unit = Math.max(100, Math.round(share / quantity / 25) * 25);
      lineTotal = unit * quantity;
    }
    allocated += lineTotal;
    items.push({
      id: `oi-${idx + 1}`,
      productId: `prd-${start + idx + 1}`,
      name: chosen[idx].name,
      unitPrice: Math.round(lineTotal / quantity),
      quantity,
      lineTotal,
      thumbnail: null,
      variant: null,
    });
  }

  // Absorb any residual drift into the first line so Σ lines == subtotal.
  const drift = subtotal - items.reduce((sum, it) => sum + it.lineTotal, 0);
  if (drift !== 0 && items[0]) {
    const first = items[0];
    const adjustedUnit = Math.max(
      100,
      Math.round((first.lineTotal + drift) / first.quantity)
    );
    first.unitPrice = adjustedUnit;
    first.lineTotal = adjustedUnit * first.quantity;
    // If snapping changed the sum again, push the difference into quantity-free space.
    const residual = subtotal - items.reduce((sum, it) => sum + it.lineTotal, 0);
    if (residual !== 0 && items.length > 1) {
      const last = items[items.length - 1];
      last.unitPrice += Math.round(residual / last.quantity);
      last.lineTotal = last.unitPrice * last.quantity;
    }
  }
  return items;
}

function buildTimeline(
  status: ManagedOrderStatus,
  paymentStatus: ManagedOrderPaymentStatus,
  method: string,
  deliveryMethod: string,
  cancelReason: string | null,
  disputeReason: string | null,
  createdAt: string
): ManagedOrderTimelineEvent[] {
  const events: ManagedOrderTimelineEvent[] = [];
  const base = new Date(createdAt).getTime();
  let cursorMinutes = 0;

  const push = (
    kind: ManagedOrderTimelineEvent["kind"],
    label: string,
    detail: string | null,
    stepHours = intBetween(rand, 1, 5)
  ) => {
    cursorMinutes += events.length === 0 ? 0 : stepHours * 60;
    events.push({
      id: `evt-${events.length + 1}`,
      kind,
      label,
      detail,
      at: new Date(base + cursorMinutes * 60_000).toISOString(),
    });
  };

  push("placed", "Order placed", "Customer checked out from storefront", 0);

  if (method === "cod") {
    push("payment", "Cash on delivery arranged", "Collect ₦ on handover");
  } else {
    switch (paymentStatus) {
      case "paid":
        push("payment", "Payment confirmed", "Ledger updated");
        break;
      case "partially_refunded":
        push("payment", "Payment captured", "Partial refund later approved");
        break;
      case "failed":
        push("payment", "Payment failed", "Charge declined - no funds captured");
        break;
      case "refunded":
        push("payment", "Payment reversed", "Full refund issued to source");
        break;
      default:
        push("payment", "Payment pending", "Awaiting provider confirmation");
    }
  }

  if (status === "pending") return events;

  if (status === "cancelled") {
    push("cancellation", "Order cancelled", cancelReason);
    return events;
  }

  push("confirmation", "Vendor accepted", "Store confirmed availability");

  if (status === "confirmed") return events;

  push("preparation", "Preparation started", "Picking and packaging in progress");

  if (status === "preparing") return events;

  push(
    "ready",
    deliveryMethod === "delivery" ? "Packed for dispatch" : "Ready for pickup",
    deliveryMethod === "delivery" ? "Awaiting rider assignment" : "Held at pickup point"
  );

  if (status === "ready_for_pickup") return events;

  if (status === "disputed" && !["delivered"].includes(status)) {
    // Dispute can fire pre-handover (e.g. never showed up).
    push("dispatch", "Handover attempted", "Customer unreachable at agreed spot");
    push("dispute", "Dispute opened", disputeReason);
    return events;
  }

  push(
    "dispatch",
    "Out for delivery",
    deliveryMethod === "delivery" ? "Rider en route" : "Met customer at meetup spot"
  );

  if (status === "out_for_delivery") return events;

  push(
    "delivery",
    deliveryMethod === "delivery" ? "Delivered" : "Handover completed",
    deliveryMethod === "delivery" ? "Signed by customer" : "Confirmed by both parties"
  );

  if (status === "disputed") {
    push("dispute", "Dispute opened", disputeReason);
  }

  return events;
}

export function buildManagedOrderDataset(): {
  rows: ManagedOrder[];
  details: Map<string, ManagedOrderDetail>;
} {
  const rows: ManagedOrder[] = [];
  const details = new Map<string, ManagedOrderDetail>();

  for (let i = 0; i < mockOrders.length; i++) {
    const seed = mockOrders[i];
    const status = mapStatus(seed.status, i);
    const paymentStatus = mapPaymentStatus(seed.paymentStatus, status, i);

    const items = buildItems(seed.subtotal, seed.itemsCount);

    const refundedAmount =
      paymentStatus === "refunded"
        ? seed.total
        : paymentStatus === "partially_refunded"
          ? Math.round(seed.total * (0.3 + rand() * 0.4))
          : 0;

    const paid =
      paymentStatus === "paid" ||
      paymentStatus === "refunded" ||
      paymentStatus === "partially_refunded";

    const payment: ManagedOrderPayment = {
      method: seed.paymentMethod,
      status: paymentStatus,
      transactionId: `pay-${String((i % 34) + 1).padStart(3, "0")}`,
      paidAt: seed.paymentMethod === "cod" ? null : paid ? seed.createdAt : null,
      refundedAmount,
    };

    const rider = RIDERS[i % RIDERS.length];
    const delivery: ManagedOrderDeliveryInfo = {
      method: seed.deliveryMethod,
      address: seed.deliveryMethod === "delivery" ? pick(rand, ADDRESSES) : null,
      meetupSpot: seed.deliveryMethod === "meetup" ? pick(rand, MEETUP_SPOTS) : null,
      pickupPoint: seed.deliveryMethod === "campus_pickup" ? pick(rand, PICKUP_SPOTS) : null,
      riderName: seed.deliveryMethod === "delivery" ? rider.name : null,
      riderPhone: seed.deliveryMethod === "delivery" ? rider.phone : null,
    };

    const cancelReason =
      status === "cancelled" ? pick(rand, CANCEL_REASONS) : null;
    const disputeReason =
      status === "disputed" ? pick(rand, DISPUTE_REASONS) : null;

    const timeline = buildTimeline(
      status,
      paymentStatus,
      seed.paymentMethod,
      seed.deliveryMethod,
      cancelReason,
      disputeReason,
      seed.createdAt
    );

    const row: ManagedOrder = {
      ...seed,
      status,
      paymentStatus,
    };
    rows.push(row);

    // Notes: 1-3 mixed-role entries.
    const noteCount = 1 + (i % 3);
    const notes: ManagedOrderNote[] = [];
    const roles = ["customer", "vendor", "admin"] as const;
    for (let nIdx = 0; nIdx < noteCount; nIdx++) {
      const role = roles[(i + nIdx) % roles.length];
      const pool =
        role === "customer" ? CUSTOMER_NOTES : role === "vendor" ? VENDOR_NOTES : ADMIN_NOTES;
      notes.push({
        id: `note-${nIdx + 1}`,
        authorRole: role,
        authorName:
          role === "customer"
            ? seed.customerName
            : role === "vendor"
              ? `${seed.vendorName} support`
              : "Ops desk",
        body: pool[(i + nIdx) % pool.length],
        createdAt: new Date(
          new Date(seed.createdAt).getTime() + (nIdx + 1) * intBetween(rand, 30, 240) * 60_000
        ).toISOString(),
      });
    }
    notes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    details.set(row.id.toUpperCase(), structuredCopy({
      order: row,
      items,
      payment,
      delivery,
      timeline,
      notes,
    }));
  }

  return { rows, details };
}

function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
