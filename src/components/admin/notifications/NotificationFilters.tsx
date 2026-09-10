"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  NOTIFICATION_CATEGORY_FILTER_ORDER,
  NOTIFICATION_TYPE_FILTER_ORDER,
  notificationCategoryLabel,
  notificationTypeLabel,
  hasActiveNotificationFilters,
} from "./notifications-meta";
import type {
  ManagedAdminNotificationQuery,
} from "@/types/admin";
import type { NotificationType, NotificationCategory } from "@/types";

interface NotificationFiltersProps {
  query: ManagedAdminNotificationQuery;
  onQueryChange: (query: ManagedAdminNotificationQuery) => void;
}

export function NotificationFilters({
  query,
  onQueryChange,
}: NotificationFiltersProps) {
  const hasActive = hasActiveNotificationFilters(query);

  return (
    <div className="my-3 flex flex-wrap items-center gap-2">
      <div className="w-full sm:w-64">
        <Input
          value={query.search ?? ""}
          placeholder="Search title or message…"
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search notifications"
          onChange={(e) =>
            onQueryChange({ ...query, search: e.target.value, page: 1 })
          }
        />
      </div>
      <Select
        value={query.type ?? "all"}
        aria-label="Filter by type"
        onChange={(e) =>
          onQueryChange({
            ...query,
            type: (e.target.value || "all") as NotificationType | "all",
            page: 1,
          })
        }
        className="w-auto h-9 text-xs"
      >
        <option value="all">All types</option>
        {NOTIFICATION_TYPE_FILTER_ORDER.map((t) => (
          <option key={t} value={t}>
            {notificationTypeLabel(t)}
          </option>
        ))}
      </Select>
      <Select
        value={query.category ?? "all"}
        aria-label="Filter by category"
        onChange={(e) =>
          onQueryChange({
            ...query,
            category: (e.target.value || "all") as NotificationCategory | "all",
            page: 1,
          })
        }
        className="w-auto h-9 text-xs"
      >
        <option value="all">All categories</option>
        {NOTIFICATION_CATEGORY_FILTER_ORDER.map((c) => (
          <option key={c} value={c}>
            {notificationCategoryLabel(c)}
          </option>
        ))}
      </Select>
      {hasActive && (
        <button
          type="button"
          onClick={() =>
            onQueryChange({ page: 1, pageSize: query.pageSize })
          }
          className="text-xs font-medium text-kampmax-blue hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
