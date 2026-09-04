"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { formatNaira, formatDateTime, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FlFinancialTransaction } from "@/types/freelancer-financials";
import { FL_FIN_SIGN } from "@/types/freelancer-financials";
import { FL_TX_TYPE_META } from "@/config/freelancer-financials";
import { FlTransactionStatusBadge } from "./FlStatusBadges";

// Transaction detail (spec §16, §17). References are treated as sensitive:
// shown in full (backend-authorized user-facing reference) with copy-to-clipboard
// and a confirmation. Internal ids/credentials are never exposed.

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => undefined);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-2.5 py-1.5 text-xs font-medium text-kampmax-text hover:bg-kampmax-muted"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-kampmax-success" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function FlTransactionDetail({ transaction }: { transaction: FlFinancialTransaction }) {
  const isCredit = transaction.sign === FL_FIN_SIGN.CREDIT;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-kampmax-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-kampmax-text-secondary">{FL_TX_TYPE_META[transaction.type].label}</p>
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-1 text-3xl font-bold",
                isCredit ? "text-kampmax-success" : "text-kampmax-text"
              )}
            >
              {isCredit ? <ArrowDownLeft className="h-6 w-6" aria-hidden /> : <ArrowUpRight className="h-6 w-6" aria-hidden />}
              {isCredit ? "+" : "−"}
              {formatNaira(transaction.amount)}
            </p>
            {typeof transaction.fee === "number" && transaction.fee > 0 && (
              <p className="mt-1 text-sm text-kampmax-text-secondary">
                Includes a platform fee of {formatNaira(transaction.fee)}
              </p>
            )}
          </div>
          <FlTransactionStatusBadge status={transaction.status} />
        </div>
        <p className="mt-4 text-sm text-kampmax-text-secondary">{transaction.description}</p>
      </div>

      <div className="rounded-xl border border-kampmax-border bg-white p-5">
        <h2 className="text-sm font-bold text-kampmax-text">Details</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <Row label="Date">
            <span className="text-kampmax-text">{formatDateTime(transaction.at)}</span>
          </Row>
          <Row label="Reference">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-kampmax-text">{transaction.reference}</span>
              <CopyButton value={transaction.reference} label="Copy" />
            </span>
          </Row>
          <Row label="Type">
            <span className="text-kampmax-text">{FL_TX_TYPE_META[transaction.type].label}</span>
          </Row>
          <Row label="Direction">
            <span className="text-kampmax-text">
              {isCredit ? "Credit (money in)" : "Debit (money out)"}
            </span>
          </Row>
          {transaction.payoutId && (
            <Row label="Withdrawal">
              <Link href={`/freelancer/payouts/${transaction.payoutId}`} className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline">
                View withdrawal <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Row>
          )}
        </dl>
      </div>

      {transaction.contractId && (
        <div className="rounded-xl border border-kampmax-border bg-white p-5">
          <h2 className="text-sm font-bold text-kampmax-text">Related Project</h2>
          <p className="mt-1 text-sm text-kampmax-text-secondary">{transaction.contractTitle}</p>
          <Link
            href={`/freelancer/contracts/${transaction.contractId}`}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline"
          >
            View Contract <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      )}

      {transaction.events.length > 0 && (
        <div className="rounded-xl border border-kampmax-border bg-white p-5">
          <h2 className="text-sm font-bold text-kampmax-text">Timeline</h2>
          <ol className="mt-4 space-y-4 border-l border-kampmax-border pl-4">
            {transaction.events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-600" aria-hidden />
                <p className="text-sm font-medium text-kampmax-text">{e.title}</p>
                <p className="text-xs text-kampmax-text-muted">{formatDate(e.at)}</p>
                {e.detail && <p className="mt-0.5 text-sm text-kampmax-text-secondary">{e.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-kampmax-text-secondary">{label}</dt>
      <dd className="sm:text-right">{children}</dd>
    </div>
  );
}
