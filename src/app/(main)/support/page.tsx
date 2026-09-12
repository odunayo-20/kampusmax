"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SupportContactBanner } from "@/components/support/SupportContactBanner";
import { SupportTicketsList } from "@/components/support/SupportTicketsList";
import { useSupportTickets } from "@/hooks/use-support";

export default function SupportPage() {
  const { data, isLoading } = useSupportTickets();

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Profile", href: "/profile" }, { label: "Support" }]}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-kampmax-muted"
            aria-label="Back to profile"
          >
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-kampmax-text">
              Support Requests
            </h1>
            <p className="text-xs text-kampmax-text-secondary">
              Track and reply to your open cases
            </p>
          </div>
        </div>
        <Link
          href="/support/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-kampmax-blue px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
        >
          <Plus className="h-4 w-4" />
          New request
        </Link>
      </div>

      <SupportContactBanner />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-kampmax-text">My requests</h2>
        <SupportTicketsList tickets={data} isLoading={isLoading} />
      </section>
    </PageContainer>
  );
}