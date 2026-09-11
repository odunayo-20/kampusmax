"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  ExternalLink,
  Flag,
  Loader2,
  Mail,
  MessageSquareText,
  Send,
  StickyNote,
  UserCheck,
  UserRound,
} from "lucide-react";
import { cn, formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import {
  SupportCategoryBadge,
  SupportPriorityBadge,
  SupportStatusBadge,
} from "@/components/admin/support/SupportBadges";
import {
  supportCategoryLabel,
  supportEscalationLabel,
  supportStatusLabel,
} from "@/components/admin/support/support-meta";
import {
  useAdminSupportAssignMutation,
  useAdminSupportEscalateMutation,
  useAdminSupportNoteMutation,
  useAdminSupportRespondMutation,
  useAdminSupportStaff,
  useAdminSupportStatusMutation,
  useAdminSupportTicket,
} from "@/hooks/admin/use-admin-support";
import { useAdminSession } from "@/lib/admin/admin-auth-context";
import type {
  SupportEscalationTarget,
  SupportMessage,
  SupportMessageVisibility,
  SupportTicketDetail,
  SupportTicketStatus,
} from "@/types/admin";

type ComposeMode = "customer" | "note";

export default function AdminSupportTicketPage() {
  const params = useParams<{ id: string }>();
  const ticketId = typeof params.id === "string" ? params.id : "";

  const { data: detail, isPending, isError, refetch } = useAdminSupportTicket(ticketId);

  if (!ticketId) {
    return <SupportTicketNotFound />;
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 animate-pulse rounded bg-kampmax-muted" />
        <LoadingSkeleton variant="cards" rows={6} />
        <div className="h-64 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  if (!detail) {
    return <SupportTicketNotFound />;
  }

  return <SupportTicketView detail={detail} refetch={() => void refetch()} />;
}

function SupportTicketView({
  detail,
}: {
  detail: SupportTicketDetail;
  refetch: () => void;
}) {
  const { admin } = useAdminSession();
  const canManage = admin?.role === "SUPER_ADMIN" || admin?.role === "ADMIN";
  const ticket = detail.ticket;
  const isClosed = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <>
      <Link
        href="/admin/support"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:text-kampmax-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All tickets
      </Link>

      <AdminPageHeader
        title={ticket.subject}
        description={`${ticket.id} · ${supportCategoryLabel(ticket.category)} · ${ticket.customer.name} · opened ${formatDate(ticket.createdAt)}`}
        actions={
          <>
            <SupportStatusBadge status={ticket.status} />
            <SupportPriorityBadge priority={ticket.priority} />
            {ticket.escalated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-kampmax-gold/15 px-2 py-0.5 text-xs font-medium capitalize text-kampmax-gold-dark">
                <Flag className="h-3 w-3" />
                Escalated
              </span>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ---------- Main column ---------- */}
        <div className="space-y-4 lg:col-span-2">
          {/* Conversation */}
          <section aria-label="Conversation" className="rounded-lg border border-kampmax-border bg-white">
            <div className="flex items-center justify-between border-b border-kampmax-border px-4 py-3">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
                <MessageSquareText className="h-4 w-4 text-kampmax-text-secondary" />
                Conversation
              </h2>
              <span className="rounded-full bg-kampmax-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-kampmax-text-secondary">
                {detail.messages.length} messages
              </span>
            </div>

            <ul className="divide-y divide-kampmax-border/70">
              {detail.messages.map((msg) => (
                <MessageRow key={msg.id} message={msg} />
              ))}
            </ul>

            {canManage && <Responder ticketId={ticket.id} isClosed={isClosed} />}
          </section>

          {/* Timeline */}
          <section aria-label="Ticket timeline" className="rounded-lg border border-kampmax-border bg-white">
            <div className="border-b border-kampmax-border px-4 py-3">
              <h2 className="text-sm font-semibold text-kampmax-text">Timeline</h2>
            </div>
            <ol className="px-4 py-4">
              {detail.timeline.map((event, i) => (
                <li
                  key={event.id}
                  className={cn(
                    "relative pl-6",
                    i !== detail.timeline.length - 1 && "pb-4"
                  )}
                >
                  {i !== detail.timeline.length - 1 && (
                    <span className="absolute left-[7px] top-2 h-full w-px bg-kampmax-border" aria-hidden />
                  )}
                  <span className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-kampmax-blue bg-white" aria-hidden />
                  <p className="text-[13px] font-medium text-kampmax-text">{event.label}</p>
                  {event.detail && (
                    <p className="mt-0.5 text-xs leading-relaxed text-kampmax-text-secondary">
                      {event.detail}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-kampmax-text-secondary/70">
                    {event.actorName} · {formatDateTime(event.at)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* ---------- Side column ---------- */}
        <div className="space-y-4">
          {/* Customer */}
          <section aria-label="Customer" className="rounded-lg border border-kampmax-border bg-white">
            <div className="border-b border-kampmax-border px-4 py-3">
              <h2 className="text-sm font-semibold text-kampmax-text">Customer</h2>
            </div>
            <div className="space-y-2.5 px-4 py-3.5">
              <p className="flex items-center gap-2 font-medium text-kampmax-text">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kampmax-muted text-xs font-semibold text-kampmax-text-secondary">
                  {initials(ticket.customer.name)}
                </span>
                {ticket.customer.name}
                {ticket.customer.isVerified && (
                  <BadgeCheck aria-label="Verified" className="h-4 w-4 shrink-0 text-kampmax-success" />
                )}
              </p>
              <p className="font-mono text-[11px] text-kampmax-text-secondary">
                {ticket.customer.id}
              </p>
              <p className="text-xs text-kampmax-text-secondary">
                {ticket.customer.role} · {ticket.customer.campusName ?? "Platform"}
              </p>
              <p className="text-[11px] text-kampmax-text-secondary/70">
                Joined {formatDate(ticket.customer.joinedAt)}
              </p>
            </div>
          </section>

          {/* Description */}
          <section aria-label="Description" className="rounded-lg border border-kampmax-border bg-white">
            <div className="border-b border-kampmax-border px-4 py-3">
              <h2 className="text-sm font-semibold text-kampmax-text">Description</h2>
            </div>
            <p className="px-4 py-3.5 text-sm leading-relaxed text-kampmax-text">
              {detail.description}
            </p>
          </section>

          {/* Related resource */}
          <RelatedResourceSection ticket={detail} />

          {/* Escalation */}
          {ticket.escalation && (
            <section aria-label="Escalation" className="rounded-lg border border-kampmax-gold/40 bg-kampmax-gold/5">
              <div className="border-b border-kampmax-gold/30 px-4 py-3">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
                  <Flag className="h-3.5 w-3.5 text-kampmax-gold-dark" />
                  Escalated
                </h2>
              </div>
              <div className="space-y-1.5 px-4 py-3.5">
                <p className="text-[13px] font-medium text-kampmax-text">
                  {supportEscalationLabel(ticket.escalation.target)}
                </p>
                <p className="text-xs leading-relaxed text-kampmax-text-secondary">
                  {ticket.escalation.note}
                </p>
                <p className="text-[11px] text-kampmax-text-secondary/70">
                  {ticket.escalation.byName} · {formatDateTime(ticket.escalation.at)}
                </p>
              </div>
            </section>
          )}

          {canManage && (
            <section aria-label="Manage ticket" className="rounded-lg border border-kampmax-border bg-white">
              <div className="border-b border-kampmax-border px-4 py-3">
                <h2 className="text-sm font-semibold text-kampmax-text">Manage ticket</h2>
              </div>
              <div className="space-y-3.5 px-4 py-3.5">
                <AssignmentControl ticketId={ticket.id} currentName={ticket.assigneeName} />
                <StatusControl
                  ticketId={ticket.id}
                  status={ticket.status}
                  isClosed={isClosed}
                />
                <EscalateControl ticketId={ticket.id} isClosed={isClosed} escalated={ticket.escalated} />
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Conversation row
// ------------------------------------------------------------

function MessageRow({ message }: { message: SupportMessage }) {
  const isSupport = message.postedBy === "support";
  const isInternal = message.visibility === "internal";
  return (
    <li className="px-4 py-3.5">
      <div
        className={cn(
          "rounded-lg border p-3",
          isInternal
            ? "border-dashed border-amber-300 bg-amber-50/60"
            : isSupport
              ? "border-kampmax-border bg-kampmax-muted/30"
              : "border-kampmax-border bg-white"
        )}
      >
        <div className={cn("flex items-center gap-2", isInternal && "justify-between")}>
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-kampmax-text">
            {isSupport ? (
              <UserCheck className="h-3.5 w-3.5 text-kampmax-blue" />
            ) : (
              <UserRound className="h-3.5 w-3.5 text-kampmax-text-secondary" />
            )}
            {message.authorName}
          </p>
          {isInternal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
              <StickyNote className="h-3 w-3" />
              Internal note
            </span>
          )}
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-kampmax-text">
          {message.body}
        </p>
        <p className="mt-1.5 text-[11px] text-kampmax-text-secondary/70">
          {formatDateTime(message.at)} · {timeAgo(message.at)}
          {isInternal && " · never sent to the customer"}
        </p>
      </div>
    </li>
  );
}

// ------------------------------------------------------------
// Responder (composer)
// ------------------------------------------------------------

function Responder({ ticketId, isClosed }: { ticketId: string; isClosed: boolean }) {
  const [mode, setMode] = useState<ComposeMode>("customer");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const respond = useAdminSupportRespondMutation();
  const note = useAdminSupportNoteMutation();
  const working = mode === "customer" ? respond.isPending : note.isPending;

  function submit() {
    if (mode === "customer") {
      respond.mutate(
        { id: ticketId, input: { body, visibility: "customer" as SupportMessageVisibility } },
        {
          onSuccess: () => {
            setBody("");
            setError(null);
          },
          onError: (e) => setError(e.message ?? "Failed to send message."),
        }
      );
    } else {
      note.mutate(
        { id: ticketId, note: body },
        {
          onSuccess: () => {
            setBody("");
            setError(null);
          },
          onError: (e) => setError(e.message ?? "Failed to add note."),
        }
      );
    }
  }

  return (
    <div className="border-t border-kampmax-border bg-kampmax-muted/20 px-4 py-3.5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("customer")}
          className={cn(
            "h-7 rounded-md border px-2.5 text-[11px] font-medium transition-colors",
            mode === "customer"
              ? "border-kampmax-blue bg-kampmax-blue/10 text-kampmax-blue"
              : "border-kampmax-border bg-white text-kampmax-text-secondary hover:bg-kampmax-muted/60"
          )}
        >
          Reply to customer
        </button>
        <button
          type="button"
          onClick={() => setMode("note")}
          className={cn(
            "h-7 rounded-md border px-2.5 text-[11px] font-medium transition-colors",
            mode === "note"
              ? "border-amber-500 bg-amber-50 text-amber-800"
              : "border-kampmax-border bg-white text-kampmax-text-secondary hover:bg-kampmax-muted/60"
          )}
        >
          Internal note
        </button>
      </div>

      {mode === "note" && (
        <p className="mt-2 text-[11px] leading-relaxed text-kampmax-text-secondary">
          Internal notes are visible to admins only and are never sent to the customer.
        </p>
      )}

      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={isClosed || working}
        placeholder={
          isClosed
            ? "This ticket is closed — reopen it from the Manage panel to compose."
            : mode === "customer"
              ? "Write a customer-facing reply…"
              : "Write an internal note for the team…"
        }
        className="mt-2 w-full resize-none rounded-lg border border-kampmax-border bg-white px-3 py-2 text-xs focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue disabled:opacity-60"
      />
      {error && <p className="mt-1 text-xs text-kampmax-error">{error}</p>}

      <div className="mt-2.5 flex items-center justify-between">
        <p className="text-[11px] text-kampmax-text-secondary/70">
          {mode === "customer" ? "Sent via the in-app notification center" : "Never exposed to the customer"}
        </p>
        <button
          type="button"
          disabled={working || isClosed || !body.trim()}
          onClick={submit}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-kampmax-navy px-3 text-xs font-medium text-white transition-colors hover:bg-kampmax-navy-light disabled:opacity-50"
        >
          {working ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : mode === "customer" ? (
            <Send className="h-3 w-3" />
          ) : (
            <StickyNote className="h-3 w-3" />
          )}
          {mode === "customer" ? "Send reply" : "Add note"}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Side controls
// ------------------------------------------------------------

function RelatedResourceSection({ ticket }: { ticket: SupportTicketDetail }) {
  const resource = ticket.ticket.relatedResource;
  if (!resource) return null;
  return (
    <section aria-label="Related resource" className="rounded-lg border border-kampmax-border bg-white">
      <div className="border-b border-kampmax-border px-4 py-3">
        <h2 className="text-sm font-semibold text-kampmax-text">Related record</h2>
      </div>
      <div className="px-4 py-3.5">
        <p className="text-[13px] font-medium capitalize text-kampmax-text">{resource.type}</p>
        <p className="mt-0.5 font-mono text-[11px] text-kampmax-text-secondary">{resource.id}</p>
        <Link
          href={resource.href}
          className="mt-2.5 inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open record
        </Link>
      </div>
    </section>
  );
}

function AssignmentControl({
  ticketId,
  currentName,
}: {
  ticketId: string;
  currentName: string | null;
}) {
  const [assigneeId, setAssigneeId] = useState("");
  const assign = useAdminSupportAssignMutation();
  const { data: staff } = useAdminSupportStaff();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <label htmlFor="support-assignee" className="text-xs font-medium text-kampmax-text-secondary">
        <span className="inline-flex items-center gap-1">
          <UserCheck className="h-3 w-3 opacity-60" />
          Assignee
        </span>
      </label>
      <div className="mt-1.5 flex gap-2">
        <select
          id="support-assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="h-9 min-w-0 flex-1 rounded-md border border-kampmax-border bg-white px-2 text-xs text-kampmax-text focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
        >
          <option value="">{currentName ?? "Unassigned"}</option>
          {(staff ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.activeTicketCount} active)
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!assigneeId || assign.isPending}
          onClick={() =>
            assign.mutate(
              { id: ticketId, input: { assigneeId } },
              {
                onSuccess: () => {
                  setAssigneeId("");
                  setError(null);
                },
                onError: (e) => setError(e.message ?? "Failed to assign."),
              }
            )
          }
          className="inline-flex h-9 items-center gap-1 rounded-md bg-kampmax-blue px-2.5 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue/90 disabled:opacity-50"
        >
          {assign.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
          Assign
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-kampmax-error">{error}</p>}
    </div>
  );
}

function StatusControl({
  ticketId,
  status,
  isClosed,
}: {
  ticketId: string;
  status: SupportTicketStatus;
  isClosed: boolean;
}) {
  const [target, setTarget] = useState<string>("");
  const setStatus = useAdminSupportStatusMutation();
  const [error, setError] = useState<string | null>(null);

  const options: { value: SupportTicketStatus; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In progress" },
    { value: "waiting_on_customer", label: "Waiting on customer" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div>
      <label htmlFor="support-status" className="text-xs font-medium text-kampmax-text-secondary">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3 opacity-60" />
          Status
        </span>
      </label>
      <div className="mt-1.5 flex gap-2">
        <select
          id="support-status"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="h-9 min-w-0 flex-1 rounded-md border border-kampmax-border bg-white px-2 text-xs text-kampmax-text focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
        >
          <option value="">{supportStatusLabel(status)}</option>
          {options
            .filter((o) => o.value !== status)
            .map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
        </select>
        <button
          type="button"
          disabled={!target || setStatus.isPending}
          onClick={() =>
            setStatus.mutate(
              { id: ticketId, input: { status: target as SupportTicketStatus } },
              {
                onSuccess: () => {
                  setTarget("");
                  setError(null);
                },
                onError: (e) => setError(e.message ?? "Failed to update status."),
              }
            )
          }
          className="inline-flex h-9 items-center gap-1 rounded-md bg-kampmax-navy px-2.5 text-xs font-medium text-white transition-colors hover:bg-kampmax-navy-light disabled:opacity-50"
        >
          {setStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
          Update
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-kampmax-error">{error}</p>}
      {isClosed && (
        <p className="mt-1.5 text-[11px] text-kampmax-text-secondary">
          Resolved/closed tickets can be reopened by setting a live status.
        </p>
      )}
    </div>
  );
}

function EscalateControl({
  ticketId,
  isClosed,
  escalated,
}: {
  ticketId: string;
  isClosed: boolean;
  escalated: boolean;
}) {
  const [note, setNote] = useState("");
  const [target, setTarget] = useState<SupportEscalationTarget>("finance");
  const escalate = useAdminSupportEscalateMutation();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="border-t border-kampmax-border pt-3.5">
      <label htmlFor="support-escalate" className="text-xs font-medium text-kampmax-text-secondary">
        <span className="inline-flex items-center gap-1">
          <Flag className="h-3 w-3 opacity-60" />
          Escalate
        </span>
      </label>
      <select
        id="support-escalate"
        value={target}
        onChange={(e) => setTarget(e.target.value as SupportEscalationTarget)}
        className="mt-1.5 h-9 w-full rounded-md border border-kampmax-border bg-white px-2 text-xs text-kampmax-text focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
      >
        {SUPPORT_ESCALATION_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={isClosed || escalated}
        placeholder={escalated ? "Already escalated" : "Why is this being escalated? (required)"}
        className="mt-1.5 w-full resize-none rounded-lg border border-kampmax-border bg-white px-3 py-2 text-xs focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue disabled:opacity-60"
      />
      <button
        type="button"
        disabled={isClosed || escalated || escalate.isPending || !note.trim()}
        onClick={() =>
          escalate.mutate(
            { id: ticketId, input: { target, note } },
            {
              onSuccess: () => {
                setNote("");
                setError(null);
              },
              onError: (e) => setError(e.message ?? "Failed to escalate."),
            }
          )
        }
        className={cn(
          "mt-2 inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-white transition-colors disabled:opacity-50",
          escalated ? "bg-kampmax-muted text-kampmax-text-secondary" : "bg-amber-500 hover:bg-amber-600"
        )}
      >
        {escalate.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Flag className="h-3 w-3" />}
        {escalated ? "Escalated" : "Escalate ticket"}
      </button>
      {error && <p className="mt-1 text-xs text-kampmax-error">{error}</p>}
    </div>
  );
}

const SUPPORT_ESCALATION_OPTIONS: readonly {
  value: SupportEscalationTarget;
  label: string;
}[] = [
  { value: "finance", label: "Finance" },
  { value: "trust_safety", label: "Trust & Safety" },
  { value: "verification", label: "Verification" },
  { value: "technical_operations", label: "Technical operations" },
  { value: "vendor_operations", label: "Vendor operations" },
  { value: "management", label: "Management" },
];

// ------------------------------------------------------------
// Shared helpers
// ------------------------------------------------------------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

function SupportTicketNotFound() {
  return (
    <div className="rounded-lg border border-kampmax-border bg-white p-4">
      <ErrorState
        title="Ticket not found"
        message="This ticket may have been removed or the link is incorrect. Only real tickets are surfaced."
      />
      <div className="mt-3 text-center">
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-blue hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Support
        </Link>
      </div>
    </div>
  );
}