"use client";

import { Building, CheckCircle, AlertCircle, XCircle, Lock } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { spPayoutAccountStatusLabel, spPayoutAccountStatusVariant } from "./sp-financials-meta";
import type { SpPayoutAccount } from "@/types/service-provider-financials";

interface SpPayoutAccountCardProps {
  account: SpPayoutAccount;
  onRequestPayout: () => void;
  canRequest: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  verified: <CheckCircle className="h-4 w-4 text-kampmax-success" />,
  pending_verification: <AlertCircle className="h-4 w-4 text-kampmax-warning" />,
  failed: <XCircle className="h-4 w-4 text-kampmax-error" />,
  restricted: <Lock className="h-4 w-4 text-kampmax-error" />,
  missing: <Building className="h-4 w-4 text-kampmax-text-secondary" />,
};

export function SpPayoutAccountCard({ account, onRequestPayout, canRequest }: SpPayoutAccountCardProps) {
  const statusIcon = ICONS[account.status] ?? ICONS.missing;

  return (
    <section aria-labelledby="sp-payout-account-heading" className="space-y-4">
      <h2 id="sp-payout-account-heading" className="text-lg font-semibold text-kampmax-text">
        Payout account
      </h2>

      <div className="rounded-xl border border-kampmax-border bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
            {statusIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-kampmax-text">{account.bankName}</p>
              <StatusBadge
                variant={spPayoutAccountStatusVariant(account.status)}
                label={spPayoutAccountStatusLabel(account.status)}
              />
            </div>
            <p className="mt-1 text-sm text-kampmax-text-secondary font-mono">
              {account.maskedAccountNumber}
            </p>
            <p className="text-xs text-kampmax-text-secondary">
              {account.accountName} • {account.currency}
            </p>
          </div>
        </div>

        {account.verifiedAt && (
          <p className="mt-3 text-xs text-kampmax-text-secondary">
            Verified {formatDate(account.verifiedAt)}
          </p>
        )}

        {account.restrictions?.length ? (
          <div className="mt-3 p-3 rounded-lg bg-warning-50 border border-kampmax-warning/20">
            <p className="text-sm font-medium text-kampmax-warning">Restrictions:</p>
            <ul className="mt-1 list-disc list-inside text-xs text-kampmax-text-secondary">
              {account.restrictions.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onRequestPayout}
            disabled={!canRequest}
            className={cn(
              "flex-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Request payout
          </button>
          <Link
            href="/service-provider/financials/payout-account"
            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100"
          >
            Manage
          </Link>
          <span className="text-xs text-kampmax-text-secondary">
            Minimum ₦2,000 • Fee ₦50 per payout
          </span>
        </div>
      </div>
    </section>
  );
}