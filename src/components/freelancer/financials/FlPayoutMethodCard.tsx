"use client";

import Link from "next/link";
import { Building2, CheckCircle2, AlertTriangle, XCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { FL_PAYOUT_ACCOUNT_STATUS_META } from "@/config/freelancer-financials";
import type { FlPayoutAccount } from "@/types/freelancer-financials";

// Payout method card (spec §26). Account numbers are always MASKED — never a
// full number. Verification status is backend-authoritative.

const ICONS = {
  verified: <CheckCircle2 className="h-5 w-5 text-kampmax-success" />,
  pending_verification: <AlertTriangle className="h-5 w-5 text-kampmax-warning" />,
  failed: <XCircle className="h-5 w-5 text-kampmax-error" />,
  restricted: <Lock className="h-5 w-5 text-kampmax-error" />,
  missing: <Building2 className="h-5 w-5 text-kampmax-text-secondary" />,
};

export function FlPayoutMethodCard({
  account,
  canWithdraw,
  onRequestPayout,
}: {
  account: FlPayoutAccount;
  canWithdraw: boolean;
  onRequestPayout?: () => void;
}) {
  const meta = FL_PAYOUT_ACCOUNT_STATUS_META[account.status];
  const icon = ICONS[account.status] ?? ICONS.missing;

  return (
    <section aria-labelledby="payout-method-heading" className="space-y-3">
      <h2 id="payout-method-heading" className="text-lg font-semibold text-kampmax-text">Payout method</h2>
      <div className="rounded-xl border border-kampmax-border bg-white p-4">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-lg", "bg-primary-100")}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-kampmax-text">{account.bankName}</p>
              <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", badgeClass(account.status))}>
                {meta.label}
              </span>
            </div>
            <p className="mt-1 font-mono text-sm text-kampmax-text-secondary">{account.maskedAccountNumber}</p>
            <p className="text-xs text-kampmax-text-muted">{account.accountName} • {account.currency}</p>
          </div>
        </div>

        {account.verifiedAt && (
          <p className="mt-3 text-xs text-kampmax-text-muted">Verified {formatDate(account.verifiedAt)}</p>
        )}

        {account.restrictions?.length ? (
          <div className="mt-3 rounded-lg border border-warning-50 bg-warning-50 p-3">
            <p className="text-sm font-medium text-kampmax-warning">Restrictions</p>
            <ul className="mt-1 list-inside list-disc text-xs text-kampmax-text-secondary">
              {account.restrictions.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {onRequestPayout && (
            <button
              type="button"
              onClick={onRequestPayout}
              disabled={!canWithdraw}
              className="inline-flex h-10 items-center rounded-md bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-[#1258C7] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              Request payout
            </button>
          )}
          <Link
            href="/freelancer/payout-methods"
            className="inline-flex h-10 items-center rounded-md border border-kampmax-border bg-white px-4 text-sm font-semibold text-kampmax-text hover:bg-kampmax-muted"
          >
            Manage
          </Link>
        </div>
      </div>
    </section>
  );
}

function badgeClass(status: FlPayoutAccount["status"]): string {
  switch (status) {
    case "verified": return "border-kampmax-success/30 bg-success-50 text-kampmax-success";
    case "pending_verification": return "border-kampmax-info/30 bg-info-50 text-kampmax-info";
    case "failed": return "border-error-100 bg-error-50 text-error-700";
    case "restricted": return "border-error-100 bg-error-50 text-error-700";
    default: return "border-kampmax-border bg-kampmax-muted text-kampmax-text-secondary";
  }
}
