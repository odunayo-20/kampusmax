"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  History,
  Info,
  Receipt,
  ShieldAlert,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminErrorMessage } from "@/lib/admin/error-reporting";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import {
  TransactionMethodBadge,
  TransactionStatusBadge,
  TransactionTypeBadge,
} from "@/components/admin/transactions/TransactionBadges";
import { formatTransactionDate } from "@/components/admin/transactions/transactions-meta";
import { useAdminTransaction } from "@/hooks/admin/use-admin-transactions";
import { formatNaira } from "@/lib/utils";
import type { ManagedTransactionDetail } from "@/types/admin";

type TabKey = "overview" | "activity";

const TABS: { key: TabKey; label: string; icon: typeof Info }[] = [
  { key: "overview", label: "Overview", icon: Info },
  { key: "activity", label: "Activity", icon: History },
];

export default function TransactionDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <TransactionDetailPageInner />
    </Suspense>
  );
}

function TransactionDetailPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: detail, isLoading, error } = useAdminTransaction(id);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  if (isLoading) return <DetailSkeleton />;

  if (error || !detail) {
    return (
      <>
        <AdminPageHeader
          title="Transaction"
          description="Transaction not found on the real ledger."
          actions={
            <button
              onClick={() => router.push("/admin/transactions")}
              className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border px-3 py-1.5 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to list
            </button>
          }
        />
        <div className="mt-6 rounded-lg border border-kampmax-border bg-kampmax-surface p-12 text-center text-sm text-kampmax-text-muted">
          {error ? adminErrorMessage(error) : "This transaction could not be found."}
        </div>
      </>
    );
  }

  const { transaction: row, order, activity, gateway, actions } = detail;

  return (
    <>
      <AdminPageHeader
        title={row.id}
        description={`${row.customerName} · ${row.type} · ${row.direction}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TransactionTypeBadge type={row.type} />
            <TransactionStatusBadge status={row.status} />
            <TransactionMethodBadge method={row.method} />
            <button
              onClick={() => router.push("/admin/transactions")}
              className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-kampmax-border px-3 py-1.5 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>
        }
      />

      {/* Source-status honesty note */}
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 px-4 py-2.5 text-xs text-kampmax-text-secondary">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kampmax-text-muted" />
        <span>
          <strong className="font-medium">Source status:</strong> {row.statusNote}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-kampmax-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "border-kampmax-primary text-kampmax-primary"
                : "border-transparent text-kampmax-text-muted hover:text-kampmax-text"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Status grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card label="Status" hint={row.sourceStatus}>
              <TransactionStatusBadge status={row.status} />
            </Card>
            <Card label="Type">
              <TransactionTypeBadge type={row.type} />
            </Card>
            <Card label="Method">
              <TransactionMethodBadge method={row.method} />
            </Card>
            <Card label="Direction" hint={row.direction === "debit" ? "Money out" : "Money in"}>
              <span
                className={`text-sm font-semibold uppercase ${
                  row.direction === "debit" ? "text-kampmax-text" : "text-kampmax-success"
                }`}
              >
                {row.direction}
              </span>
            </Card>
          </div>

          {/* Amount card */}
          <div className="rounded-lg border border-kampmax-border bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
              Amount
            </h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold tabular-nums text-kampmax-text ${
                row.direction === "debit" ? "" : "text-kampmax-success"
              }`}>
                {row.direction === "debit" ? "−" : "+"}
                {formatNaira(row.amount)}
              </span>
              {row.platformFee > 0 && (
                <span className="text-xs text-kampmax-text-muted">
                  incl. platform fee {formatNaira(row.platformFee)}
                </span>
              )}
            </div>
            {row.reference ? (
              <p className="mt-2 text-xs text-kampmax-text-muted">
                Internal reference: <code className="font-mono">{row.reference}</code>
              </p>
            ) : (
              <p className="mt-2 text-xs text-kampmax-text-muted">
                Internal reference: <strong>not recorded</strong> by the owning store — the real
                orders store carries no payment reference for this record.
              </p>
            )}
          </div>

          {/* Parties */}
          <div className="rounded-lg border border-kampmax-border bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
              Parties
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-kampmax-text-muted">Customer</span>
                <div className="text-right">
                  <p className="font-medium text-kampmax-text">{row.customerName}</p>
                  <p className="font-mono text-xs text-kampmax-text-muted">{row.customerId}</p>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-kampmax-text-muted">Vendor</span>
                {row.vendorId ? (
                  <div className="text-right">
                    <a
                      href={`/admin/vendors/${row.vendorId}`}
                      className="font-medium text-kampmax-primary hover:underline"
                    >
                      {row.vendorName ?? row.vendorId}
                    </a>
                    <p className="font-mono text-xs text-kampmax-text-muted">{row.vendorId}</p>
                  </div>
                ) : (
                  <span className="text-xs text-kampmax-text-muted/60">
                    {row.type === "refund" ? "Wallet credit — no vendor" : "—"}
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-kampmax-text-muted">Order</span>
                {row.orderId ? (
                  <span className="font-mono text-xs font-semibold text-kampmax-text">{row.orderId}</span>
                ) : (
                  <span className="text-xs text-kampmax-text-muted/60">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Order summary (order payments / refunded orders) */}
          {order && (
            <OrderSummaryCard order={order} />
          )}
          {row.type === "refund" && row.orderId && !order && (
            <div className="rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
                Source order
              </h3>
              <p className="text-xs text-kampmax-text-muted">
                This refund record references order <code className="font-mono">{row.orderId}</code>,
                which is not present in the real orders store. The wallet refund record is shown at
                face value; no order-level detail can be derived for it.
              </p>
            </div>
          )}

          {/* Channel detail */}
          {row.channelLabel && (
            <div className="rounded-lg border border-kampmax-border bg-white p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
                Channel detail
              </h3>
              <p className="text-sm text-kampmax-text-secondary">{row.channelLabel}</p>
            </div>
          )}

          {/* Gateway status */}
          <GatewayCard gateway={gateway} />

          {/* Actions */}
          <div className="rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 p-5">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
              <ShieldAlert className="h-3.5 w-3.5" /> Actions
            </h3>
            <p className="text-sm text-kampmax-text-secondary">{actions.note}</p>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="rounded-lg border border-kampmax-border bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
            <History className="mr-1.5 inline h-3.5 w-3.5" />
            Activity timeline
          </h3>
          <p className="mb-4 text-xs text-kampmax-text-secondary">
            Real events from the owning store. Order payments show the order timeline; wallet
            records show the real created/completed timestamps.
          </p>
          {activity.length ? (
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-kampmax-primary" />
                  <div>
                    <p className="text-sm font-medium text-kampmax-text">{a.title}</p>
                    <p className="text-xs text-kampmax-text-muted">
                      {a.meta} · {formatTransactionDate(a.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-kampmax-text-muted">
              No activity is recorded for this record by the owning store.
            </p>
          )}
        </div>
      )}
    </>
  );
}

function OrderSummaryCard({ order }: { order: ManagedTransactionDetail["order"] }) {
  if (!order) return null;
  return (
    <div className="rounded-lg border border-kampmax-border bg-white p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
        Order summary
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-4">
        <div>
          <p className="text-xs text-kampmax-text-muted">Order</p>
          <p className="font-mono text-xs font-semibold text-kampmax-text">{order.id}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Status</p>
          <p className="text-xs font-medium text-kampmax-text">{order.status}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Items</p>
          <p className="text-xs font-medium tabular-nums text-kampmax-text">{order.itemCount}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Payment method</p>
          <p className="text-xs font-medium text-kampmax-text">{order.paymentMethod}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Subtotal</p>
          <p className="text-xs font-medium tabular-nums text-kampmax-text">{formatNaira(order.subtotal)}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Platform fee</p>
          <p className="text-xs font-medium tabular-nums text-kampmax-text">{formatNaira(order.platformFee)}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Delivery fee</p>
          <p className="text-xs font-medium tabular-nums text-kampmax-text">{formatNaira(order.deliveryFee)}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Discount</p>
          <p className="text-xs font-medium tabular-nums text-kampmax-text">{formatNaira(order.discountAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Total</p>
          <p className="text-xs font-bold tabular-nums text-kampmax-text">{formatNaira(order.total)}</p>
        </div>
        <div>
          <p className="text-xs text-kampmax-text-muted">Placed</p>
          <p className="text-xs font-medium text-kampmax-text">{formatTransactionDate(order.createdAt)}</p>
        </div>
      </div>
      {order.cancelledAt && (
        <div className="mt-4 rounded-md border border-kampmax-error/20 bg-kampmax-error/5 px-3 py-2 text-xs text-kampmax-text-secondary">
          <strong className="font-medium text-kampmax-error">Cancelled {formatTransactionDate(order.cancelledAt)}</strong>
          {order.cancelReason ? ` — ${order.cancelReason}` : ""}. The order payment status is{" "}
          <strong className="font-medium">refunded</strong>; the refund itself is recorded at order
          level (no separate provider refund record exists in the prototype store).
        </div>
      )}
    </div>
  );
}

function GatewayCard({
  gateway,
}: {
  gateway: ManagedTransactionDetail["gateway"];
}) {
  return (
    <div className="rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 p-5">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
        <Receipt className="h-3.5 w-3.5" /> Payment provider (gateway)
      </h3>
      <p className="text-sm text-kampmax-text-secondary">{gateway.note}</p>
      <div className="mt-3 space-y-2 text-xs text-kampmax-text-muted">
        <p>
          Gateway reference: <strong className="font-mono text-kampmax-text-muted">none on record</strong>
        </p>
        <p>
          Provider verification events: <strong className="font-mono text-kampmax-text-muted">not tracked</strong>
        </p>
      </div>
    </div>
  );
}

function Card({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-kampmax-border bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-kampmax-text-muted">{label}</p>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-0.5 text-[10px] text-kampmax-text-muted">{hint}</p>}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <div className="mb-6 h-10 w-64 animate-pulse rounded bg-kampmax-surface-hover" />
      <div className="mb-4 h-6 w-full animate-pulse rounded bg-kampmax-surface-hover" />
      <LoadingSkeleton rows={6} />
    </>
  );
}