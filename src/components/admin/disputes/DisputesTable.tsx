"use client";

import { Eye, SearchCheck } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { communityCampusName, previewText } from "@/components/admin/campus-community/campus-community-utils";
import { cn, formatDateShort, formatNaira, timeAgo } from "@/lib/utils";
import {
  disputeIsOpenForActions,
  disputeReasonLabel,
  disputeReasonVariant,
  disputeStatusLabel,
  disputeStatusVariant,
} from "./disputes-meta";
import type { ManagedDispute } from "@/types/admin";

export interface DisputesTableProps {
  items: ManagedDispute[];
  loading: boolean;
  error: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onView: (d: ManagedDispute) => void;
}

export function DisputesTable(props: DisputesTableProps) {
  const {
    items,
    loading,
    error,
    hasActiveFilters,
    onRetry,
    onClearFilters,
    onView,
  } = props;

  if (loading) return <LoadingSkeleton variant="table" rows={6} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (items.length === 0)
    return (
      <EmptyState
        title={hasActiveFilters ? "No disputes match" : "No disputes yet"}
        message={
          hasActiveFilters
            ? "Try different search terms or clear the filters."
            : "Customer disputes will queue up here once orders start flowing."
        }
        action={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-8 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/60"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />
    );

  return (
    <>
      {/* Desktop / tablet: full table */}
      <div className="hidden overflow-hidden rounded-lg border border-kampmax-border bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                <th scope="col" className="px-4 py-2.5 font-medium">Dispute</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Order</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Customer</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Vendor</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Campus</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Reason</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Amount</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium xl:table-cell">Created</th>
                <th scope="col" className="w-10 px-2 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kampmax-border">
              {items.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => onView(d)}
                  className="cursor-pointer transition-colors hover:bg-kampmax-muted/40"
                >
                  <td className="max-w-[240px] px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-semibold uppercase text-kampmax-blue">
                        {d.id}
                      </span>
                      {d.priority === "high" && (
                        <span className="rounded bg-kampmax-error/10 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-kampmax-error">
                          High
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-0.5 truncate text-xs text-kampmax-text-secondary"
                      title={d.subject}
                    >
                      {previewText(d.subject, 44)}
                    </p>
                  </td>

                  <td className="hidden whitespace-nowrap px-3 py-2.5 font-mono text-xs uppercase text-kampmax-text-secondary lg:table-cell">
                    {d.orderId}
                  </td>

                  <td className="max-w-[140px] truncate whitespace-nowrap px-3 py-2.5 text-kampmax-text">
                    {d.customerName}
                  </td>

                  <td className="hidden max-w-[150px] truncate whitespace-nowrap px-3 py-2.5 text-kampmax-text-secondary xl:table-cell" title={d.vendorName}>
                    {d.vendorName}
                  </td>

                  <td className="hidden whitespace-nowrap px-3 py-2.5 text-kampmax-text-secondary lg:table-cell">
                    {communityCampusName(d.campusId)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <StatusBadge
                      variant={disputeReasonVariant(d.reason)}
                      label={disputeReasonLabel(d.reason)}
                    />
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5 font-medium tabular-nums text-kampmax-text">
                    {formatNaira(d.amount)}
                  </td>

                  <td className="px-3 py-2.5">
                    <StatusBadge
                      variant={disputeStatusVariant(d.status)}
                      label={disputeStatusLabel(d.status)}
                    />
                  </td>

                  <td
                    className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-kampmax-text-secondary xl:table-cell"
                    title={new Date(d.createdAt).toISOString()}
                  >
                    {formatDateShort(d.createdAt)}
                    <span className="ml-1.5 hidden text-[11px] 2xl:inline">
                      {timeAgo(d.createdAt)}
                    </span>
                  </td>

                  <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <ViewButton onView={() => onView(d)} disputeId={d.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="space-y-2.5 md:hidden">
        {items.map((d) => (
          <li
            key={d.id}
            onClick={() => onView(d)}
            className="cursor-pointer rounded-lg border border-kampmax-border bg-white p-3 transition-colors active:bg-kampmax-muted/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono text-[11px] font-semibold uppercase text-kampmax-blue">
                  {d.id}
                </span>
                {d.priority === "high" && (
                  <span className="ml-1.5 rounded bg-kampmax-error/10 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-kampmax-error align-middle">
                    High
                  </span>
                )}
                <p className="mt-0.5 truncate text-[13px] font-medium text-kampmax-text">
                  {previewText(d.subject, 48)}
                </p>
              </div>
              <StatusBadge
                variant={disputeStatusVariant(d.status)}
                label={disputeStatusLabel(d.status)}
              />
            </div>

            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-dashed border-kampmax-border pt-2 text-xs">
              <MetaCell label="Order">{d.orderId}</MetaCell>
              <MetaCell label="Amount">{formatNaira(d.amount)}</MetaCell>
              <MetaCell label="Customer">
                <span className="truncate">{d.customerName}</span>
              </MetaCell>
              <MetaCell label="Campus">
                {communityCampusName(d.campusId)}
              </MetaCell>
              <MetaCell label="Vendor">
                <span className="truncate">{d.vendorName}</span>
              </MetaCell>
              <MetaCell label="Created">
                {formatDateShort(d.createdAt)} · {timeAgo(d.createdAt)}
              </MetaCell>
            </dl>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-kampmax-border pt-2">
              <StatusBadge
                variant={disputeReasonVariant(d.reason)}
                label={disputeReasonLabel(d.reason)}
              />
              <div
                className="flex shrink-0 items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="inline-flex items-center gap-1 text-[11px] text-kampmax-text-secondary">
                  <SearchCheck aria-hidden className="h-3 w-3" />
                  {disputeIsOpenForActions(d.status) ? "Actionable" : "Closed"}
                </span>
                <ViewButton onView={() => onView(d)} disputeId={d.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function ViewButton({
  onView,
  disputeId,
}: {
  onView: () => void;
  disputeId: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Open case ${disputeId}`}
      onClick={(e) => {
        e.stopPropagation();
        onView();
      }}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border border-kampmax-border bg-white px-2 text-[11px] font-medium",
        "text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
      )}
    >
      <Eye className="h-3 w-3" aria-hidden />
      Open case
    </button>
  );
}

function MetaCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-kampmax-text-secondary">
        {label}
      </dt>
      <dd className="truncate text-kampmax-text">{children}</dd>
    </div>
  );
}
