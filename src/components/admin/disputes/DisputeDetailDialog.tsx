"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  CheckCheck,
  CircleAlert,
  FileText,
  History,
  Image as ImageIcon,
  Loader2,
  MessageSquareText,
  MessagesSquare,
  ReceiptText,
  Send,
  ShieldX,
  ShoppingBag,
  Store,
  Upload,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { communityCampusName } from "@/components/admin/campus-community/campus-community-utils";
import { cn, formatDateTime, formatNaira } from "@/lib/utils";
import {
  disputeReasonLabel,
  disputeStatusLabel,
  disputeStatusVariant,
} from "./disputes-meta";
import { disputeManagementService } from "@/services/admin";
import type {
  DisputeMessage,
  ManagedDisputeDetail,
} from "@/types/admin";

interface DisputeDetailDialogProps {
  disputeId: string | null;
  onClose: () => void;
  onToast: (tone: "success" | "error", text: string) => void;
  onMutated: () => void;
  /** Opens one of the admin action panels directly. */
  actionRequest:
    | { kind: "info" }
    | { kind: "resolve" }
    | { kind: "reject" }
    | { kind: "refund" }
    | null;
  onActionHandled: () => void;
}

type ActionPanel = "info" | "resolve" | "reject" | "refund";

type DetailTab = "messages" | "evidence" | "payment" | "timeline" | "resolution";

const TABS: { key: DetailTab; label: string; icon: typeof MessagesSquare }[] = [
  { key: "messages", label: "Messages", icon: MessagesSquare },
  { key: "evidence", label: "Evidence", icon: FileText },
  { key: "payment", label: "Payment", icon: ReceiptText },
  { key: "timeline", label: "Timeline", icon: History },
  { key: "resolution", label: "Resolution", icon: CheckCheck },
];

