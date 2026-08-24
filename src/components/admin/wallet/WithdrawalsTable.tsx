"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  BadgeCheck,
  CircleDashed,
  MoreHorizontal,
  Send,
  XCircle,
} from "lucide-react";
import { formatNaira, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { WithdrawalStatusBadge } from "./FinanceBadges";
import type { Paginated, WithdrawalAction, WithdrawalRequest } from "@/types/admin";

interface WithdrawalsTableProps {
  page: Paginated<WithdrawalRequest> | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onAct: (w: WithdrawalRequest, action: Extract<WithdrawalAction, "start_processing" | "approve" | "mark_paid">) => void;
  onReject: (w: WithdrawalRequest) => void;
}

/** Actions allowed per state - mirrors the service transition map. */
function actionsFor(w: WithdrawalRequest): WithdrawalAction[] {
  switch (w.status) {
    case "pending":
      return ["start_processing", "approve", "reject"];
    case "processing":
      return ["approve", "mark_paid", "reject"];
    case "approved":
      return ["mark_paid"];
    default:
      return [];
  }
}

const ACTION_META = {
  start_processing: { label: "Start processing", icon: CircleDashed },
  approve: { label: "Approve", icon: BadgeCheck },
  mark_paid: { label: "Mark as paid", icon: ArrowDownToLine },
} as const;

export function WithdrawalsTable({
  page,
  loading,
  error,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  onAct,
  onReject,
}: WithdrawalsTableProps) {
  const [menuFor, setMenuFor] = useState<string | null>(null);

  if (loading && !page) return <LoadingSkeleton variant="table" rows={6} />;

  if (error) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (!page || page.items.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="No withdrawal requests"
        message={
          hasActiveFilters
            ? "No request matches the current search or filters."
            : "Vendors' payout requests will land here."
        }
        action={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-9 rounded-md bg-kampmax-blue px-3.5 text-sm font-medium text-white hover:bg-kampmax-blue/90"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">Request</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Vendor</th>
              <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Bank account</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Amount</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
              <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Requested</th>
              <th scope="col" className="hidden px-4 py-2.5 font-medium xl:table-cell">Processed</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border/70">
            {page.items.map((w) => {
              const actions = actionsFor(w);
              const rejectedNote = w.status === "rejected" ? w.note : null;
              return (
                <tr key={w.id} className="transition-colors hover:bg-kampmax-muted/40">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] font-medium text-kampmax-blue">
                    {w.id}
                  </td>

                  <td className="max-w-[160px] px-4 py-2.5">
                    <span className="block truncate font-medium text-kampmax-text">
                      {w.vendorName}
                    </span>
                    <span className="block truncate text-[11px] text-kampmax-text-secondary">
                      {w.accountName}
                    </span>
                  </td>

                  <td className="hidden whitespace-nowrap px-4 py-2.5 text-[13px] text-kampmax-text-secondary md:table-cell">
                    <span className="font-medium text-kampmax-text">{w.bankName}</span>{" "}
                    · {w.accountNumberMasked}
                  </td>

                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                    <span
                      className={
                        w.status === "rejected"
                          ? "font-medium text-kampmax-text-secondary line-through decoration-red-400/50"
                          : "font-medium text-kampmax-text"
                      }
                    >
                      {formatNaira(w.amount)}
                    </span>
                    <span className="block text-[10px] text-kampmax-text-secondary">
                      fee {formatNaira(w.fee)}
                    </span>
                  </td>

                  <td className="px-4 py-2.5">
                    <WithdrawalStatusBadge status={w.status} />
                    {rejectedNote && (
                      <span
                        className="mt-1 block max-w-[180px] truncate text-[10px] text-kampmax-error"
                        title={rejectedNote}
                      >
                        “{rejectedNote}”
                      </span>
                    )}
                  </td>

                  <td
                    className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary lg:table-cell"
                    title={w.requestedAt}
                  >
                    {timeAgo(w.requestedAt)}
                  </td>

                  <td
                    className="hidden whitespace-nowrap px-4 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell"
                    title={w.processedAt ?? undefined}
                  >
                    {w.processedAt ? timeAgo(w.processedAt) : "—"}
                  </td>

                  {/* Actions */}
                  <td className="relative px-4 py-2.5 text-right">
                    {actions.length === 0 ? (
                      <span className="text-xs text-kampmax-text-secondary">—</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          aria-label={`Actions for ${w.id}`}
                          aria-expanded={menuFor === w.id}
                          onClick={() => setMenuFor((m) => (m === w.id ? null : w.id))}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-kampmax-text-secondary hover:border-kampmax-border hover:bg-white hover:text-kampmax-text"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {menuFor === w.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setMenuFor(null)}
                              aria-hidden="true"
                            />
                            <div className="absolute right-3 top-9 z-40 w-48 overflow-hidden rounded-md border border-kampmax-border bg-white py-1 shadow-md">
                              {actions.map((action) =>
                                action === "reject" ? (
                                  <button
                                    key={action}
                                    type="button"
                                    onClick={() => {
                                      setMenuFor(null);
                                      onReject(w);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-red-600 hover:bg-kampmax-error/10"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject…
                                  </button>
                                ) : (
                                  <button
                                    key={action}
                                    type="button"
                                    onClick={() => {
                                      setMenuFor(null);
                                      onAct(w, action);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-kampmax-text hover:bg-kampmax-muted/60"
                                  >
                                    {(() => {
                                      const Icon = ACTION_META[action].icon;
                                      return <Icon className="h-3.5 w-3.5 opacity-70" />;
                                    })()}
                                    {ACTION_META[action].label}
                                  </button>
                                )
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {page.items.length} of {page.total} withdrawal requests, page {page.page} of{" "}
        {page.totalPages}.
      </p>
    </div>
  );
}
