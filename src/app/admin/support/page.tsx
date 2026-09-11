"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock3, Headphones, Inbox, Scale } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/admin/StatCard";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { SupportTicketsTable } from "@/components/admin/support/SupportTicketsTable";
import { SupportMetrics } from "@/components/admin/support/SupportMetrics";
import {
  SUPPORT_CATEGORY_FILTER_ORDER,
  SUPPORT_PRIORITY_FILTER_ORDER,
  SUPPORT_STATUS_FILTER_ORDER,
  supportCategoryLabel,
  supportPriorityLabel,
  supportStatusLabel,
} from "@/components/admin/support/support-meta";
import {
  useAdminSupportMetrics,
  useAdminSupportStaff,
  useAdminSupportTickets,
} from "@/hooks/admin/use-admin-support";
import { useDebounce } from "@/hooks/use-debounce";
import { communityCampusOptions } from "@/data/admin/community";
import type {
  SupportTicketCategory,
  SupportTicketListQuery,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/admin";

const PAGE_SIZE = 15;

const STATUS_KEYS = ["status"] as const;
const STATIC_KEYS = ["search", "priority", "category", "assigneeId", "campusId"] as const;

export default function AdminSupportPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="table" rows={6} />}>
      <SupportConsole />
    </Suspense>
  );
}

function parseInitialStatus(params: URLSearchParams) {
  const raw = params.get("status");
  return SUPPORT_STATUS_FILTER_ORDER.includes(raw as SupportTicketStatus)
    ? (raw as SupportTicketStatus)
    : "all";
}

function readInitialFilters(params: URLSearchParams) {
  const state: {
    search: string;
    status: SupportTicketStatus | "all";
    priority: SupportTicketPriority | "all";
    category: SupportTicketCategory | "all";
    assigneeId: string;
    campusId: string;
  } = {
    search: params.get("search") ?? "",
    status: parseInitialStatus(params),
    priority: (SUPPORT_PRIORITY_FILTER_ORDER.includes(
      params.get("priority") as SupportTicketPriority
    )
      ? params.get("priority")
      : "all") as SupportTicketPriority | "all",
    category: (SUPPORT_CATEGORY_FILTER_ORDER.includes(
      params.get("category") as SupportTicketCategory
    )
      ? params.get("category")
      : "all") as SupportTicketCategory | "all",
    assigneeId: params.get("assigneeId") ?? "all",
    campusId: params.get("campusId") ?? "all",
  };
  return state;
}

function SupportConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilters = useMemo(
    () => readInitialFilters(searchParams),
    [searchParams]
  );
  const [filters, setFilters] = useState(initialFilters);
  const debouncedSearch = useDebounce(filters.search.trim(), 350);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filters.status,
    filters.priority,
    filters.category,
    filters.assigneeId,
    filters.campusId,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set("search", filters.search.trim());
    for (const key of [...STATIC_KEYS, ...STATUS_KEYS] as const) {
      const value = filters[key];
      if (typeof value === "string" && value && value !== "all" && key !== "search") {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/admin/support", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, router]);

  const query = useMemo<SupportTicketListQuery>(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status,
      priority: filters.priority,
      category: filters.category,
      assigneeId: filters.assigneeId,
      campusId: filters.campusId,
      sortBy: "createdAt",
      sortDir: "desc",
      page,
      pageSize: PAGE_SIZE,
    }),
    [
      debouncedSearch,
      filters.status,
      filters.priority,
      filters.category,
      filters.assigneeId,
      filters.campusId,
      page,
    ]
  );

  const tickets = useAdminSupportTickets(query);
  const metrics = useAdminSupportMetrics();
  const staff = useAdminSupportStaff();

  const hasActiveFilters =
    debouncedSearch.length > 0 ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all" ||
    filters.assigneeId !== "all" ||
    filters.campusId !== "all";

  const campusOptions = communityCampusOptions();
  const openCount = metrics.data?.open ?? 0;

  function clearFilters() {
    setFilters({
      search: "",
      status: "all",
      priority: "all",
      category: "all",
      assigneeId: "all",
      campusId: "all",
    });
    setPage(1);
  }

  return (
    <>
      <AdminPageHeader
        title="Support"
        description="Resolve customer service tickets end-to-end: triage, respond, assign, escalate and track outcomes. Every action is audited."
        actions={
          metrics.data && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary">
                <Inbox className="h-3.5 w-3.5 opacity-60" />
                {openCount} open
              </span>
              <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary">
                <Scale className="h-3.5 w-3.5 opacity-60" />
                {metrics.data.escalated} escalated
              </span>
            </div>
          )
        }
      />

      <SupportMetrics metrics={metrics.data} loading={metrics.isLoading} />

      {/* Status tabs */}
      <div className="mt-3">
        <div
          role="tablist"
          aria-label="Filter tickets by status"
          className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
        >
          {(["all", ...SUPPORT_STATUS_FILTER_ORDER] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={filters.status === tab}
              onClick={() => {
                setFilters((f) => ({ ...f, status: tab }));
                setPage(1);
              }}
              className={cn_tab(filters.status === tab)}
            >
              {tab === "all" ? "All" : supportStatusLabel(tab)}
              {metrics.data && (
                <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums">
                  {tab === "all"
                    ? metrics.data.byStatus.reduce((a, s) => a + s.count, 0)
                    : metrics.data.byStatus.find((s) => s.status === tab)?.count ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="my-3 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-56">
          <Input
            value={filters.search}
            placeholder="Search ticket, customer or order…"
            aria-label="Search support tickets"
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
          />
        </div>
        <Select
          value={filters.priority}
          aria-label="Filter by priority"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              priority: e.target.value as SupportTicketPriority | "all",
            }))
          }
          className="h-9 w-auto text-xs"
        >
          <option value="all">All priorities</option>
          {SUPPORT_PRIORITY_FILTER_ORDER.map((p) => (
            <option key={p} value={p}>
              {supportPriorityLabel(p)}
            </option>
          ))}
        </Select>
        <Select
          value={filters.category}
          aria-label="Filter by category"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              category: e.target.value as SupportTicketCategory | "all",
            }))
          }
          className="h-9 w-auto text-xs"
        >
          <option value="all">All categories</option>
          {SUPPORT_CATEGORY_FILTER_ORDER.map((c) => (
            <option key={c} value={c}>
              {supportCategoryLabel(c)}
            </option>
          ))}
        </Select>
        <Select
          value={filters.assigneeId}
          aria-label="Filter by assignee"
          onChange={(e) =>
            setFilters((f) => ({ ...f, assigneeId: e.target.value }))
          }
          className="h-9 w-auto text-xs"
        >
          <option value="all">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {(staff.data ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          value={filters.campusId}
          aria-label="Filter by campus"
          onChange={(e) =>
            setFilters((f) => ({ ...f, campusId: e.target.value }))
          }
          className="h-9 max-w-[170px] text-xs"
        >
          <option value="all">All campuses</option>
          {campusOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.shortName} - {c.name}
            </option>
          ))}
        </Select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-kampmax-blue hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <SupportTicketsTable
        items={tickets.data?.items ?? []}
        loading={tickets.isLoading}
        error={tickets.isError}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => void tickets.refetch()}
        onClearFilters={clearFilters}
      />

      {tickets.data && tickets.data.totalPages > 1 && (
        <Pagination
          page={tickets.data.page}
          pageSize={tickets.data.pageSize}
          total={tickets.data.total}
          totalPages={tickets.data.totalPages}
          onPageChange={setPage}
          className="mt-3 rounded-lg border border-kampmax-border bg-white"
          unitLabel="tickets"
        />
      )}
    </>
  );
}

function cn_tab(active: boolean): string {
  return [
    "-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-1.5 text-[13px] font-medium transition-colors",
    active
      ? "border-kampmax-blue text-kampmax-blue"
      : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text",
  ].join(" ");
}