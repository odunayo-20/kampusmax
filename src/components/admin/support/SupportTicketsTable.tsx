"use client";

import Link from "next/link";
import { ArrowRight, Flag } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { previewText } from "@/components/admin/campus-community/campus-community-utils";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import {
  supportCategoryLabel,
  supportCategoryVariant,
  supportPriorityLabel,
  supportPriorityVariant,
  supportStatusLabel,
  supportStatusVariant,
} from "./support-meta";
import type { SupportTicket } from "@/types/admin";

export interface SupportTicketsTableProps {
  items: SupportTicket[];
  loading: boolean;
  error: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function SupportTicketsTable(props: SupportTicketsTableProps) {
  const { items, loading, error, hasActiveFilters, onRetry, onClearFilters } =
    props;

  if (loading) return <LoadingSkeleton variant="table" rows={6} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (items.length === 0)
    return (
      <EmptyState
        title={hasActiveFilters ? "No tickets match" : "No support tickets yet"}
        message={
          hasActiveFilters
            ? "Try different search terms or clear the filters."
            : "Customer support requests will queue up here."
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
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                <th scope="col" className="px-4 py-2.5 font-medium">Ticket</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium sm:table-cell">Customer</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Category</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Priority</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium md:table-cell">Assignee</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Created</th>
                <th scope="col" className="w-10 px-2 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kampmax-border">
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer transition-colors hover:bg-kampmax-muted/40"
                >
                  <td className="max-w-[260px] px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-semibold uppercase text-kampmax-blue">
                        {t.id}
                      </span>
                      {t.escalated && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-kampmax-gold/15 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-kampmax-gold-dark">
                          <Flag className="h-2.5 w-2.5" />
                          Escalated
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-0.5 truncate text-xs text-kampmax-text-secondary"
                      title={t.subject}
                    >
                      {previewText(t.subject, 44)}
                    </p>
                  </td>

                  <td className="hidden max-w-[150px] px-3 py-2.5 sm:table-cell">
                    <span className="truncate text-kampmax-text">{t.customer.name}</span>
                    <span className="block text-[11px] text-kampmax-text-secondary">
                      {t.customer.campusName ?? "Platform"}
                    </span>
                  </td>

                  <td className="hidden whitespace-nowrap px-3 py-2.5 lg:table-cell">
                    <StatusBadge
                      variant={supportCategoryVariant(t.category)}
                      label={supportCategoryLabel(t.category)}
                    />
                  </td>

                  <td className="whitespace-nowrap px-3 py-2.5">
                    <StatusBadge
                      variant={supportPriorityVariant(t.priority)}
                      label={supportPriorityLabel(t.priority)}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <StatusBadge
                      variant={supportStatusVariant(t.status)}
                      label={supportStatusLabel(t.status)}
                    />
                  </td>

                  <td className="hidden whitespace-nowrap px-3 py-2.5 text-xs text-kampmax-text-secondary md:table-cell">
                    {t.assigneeName ?? <span className="italic">Unassigned</span>}
                  </td>

                  <td
                    className="hidden whitespace-nowrap px-3 py-2.5 tabular-nums text-kampmax-text-secondary lg:table-cell"
                    title={new Date(t.createdAt).toISOString()}
                  >
                    {formatDateShort(t.createdAt)}
                    <span className="ml-1.5 hidden text-[11px] 2xl:inline">
                      {timeAgo(t.createdAt)}
                    </span>
                  </td>

                  <td className="px-2 py-2.5">
                    <Link
                      href={`/admin/support/${t.id}`}
                      aria-label={`Open ticket ${t.id}`}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-kampmax-border bg-white px-2 text-[11px] font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
                    >
                      Open
                      <ArrowRight className="h-3 w-3" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="space-y-2.5 md:hidden">
        {items.map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/support/${t.id}`}
              className="block cursor-pointer rounded-lg border border-kampmax-border bg-white p-3 transition-colors active:bg-kampmax-muted/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] font-semibold uppercase text-kampmax-blue">
                    {t.id}
                  </span>
                  {t.escalated && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-kampmax-gold/15 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-kampmax-gold-dark align-middle">
                      <Flag className="h-2.5 w-2.5" />
                      Escalated
                    </span>
                  )}
                  <p className="mt-0.5 truncate text-[13px] font-medium text-kampmax-text">
                    {previewText(t.subject, 48)}
                  </p>
                </div>
                <StatusBadge
                  variant={supportStatusVariant(t.status)}
                  label={supportStatusLabel(t.status)}
                />
              </div>

              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-dashed border-kampmax-border pt-2 text-xs">
                <MetaCell label="Customer">
                  <span className="truncate">{t.customer.name}</span>
                </MetaCell>
                <MetaCell label="Priority">
                  <span className={cn("font-medium", priorityText(t.priority))}>
                    {supportPriorityLabel(t.priority)}
                  </span>
                </MetaCell>
                <MetaCell label="Category">
                  {supportCategoryLabel(t.category)}
                </MetaCell>
                <MetaCell label="Created">
                  {formatDateShort(t.createdAt)} · {timeAgo(t.createdAt)}
                </MetaCell>
              </dl>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-kampmax-border pt-2">
                <StatusBadge
                  variant={supportCategoryVariant(t.category)}
                  label={supportCategoryLabel(t.category)}
                />
                <span className="inline-flex items-center gap-1 text-[11px] text-kampmax-text-secondary">
                  {t.assigneeName ?? "Unassigned"}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function priorityText(priority: SupportTicket["priority"]): string {
  switch (priority) {
    case "urgent":
      return "text-kampmax-error";
    case "high":
      return "text-amber-700";
    case "normal":
      return "text-kampmax-info";
    default:
      return "text-kampmax-text-secondary";
  }
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