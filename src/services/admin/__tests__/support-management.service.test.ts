import { describe, expect, it } from "vitest";
import {
  AdminProfile,
  SupportTicket,
  SupportTicketDetail,
} from "@/types/admin";
import { createMockSupportManagementService } from "@/services/admin/support-management.service";
import { buildSupportDataset } from "@/data/admin/support-management";
import { getUnreadCount } from "@/data/notifications";
import type { AdminActingContext } from "@/types/admin";

// ------------------------------------------------------------
// ADMIN SUPPORT MANAGEMENT SERVICE TESTS (Module 56)
//
// The store is deterministic (seeded RNG) so `buildSupportDataset()`
// and the service's internal store share identical ids/content. Tests
// derive the exact rows they mutate from the dataset instead of
// hardcoding fragile random facts, and mutations never pretend the
// notification/audit stores are empty — they assert honest deltas.
// ------------------------------------------------------------

function makeAdmin(
  partial: Partial<AdminProfile> & Pick<AdminProfile, "id" | "name" | "role">
): AdminProfile {
  return {
    email: `${partial.id}@kampmax.ng`,
    campusId: null,
    avatar: "/brand/avatar.png",
    title: "Test Admin",
    lastLoginAt: "2026-01-01T08:00:00.000Z",
    ...partial,
  };
}

const ctx = (actor: AdminProfile): AdminActingContext => ({ actor });

const SUPER = makeAdmin({
  id: "adm-test-super",
  name: "Test Super",
  role: "SUPER_ADMIN",
});
const ADMIN = makeAdmin({ id: "adm-test-admin", name: "Test Admin", role: "ADMIN" });
const CAMPUS = makeAdmin({
  id: "adm-test-campus",
  name: "Test Campus",
  role: "CAMPUS_ADMIN",
  campusId: "rugipo",
});

/** A ticket in a live status (safe to mutate) from the SAME seed. */
function pickOpenTicket(): SupportTicket {
  const dataset = buildSupportDataset();
  const open = dataset.tickets.find((t) => t.status === "open");
  expect(open).toBeDefined();
  return open as SupportTicket;
}

describe("supportManagementService (live store)", () => {
  it("lists all 20 seeded tickets from the deterministic store", async () => {
    const svc = createMockSupportManagementService();
    const page = await svc.list({ pageSize: 50 });
    expect(page.total).toBe(20);
    expect(page.items.length).toBe(20);
    expect(new Set(page.items.map((t) => t.id)).size).toBe(20);
    for (const t of page.items) {
      expect(t.id).toMatch(/^tkt-\d{3}$/);
      expect(t.customer).not.toHaveProperty("email");
      expect(t.customer).not.toHaveProperty("phone");
    }
  });

  it("pages with safe bounds", async () => {
    const svc = createMockSupportManagementService();
    const page2 = await svc.list({ page: 2, pageSize: 6 });
    expect(page2.page).toBe(2);
    expect(page2.totalPages).toBe(4);
    expect(page2.items.length).toBe(6);

    const over = await svc.list({ page: 99, pageSize: 10 });
    expect(over.page).toBe(2);
  });

  it("derives metrics from the real ticket rows", async () => {
    const svc = createMockSupportManagementService();
    const metrics = await svc.getMetrics();
    const dataset = buildSupportDataset();
    expect(
      metrics.byStatus.reduce((a, b) => a + b.count, 0)
    ).toBe(dataset.tickets.length);
    expect(metrics.open).toBe(
      dataset.tickets.filter((t) => t.status === "open").length
    );
    expect(metrics.escalated).toBe(
      dataset.tickets.filter((t) => t.escalated).length
    );
    expect(metrics.unassigned).toBe(
      dataset.tickets.filter((t) => t.assigneeId === null).length
    );
    expect(metrics.byCategory.length).toBe(9);
    expect(metrics.byPriority.length).toBe(4);
    expect(metrics.byStatus.length).toBe(6);
  });

  it("resolves a full detail with description, messages, timeline and staff", async () => {
    const svc = createMockSupportManagementService();
    const seed = pickOpenTicket();
    const detail: SupportTicketDetail | null = await svc.getById(seed.id);
    expect(detail).not.toBeNull();
    expect(detail?.ticket.id).toBe(seed.id);
    expect(detail?.description.length).toBeGreaterThan(0);
    expect(detail?.messages.length).toBeGreaterThan(0);
    expect(detail?.timeline.length).toBeGreaterThan(0);
    expect(detail?.messages.every((m) => m.ticketId === seed.id)).toBe(true);
    expect(detail?.assignees.length).toBeGreaterThan(0);
  });

  it("throws for unknown and out-of-scope tickets", async () => {
    const svc = createMockSupportManagementService();
    await expect(svc.getById("tkt-999")).rejects.toThrow(/not found/);

    const seed = pickOpenTicket();
    const outOfScope =
      buildSupportDataset().tickets.find(
        (t) => t.customer.campusId !== "rugipo"
      );
    expect(outOfScope).toBeDefined();
    await expect(
      svc.getById(outOfScope?.id as string, ctx(CAMPUS))
    ).rejects.toThrow(/not found/);
    expect(seed.id).toBeDefined();
  });
});

