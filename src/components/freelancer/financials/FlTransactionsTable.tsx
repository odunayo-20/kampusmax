"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { FlFinancialTransaction } from "@/types/freelancer-financials";
import { FL_FIN_SIGN } from "@/types/freelancer-financials";
import { FL_TX_TYPE_META } from "@/config/freelancer-financials";
import { FlTransactionStatusBadge } from "./FlStatusBadges";

// Transaction list: a semantic table on desktop, cards on mobile (spec §13).

function AmountCell({ t }: { t: FlFinancialTransaction }) {
  const isCredit = t.sign === FL_FIN_SIGN.CREDIT;
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold", isCredit ? "text-kampmax-success" : "text-kampmax-text")}>
      {isCredit ? <ArrowDownLeft className="h-4 w-4" aria-hidden /> : <ArrowUpRight className="h-4 w-4" aria-hidden />}
      {isCredit ? "+" : "−"}
      {formatNaira(t.amount)}
      {t.fee ? <span className="text-xs font-normal text-kampmax-text-muted">incl. {formatNaira(t.fee)}</span> : null}
    </span>
  );
}

export function FlTransactionsTable({ transactions }: { transactions: FlFinancialTransaction[] }) {
  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-kampmax-border bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Financial transactions</caption>
          <thead className="border-b border-kampmax-border bg-kampmax-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Date</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Transaction</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Type</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Amount</th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-kampmax-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-kampmax-muted/40">
                <td className="whitespace-nowrap px-4 py-3 text-kampmax-text-secondary">{formatDate(t.at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/freelancer/transactions/${t.id}`} className="font-medium text-kampmax-text hover:text-primary-700">
                    {t.description}
                  </Link>
                  <p className="text-xs text-kampmax-text-muted">{t.reference}</p>
                </td>
                <td className="px-4 py-3 text-kampmax-text-secondary">{FL_TX_TYPE_META[t.type].label}</td>
                <td className="px-4 py-3"><AmountCell t={t} /></td>
                <td className="px-4 py-3">
                  <Link href={`/freelancer/transactions/${t.id}`}>
                    <FlTransactionStatusBadge status={t.status} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {transactions.map((t) => (
          <li key={t.id}>
            <Link
              href={`/freelancer/transactions/${t.id}`}
              className="block rounded-xl border border-kampmax-border bg-white p-4 hover:border-primary-400"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-kampmax-text">{t.description}</p>
                  <p className="mt-0.5 text-xs text-kampmax-text-muted">{formatDate(t.at)} • {FL_TX_TYPE_META[t.type].label}</p>
                </div>
                <AmountCell t={t} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="truncate font-mono text-xs text-kampmax-text-muted">{t.reference}</span>
                <FlTransactionStatusBadge status={t.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
