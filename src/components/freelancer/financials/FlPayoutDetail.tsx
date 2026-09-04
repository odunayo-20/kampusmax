"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatNaira, formatDateTime } from "@/lib/utils";
import type { FlPayout } from "@/types/freelancer-financials";
import { FlPayoutStatusBadge } from "./FlStatusBadges";

// Withdrawal detail (spec §16/§29). Account numbers masked, references shown
// with copy-to-clipboard confirmation, status backend-authoritative.

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

export function FlPayoutDetail({ payout }: { payout: FlPayout }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-kampmax-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-kampmax-text-secondary">Withdrawal</p>
            <p className="mt-1 text-3xl font-bold text-kampmax-text">{formatNaira(payout.amount)}</p>
            <p className="mt-1 text-sm text-kampmax-text-secondary">Payout fee {formatNaira(payout.fee)}</p>
          </div>
          <FlPayoutStatusBadge status={payout.status} />
        </div>
      </div>

      <div className="rounded-xl border border-kampmax-border bg-white p-5">
        <h2 className="text-sm font-bold text-kampmax-text">Details</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <Row label="Reference">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-kampmax-text">{payout.reference}</span>
              <CopyButton value={payout.reference} label="Copy" />
            </span>
          </Row>
          <Row label="Bank"><span className="text-kampmax-text">{payout.bankName}</span></Row>
          <Row label="Account">
            <span className="font-mono text-kampmax-text-secondary">{payout.maskedAccountNumber}</span>
          </Row>
          <Row label="Requested">
            <span className="font-mono text-kampmax-text">{formatDateTime(payout.requestedAt)}</span>
          </Row>
          {payout.processedAt && (
            <Row label="Processed">
              <span className="font-mono text-kampmax-text">{formatDateTime(payout.processedAt)}</span>
            </Row>
          )}
          {payout.expectedAt && (
            <Row label="Expected"><span className="text-kampmax-text">{formatDateTime(payout.expectedAt)}</span></Row>
          )}
          {payout.failedReason && (
            <Row label="Failure reason"><span className="text-kampmax-text">{payout.failedReason}</span></Row>
          )}
          {payout.reversalReason && (
            <Row label="Reversal reason"><span className="text-kampmax-text">{payout.reversalReason}</span></Row>
          )}
        </dl>
      </div>

      {payout.events.length > 0 && (
        <div className="rounded-xl border border-kampmax-border bg-white p-5">
          <h2 className="text-sm font-bold text-kampmax-text">Timeline</h2>
          <ol className="mt-4 space-y-4 border-l border-kampmax-border pl-4">
            {payout.events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-600" aria-hidden />
                <p className="text-sm font-medium text-kampmax-text">{e.title}</p>
                <p className="text-xs text-kampmax-text-muted">{formatDateTime(e.at)}</p>
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
