import {
  CommunitySectionCounts,
  DisputeListQuery,
  DisputeMessage,
  DisputeRequestInfoInput,
  DisputeResolutionInput,
  DisputeTimelineEvent,
  ListQuery,
  ManagedDispute,
  ManagedDisputeDetail,
  ManagedDisputeStatus,
  Paginated,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import { disputeManagementDataset } from "@/data/admin/dispute-management";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/disputes)
// ------------------------------------------------------------

export interface AdminDisputeManagementService {
  list(query?: DisputeListQuery): Promise<Paginated<ManagedDispute>>;
  getById(id: string): Promise<ManagedDisputeDetail | null>;
  getCounts(): Promise<CommunitySectionCounts<ManagedDisputeStatus>>;
  /** Ask one side for more information; logs a support message. */
  requestInfo(
    id: string,
    input: DisputeRequestInfoInput
  ): Promise<ManagedDispute>;
  resolve(id: string, input: DisputeResolutionInput): Promise<ManagedDispute>;
  reject(id: string, input: DisputeResolutionInput): Promise<ManagedDispute>;
  escalate(id: string): Promise<ManagedDispute>;
  /**
   * PLACEHOLDER - records the refund intent on the dispute only.
   * No funds move in the prototype; the payments service will own
   * execution when the real backend lands.
   */
  recordRefundPlaceholder(
    id: string,
    input: { note: string }
  ): Promise<ManagedDispute>;
}

const DISPUTE_STATUSES: ManagedDisputeStatus[] = [
  "open",
  "under_review",
  "awaiting_customer",
  "awaiting_vendor",
  "resolved",
  "rejected",
  "escalated",
];

