"use client";

import { AlarmClock, Clock3, Inbox, ShieldAlert, Undo2, UserX } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Skeleton } from "@/components/admin/LoadingSkeleton";
import type { SupportTicketMetrics } from "@/types/admin";

interface SupportMetricsProps {
  metrics?: SupportTicketMetrics;
  loading: boolean;
}

/** Backend-derived headline metrics — never seeded or hardcoded values. */
export function SupportMetrics({ metrics, loading }: SupportMetricsProps) {
  if (loading || !metrics) {
    return (
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-kampmax-border bg-white p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-7 w-10" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <StatCard
        label="Open"
        value={metrics.open.toLocaleString("en-NG")}
        icon={Inbox}
        tone="error"
        hint="awaiting triage"
      />
      <StatCard
        label="Escalated"
        value={metrics.escalated.toLocaleString("en-NG")}
        icon={ShieldAlert}
        tone="warning"
        hint="senior team"
      />
      <StatCard
        label="Unassigned"
        value={metrics.unassigned.toLocaleString("en-NG")}
        icon={UserX}
        hint="no agent yet"
      />
      <StatCard
        label="Waiting on customer"
        value={metrics.awaitingCustomer.toLocaleString("en-NG")}
        icon={Clock3}
        hint="customer to reply"
      />
      <StatCard
        label="Avg first response"
        value={`${metrics.avgFirstResponseHours.toLocaleString("en-NG")}h`}
        icon={AlarmClock}
        hint="across active tickets"
      />
      <StatCard
        label="Resolved"
        value={metrics.resolved.toLocaleString("en-NG")}
        icon={Undo2}
        hint="resolved tickets"
      />
    </div>
  );
}