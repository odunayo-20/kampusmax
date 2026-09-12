"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  LifeBuoy,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { SupportStatusBadge } from "./SupportBadges";
import { supportCategoryOption } from "@/config/support";
import { formatDateTime } from "@/lib/utils";
import type {
  SupportRelatedResource,
  SupportTicket,
} from "@/types/admin";

function RelatedChip({ related }: { related: SupportRelatedResource }) {
  const Icon =
    related.type === "order"
      ? ShoppingBag
      : related.type === "transaction"
        ? Wallet
        : FileText;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-kampmax-muted px-2 py-0.5 text-[11px] font-medium text-kampmax-text-secondary">
      <Icon className="h-3 w-3" />
      {related.label}
    </span>
  );
}

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const category = supportCategoryOption(ticket.category);
  return (
    <Link
      href={`/support/${ticket.id}`}
      className="group block rounded-xl border border-kampmax-border bg-white p-4 transition-colors hover:border-kampmax-blue/40"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-kampmax-text group-hover:text-kampmax-blue transition-colors line-clamp-1">
              {ticket.subject}
            </span>
            <SupportStatusBadge status={ticket.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-kampmax-text-secondary">
            <span className="font-mono text-[11px]">{ticket.id}</span>
            <span>&middot;</span>
            <span>{category.title}</span>
            {ticket.relatedResource && <RelatedChip related={ticket.relatedResource} />}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-[11px] text-kampmax-text-secondary">
            Updated {formatDateTime(ticket.updatedAt)}
          </span>
          <ArrowRight className="h-4 w-4 text-kampmax-text-secondary transition-colors group-hover:text-kampmax-blue" />
        </div>
      </div>
    </Link>
  );
}

function TicketRowSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-kampmax-border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded bg-kampmax-muted" />
          <div className="h-3 w-2/3 rounded bg-kampmax-muted" />
        </div>
        <div className="h-3 w-24 rounded bg-kampmax-muted" />
      </div>
    </div>
  );
}

export function SupportTicketsListSkeleton() {
  return (
    <div className="space-y-2">
      <TicketRowSkeleton />
      <TicketRowSkeleton />
      <TicketRowSkeleton />
    </div>
  );
}

export function SupportTicketsList({
  tickets,
  isLoading,
}: {
  tickets: SupportTicket[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) return <SupportTicketsListSkeleton />;

  if (!tickets || tickets.length === 0) {
    return (
      <div className="rounded-xl border border-kampmax-border bg-white px-6 py-12 text-center">
        <LifeBuoy className="mx-auto h-10 w-10 text-kampmax-text-secondary" />
        <h2 className="mt-3 text-sm font-semibold text-kampmax-text">
          No support requests yet
        </h2>
        <p className="mt-1 text-xs text-kampmax-text-secondary">
          When you open a request, it will show up here with its status.
        </p>
        <Link
          href="/support/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-kampmax-blue px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
        >
          Open a request
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <TicketRow key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}