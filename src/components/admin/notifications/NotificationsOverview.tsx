"use client";

import { Bell, Eye, EyeOff, Users } from "lucide-react";
import { useAdminNotificationOverview } from "@/hooks/admin/use-admin-communications";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { ManagedAdminNotificationOverview } from "@/types/admin";

interface NotificationsOverviewProps {
  onNavigate: (query: { read?: "unread" | "read" }) => void;
}

export function NotificationsOverview({ onNavigate }: NotificationsOverviewProps) {
  const { data: overview, isLoading, error } = useAdminNotificationOverview();

  if (isLoading) return <LoadingSkeleton rows={2} />;
  if (error || !overview) return null;

  const { counts } = overview;

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <StatCard
        icon={Bell}
        label="Total"
        value={counts.total}
        onClick={() => onNavigate({})}
      />
      <StatCard
        icon={EyeOff}
        label="Unread"
        value={counts.unread}
        tone="info"
        onClick={() => onNavigate({ read: "unread" })}
      />
      <StatCard
        icon={Eye}
        label="Read"
        value={counts.read}
        onClick={() => onNavigate({ read: "read" })}
      />
      <StatCard
        icon={Users}
        label="Recipients"
        value={counts.recipients}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  onClick,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
  tone?: "info" | "default";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex items-center gap-3 rounded-lg border border-kampmax-border bg-white px-3 py-2.5 text-left transition-colors ${
        onClick
          ? "cursor-pointer hover:bg-kampmax-muted/40"
          : "cursor-default"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
          tone === "info"
            ? "bg-kampmax-info/10 text-kampmax-info"
            : "bg-kampmax-muted text-kampmax-text-secondary"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-kampmax-text-secondary">
          {label}
        </p>
        <p className="text-lg font-bold tabular-nums text-kampmax-text">
          {value.toLocaleString("en-NG")}
        </p>
      </div>
    </button>
  );
}
