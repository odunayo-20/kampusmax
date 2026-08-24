"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  ChevronRight,
  CircleDashed,
  Clock,
  Hash,
  History,
  Landmark,
  ReceiptText,
  ShieldX,
  Store,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";
import { cn, formatDateTime, formatNaira, formatNairaCompact, timeAgo } from "@/lib/utils";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  RejectWithdrawalDialog,
} from "@/components/admin/wallet/RejectWithdrawalDialog";
import {
  WithdrawalStatusBadge,
} from "@/components/admin/wallet/FinanceBadges";
import { financeManagementService } from "@/services/admin";
import type {
  ManagedFinanceTxn,
  ManagedWithdrawalDetail,
  ManagedWithdrawalTimelineEvent,
  WithdrawalAction,
  WithdrawalRequest,
} from "@/types/admin";

const TIMELINE_STYLES: Record<
  ManagedWithdrawalTimelineEvent["kind"],
  { icon: typeof Hash; className: string }
> = {
  requested: { icon: Hash, className: "bg-kampmax-blue/10 text-kampmax-blue" },
  review: { icon: Clock, className: "bg-kampmax-warning/15 text-amber-600" },
  decision: { icon: BadgeCheck, className: "bg-sky-100 text-sky-700" },
  completed: { icon: ArrowDownToLine, className: "bg-emerald-100 text-emerald-700" },
  rejected: { icon: ShieldX, className: "bg-red-100 text-red-600" },
  failed: { icon: XCircle, className: "bg-kampmax-error/10 text-red-600" },
};

type QuickAction = Extract<
  WithdrawalAction,
  "start_processing" | "approve" | "mark_completed"
>;

function actionsFor(w: WithdrawalRequest): WithdrawalAction[] {
  switch (w.status) {
    case "pending":
      return ["start_processing", "approve", "reject"];
    case "processing":
      return ["approve", "mark_completed", "mark_failed", "reject"];
    case "approved":
      return ["mark_completed", "mark_failed"];
    default:
      return [];
  }
}

const ACTION_BUTTONS = {
  start_processing: { label: "Mark processing", icon: CircleDashed },
  approve: { label: "Approve", icon: BadgeCheck },
  mark_completed: { label: "Mark completed", icon: ArrowDownToLine },
} as const;

