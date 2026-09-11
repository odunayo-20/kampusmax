import {
  AdminActingContext,
  AdminAuditAction,
  AdminAuditEventActor,
  AdminProfile,
  AdminRole,
  ListQuery,
  Paginated,
  SupportAssignInput,
  SupportAssignee,
  SupportEscalateInput,
  SupportMessage,
  SupportMessageVisibility,
  SupportRespondInput,
  SupportSetPriorityInput,
  SupportSetStatusInput,
  SupportTicket,
  SupportTicketDetail,
  SupportTicketListQuery,
  SupportTicketMetrics,
  SupportTicketStatus,
  SupportTimelineEvent,
} from "@/types/admin";
import { apiDelay, applySearch, applySort, paginate } from "@/lib/admin/api";
import {
  buildSupportDataset,
  SUPPORT_STAFF,
} from "@/data/admin/support-management";
import { recordAdminAuditEvent } from "@/data/admin/audit-trail";
import { pushNotificationRecord } from "@/data/notifications";

// ------------------------------------------------------------
// CONTRACT (future NestJS resource: /admin/support/tickets)
//
// Ticket operations are privilege-gated exactly like the other
// management consoles:
//   - CAMPUS_ADMIN operators are READ-ONLY and campus-scoped (their
//     list, detail and metrics never cross campus boundaries).
//   - respond / note / assign / setStatus / setPriority / escalate
//     are restricted to SUPER_ADMIN/ADMIN.
// The service enforces these checks itself — the UI merely reflects
// them. Every successful mutation writes an audit row (Module 48)
// and customer-visible replies dispatch a real in-app notification
// (Module 26A) so the requester's notification center updates live.
//
// Internal notes are NEVER sent to the customer: they are stored with
// visibility "internal" and excluded from every customer-facing path.
// ------------------------------------------------------------

export interface AdminSupportManagementService {
  list(
    query?: SupportTicketListQuery,
    ctx?: AdminActingContext
  ): Promise<Paginated<SupportTicket>>;
  getById(
    id: string,
    ctx?: AdminActingContext
  ): Promise<SupportTicketDetail | null>;
  getMetrics(ctx?: AdminActingContext): Promise<SupportTicketMetrics>;
  getAssignableStaff(ctx?: AdminActingContext): Promise<SupportAssignee[]>;
  respond(
    id: string,
    input: SupportRespondInput,
    ctx: AdminActingContext
  ): Promise<SupportTicket>;
  addInternalNote(
    id: string,
    note: string,
    ctx: AdminActingContext
  ): Promise<SupportTicket>;
  assign(
    id: string,
    input: SupportAssignInput,
    ctx: AdminActingContext
  ): Promise<SupportTicket>;
  setStatus(
    id: string,
    input: SupportSetStatusInput,
    ctx: AdminActingContext
  ): Promise<SupportTicket>;
  setPriority(
    id: string,
    input: SupportSetPriorityInput,
    ctx: AdminActingContext
  ): Promise<SupportTicket>;
  escalate(
    id: string,
    input: SupportEscalateInput,
    ctx: AdminActingContext
  ): Promise<SupportTicket>;
}

const TICKET_STATUSES: SupportTicketStatus[] = [
  "open",
  "pending",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed",
];

const ACTION_BY_STATUS: Partial<Record<SupportTicketStatus, AdminAuditAction>> = {
  resolved: "SUPPORT_TICKET_STATUS_CHANGED",
  closed: "SUPPORT_TICKET_STATUS_CHANGED",
};

function auditActorFor(actor: AdminProfile): AdminAuditEventActor {
  return { type: "admin", id: actor.id, name: actor.name, role: actor.role };
}

function requireActor(
  ctx: AdminActingContext | undefined
): AdminActingContext {
  if (!ctx?.actor?.name) {
    throw new Error(
      "Support mutations require an authenticated operator session."
    );
  }
  return ctx as AdminActingContext;
}

/** Only full operators may change a ticket. */
function assertCanManage(actor: AdminProfile): void {
  if (actor.role !== "SUPER_ADMIN" && actor.role !== "ADMIN") {
    throw new Error(
      "You do not have permission to perform support ticket actions."
    );
  }
}