export function DisputeDetailDialog({
  disputeId,
  onClose,
  onToast,
  onMutated,
  actionRequest,
  onActionHandled,
}: DisputeDetailDialogProps) {
  const [detail, setDetail] = useState<ManagedDisputeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<DetailTab>("messages");

  // ----- action panel state -----
  const [panel, setPanel] = useState<"info" | "resolve" | "reject" | "refund" | null>(
    null
  );
  const [party, setParty] = useState<"customer" | "vendor">("customer");
  const [note, setNote] = useState("");
  const [working, setWorking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!disputeId) return;
    setLoading(true);
    setError(false);
    try {
      const d = await disputeManagementService.getById(disputeId);
      setDetail(d);
      if (!d) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    if (disputeId) void load();
    else {
      setDetail(null);
      setPanel(null);
      setNote("");
      setFormError(null);
    }
  }, [disputeId, load]);

  // Open the requested admin panel (from row/detail menu).
  useEffect(() => {
    if (!actionRequest || !detail) return;
    setPanel(actionRequest.kind);
    setNote("");
    setFormError(null);
    if (actionRequest.kind === "info") setParty("customer");
    onActionHandled();
  }, [actionRequest, detail, onActionHandled]);

  useEffect(() => {
    if (!disputeId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [disputeId, onClose]);

  async function runAction() {
    if (!detail) return;
    setWorking(true);
    setFormError(null);
    try {
      const svc = disputeManagementService;
      switch (panel) {
        case "info":
          await svc.requestInfo(detail.dispute.id, { party, note });
          onToast(
            "success",
            `Information request sent to the ${party}. Case marked ${party === "customer" ? "awaiting customer" : "awaiting vendor"}.`
          );
          break;
        case "resolve":
          await svc.resolve(detail.dispute.id, { note });
          onToast("success", `Case ${detail.dispute.id.toUpperCase()} resolved.`);
          break;
        case "reject":
          await svc.reject(detail.dispute.id, { note });
          onToast("success", `Case ${detail.dispute.id.toUpperCase()} rejected.`);
          break;
        case "refund":
          await svc.recordRefundPlaceholder(detail.dispute.id, { note });
          onToast(
            "success",
            `Refund of ${formatNaira(detail.dispute.amount)} recorded for ${detail.dispute.id.toUpperCase()} (placeholder - no funds moved).`
          );
          break;
        default:
          break;
      }
      setPanel(null);
      await load();
      onMutated();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setWorking(false);
    }
  }

  async function escalateNow() {
    if (!detail) return;
    setWorking(true);
    try {
      await disputeManagementService.escalate(detail.dispute.id);
      onToast("success", `Case ${detail.dispute.id.toUpperCase()} escalated to senior operations.`);
      setPanel(null);
      await load();
      onMutated();
    } catch (err) {
      onToast("error", err instanceof Error ? err.message : "Couldn't escalate.");
    } finally {
      setWorking(false);
    }
  }

  if (!disputeId) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Dispute case details"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => !working && onClose()}
        disabled={working}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl">
        {loading && !detail ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-kampmax-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading case…
          </div>
        ) : error || !detail ? (
          <div className="px-5 py-14 text-center text-sm text-kampmax-text-secondary">
            Couldn&apos;t load this dispute.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-kampmax-border px-5 pt-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold uppercase text-kampmax-blue">
                      {detail.dispute.id}
                    </span>
                    <StatusBadge
                      variant={disputeStatusVariant(detail.dispute.status)}
                      label={disputeStatusLabel(detail.dispute.status)}
                    />
                    {detail.resolution?.refundPlaceholder && (
                      <StatusBadge variant="blue" label="Refund recorded" />
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-kampmax-text">
                    {detail.dispute.subject}
                  </p>
                  <p className="text-xs text-kampmax-text-secondary">
                    {disputeReasonLabel(detail.dispute.reason)} · Order{" "}
                    <span className="font-mono uppercase">{detail.dispute.orderId}</span> ·{" "}
                    {communityCampusName(detail.dispute.campusId)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  disabled={working}
                  className="-mr-1 rounded-md p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Parties */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <PartyCard
                  icon={UserRound}
                  role="Customer"
                  name={detail.dispute.customerName}
                />
                <PartyCard
                  icon={
                    detail.dispute.parties === "customer_vs_platform"
                      ? ShieldX
                      : Store
                  }
                  role={
                    detail.dispute.parties === "customer_vs_platform"
                      ? "Kampmax (platform)"
                      : "Vendor"
                  }
                  name={
                    detail.dispute.parties === "customer_vs_platform"
                      ? "Kampmax Payments"
                      : detail.dispute.vendorName
                  }
                />
              </div>
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Case sections"
              className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 no-scrollbar"
            >
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                    tab === t.key
                      ? "border-kampmax-blue text-kampmax-blue"
                      : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" aria-hidden />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {tab === "messages" && <MessagesTab messages={detail.messages} />}
              {tab === "evidence" && <EvidenceTab evidence={detail.evidence} />}
              {tab === "payment" && (
                <PaymentTab
                  detail={detail}
                  onRefundPlaceholder={() => setPanel("refund")}
                  refundAllowed={detail.dispute.status !== "rejected"}
                />
              )}
              {tab === "timeline" && <TimelineTab detail={detail} />}
              {tab === "resolution" && <ResolutionTab detail={detail} />}
            </div>

            {/* Action bar */}
            {panel ? (
              <ActionBar
                panel={panel}
                party={party}
                setParty={setParty}
                note={note}
                setNote={setNote}
                error={formError}
                working={working}
                amount={detail.dispute.amount}
                onCancel={() => {
                  setPanel(null);
                  setFormError(null);
                }}
                onSubmit={() => void runAction()}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-kampmax-border px-5 py-3">
                {["resolved", "rejected"].includes(detail.dispute.status) ? (
                  <span className="mr-auto inline-flex items-center gap-1.5 text-xs text-kampmax-text-secondary">
                    <CircleAlert className="h-3.5 w-3.5" aria-hidden />
                    This case is closed.
                  </span>
                ) : (
                  <>
                    <ActionButton
                      icon={MessageSquareText}
                      label="Request info"
                      onClick={() => {
                        setParty("customer");
                        setNote("");
                        setFormError(null);
                        setPanel("info");
                      }}
                    />
                    <ActionButton
                      icon={Banknote}
                      label="Issue refund*"
                      title="Placeholder only - records refund intent, moves no money"
                      tone="blue"
                      onClick={() => {
                        setNote("");
                        setFormError(null);
                        setPanel("refund");
                      }}
                    />
                    <ActionButton
                      icon={ShieldX}
                      label="Reject"
                      tone="danger"
                      onClick={() => {
                        setNote("");
                        setFormError(null);
                        setPanel("reject");
                      }}
                    />
                    <ActionButton
                      icon={CircleAlert}
                      label="Escalate"
                      tone="warning"
                      loading={working}
                      onClick={() => void escalateNow()}
                    />
                    <ActionButton
                      icon={CheckCheck}
                      label="Resolve"
                      tone="primary"
                      onClick={() => {
                        setNote("");
                        setFormError(null);
                        setPanel("resolve");
                      }}
                    />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// TABS
// ------------------------------------------------------------

function MessagesTab({ messages }: { messages: DisputeMessage[] }) {
  if (messages.length === 0)
    return (
      <EmptyState compact icon={MessagesSquare} title="No messages yet" />
    );
  return (
    <ul className="space-y-2.5">
      {messages.map((m) => (
        <li
          key={m.id}
          className={cn(
            "rounded-lg border px-3 py-2.5",
            m.authorRole === "support"
              ? "border-kampmax-blue/20 bg-kampmax-blue/5"
              : "border-kampmax-border bg-white"
          )}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-semibold text-kampmax-text">
              {m.authorName}
            </span>
            <span
              className={cn(
                "rounded px-1.5 py-px text-[10px] font-medium uppercase tracking-wide",
                m.authorRole === "support"
                  ? "bg-kampmax-blue/10 text-kampmax-blue"
                  : m.authorRole === "vendor"
                    ? "bg-kampmax-gold/15 text-kampmax-gold-dark"
                    : "bg-kampmax-muted text-kampmax-text-secondary"
              )}
            >
              {m.authorRole}
            </span>
            <span className="ml-auto text-[11px] tabular-nums text-kampmax-text-secondary">
              {formatDateTime(m.at)}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-kampmax-text">
            {m.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

function EvidenceTab({
  evidence,
}: {
  evidence: ManagedDisputeDetail["evidence"];
}) {
  if (evidence.length === 0)
    return (
      <EmptyState
        compact
        icon={Upload}
        title="No evidence attached"
        message="Ask either party to upload photos or documents to speed up review."
      />
    );
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {evidence.map((e) => (
        <li
          key={e.id}
          className="rounded-lg border border-kampmax-border p-3"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-kampmax-muted">
              {e.kind === "photo" ? (
                <ImageIcon className="h-4 w-4 text-kampmax-text-secondary" aria-hidden />
              ) : (
                <FileText className="h-4 w-4 text-kampmax-text-secondary" aria-hidden />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-xs font-medium text-kampmax-text">
                {e.name}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-kampmax-text-secondary">
                {e.kind.replace("_", " ")} · by {e.uploadedBy} ·{" "}
                {formatDateTime(e.at)}
              </p>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-kampmax-text-secondary">
            {e.note}
          </p>
          <span className="mt-2 inline-flex cursor-not-allowed items-center gap-1 rounded border border-dashed border-kampmax-border px-1.5 py-0.5 text-[10px] text-kampmax-text-secondary" title="File preview is mocked in this prototype">
            <ImageIcon className="h-3 w-3" aria-hidden />
            Mock preview unavailable
          </span>
        </li>
      ))}
    </ul>
  );
}

function PaymentTab({
  detail,
  onRefundPlaceholder,
  refundAllowed,
}: {
  detail: ManagedDisputeDetail;
  onRefundPlaceholder: () => void;
  refundAllowed: boolean;
}) {
  const p = detail.payment;
  return (
    <div className="space-y-3">
      <dl className="space-y-2 rounded-lg border border-kampmax-border px-4 py-3 text-sm">
        <Row label="Order total">
          <span className="font-semibold tabular-nums">{formatNaira(p.amount)}</span>
        </Row>
        <Row label="Payment method" value={methodLabel(p.method)} />
        <Row
          label="Reference"
          value={<span className="font-mono uppercase">{p.reference}</span>}
        />
        <Row label="Paid at" value={p.paidAt ? formatDateTime(p.paidAt) : "Not paid"} />
        <Row
          label="Payment status"
          value={<StatusBadge variant={payVariant(p.status)} label={p.status} />}
        />
      </dl>

      {detail.order && (
        <dl className="space-y-2 rounded-lg border border-kampmax-border px-4 py-3 text-sm">
          <div className="flex items-center gap-2 pb-1 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
            Linked order
          </div>
          <Row
            label="Order"
            value={<span className="font-mono uppercase">{detail.order.id}</span>}
          />
          <Row label="Items" value={`${detail.order.itemsCount} · ${detail.order.itemsSummary}`} />
          <Row label="Placed" value={formatDateTime(detail.order.placedAt)} />
          <Row
            label="Delivery"
            value={`${detail.order.deliveryMethod.replace(/_/g, " ")} · order ${detail.order.orderStatus}`}
          />
        </dl>
      )}

      <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3">
        <p className="text-xs leading-relaxed text-amber-800">
          <strong>Prototype note:</strong> refunds are placeholders only -
          Kampmax admin never moves money here. Recording a refund writes an
          audit entry and closes the case; execution stays with the payments
          service.
        </p>
        {refundAllowed && (
          <button
            type="button"
            onClick={onRefundPlaceholder}
            className="mt-2 inline-flex h-7 items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-100"
          >
            <Banknote className="h-3 w-3" aria-hidden />
            Record refund placeholder
          </button>
        )}
      </div>
    </div>
  );
}

function TimelineTab({ detail }: { detail: ManagedDisputeDetail }) {
  return (
    <ol className="relative space-y-4 border-l border-kampmax-border pl-5">
      {[...detail.timeline].reverse().map((t, i) => (
        <li key={t.id} className="relative">
          <span
            className={cn(
              "absolute -left-[26px] top-0.5 h-3 w-3 rounded-full border-2 border-white",
              i === 0
                ? "bg-kampmax-blue"
                : t.actor === "system"
                  ? "bg-kampmax-gold"
                  : "bg-kampmax-text-secondary/40"
            )}
            aria-hidden
          />
          <p className="text-xs font-semibold text-kampmax-text">{t.label}</p>
          {t.detail && (
            <p className="mt-0.5 text-xs leading-relaxed text-kampmax-text-secondary">
              {t.detail}
            </p>
          )}
          <p className="mt-0.5 text-[11px] capitalize tabular-nums text-kampmax-text-secondary">
            {t.actor} · {formatDateTime(t.at)}
          </p>
        </li>
      ))}
    </ol>
  );
}

function ResolutionTab({ detail }: { detail: ManagedDisputeDetail }) {
  const r = detail.resolution;
  if (!r)
    return (
      <EmptyState
        compact
        icon={CheckCheck}
        title="No resolution yet"
        message="Use Resolve or Reject below once you've reviewed the evidence."
      />
    );
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3.5",
        r.outcome === "resolved"
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-kampmax-border bg-kampmax-muted/30"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {r.outcome === "resolved" ? (
          <BadgeCheck className="h-4 w-4 text-kampmax-success" aria-hidden />
        ) : (
          <XCircle className="h-4 w-4 text-kampmax-error" aria-hidden />
        )}
        <span className="text-sm font-semibold capitalize text-kampmax-text">
          Case {r.outcome}
        </span>
        <span className="ml-auto text-[11px] text-kampmax-text-secondary">
          {r.decidedBy} · {formatDateTime(r.decidedAt)}
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-kampmax-text">
        {r.note}
      </p>
      {r.refundPlaceholder && (
        <div className="mt-3 rounded-lg border border-dashed border-amber-300 bg-white px-3 py-2.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <Banknote className="h-3.5 w-3.5" aria-hidden />
            Refund recorded - PLACEHOLDER
          </p>
          <p className="mt-1 text-xs tabular-nums text-amber-800">
            {formatNaira(r.refundPlaceholder.amount)} via{" "}
            {methodLabel(r.refundPlaceholder.method)} · recorded by{" "}
            {r.refundPlaceholder.recordedBy} · no funds have moved
          </p>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// ACTION BAR
// ------------------------------------------------------------

function ActionBar({
  panel,
  party,
  setParty,
  note,
  setNote,
  error,
  working,
  amount,
  onCancel,
  onSubmit,
}: {
  panel: ActionPanel;
  party: "customer" | "vendor";
  setParty: (p: "customer" | "vendor") => void;
  note: string;
  setNote: (v: string) => void;
  error: string | null;
  working: boolean;
  amount: number;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const config = {
    info: {
      title: "Request information",
      hint: "The message is posted to the case thread and the case waits on the chosen side.",
      cta: "Send request",
      tone: "default" as const,
      Icon: Send,
    },
    resolve: {
      title: "Resolve dispute",
      hint: "Summarise the outcome for the audit trail. The case closes as resolved.",
      cta: "Resolve case",
      tone: "primary" as const,
      Icon: CheckCheck,
    },
    reject: {
      title: "Reject claim",
      hint: "Explain why the evidence doesn't support the claim. This closes the case.",
      cta: "Reject case",
      tone: "danger" as const,
      Icon: XCircle,
    },
    refund: {
      title: `Record refund placeholder - ${amount.toLocaleString("en-NG")}`,
      hint: "PROTOTYPE ONLY: records refund intent + audit entry. No funds move; the payments service executes real refunds.",
      cta: "Record refund (placeholder)",
      tone: "warning" as const,
      Icon: Banknote,
    },
  }[panel];

  const needsNote = panel !== "info";

  return (
    <div className="border-t border-kampmax-border bg-kampmax-muted/20 px-5 py-3.5">
      <p className="text-xs font-semibold text-kampmax-text">
        <config.Icon className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
        {config.title}
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-kampmax-text-secondary">
        {config.hint}
      </p>

      {panel === "info" && (
        <div className="mt-2 flex gap-2">
          {(["customer", "vendor"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setParty(p)}
              className={cn(
                "h-8 rounded-md border px-3 text-xs font-medium capitalize transition-colors",
                party === p
                  ? "border-kampmax-blue bg-kampmax-blue/10 text-kampmax-blue"
                  : "border-kampmax-border bg-white text-kampmax-text-secondary hover:bg-kampmax-muted/60"
              )}
            >
              Ask the {p}
            </button>
          ))}
        </div>
      )}

      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={
          panel === "info"
            ? "e.g. Please upload a photo of the parcel slip…"
            : panel === "refund"
              ? "Optional note for the audit trail…"
              : "Required - visible in the case timeline…"
        }
        className="mt-2 w-full resize-none rounded-lg border border-kampmax-border bg-white px-3 py-2 text-xs focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
      />
      {error && <p className="mt-1 text-xs text-kampmax-error">{error}</p>}

      <div className="mt-2.5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={working}
          className="inline-flex h-8 items-center rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={working || (needsNote && !note.trim())}
          onClick={onSubmit}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-white transition-colors disabled:opacity-50",
            config.tone === "primary" && "bg-kampmax-navy hover:bg-kampmax-navy-light",
            config.tone === "danger" && "bg-kampmax-error hover:bg-red-700",
            config.tone === "warning" && "bg-amber-500 hover:bg-amber-600",
            config.tone === "default" && "bg-kampmax-blue hover:bg-kampmax-blue/90"
          )}
        >
          {working && <Loader2 className="h-3 w-3 animate-spin" />}
          {!working && <config.Icon className="h-3 w-3" />}
          {config.cta}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Small shared bits
// ------------------------------------------------------------

function PartyCard({
  icon: Icon,
  role,
  name,
}: {
  icon: typeof Store;
  role: string;
  name: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-kampmax-border bg-kampmax-muted/30 px-3 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-kampmax-text-secondary">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-kampmax-text-secondary">
          {role}
        </p>
        <p className="truncate text-xs font-medium text-kampmax-text" title={name}>
          {name}
        </p>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "neutral",
  loading,
  title,
}: {
  icon: typeof Store;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "danger" | "warning" | "blue" | "primary";
  loading?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-60",
        tone === "primary" && "bg-kampmax-navy text-white hover:bg-kampmax-navy-light",
        tone === "danger" && "border border-red-200 bg-red-50 text-kampmax-error hover:bg-red-100",
        tone === "warning" && "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        tone === "blue" && "border border-sky-200 bg-sky-50 text-kampmax-info hover:bg-sky-100",
        tone === "neutral" &&
          "border border-kampmax-border bg-white text-kampmax-text hover:bg-kampmax-muted/60"
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Icon className="h-3 w-3" aria-hidden />
      )}
      {label}
    </button>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-kampmax-text-secondary">
        {label}
      </dt>
      <dd className="truncate text-right text-xs font-medium text-kampmax-text">
        {children ?? value}
      </dd>
    </div>
  );
}

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    wallet: "Kampmax Wallet",
    paystack: "Paystack checkout",
    bank_transfer: "Bank transfer",
    cod: "Cash on pickup",
    card: "Card",
  };
  return labels[method] ?? method;
}

function payVariant(status: string) {
  switch (status) {
    case "paid":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "failed":
      return "error" as const;
    default:
      return "info" as const; // refunded
  }
}