export default function AdminWithdrawalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [detail, setDetail] = useState<ManagedWithdrawalDetail | null>(null);
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [acting, setActing] = useState(false);
  const [reasonTarget, setReasonTarget] = useState<"reject" | "fail" | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<QuickAction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { id } = await params;
      setRequestId(id);
      const result = await financeManagementService.getWithdrawalDetail(id);
      setDetail(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAct = async (action: WithdrawalAction, note?: string) => {
    if (!detail) return;
    setActing(true);
    try {
      await financeManagementService.actOnWithdrawal(detail.request.id, action, note);
      await load();
    } catch {
      setError(true);
    } finally {
      setActing(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="cards" rows={5} />;
  if (error || !detail)
    return (
      <ErrorState
        onRetry={() => void load()}
        message={
          !error && !detail
            ? `No withdrawal request found for "${requestId}".`
            : undefined
        }
      />
    );

  const { request, vendorBalance, timeline, history, previous } = detail;
  const actions = actionsFor(request);
  const total = request.amount + request.fee;

  return (
    <>
      <Link
        href="/admin/withdrawals"
        className="mb-3 inline-flex items-center gap-1 text-sm text-kampmax-text-secondary transition-colors hover:text-kampmax-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to withdrawals
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-bold tracking-tight text-kampmax-text sm:text-2xl">
            {request.id}
          </h1>
          <WithdrawalStatusBadge status={request.status} />
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action) =>
              action === "reject" || action === "mark_failed" ? (
                <button
                  key={action}
                  type="button"
                  disabled={acting}
                  onClick={() => setReasonTarget(action === "reject" ? "reject" : "fail")}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                >
                  <ShieldX className="h-3.5 w-3.5" />
                  {action === "reject" ? "Reject…" : "Mark failed…"}
                </button>
              ) : (
                <button
                  key={action}
                  type="button"
                  disabled={acting}
                  onClick={() => setConfirmTarget(action as QuickAction)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-kampmax-navy px-3 text-xs font-medium text-white transition-colors hover:bg-kampmax-navy-light disabled:opacity-40"
                >
                  {(() => {
                    const Icon = ACTION_BUTTONS[action as QuickAction].icon;
                    return <Icon className="h-3.5 w-3.5 opacity-80" />;
                  })()}
                  {ACTION_BUTTONS[action as QuickAction].label}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {(request.status === "rejected" || request.status === "failed") && request.note && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-kampmax-error/30 bg-kampmax-error/10 px-4 py-3 text-sm text-red-700"
        >
          {request.status === "failed" ? "Transfer failed: " : "Rejected: "}
          {request.note}. The payout remains in vendor payable until it is retried or resolved.
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="space-y-4">
          {/* Request timeline */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
              <CalendarClock className="h-4 w-4 opacity-60" />
              Request timeline
            </h2>
            <ol className="relative ml-3 space-y-0 border-l border-kampmax-border pl-6">
              {timeline.map((event) => {
                const style = TIMELINE_STYLES[event.kind];
                const Icon = style.icon;
                return (
                  <li key={event.id} className="relative pb-5 last:pb-0">
                    <span
                      className={cn(
                        "absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full",
                        style.className
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <p className="text-sm font-medium text-kampmax-text">{event.label}</p>
                    {event.detail && (
                      <p className="text-xs text-kampmax-text-secondary">{event.detail}</p>
                    )}
                    <time
                      dateTime={event.at}
                      title={formatDateTime(event.at)}
                      className="mt-0.5 block font-mono text-[11px] text-kampmax-text-secondary"
                    >
                      {formatDateTime(event.at)} · {timeAgo(event.at)}
                    </time>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Vendor transaction history */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
              <History className="h-4 w-4 opacity-60" />
              Vendor wallet history
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-kampmax-text-secondary">
                No wallet activity recorded for this store yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="border-b border-kampmax-border text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                    <tr>
                      <th scope="col" className="py-2 pr-4 font-medium">Type</th>
                      <th scope="col" className="px-4 py-2 text-right font-medium">Amount</th>
                      <th scope="col" className="hidden px-4 py-2 font-medium sm:table-cell">Reference</th>
                      <th scope="col" className="py-2 pl-4 text-right font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kampmax-border/70">
                    {history.map((t: ManagedFinanceTxn) => (
                      <tr key={t.id}>
                        <td className="whitespace-nowrap py-2 pr-4 capitalize text-kampmax-text">
                          {t.type.replace(/_/g, " ")}
                        </td>
                        <td
                          className={cn(
                            "whitespace-nowrap px-4 py-2 text-right font-medium tabular-nums",
                            t.direction === "credit"
                              ? "text-kampmax-success"
                              : "text-kampmax-error"
                          )}
                        >
                          {t.direction === "credit" ? "+" : "−"}
                          {formatNaira(t.amount)}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-2 font-mono text-[11px] text-kampmax-text-secondary sm:table-cell">
                          {t.reference}
                        </td>
                        <td
                          className="whitespace-nowrap py-2 pl-4 text-right tabular-nums text-kampmax-text-secondary"
                          title={t.createdAt}
                        >
                          {timeAgo(t.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Amount */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
              <ReceiptText className="h-4 w-4 opacity-60" />
              Requested amount
            </h2>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-kampmax-text">
              {formatNaira(request.amount)}
            </p>
            <p className="mt-1 text-xs tabular-nums text-kampmax-text-secondary">
              Transfer fee {formatNaira(request.fee)} · total debit{" "}
              {formatNaira(total)}
            </p>
            <dl className="mt-3 space-y-2 border-t border-dashed border-kampmax-border pt-3 text-sm">
              <InfoRow label="Requested" value={formatDateTime(request.requestedAt)} />
              <InfoRow
                label="Processed"
                value={request.processedAt ? formatDateTime(request.processedAt) : "—"}
              />
            </dl>
          </section>

          {/* Vendor */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
              <Store className="h-4 w-4 opacity-60" />
              Vendor
            </h2>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-kampmax-text">
                {request.vendorName}
              </span>
              <Link
                href={`/admin/vendors/${request.vendorId}`}
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-kampmax-blue hover:underline"
              >
                <UserRound className="h-3 w-3" />
                View vendor
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md bg-kampmax-muted/60 px-3 py-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary">
                <Wallet className="h-3.5 w-3.5" />
                Available balance
              </span>
              <span className="text-sm font-semibold tabular-nums text-kampmax-text">
                {vendorBalance != null ? formatNaira(vendorBalance) : "No wallet"}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-kampmax-text-secondary">
              This withdrawal is {vendorBalance != null && vendorBalance < total ? "larger than" : "covered by"}{" "}
              the vendor's current wallet balance.
            </p>
          </section>

          {/* Bank details */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
              <Landmark className="h-4 w-4 opacity-60" />
              Bank details
            </h2>
            <dl className="space-y-2.5 text-sm">
              <InfoRow label="Bank" value={request.bankName} />
              <InfoRow label="Account name" value={request.accountName} />
              <InfoRow label="Account no." value={request.accountNumberMasked} mono />
            </dl>
          </section>

          {/* Previous withdrawals */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
              <History className="h-4 w-4 opacity-60" />
              Previous withdrawals
            </h2>
            {previous.length === 0 ? (
              <p className="text-sm text-kampmax-text-secondary">First payout request.</p>
            ) : (
              <ul className="space-y-1.5">
                {previous.map((w) => (
                  <li key={w.id}>
                    <Link
                      href={`/admin/withdrawals/${w.id}`}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-kampmax-muted/50"
                    >
                      <span className="font-mono text-xs text-kampmax-blue">{w.id}</span>
                      <span className="text-xs font-medium tabular-nums text-kampmax-text">
                        {formatNairaCompact(w.amount)}
                      </span>
                      <WithdrawalStatusBadge status={w.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Mutations */}
      <RejectWithdrawalDialog
        open={reasonTarget != null}
        withdrawal={request}
        mode={reasonTarget ?? "reject"}
        working={acting}
        onClose={() => setReasonTarget(null)}
        onConfirm={async (w, note) => {
          await runAct(reasonTarget === "fail" ? "mark_failed" : "reject", note);
          setReasonTarget(null);
        }}
      />

      <ConfirmDialog
        open={confirmTarget != null}
        title={
          confirmTarget === "mark_completed"
            ? "Mark as completed?"
            : confirmTarget === "approve"
              ? "Approve withdrawal?"
              : "Mark as processing?"
        }
        message={
          confirmTarget == null
            ? ""
            : confirmTarget === "mark_completed"
              ? `Confirm the bank transfer of ${formatNairaCompact(total)} to ${request.vendorName} (${request.bankName} ${request.accountNumberMasked}) is complete.`
              : `${request.vendorName} · ${formatNairaCompact(total)} to ${request.bankName}. This moves vendor payable forward - funds stay reconciled in the wallet console.`
        }
        tone={confirmTarget === "start_processing" ? "default" : "warning"}
        loading={acting}
        confirmLabel={
          confirmTarget === "mark_completed"
            ? "Yes, mark completed"
            : confirmTarget === "approve"
              ? "Approve"
              : "Mark processing"
        }
        onConfirm={async () => {
          if (!confirmTarget) return;
          await runAct(confirmTarget);
          setConfirmTarget(null);
        }}
        onCancel={() => setConfirmTarget(null)}
      />
    </>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-kampmax-text-secondary">
        {label}
      </dt>
      <dd
        className={cn(
          "break-all text-right text-sm text-kampmax-text",
          mono && "font-mono text-[13px]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
