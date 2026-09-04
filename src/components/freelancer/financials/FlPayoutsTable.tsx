"use client";

import Link from "next/link";
import { formatNaira, formatDate } from "@/lib/utils";
import type { FlPayout } from "@/types/freelancer-financials";
import { FlPayoutStatusBadge } from "./FlStatusBadges";

// Payouts table (desktop table + mobile cards). Account numbers remain masked.

export function FlPayoutsTable({ payouts }: { payouts: FlPayout[] }) {
  return (
    <div>
      <div className="hidden overflow-hidden rounded-xl border border-kampmax-border bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Withdrawal history</caption>
          <thead className="border-b border-kampmax-border bg-kampmax-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Date</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Reference</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Amount</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Fee</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Account</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-kampmax-muted/40">
                <td className="whitespace-nowrap px-4 py-3 text-kampmax-text-secondary">{formatDate(p.requestedAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/freelancer/payouts/${p.id}`} className="font-medium text-primary-600 hover:underline">
                    {p.reference}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold text-kampmax-text">{formatNaira(p.amount)}</td>
                <td className="px-4 py-3 text-kampmax-text-secondary">{formatNaira(p.fee)}</td>
                <td className="px-4 py-3 text-kampmax-text-secondary">{p.bankName} <span className="font-mono">{p.maskedAccountNumber}</span></td>
                <td className="px-4 py-3"><FlPayoutStatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {payouts.map((p) => (
          <li key={p.id}>
            <Link
              href={`/freelancer/payouts/${p.id}`}
              className="block rounded-xl border border-kampmax-border bg-white p-4 hover:border-primary-400"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-kampmax-text">{p.reference}</p>
                  <p className="mt-0.5 text-xs text-kampmax-text-muted">{formatDate(p.requestedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-kampmax-text">{formatNaira(p.amount)}</p>
                  <p className="text-xs text-kampmax-text-muted">fee {formatNaira(p.fee)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="truncate text-xs text-kampmax-text-muted">{p.bankName} {p.maskedAccountNumber}</span>
                <FlPayoutStatusBadge status={p.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
