"use client";

import { ChevronLeft, AlertCircle, Copy, Clock, CheckCircle, XCircle, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNaira, formatDateTime } from "@/lib/utils";
import { spPayoutStatusLabel, spPayoutStatusVariant } from "./sp-financials-meta";
import type { SpPayout } from "@/types/service-provider-financials";

interface SpPayoutDetailProps {
  payout: SpPayout;
}

const STATUS_ICONS = {
  processing: <Clock className="h-5 w-5 text-kampmax-info" />,
  successful: <CheckCircle className="h-5 w-5 text-kampmax-success" />,
  failed: <XCircle className="h-5 w-5 text-kampmax-error" />,
};

export function SpPayoutDetail({ payout }: SpPayoutDetailProps) {
  const router = useRouter();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const total = payout.amount + payout.fee;

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
          <p className="text-sm text-kampmax-text-secondary">Withdrawal</p>
          <h1 className="text-xl font-bold text-kampmax-text">Payout {payout.id}</h1>
        </div>
        <div className="flex items-center gap-2">
          {STATUS_ICONS[payout.status]}
          <StatusBadge variant={spPayoutStatusVariant(payout.status)} label={spPayoutStatusLabel(payout.status)} />
        </div>
      </div>

      {payout.status === "failed" && payout.failedReason && (
        <div className="flex items-start gap-3 rounded-lg border border-kampmax-error/20 bg-error-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-kampmax-error" />
          <div>
            <p className="font-medium text-kampmax-error">Payout failed</p>
            <p className="mt-1 text-sm text-kampmax-text-secondary">{payout.failedReason}</p>
          </div>
        </div>
      )}

      {payout.status === "processing" && (
        <div className="flex items-start gap-3 rounded-lg border border-kampmax-info/20 bg-info-50 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-kampmax-info" />
          <div>
            <p className="font-medium text-kampmax-text">Payout in progress</p>
            <p className="mt-1 text-sm text-kampmax-text-secondary">
              Funds usually arrive within 24 hours. No action is needed.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
            <Building className="h-5 w-5 text-primary-700" />
          </div>
          <div>
            <p className="font-semibold text-kampmax-text">{payout.bankName}</p>
            <p className="mt-1 text-sm text-kampmax-text-secondary font-mono">{payout.maskedAccountNumber}</p>
            <p className="mt-1 text-sm text-kampmax-text-secondary">NGN</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-kampmax-border bg-white">
        <div className="grid divide-y divide-kampmax-border text-base sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="p-4">
            <p className="text-sm text-kampmax-text-secondary">Amount requested</p>
            <p className="mt-1 text-xl font-bold text-kampmax-text">{formatNaira(payout.amount)}</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-kampmax-text-secondary">Payout fee</p>
            <p className="mt-1 text-xl font-semibold text-kampmax-text">{formatNaira(payout.fee)}</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-kampmax-text-secondary">Total to bank</p>
            <p className="mt-1 text-xl font-semibold text-kampmax-text">{formatNaira(total)}</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-kampmax-text-secondary">Net from balance</p>
            <p className="mt-1 text-xl font-semibold text-kampmax-error">−{formatNaira(total)}</p>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-kampmax-border bg-white p-4" aria-labelledby="payout-details-heading">
        <h2 id="payout-details-heading" className="text-lg font-semibold text-kampmax-text">Details</h2>
        <dl className="mt-4 space-y-4">
          <Row label="Payout ID" value={payout.id} copyable onCopy={() => copyToClipboard(payout.id)} />
          <Row label="Reference" value={payout.reference} copyable onCopy={() => copyToClipboard(payout.reference)} />
          <Row label="Status" value={<StatusBadge variant={spPayoutStatusVariant(payout.status)} label={spPayoutStatusLabel(payout.status)} />} />
          <Row label="Requested" value={formatDateTime(payout.requestedAt)} />
          {payout.processedAt && <Row label="Processed" value={formatDateTime(payout.processedAt)} />}
        </dl>
        <p className="mt-4 text-xs text-kampmax-text-secondary">
          Once initiated, payouts cannot be cancelled or edited from this dashboard. Refer to{" "}
          <span className="font-mono">{payout.reference}</span> when contacting support.
        </p>
      </section>
    </div>
  );
}

interface RowProps {
  label: string;
  value: string | React.ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
}

function Row({ label, value, copyable, onCopy }: RowProps) {
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