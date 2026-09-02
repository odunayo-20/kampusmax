"use client";

import { ChevronLeft, Copy, ExternalLink, Clock, Tag, CreditCard, Building, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { spTxTypeLabel, spTxStatusLabel, spTxStatusVariant, spSignIcon, SP_SIGN_LABELS } from "./sp-financials-meta";
import type { SpFinancialTransaction, SpFinSign } from "@/types/service-provider-financials";

interface SpTransactionDetailProps {
  transaction: SpFinancialTransaction;
}

export function SpTransactionDetail({ transaction }: SpTransactionDetailProps) {
  const router = useRouter();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-kampmax-text-secondary hover:bg-neutral-100"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm text-kampmax-text-secondary">{spTxTypeLabel(transaction.type)}</p>
          <h1 className="text-xl font-bold text-kampmax-text">{transaction.description}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant={spTxStatusVariant(transaction.status)} label={spTxStatusLabel(transaction.status)} />
          {transaction.payoutId && (
            <StatusBadge variant="info" label="Payout" dot={false} />
          )}
        </div>
      </div>

      <div className="rounded-lg border border-kampmax-border bg-neutral-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-kampmax-text-secondary" />
          <div>
            <p className="font-medium text-kampmax-text">Transactions are final</p>
            <p className="mt-1 text-sm text-kampmax-text-secondary">
              This ledger entry is immutable and cannot be edited, deleted, or reversed from
              this dashboard. For disputes, contact support.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Amount"
          value={`${transaction.sign === "credit" ? "+" : "−"}${formatNaira(transaction.amount)}`}
          icon={transaction.sign === "credit" ? <ArrowUp className="h-5 w-5 text-kampmax-success" /> : <ArrowDown className="h-5 w-5 text-kampmax-error" />}
          tone={transaction.sign === "credit" ? "positive" : "negative"}
        />
        {transaction.fee && transaction.fee > 0 && (
          <SummaryCard
            label="Fee"
            value={formatNaira(transaction.fee)}
            icon={<Tag className="h-5 w-5 text-kampmax-warning" />}
            tone="neutral"
          />
        )}
        <SummaryCard
          label="Date"
          value={formatDateTime(transaction.at)}
          icon={<Clock className="h-5 w-5 text-kampmax-text-secondary" />}
          tone="neutral"
        />
        <SummaryCard
          label="Reference"
          value={transaction.reference}
          icon={<Tag className="h-5 w-5 text-kampmax-text-secondary" />}
          tone="neutral"
          copyable
          onCopy={() => copyToClipboard(transaction.reference)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-kampmax-border bg-white p-4" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-lg font-semibold text-kampmax-text">Details</h2>
          <dl className="mt-4 space-y-4">
            <DetailRow label="Transaction ID" value={transaction.id} copyable onCopy={() => copyToClipboard(transaction.id)} />
            <DetailRow label="Type" value={spTxTypeLabel(transaction.type)} />
            <DetailRow label="Status" value={<StatusBadge variant={spTxStatusVariant(transaction.status)} label={spTxStatusLabel(transaction.status)} />} />
            <DetailRow label="Direction" value={<span className="inline-flex items-center gap-1">{spSignIcon(transaction.sign) === "arrow-up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}{SP_SIGN_LABELS[transaction.sign]}</span>} />
            <DetailRow label="Amount" value={`${transaction.sign === "credit" ? "+" : "−"}${formatNaira(transaction.amount)}`} />
            {transaction.fee && transaction.fee > 0 && (
              <DetailRow label="Fee" value={formatNaira(transaction.fee)} />
            )}
            {transaction.bankRef && (
              <DetailRow label="Bank" value={<span className="inline-flex items-center gap-1"><Building className="h-4 w-4" />{transaction.bankRef}</span>} />
            )}
            {transaction.payoutId && (
              <DetailRow label="Payout ID" value={<span className="font-mono">{transaction.payoutId}</span>} copyable onCopy={() => copyToClipboard(transaction.payoutId!)} />
            )}
          </dl>
        </section>

        <section className="rounded-xl border border-kampmax-border bg-white p-4" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="text-lg font-semibold text-kampmax-text">Timeline</h2>
          {transaction.orderId && (
            <div className="mt-4">
              <p className="text-sm text-kampmax-text-secondary">Linked to booking</p>
              <Link
                href={`/service-provider/bookings/${transaction.orderId}`}
                className="mt-1 inline-flex items-center gap-1 text-sm font-mono text-primary-600 hover:underline"
              >
                {transaction.orderId}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
          <ul className="mt-4 space-y-4" role="list">
            {transaction.events.map((evt) => (
              <li key={evt.id} className="relative border-l border-kampmax-border pl-6">
                <div className="absolute left-[-5px] top-0.5 h-2 w-2 rounded-full bg-primary-600" />
                <time className="text-xs text-kampmax-text-secondary">{formatDateTime(evt.at)}</time>
                <p className="mt-0.5 font-medium text-kampmax-text">{evt.title}</p>
                {evt.detail && <p className="text-sm text-kampmax-text-secondary">{evt.detail}</p>}
              </li>
            ))}
            {transaction.events.length === 0 && (
              <li className="py-4 text-center text-sm text-kampmax-text-secondary">
                No timeline events recorded
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
  tone: "neutral" | "positive" | "negative";
  copyable?: boolean;
  onCopy?: () => void;
}

function SummaryCard({ label, value, icon, tone, copyable, onCopy }: SummaryCardProps) {
  const TONE_BG: Record<string, string> = {
    neutral: "bg-white",
    positive: "bg-success-50",
    negative: "bg-error-50",
  };
  const TONE_BORDER: Record<string, string> = {
    neutral: "border-kampmax-border",
    positive: "border-kampmax-success/20",
    negative: "border-kampmax-error/20",
  };

  return (
    <article className={cn("rounded-xl border p-4", TONE_BG[tone], TONE_BORDER[tone])}>
      <div className="flex items-center gap-2">
        <span className="text-kampmax-text-secondary">{icon}</span>
        <p className="text-sm font-medium text-kampmax-text-secondary">{label}</p>
        {copyable && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded text-kampmax-text-secondary hover:text-kampmax-text"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-1 font-semibold text-kampmax-text">{value}</p>
    </article>
  );
}

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
}

function DetailRow({ label, value, copyable, onCopy }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-kampmax-text-secondary">{label}</dt>
      <dd className="flex items-center gap-2 font-mono text-sm text-kampmax-text">
        {value}
        {copyable && onCopy && (
          <button type="button" onClick={onCopy} className="ml-2 text-kampmax-text-secondary hover:text-kampmax-text" aria-label={`Copy ${label}`}>
            <Copy className="h-4 w-4" />
          </button>
        )}
      </dd>
    </div>
  );
}