export function createMockSupportManagementService(): AdminSupportManagementService {
  const dataset = buildSupportDataset();
  const tickets = dataset.tickets.map((t) => ({ ...t }));
  const descriptions = new Map<string, string>(dataset.descriptions);
  const messages = new Map<string, SupportMessage[]>();
  const timeline = new Map<string, SupportTimelineEvent[]>();
  dataset.messages.forEach((msgs, id) =>
    messages.set(id, msgs.map((m) => ({ ...m })))
  );
  dataset.timeline.forEach((events, id) =>
    timeline.set(id, events.map((e) => ({ ...e })))
  );

  let seq = 0;

  function campusScope(ctx?: AdminActingContext): string | null {
    if (ctx?.actor?.role === "CAMPUS_ADMIN") return ctx.actor.campusId ?? null;
    return null;
  }

  function requireRow(id: string, ctx?: AdminActingContext): SupportTicket {
    const scope = campusScope(ctx);
    const row = tickets.find(
      (t) => t.id === id && (!scope || t.customer.campusId === scope)
    );
    if (!row) throw new Error(`Support ticket ${id} not found.`);
    return row;
  }

  function mutateRow(
    id: string,
    ctx: AdminActingContext
  ): SupportTicket {
    assertCanManage(ctx.actor);
    return requireRow(id, ctx);
  }

  function syncDetail(ticket: SupportTicket): void {
    const idx = tickets.findIndex((t) => t.id === ticket.id);
    if (idx !== -1) tickets[idx] = { ...ticket };
  }

  function touch(
    ticket: SupportTicket,
    at = new Date().toISOString()
  ): SupportTicket {
    ticket.updatedAt = at;
    syncDetail(ticket);
    return ticket;
  }

  function pushMessage(
    ticketId: string,
    msg: Omit<SupportMessage, "id" | "ticketId">
  ): void {
    const list = messages.get(ticketId) ?? [];
    seq += 1;
    list.push({
      ...msg,
      id: `spl-${String(seq).padStart(3, "0")}`,
      ticketId,
    });
    messages.set(ticketId, list);
  }

  function pushTimeline(
    ticketId: string,
    event: Omit<SupportTimelineEvent, "id" | "ticketId">
  ): void {
    const list = timeline.get(ticketId) ?? [];
    seq += 1;
    list.push({
      ...event,
      id: `spt-${String(seq).padStart(3, "0")}`,
      ticketId,
    });
    timeline.set(ticketId, list);
  }

  function detailOf(ticket: SupportTicket): SupportTicketDetail | null {
    const scope = campusScope();
    if (scope && ticket.customer.campusId !== scope) return null;
    return {
      ticket: { ...ticket },
      description: descriptions.get(ticket.id) ?? "",
      messages: (messages.get(ticket.id) ?? []).map((m) => ({ ...m })),
      timeline: (timeline.get(ticket.id) ?? []).map((e) => ({ ...e })),
      assignees: assigneesOf(ticket),
    };
  }

  function assigneesOf(ticket: SupportTicket): SupportAssignee[] {
    return SUPPORT_STAFF.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      activeTicketCount: tickets.filter((t) => t.assigneeId === s.id).length,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  function respondInternal(
    id: string,
    input: SupportRespondInput,
    ctx: AdminActingContext
  ): SupportTicket {
    const ticket = mutateRow(id, ctx);
    if (!input.body.trim()) throw new Error("Message body cannot be empty.");
    const now = new Date().toISOString();
    const visibility: SupportMessageVisibility =
      input.visibility === "internal" ? "internal" : "customer";

    pushMessage(ticket.id, {
      postedBy: "support",
      authorName: ctx.actor.name,
      visibility,
      body: input.body.trim(),
      attachments: [],
      at: now,
    });
    pushTimeline(ticket.id, {
      kind: visibility === "internal" ? "note_added" : "responded",
      label:
        visibility === "internal"
          ? "Internal note added"
          : "Agent replied to customer",
      detail: ctx.actor.name,
      actorName: ctx.actor.name,
      at: now,
    });
    ticket.lastResponseAt = now;
    if (visibility === "customer") {
      if (ticket.status === "open" || ticket.status === "pending") {
        ticket.status = "in_progress";
        pushTimeline(ticket.id, {
          kind: "status_changed",
          label: "Ticket marked in progress",
          detail: ctx.actor.name,
          actorName: ctx.actor.name,
          at: now,
        });
      }
      // Real in-app notification to the requester (Module 26A store).
      pushNotificationRecord({
        userId: ticket.customer.id,
        type: "system",
        category: "account",
        title: "Kampmax support updated your ticket",
        message: `"${ticket.subject}" — ${ctx.actor.name} replied.`,
        actionUrl: `/admin/support/${ticket.id}`,
      });
    }
    recordAdminAuditEvent({
      action:
        visibility === "internal"
          ? "SUPPORT_TICKET_NOTE_ADDED"
          : "SUPPORT_TICKET_RESPONDED",
      actor: auditActorFor(ctx.actor),
      resource: { type: "ticket", id: ticket.id, label: ticket.subject },
      metadata: { reason: input.body.trim().slice(0, 120) },
    });
    return touch(ticket, now);
  }

  return {
    async list(query = {}, ctx) {
      await apiDelay();
      const {
        search,
        status = "all",
        priority = "all",
        category = "all",
        assigneeId = "all",
        campusId = "all",
        escalated,
        sortBy,
        sortDir = "desc",
        ...rest
      } = query;

      const scope = campusScope(ctx);
      let rows = tickets.filter((t) => {
        if (scope && t.customer.campusId !== scope) return false;
        if (status !== "all" && t.status !== status) return false;
        if (priority !== "all" && t.priority !== priority) return false;
        if (category !== "all" && t.category !== category) return false;
        if (assigneeId !== "all") {
          if (assigneeId === "unassigned" && t.assigneeId !== null) return false;
          if (assigneeId !== "unassigned" && t.assigneeId !== assigneeId) return false;
        }
        if (campusId !== "all" && t.customer.campusId !== campusId) return false;
        if (escalated !== undefined && t.escalated !== escalated) return false;
        return true;
      });

      rows = applySearch(rows, search, (t) => [
        t.id,
        t.subject,
        t.customer.name,
        t.assigneeName ?? "",
        t.category,
        t.relatedResource?.label ?? "",
      ]);

      rows = applySort(
        rows,
        sortBy,
        sortDir,
        {
          createdAt: (t) => new Date(t.createdAt).getTime(),
          updatedAt: (t) => new Date(t.updatedAt).getTime(),
          priority: (t) => PRIORITY_RANK[t.priority],
          subject: (t) => t.subject.toLowerCase(),
        },
        "createdAt"
      );
      return paginate(rows, rest as ListQuery);
    },

    async getById(id, ctx) {
      await apiDelay(160);
      const ticket = requireRow(id, ctx);
      return detailOf(ticket);
    },

    async getMetrics(ctx) {
      await apiDelay(120);
      const scope = campusScope(ctx);
      const rows = scope
        ? tickets.filter((t) => t.customer.campusId === scope)
        : tickets;

      const count = (fn: (t: SupportTicket) => boolean) =>
        rows.filter(fn).length;

      const firstResponseMs: number[] = [];
      for (const t of rows) {
        if (t.lastResponseAt) {
          firstResponseMs.push(
            new Date(t.lastResponseAt).getTime() - new Date(t.createdAt).getTime()
          );
        }
      }

      return {
        open: count((t) => t.status === "open"),
        escalated: count((t) => t.escalated),
        unassigned: count((t) => t.assigneeId === null),
        awaitingCustomer: count((t) => t.status === "waiting_on_customer"),
        resolved: count((t) => t.status === "resolved"),
        closed: count((t) => t.status === "closed"),
        urgent: count((t) => t.priority === "urgent"),
        highPriority: count((t) => t.priority === "high"),
        current: TICKET_STATUSES,
        avgFirstResponseHours:
          firstResponseMs.length > 0
            ? Math.round(
                (firstResponseMs.reduce((a, b) => a + b, 0) /
                  firstResponseMs.length /
                  3_600_000) *
                  10
              ) / 10
            : 0,
        byStatus: TICKET_STATUSES.map((status) => ({
          status,
          count: count((t) => t.status === status),
        })),
        byPriority: PRIORITIES.map((priority) => ({
          priority,
          count: count((t) => t.priority === priority),
        })),
        byCategory: CATEGORIES.map((category) => ({
          category,
          count: count((t) => t.category === category),
        })),
      };
    },

    async getAssignableStaff(ctx) {
      await apiDelay(60);
      const scope = campusScope(ctx);
      const all = scope
        ? tickets.filter((t) => t.customer.campusId === scope)
        : tickets;
      return assigneesOf({ id: "" } as SupportTicket)
        .map((s) => ({
          ...s,
          activeTicketCount: all.filter((t) => t.assigneeId === s.id).length,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async respond(id, input, ctx) {
      await apiDelay();
      const actor = requireActor(ctx);
      return respondInternal(id, input, actor);
    },

    async addInternalNote(id, note, ctx) {
      await apiDelay();
      const actor = requireActor(ctx);
      return respondInternal(id, { body: note, visibility: "internal" }, actor);
    },

    async assign(id, input, ctx) {
      await apiDelay();
      const actor = requireActor(ctx);
      const ticket = mutateRow(id, actor);
      if (!input.assigneeId) throw new Error("Select an agent to assign to.");
      const staff = SUPPORT_STAFF.find((s) => s.id === input.assigneeId);
      if (!staff) throw new Error("Unknown support agent.");
      const now = new Date().toISOString();
      const previousAssignee = ticket.assigneeName ?? "unassigned";
      ticket.assigneeId = staff.id;
      ticket.assigneeName = staff.name;
      pushTimeline(ticket.id, {
        kind: "assigned",
        label: `Assigned to ${staff.name}`,
        detail: previousAssignee,
        actorName: actor.actor.name,
        at: now,
      });
      recordAdminAuditEvent({
        action: "SUPPORT_TICKET_ASSIGNED",
        actor: auditActorFor(actor.actor),
        resource: { type: "ticket", id: ticket.id, label: ticket.subject },
        metadata: {
          reason: `${previousAssignee} -> ${staff.name}`,
        },
      });
      return touch(ticket, now);
    },

    async setStatus(id, input, ctx) {
      await apiDelay();
      const actor = requireActor(ctx);
      const ticket = mutateRow(id, actor);
      if (!TICKET_STATUSES.includes(input.status)) {
        throw new Error("Invalid ticket status.");
      }
      if (ticket.status === input.status) return { ...ticket };
      const now = new Date().toISOString();
      const previousStatus = ticket.status;
      ticket.status = input.status;
      if (input.status === "resolved" || input.status === "closed") {
        ticket.escalated = false;
      }
      if (input.status === "open" && previousStatus === "closed") {
        ticket.reopenedAt = now;
        pushTimeline(ticket.id, {
          kind: "reopened",
          label: "Ticket reopened",
          detail: `${previousStatus} -> ${input.status}`,
          actorName: actor.actor.name,
          at: now,
        });
        recordAdminAuditEvent({
          action: "SUPPORT_TICKET_REOPENED",
          actor: auditActorFor(actor.actor),
          resource: { type: "ticket", id: ticket.id, label: ticket.subject },
          metadata: { previousStatus, newStatus: input.status },
        });
        return touch(ticket, now);
      }
      pushTimeline(ticket.id, {
        kind: "status_changed",
        label: `Status changed to ${input.status.replace(/_/g, " ")}`,
        detail: `${previousStatus} -> ${input.status}`,
        actorName: actor.actor.name,
        at: now,
      });
      recordAdminAuditEvent({
        action: ACTION_BY_STATUS[input.status] ?? "SUPPORT_TICKET_STATUS_CHANGED",
        actor: auditActorFor(actor.actor),
        resource: { type: "ticket", id: ticket.id, label: ticket.subject },
        metadata: { previousStatus, newStatus: input.status },
      });
      return touch(ticket, now);
    },

    async setPriority(id, input, ctx) {
      await apiDelay();
      const actor = requireActor(ctx);
      const ticket = mutateRow(id, actor);
      if (!PRIORITIES.includes(input.priority)) {
        throw new Error("Invalid priority.");
      }
      if (ticket.priority === input.priority) return { ...ticket };
      const now = new Date().toISOString();
      const previousPriority = ticket.priority;
      ticket.priority = input.priority;
      pushTimeline(ticket.id, {
        kind: "priority_changed",
        label: `Priority changed to ${input.priority}`,
        detail: `${previousPriority} -> ${input.priority}`,
        actorName: actor.actor.name,
        at: now,
      });
      recordAdminAuditEvent({
        action: "SUPPORT_TICKET_PRIORITY_CHANGED",
        actor: auditActorFor(actor.actor),
        resource: { type: "ticket", id: ticket.id, label: ticket.subject },
        metadata: {
          previousStatus: previousPriority,
          newStatus: input.priority,
        },
      });
      return touch(ticket, now);
    },

    async escalate(id, input, ctx) {
      await apiDelay();
      const actor = requireActor(ctx);
      const ticket = mutateRow(id, actor);
      if (ticket.status === "closed" || ticket.status === "resolved") {
        throw new Error("Closed tickets cannot be escalated.");
      }
      const now = new Date().toISOString();
      ticket.escalated = true;
      ticket.escalation = {
        target: input.target,
        note: input.note.trim(),
        byName: actor.actor.name,
        at: now,
      };
      pushTimeline(ticket.id, {
        kind: "escalated",
        label: `Escalated to ${input.target.replace(/_/g, " ")}`,
        detail: input.note.trim(),
        actorName: actor.actor.name,
        at: now,
      });
      recordAdminAuditEvent({
        action: "SUPPORT_TICKET_ESCALATED",
        actor: auditActorFor(actor.actor),
        resource: { type: "ticket", id: ticket.id, label: ticket.subject },
        metadata: {
          reason: input.note.trim(),
          newStatus: input.target,
        },
      });
      return touch(ticket, now);
    },
  };
}

const PRIORITY_RANK: Record<SupportTicket["priority"], number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

const PRIORITIES: SupportTicket["priority"][] = [
  "urgent",
  "high",
  "normal",
  "low",
];

const CATEGORIES: SupportTicket["category"][] = [
  "account",
  "marketplace",
  "payments",
  "freelancer",
  "service_provider",
  "employer",
  "verification",
  "technical",
  "other",
];

export type { AdminActingContext } from "@/types/admin";