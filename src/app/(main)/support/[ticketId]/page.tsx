"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  LifeBuoy,
  MessageSquare,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  SupportStatusBadge,
  SupportStatusExplainer,
  SupportCategoryBadge,
} from "@/components/support/SupportBadges";
import { SupportRequestThread } from "@/components/support/SupportRequestThread";
import { SupportContactBanner } from "@/components/support/SupportContactBanner";
import { useSupportTicket } from "@/hooks/use-support";
import { formatDateTime } from "@/lib/utils";
import type { SupportRelatedResource } from "@/types/admin";

function RelatedLink({ related }: { related: SupportRelatedResource }) {
  const Icon =
    related.type === "order"
      ? ShoppingBag
      : related.type === "transaction"
        ? Wallet
        : FileText;
  return (
    <Link
      href={related.href}
      className="inline-flex items-center gap-1.5 rounded-full bg-kampmax-muted px-2.5 py-1 text-[11px] font-medium text-kampmax-text-secondary transition-colors hover:text-kampmax-blue"
    >
      <Icon className="h-3 w-3" />
      {related.label}
    </Link>
  );
}

export default function SupportTicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const { data, isLoading } = useSupportTicket(params.ticketId);

  if (isLoading) {
    return (
      <PageContainer className="space-y-4">
        <Breadcrumbs items={[{ label: "Support", href: "/support" }, { label: "Loading…" }]} />
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-1/3 rounded-lg bg-kampmax-muted" />
          <div className="h-32 rounded-xl bg-kampmax-muted" />
          <div className="h-64 rounded-xl bg-kampmax-muted" />
        </div>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer className="space-y-4">
        <Breadcrumbs items={[{ label: "Support", href: "/support" }, { label: "Not found" }]} />
        <div className="rounded-xl border border-kampmax-border bg-white px-6 py-14 text-center">
          <LifeBuoy className="mx-auto h-10 w-10 text-kampmax-text-secondary" />
          <h1 className="mt-3 text-sm font-semibold text-kampmax-text">
            Support request not found
          </h1>
          <p className="mt-1 text-xs text-kampmax-text-secondary">
            It may have been removed, or it belongs to a different account.
          </p>
          <Link
            href="/support"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-kampmax-blue px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
          >
            Back to support
          </Link>
        </div>
      </PageContainer>
    );
  }

  const { ticket, messages } = data;

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Support", href: "/support" },
          { label: ticket.id },
        ]}
      />

      <div className="flex items-center gap-3">
        <Link
          href="/support"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-kampmax-muted"
          aria-label="Back to support"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </Link>
        <h1 className="text-lg font-bold text-kampmax-text">
          {ticket.subject}
        </h1>
      </div>

      <div className="rounded-xl border border-kampmax-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <SupportStatusBadge status={ticket.status} />
          <SupportCategoryBadge category={ticket.category} />
          <span className="font-mono text-[11px] text-kampmax-text-secondary">
            {ticket.id}
          </span>
          {ticket.relatedResource && (
            <RelatedLink related={ticket.relatedResource} />
          )}
        </div>
        <SupportStatusExplainer status={ticket.status} className="mt-2" />
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-kampmax-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Opened {formatDateTime(ticket.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Last update {formatDateTime(ticket.updatedAt)}
          </span>
        </div>
      </div>

      <SupportRequestThread detail={data} />

      <SupportContactBanner />
    </PageContainer>
  );
}