describe("mutations (privilege + audit + notifications)", () => {
  it("rejects every mutation for CAMPUS_ADMIN operators", async () => {
    const svc = createMockSupportManagementService();
    const seed = pickOpenTicket();
    await expect(
      svc.respond(seed.id, { body: "hi", visibility: "customer" }, ctx(CAMPUS))
    ).rejects.toThrow(/permission/);
    await expect(
      svc.addInternalNote(seed.id, "note", ctx(CAMPUS))
    ).rejects.toThrow(/permission/);
    await expect(
      svc.assign(seed.id, { assigneeId: "adm-001" }, ctx(CAMPUS))
    ).rejects.toThrow(/permission/);
    await expect(
      svc.setStatus(seed.id, { status: "closed" }, ctx(CAMPUS))
    ).rejects.toThrow(/permission/);
    await expect(
      svc.setPriority(seed.id, { priority: "urgent" }, ctx(CAMPUS))
    ).rejects.toThrow(/permission/);
    await expect(
      svc.escalate(seed.id, { target: "finance", note: "x" }, ctx(CAMPUS))
    ).rejects.toThrow(/permission/);
  });

  it("refuses mutations without an authenticated actor session", async () => {
    const svc = createMockSupportManagementService();
    const seed = pickOpenTicket();
    await expect(
      svc.respond(seed.id, { body: "hi", visibility: "customer" }, undefined as never)
    ).rejects.toThrow(/authenticated/);
  });

  it("responds to a customer, moves open tickets to in_progress and notifies the requester", async () => {
    const svc = createMockSupportManagementService();
    const dataset = buildSupportDataset();
    const open = dataset.tickets.find((t) => t.status === "open") as SupportTicket;
    const beforeUnread = getUnreadCount(open.customer.id);

    const updated = await svc.respond(
      open.id,
      { body: "We have fixed this for you.", visibility: "customer" },
      ctx(ADMIN)
    );

    expect(updated.status).toBe("in_progress");
    expect(updated.lastResponseAt).not.toBeNull();

    const detail = await svc.getById(open.id);
    const last = detail?.messages.at(-1);
    expect(last?.postedBy).toBe("support");
    expect(last?.visibility).toBe("customer");
    expect(last?.authorName).toBe("Test Admin");
    expect(detail?.timeline.some((e) => e.kind === "responded")).toBe(true);

    expect(getUnreadCount(open.customer.id)).toBeGreaterThan(beforeUnread);
  });

  it("rejects empty reply bodies", async () => {
    const svc = createMockSupportManagementService();
    const seed = pickOpenTicket();
    await expect(
      svc.respond(seed.id, { body: "   ", visibility: "customer" }, ctx(ADMIN))
    ).rejects.toThrow(/empty/);
  });

  it("stores internal notes as internal and never notifies the customer", async () => {
    const svc = createMockSupportManagementService();
    const seed = pickOpenTicket();
    const beforeUnread = getUnreadCount(seed.customer.id);

    const updated = await svc.addInternalNote(
      seed.id,
      "Internal: verification docs look tampered.",
      ctx(SUPER)
    );

    const detail = await svc.getById(updated.id);
    const last = detail?.messages.at(-1);
    expect(last?.visibility).toBe("internal");
    expect(getUnreadCount(seed.customer.id)).toBe(beforeUnread);
    expect(
      detail?.timeline.some((e) => e.kind === "note_added")
    ).toBe(true);
  });

  it("assigns to a known agent and rejects unknown agents", async () => {
    const svc = createMockSupportManagementService();
    const seed = pickOpenTicket();
    const updated = await svc.assign(
      seed.id,
      { assigneeId: "adm-001" },
      ctx(ADMIN)
    );
    expect(updated.assigneeId).toBe("adm-001");
    expect(updated.assigneeName).toBeTruthy();

    await expect(
      svc.assign(seed.id, { assigneeId: "nope" }, ctx(ADMIN))
    ).rejects.toThrow(/Unknown/);
  });

  it("reopens closed tickets and clears escalation on resolve", async () => {
    const svc = createMockSupportManagementService();
    const dataset = buildSupportDataset();
    const closed = dataset.tickets.find(
      (t) => t.status === "closed"
    ) as SupportTicket;

    const reopened = await svc.setStatus(
      closed.id,
      { status: "open" },
      ctx(SUPER)
    );
    expect(reopened.status).toBe("open");
    expect(reopened.reopenedAt).not.toBeNull();

    const escalated = dataset.tickets.find(
      (t) => t.escalated
    ) as SupportTicket;
    const resolved = await svc.setStatus(
      escalated.id,
      { status: "resolved" },
      ctx(ADMIN)
    );
    expect(resolved.escalated).toBe(false);
  });

  it("rejects escalating resolved or closed tickets", async () => {
    const svc = createMockSupportManagementService();
    const dataset = buildSupportDataset();
    const terminal = dataset.tickets.find(
      (t) => t.status === "resolved" || t.status === "closed"
    ) as SupportTicket;
    await expect(
      svc.escalate(
        terminal.id,
        { target: "finance", note: "urgent" },
        ctx(ADMIN)
      )
    ).rejects.toThrow(/Closed tickets/);
  });

  it("escalates live tickets with a target, note and actor", async () => {
    const svc = createMockSupportManagementService();
    const seed = pickOpenTicket();
    const updated = await svc.escalate(
      seed.id,
      { target: "finance", note: "Payment provider involved.", },
      ctx(SUPER)
    );
    expect(updated.escalated).toBe(true);
    expect(updated.escalation?.target).toBe("finance");
    expect(updated.escalation?.byName).toBe("Test Super");

    const detail = await svc.getById(seed.id);
    expect(detail?.timeline.some((e) => e.kind === "escalated")).toBe(true);
  });
});

describe("campus scoping", () => {
  it("restricts list and metrics to the CAMPUS_ADMIN campus", async () => {
    const svc = createMockSupportManagementService();
    const dataset = buildSupportDataset();
    const expected = dataset.tickets.filter(
      (t) => t.customer.campusId === "rugipo"
    );

    const page = await svc.list({ pageSize: 50 }, ctx(CAMPUS));
    expect(page.total).toBe(expected.length);
    expect(
      page.items.every((t) => t.customer.campusId === "rugipo")
    ).toBe(true);

    const metrics = await svc.getMetrics(ctx(CAMPUS));
    expect(metrics.byStatus.reduce((a, b) => a + b.count, 0)).toBe(
      expected.length
    );
  });
});