export function createMockDisputeManagementService(): AdminDisputeManagementService {
  const disputes = disputeManagementDataset.disputes.map((d) => ({ ...d }));
  const details = new Map<string, ManagedDisputeDetail>();
  disputeManagementDataset.details.forEach((detail, id) =>
    details.set(id, structuredCopy(detail))
  );

  function requireRow(id: string): ManagedDispute {
    const row = disputes.find((d) => d.id === id);
    if (!row) throw new Error(`Dispute ${id} not found`);
    return row;
  }

  function syncDetail(dispute: ManagedDispute): void {
    const detail = details.get(dispute.id);
    if (detail) detail.dispute = { ...dispute };
  }

  function pushTimeline(detail: ManagedDisputeDetail | undefined, event: Omit<DisputeTimelineEvent, "id">) {
    if (!detail) return;
    let n = detail.timeline.length + 1;
    while (detail.timeline.some((t) => t.id === `dst-live-${n}`)) n += 1;
    detail.timeline.push({ ...event, id: `dst-live-${n}` });
  }

  function pushMessage(detail: ManagedDisputeDetail | undefined, msg: Omit<DisputeMessage, "id">) {
    if (!detail) return;
    let n = detail.messages.length + 1;
    while (detail.messages.some((m) => m.id === `dsm-live-${n}`)) n += 1;
    detail.messages.push({ ...msg, id: `dsm-live-${n}` });
  }

  function touch(dispute: ManagedDispute, at = new Date().toISOString()): void {
    dispute.updatedAt = at;
    syncDetail(dispute);
  }

  function setStatusInternal(
    id: string,
    status: ManagedDisputeStatus
  ): ManagedDispute {
    const dispute = requireRow(id);
    const detail = details.get(id);
    dispute.status = status;
    touch(dispute);
    switch (status) {
      case "under_review":
        pushTimeline(detail, {
          label: "Review started by platform team",
          actor: "support",
          at: dispute.updatedAt,
        });
        break;
      case "escalated":
        pushTimeline(detail, {
          label: "Escalated to senior operations",
          detail: "High-value or policy-sensitive case",
          actor: "support",
          at: dispute.updatedAt,
        });
        break;
      case "resolved":
        pushTimeline(detail, {
          label: "Dispute resolved",
          actor: "support",
          at: dispute.updatedAt,
        });
        break;
      case "rejected":
        pushTimeline(detail, {
          label: "Dispute rejected",
          actor: "support",
          at: dispute.updatedAt,
        });
        break;
      default:
        break;
    }
    return { ...dispute };
  }

  return {
    async list(query = {}) {
      await apiDelay();
      const {
        search,
        status = "all",
        campusId = "all",
        reason = "all",
        ...rest
      } = query;

      let rows = disputes.filter(
        (d) =>
          (status === "all" || d.status === status) &&
          (campusId === "all" || d.campusId === campusId) &&
          (reason === "all" || d.reason === reason)
      );
      rows = applySearch(rows, search, (d) => [
        d.id,
        d.orderId,
        d.customerName,
        d.vendorName,
        d.subject,
      ]);
      rows = applySort(
        rows,
        rest.sortBy,
        rest.sortDir ?? "desc",
        {
          createdAt: (d) => new Date(d.createdAt).getTime(),
          amount: (d) => d.amount,
          updatedAt: (d) => new Date(d.updatedAt).getTime(),
        },
        "createdAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async getById(id) {
      await apiDelay(160);
      const detail = details.get(id);
      if (!detail) return null;
      return structuredCopy(detail);
    },

    async getCounts() {
      await apiDelay(80);
      const byStatus = Object.fromEntries(
        DISPUTE_STATUSES.map((s) => [
          s,
          disputes.filter((d) => d.status === s).length,
        ])
      ) as Record<ManagedDisputeStatus, number>;
      return { all: disputes.length, byStatus };
    },

    async requestInfo(id, input) {
      await apiDelay();
      const dispute = requireRow(id);
      const detail = details.get(id);
      if (
        dispute.status === "resolved" ||
        dispute.status === "rejected"
      )
        throw new Error("This dispute is already closed.");
      if (!input.note.trim())
        throw new Error("Include a short note explaining what you need.");

      const now = new Date().toISOString();
      pushMessage(detail, {
        authorRole: "support",
        authorName: "Kampmax Support",
        body: input.note.trim(),
        at: now,
      });
      pushTimeline(detail, {
        label: `Information requested from ${input.party}`,
        detail: input.note.trim(),
        actor: "support",
        at: now,
      });
      dispute.status =
        input.party === "customer" ? "awaiting_customer" : "awaiting_vendor";
      touch(dispute, now);
      return { ...dispute };
    },

    async resolve(id, input) {
      await apiDelay();
      const dispute = requireRow(id);
      const detail = details.get(id);
      if (!input.note.trim())
        throw new Error("Add a resolution note for the audit trail.");
      if (dispute.status === "rejected")
        throw new Error("This dispute was already rejected.");
      const now = new Date().toISOString();
      detail!.resolution = {
        outcome: "resolved",
        note: input.note.trim(),
        decidedBy: "Platform Admin",
        decidedAt: now,
        refundPlaceholder: detail?.resolution?.refundPlaceholder,
      };
      return setStatusInternal(id, "resolved");
    },

    async reject(id, input) {
      await apiDelay();
      const dispute = requireRow(id);
      const detail = details.get(id);
      if (!input.note.trim())
        throw new Error("State why this claim is being rejected.");
      if (dispute.status === "resolved")
        throw new Error("This dispute was already resolved.");
      const now = new Date().toISOString();
      detail!.resolution = {
        outcome: "rejected",
        note: input.note.trim(),
        decidedBy: "Platform Admin",
        decidedAt: now,
      };
      return setStatusInternal(id, "rejected");
    },

    async escalate(id) {
      await apiDelay();
      const dispute = requireRow(id);
      if (dispute.status === "resolved" || dispute.status === "rejected")
        throw new Error("Closed disputes cannot be escalated.");
      return setStatusInternal(id, "escalated");
    },

    async recordRefundPlaceholder(id, input) {
      await apiDelay();
      const dispute = requireRow(id);
      const detail = details.get(id);
      if (dispute.status === "rejected")
        throw new Error("Remove the rejection first - refunds apply to live cases.");
      const now = new Date().toISOString();

      // Record intent ONLY. The prototype never moves money.
      detail!.resolution = {
        outcome: "resolved",
        note:
          input.note.trim() ||
          "Refund agreed with the buyer. Recorded as placeholder - payout executes via the payments service.",
        decidedBy: "Platform Admin",
        decidedAt: now,
        refundPlaceholder: {
          amount: dispute.amount,
          method: detail?.payment.method ?? "wallet",
          recordedBy: "Platform Admin",
        },
      };
      pushTimeline(detail!, {
        label: "Refund recorded (placeholder)",
        detail: `${dispute.amount.toLocaleString("en-NG")} via ${detail?.payment.method ?? "wallet"} - no funds moved in prototype`,
        actor: "system",
        at: now,
      });
      return setStatusInternal(id, "resolved");
    },
  };
}

/** JSON clone - dataset contains plain serialisable objects only. */
function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
