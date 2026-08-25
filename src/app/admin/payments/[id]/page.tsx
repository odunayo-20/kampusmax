"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Hash,
  Loader2,
  Store,
  Undo2,
  User,
  XCircle,
} from "lucide-react";
import { cn, formatDateTime, formatNaira, timeAgo } from "@/lib/utils";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  managedOrderStatusVariant,
  ORDER_STATUS_LABELS,
} from "@/components/admin/orders/orders-meta";
import { MethodBadge, PaymentTxnStatusBadge } from "@/components/admin/payments/PaymentBadges";
import {
  paymentMethodLabel,
  paymentTypeLabel,
} from "@/components/admin/payments/payments-meta";
import { paymentManagementService } from "@/services/admin";
import type { ManagedPaymentDetail, ManagedPaymentTimelineEvent } from "@/types/admin";

const TIMELINE_STYLES: Record<
  ManagedPaymentTimelineEvent["kind"],
  { icon: typeof Hash; className: string }
> = {
  initiated: { icon: Hash, className: "bg-kampmax-blue/10 text-kampmax-blue" },
  processing: { icon: Loader2, className: "bg-kampmax-warning/15 text-amber-600" },
  settled: { icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" },
  failure: { icon: XCircle, className: "bg-kampmax-error/10 text-red-600" },
  refund: { icon: Undo2, className: "bg-sky-100 text-sky-700" },
  partial_refund: { icon: Undo2, className: "bg-sky-100 text-sky-700" },
  reversal: { icon: Ban, className: "bg-kampmax-muted text-kampmax-text-secondary" },
};

export default function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [detail, setDetail] = useState<ManagedPaymentDetail | null>(null);
  const [txnId, setTxnId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const { id } = await params;
      setTxnId(id);
      const result = await paymentManagementService.getById(id);
      setDetail(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSkeleton variant="cards" rows={5} />;
  if (error || !detail)
    return (
      <ErrorState
        onRetry={() => void load()}
        message={
          !error && !detail
            ? `No transaction found for "${txnId}". It may have been removed from the ledger mock.`
            : undefined
        }
      />
    );

  const txn = detail.payment;

  function SumRow({
    label,
    value,
    emphasis = false,
    muted = false,
    hint,
  }: {
    label: string;
    value: React.ReactNode;
    emphasis?: boolean;
    muted?: boolean;
    hint?: string;
  }) {
    return (
      <div className="flex items-center justify-between gap-4 py-1.5">
        <span
          className={cn(
            "text-sm",
            muted ? "text-kampmax-text-secondary" : "text-kampmax-text",
            emphasis && "font-medium"
          )}
        >
          {label}
          {hint && <span className="ml-1 text-xs text-kampmax-text-secondary">{hint}</span>}
        </span>
        <span
          className={cn(
            "shrink-0 tabular-nums",
            emphasis ? "text-base font-semibold text-kampmax-text" : "text-sm text-kampmax-text"
          )}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <Link
        href="/admin/payments"
        className="mb-3 inline-flex items-center gap-1 text-sm text-kampmax-text-secondary transition-colors hover:text-kampmax-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to payments
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-bold tracking-tight text-kampmax-text sm:text-2xl">
            {txn.id}
          </h1>
          <PaymentTxnStatusBadge status={txn.status} />
          <MethodBadge method={txn.method} />
        </div>
        <span className="inline-flex items-center gap-1 text-xs capitalize text-kampmax-text-secondary">
          {paymentTypeLabel(txn.type)}
          <ChevronRight className="h-3 w-3 opacity-50" />
        </span>
      </div>

      {(txn.status === "failed" || txn.status === "reversed") && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-kampmax-error/30 bg-kampmax-error/10 px-4 py-3 text-sm text-red-700"
        >
          {txn.status === "reversed"
            ? "This transaction was reversed - funds were returned to the source instrument. The linked order may need manual review."
            : "This charge never captured - no funds moved. If the customer still expects delivery, ask them to retry payment."}
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="space-y-4">
          {/* Amount breakdown */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-kampmax-text">Amount breakdown</h2>
            <SumRow label="Transaction amount" value={formatNaira(txn.amount)} />
            <SumRow
              label="Platform fee"
              value={`− ${formatNaira(txn.platformFee)}`}
              hint="(service charge)"
              muted
            />
            <SumRow label="Vendor amount" value={formatNaira(txn.vendorAmount)} emphasis />
            {txn.refundedAmount > 0 && (
              <>
                <div className="my-2 border-t border-dashed border-kampmax-border" />
                <SumRow
                  label={txn.status === "partially_refunded" ? "Refunded (partial)" : "Refunded"}
                  value={`− ${formatNaira(txn.refundedAmount)}`}
                  muted
                />
              </>
            )}
            <div className="my-2 border-t border-dashed border-kampmax-border" />
            <SumRow label="Payment reference" value={<span className="font-mono text-sm">{txn.reference}</span>} />
          </section>

          {/* Timeline */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
              <CalendarClock className="h-4 w-4 opacity-60" />
              Timeline
            </h2>
            <ol className="relative ml-3 space-y-0 border-l border-kampmax-border pl-6">
              {detail.timeline.map((event) => {
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
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Transaction info */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-kampmax-text">Transaction</h2>
            <dl className="space-y-2.5 text-sm">
              <InfoRow label="Type" value={paymentTypeLabel(txn.type)} />
              <InfoRow label="Method" value={paymentMethodLabel(txn.method)} />
              <InfoRow
                label="Internal ref."
                value={txn.reference}
                mono
              />
              <InfoRow label="Gateway ref." value={txn.gatewayRef} mono />
              <InfoRow label="Initiated" value={formatDateTime(txn.createdAt)} />
              <InfoRow label="Last update" value={formatDateTime(txn.updatedAt)} />
            </dl>
          </section>

          {/* Order */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-kampmax-text">Order</h2>
            {detail.order ? (
              <div className="space-y-2">
                <Link
                  href={`/admin/orders/${detail.order.id}`}
                  className="font-mono text-sm font-medium text-kampmax-blue hover:underline"
                >
                  {detail.order.id}
                  <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" />
                </Link>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <StatusBadge
                    variant={managedOrderStatusVariant(detail.order.status)}
                    label={ORDER_STATUS_LABELS[detail.order.status]}
                  />
                  <span className="font-medium tabular-nums text-kampmax-text">
                    {formatNaira(detail.order.total)}
                  </span>
                </div>
                <p className="text-xs text-kampmax-text-secondary">
                  Placed {timeAgo(detail.order.createdAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-kampmax-text-secondary">
                Not tied to an order ({paymentTypeLabel(txn.type)}).
              </p>
            )}
          </section>

          {/* Customer */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-kampmax-text">Customer</h2>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-kampmax-text-secondary" />
                <span className="truncate text-sm font-medium text-kampmax-text">
                  {txn.customerName}
                </span>
              </span>
              <Link
                href={`/admin/users?q=${txn.customerId}`}
                className="shrink-0 text-xs font-medium text-kampmax-blue hover:underline"
              >
                View user
              </Link>
            </div>
          </section>

          {/* Vendor */}
          <section className="rounded-lg border border-kampmax-border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-kampmax-text">Vendor</h2>
            {txn.vendorName ? (
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Store className="h-4 w-4 shrink-0 text-kampmax-text-secondary" />
                  <span className="truncate text-sm font-medium text-kampmax-text">
                    {txn.vendorName}
                  </span>
                </span>
                <a
                  href={`/admin/vendors?q=${encodeURIComponent(txn.vendorName)}`}
                  className="shrink-0 text-xs font-medium text-kampmax-blue hover:underline"
                >
                  Find store
                </a>
              </div>
            ) : (
              <p className="text-sm text-kampmax-text-secondary">
                No vendor involved in this flow.
              </p>
            )}
          </section>
        </div>
      </div>
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
