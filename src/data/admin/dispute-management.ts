import {
  DisputeEvidenceItem,
  DisputeMessage,
  DisputePaymentSummary,
  DisputeResolution,
  DisputeTimelineEvent,
  ManagedDispute,
  ManagedDisputeDetail,
  ManagedDisputeReason,
  ManagedDisputeStatus,
} from "@/types/admin";
import { mockOrders } from "./commerce";
import { mockUsers } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/disputes MODULE
//
// Disputes reference real orders (so order/payment context always
// resolves) and carry a full message thread, evidence list, audit
// timeline and - where applicable - a recorded resolution.
// Deterministic (seeded PRNG): identical output every reload.
// ------------------------------------------------------------

/** Index-bucketed so every status is represented: open x4, under_review x3,
 *  awaiting_customer x3, awaiting_vendor x3, resolved x4, rejected x2, escalated x2. */
const DISPUTE_STATUS_PATTERN = [
  "open", "under_review", "awaiting_customer", "resolved", "open",
  "awaiting_vendor", "escalated", "rejected", "open", "under_review",
  "awaiting_customer", "resolved", "open", "awaiting_vendor", "under_review",
  "rejected", "escalated", "awaiting_customer", "resolved", "open",
  "awaiting_vendor", "under_review",
] as const;

const REASON_CYCLE: ManagedDisputeReason[] = [
  "missing_order", "payment_issue", "wrong_product", "damaged_product",
  "delivery_issue", "refund_request", "unauthorized_transaction",
  "missing_order", "damaged_product", "refund_request", "delivery_issue",
  "wrong_product", "payment_issue", "missing_order", "damaged_product",
  "refund_request", "unauthorized_transaction", "delivery_issue",
  "wrong_product", "payment_issue", "missing_order", "refund_request",
];

const SUBJECTS: Record<ManagedDisputeReason, readonly string[]> = {
  payment_issue: [
    "Wallet debited twice for one order",
    "Card charged but order shows unpaid",
    "Promo discount not applied at checkout",
  ],
  missing_order: [
    "Order marked delivered but never arrived",
    "Package not found at pickup station",
    "Rider marked delivered at wrong hostel",
  ],
  wrong_product: [
    "Received wrong textbook edition",
    "Hoodie sent in wrong size and colour",
    "Skincare kit missing two items",
  ],
  damaged_product: [
    "Mattress arrived torn on one side",
    "Earbuds dead on arrival",
    "Power bank casing cracked in transit",
  ],
  delivery_issue: [
    "Delivery promised in 24hrs, now day 4",
    "Rider refused hostel drop-off",
    "Pickup station lost the parcel slip",
  ],
  refund_request: [
    "Refund approved 10 days ago, not received",
    "Buyer changed mind before dispatch, seeking refund",
    "Vendor closed store before dispatch, refund requested",
  ],
  unauthorized_transaction: [
    "Order placed without account owner's consent",
    "Unknown charge after card top-up",
    "Login from another device placed this order",
  ],
};

const CUSTOMER_MESSAGES: readonly string[] = [
  "I have been waiting for days and nobody is explaining anything. Please help.",
  "This is not what I ordered. I have photos of what arrived.",
  "The vendor stopped replying after I raised the issue here.",
  "Please check the payment reference - money left my bank account.",
  "I can share screenshots of the whole conversation if needed.",
];

const VENDOR_MESSAGES: readonly string[] = [
  "We dispatched the item on time and have the rider's receipt attached.",
  "The buyer refused pickup twice; our records show both attempts.",
  "Happy to replace the item once the original is returned to our station.",
  "This order was paid with wallet funds we never received a payout for.",
];

const SUPPORT_MESSAGES: readonly string[] = [
  "Thanks both - Kampmax support is reviewing the evidence now.",
  "Could you upload a photo of the item as it arrived? That speeds up review.",
  "Escalated to the platform team given the amount involved.",
];

const EVIDENCE_NAMES: Record<DisputeEvidenceItem["kind"], readonly string[]> = {
  photo: ["item-as-received.jpg", "packaging-damage.jpg", "pickup-slip.jpg", "wrong-item.jpg"],
  document: ["rider-manifest.pdf", "bank-statement.pdf", "receipt-reprint.pdf"],
  chat_log: ["whatsapp-export.txt", "inapp-chat-log.txt"],
};

export interface ManagedDisputeSeed {
  dispute: ManagedDispute;
  messages: DisputeMessage[];
  evidence: DisputeEvidenceItem[];
  timeline: DisputeTimelineEvent[];
  payment: DisputePaymentSummary;
  resolution: DisputeResolution | null;
}

export function buildDisputeManagementDataset(): {
  disputes: ManagedDispute[];
  details: Map<string, ManagedDisputeDetail>;
} {
  const rand = seededRandom(6067);
  const customers = mockUsers.slice(0);

  const seeds: ManagedDisputeSeed[] = DISPUTE_STATUS_PATTERN.map(
    (status, i) => {
      const order = mockOrders[(i * 3 + 5) % mockOrders.length];
      const customer =
        customers.find((u) => u.id === order.customerId) ??
        pick(rand, customers);
      const reason = REASON_CYCLE[i % REASON_CYCLE.length];
      const subject = pick(rand, SUBJECTS[reason]);
      const createdDaysAgo = intBetween(rand, 1, 21);
      const createdAt = daysAgoIso(rand, createdDaysAgo);
      const updatedAt = daysAgoIso(rand, Math.max(0, createdDaysAgo - intBetween(rand, 0, 4)));

      const priority: ManagedDispute["priority"] =
        reason === "unauthorized_transaction" || order.total > 120_000
          ? "high"
          : order.total > 40_000
            ? "medium"
            : rand() > 0.5
              ? "medium"
              : "low";

      // ----- message thread -----
      const threadLength = intBetween(rand, 2, 5);
      const messages: DisputeMessage[] = [];
      for (let m = 0; m < threadLength; m++) {
        const roll = rand();
        const role: DisputeMessage["authorRole"] =
          m === 0
            ? "customer"
            : roll > 0.62
              ? "vendor"
              : roll > 0.34
                ? "customer"
                : "support";
        messages.push({
          id: `dsm-${i + 1}-${m + 1}`,
          authorRole: role,
          authorName:
            role === "customer"
              ? customer.name
              : role === "vendor"
                ? order.vendorName
                : "Kampmax Support",
          body:
            role === "customer"
              ? pick(rand, CUSTOMER_MESSAGES)
              : role === "vendor"
                ? pick(rand, VENDOR_MESSAGES)
                : pick(rand, SUPPORT_MESSAGES),
          at: new Date(
            new Date(createdAt).getTime() + (m + 1) * 9 * 3_600_000
          ).toISOString(),
        });
      }

      // ----- evidence -----
      const evidenceCount = status === "open" && rand() > 0.5 ? 1 : intBetween(rand, 1, 3);
      const kinds: DisputeEvidenceItem["kind"][] = ["photo", "document", "chat_log"];
      const evidence: DisputeEvidenceItem[] = Array.from({
        length: evidenceCount,
      }).map((_, e) => {
        const kind = pick(rand, kinds);
        return {
          id: `dse-${i + 1}-${e + 1}`,
          kind,
          name: pick(rand, EVIDENCE_NAMES[kind]),
          note:
            kind === "photo"
              ? "Photo attached by the buyer showing the condition on arrival."
              : kind === "document"
                ? "Supporting document requested by Kampmax support."
                : "Conversation export covering the pre-dispute exchange.",
          uploadedBy: rand() > 0.35 ? "customer" : "vendor",
          at: new Date(
            new Date(createdAt).getTime() + (e + 1) * 12 * 3_600_000
          ).toISOString(),
        };
      });

      // ----- timeline -----
      const timeline: DisputeTimelineEvent[] = [
        {
          id: `dst-${i + 1}-1`,
          label: "Dispute opened",
          detail: `Case auto-linked to order ${order.id}`,
          actor: "system",
          at: createdAt,
        },
        ...messages.slice(0, 3).map((msg, k) => ({
          id: `dst-${i + 1}-${k + 2}`,
          label:
            msg.authorRole === "support"
              ? "Support responded"
              : `${msg.authorRole === "customer" ? "Customer" : "Vendor"} message added`,
          actor: msg.authorRole,
          at: msg.at,
        })),
        ...(evidence.length > 0
          ? [
              {
                id: `dst-${i + 1}-ev`,
                label: `Evidence uploaded (${evidence.length} file${evidence.length === 1 ? "" : "s"})`,
                actor: "customer" as const,
                at: evidence[0].at,
              },
            ]
          : []),
      ];

      switch (status) {
        case "under_review":
          timeline.push({
            id: `dst-${i + 1}-rev`,
            label: "Review started by platform team",
            actor: "support",
            at: updatedAt,
          });
          break;
        case "awaiting_customer":
        case "awaiting_vendor":
          timeline.push({
            id: `dst-${i + 1}-info`,
            label: `Information requested from ${status === "awaiting_customer" ? "customer" : "vendor"}`,
            detail: "Response window: 48 hours",
            actor: "support",
            at: updatedAt,
          });
          break;
        case "escalated":
          timeline.push({
            id: `dst-${i + 1}-esc`,
            label: "Escalated to senior operations",
            detail: "High-value or policy-sensitive case",
            actor: "support",
            at: updatedAt,
          });
          break;
        default:
          break;
      }

      // ----- resolution -----
      let resolution: DisputeResolution | null = null;
      if (status === "resolved") {
        const withRefund = rand() > 0.45;
        resolution = {
          outcome: "resolved",
          note: withRefund
            ? "Buyer refunded in full after reviewing the evidence; vendor notified to improve packaging."
            : "Vendor agreed to a replacement item; dispute closed as resolved.",
          decidedBy: "Amaka O. (Platform Admin)",
          decidedAt: updatedAt,
          refundPlaceholder: withRefund
            ? {
                amount: order.total,
                method: order.paymentMethod,
                recordedBy: "Platform Admin",
              }
            : undefined,
        };
        timeline.push({
          id: `dst-${i + 1}-res`,
          label: "Dispute resolved",
          detail: resolution.note,
          actor: "support",
          at: updatedAt,
        });
      } else if (status === "rejected") {
        resolution = {
          outcome: "rejected",
          note: "Evidence shows the order was delivered and signed for at the pickup station; claim rejected.",
          decidedBy: "Tunde A. (Platform Admin)",
          decidedAt: updatedAt,
        };
        timeline.push({
          id: `dst-${i + 1}-rej`,
          label: "Dispute rejected",
          detail: resolution.note,
          actor: "support",
          at: updatedAt,
        });
      }

      // ----- payment summary -----
      const paymentStatus: DisputePaymentSummary["status"] =
        reason === "unauthorized_transaction"
          ? "paid"
          : (order.paymentStatus as DisputePaymentSummary["status"]) ?? "paid";

      const payment: DisputePaymentSummary = {
        method: order.paymentMethod,
        reference: `PSK-${order.id.replace("KMP-", "")}${intBetween(rand, 100, 999)}`,
        paidAt: paymentStatus === "pending" || paymentStatus === "failed" ? null : order.createdAt,
        amount: order.total,
        status: paymentStatus,
      };

      const parties: ManagedDispute["parties"] =
        reason === "unauthorized_transaction" || reason === "payment_issue"
          ? "customer_vs_platform"
          : "customer_vs_vendor";

      const dispute: ManagedDispute = {
        id: `dsp-${String(i + 1).padStart(3, "0")}`,
        orderId: order.id,
        customerId: customer.id,
        customerName: customer.name,
        vendorId: order.vendorId,
        vendorName: order.vendorName,
        campusId: order.campusId,
        parties,
        reason,
        subject,
        amount: order.total,
        priority,
        status,
        messagesCount: messages.length,
        evidenceCount: evidence.length,
        createdAt,
        updatedAt,
      };

      return { dispute, messages, evidence, timeline, payment, resolution };
    }
  );

  const details = new Map<string, ManagedDisputeDetail>();
  const disputes: ManagedDispute[] = [];

  seeds.forEach((seed) => {
    const { dispute, messages, evidence, timeline, payment, resolution } = seed;
    const order = mockOrders.find((o) => o.id === dispute.orderId);
    disputes.push(dispute);
    details.set(dispute.id, {
      dispute: { ...dispute },
      order: order
        ? {
            id: order.id,
            itemsSummary: order.itemsSummary,
            itemsCount: order.itemsCount,
            total: order.total,
            placedAt: order.createdAt,
            deliveryMethod: order.deliveryMethod,
            orderStatus: order.status,
          }
        : null,
      payment,
      messages: [...messages].sort(
        (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
      ),
      evidence: [...evidence],
      timeline: [...timeline].sort(
        (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
      ),
      resolution,
    });
  });

  return { disputes, details };
}

export const disputeManagementDataset = buildDisputeManagementDataset();
