"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminErrorMessage } from "@/lib/admin/error-reporting";
import { Pagination } from "@/components/admin/Pagination";
import {
  VerificationFilters,
  DEFAULT_VERIFICATION_FILTERS,
  type VerificationFilterState,
} from "@/components/admin/verifications/VerificationFilters";
import { VerificationsTable } from "@/components/admin/verifications/VerificationsTable";
import { VERIFICATION_STATUS_TABS, VERIFICATION_STATUS_LABELS } from "@/components/admin/verifications/verifications-meta";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAdminVerifications,
  useAdminVerificationCounts,
} from "@/hooks/admin/use-admin-verifications";
import type {
  ManagedVerificationApplicantType,
  ManagedVerificationSortField,
  ManagedVerificationStatus,
  ManagedVerificationType,
  SortDir,
} from "@/types/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";

function parseInitialFilters(params: URLSearchParams): VerificationFilterState {
  const rawStatus = params.get("status");
  const validStatus = VERIFICATION_STATUS_TABS as (ManagedVerificationStatus | "all")[];
  const rawApplicant = params.get("type");
  const validApplicant = ["all", "vendor", "freelancer", "employer"] as (ManagedVerificationApplicantType | "all")[];
  const rawVerificationType = params.get("vtype");
  const validVType = ["all", "identity", "business", "address", "email", "professional"] as (ManagedVerificationType | "all")[];
  return {
    search: params.get("q") ?? "",
    status:
      rawStatus && validStatus.includes(rawStatus as ManagedVerificationStatus | "all")
        ? (rawStatus as ManagedVerificationStatus | "all")
        : "all",
    applicantType:
      rawApplicant && validApplicant.includes(rawApplicant as ManagedVerificationApplicantType | "all")
        ? (rawApplicant as ManagedVerificationApplicantType | "all")
        : "all",
    verificationType:
      rawVerificationType && validVType.includes(rawVerificationType as ManagedVerificationType | "all")
        ? (rawVerificationType as ManagedVerificationType | "all")
        : "all",
    campusId: params.get("campus") ?? "all",
  };
}

function parseInitialPage(params: URLSearchParams): number {
  const rawPage = Number.parseInt(params.get("page") ?? "", 10);
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
}

export default function AdminVerificationsPage() {
  return (
    <Suspense fallback={<VerificationsSkeleton />}>
      <AdminVerificationsPageInner />
    </Suspense>
  );
}

function AdminVerificationsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { admin } = useAdminSession();
  const isCampusScoped = admin?.role === "CAMPUS_ADMIN";

  const [filters, setFilters] = useState<VerificationFilterState>(() => {
    const initial = parseInitialFilters(new URLSearchParams(searchParams.toString()));
    if (isCampusScoped) initial.campusId = "all";
    return initial;
  });
  const [sortBy, setSortBy] = useState<ManagedVerificationSortField>("applicantName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(() =>
    parseInitialPage(new URLSearchParams(searchParams.toString()))
  );
  const [pageSize] = useState(10);

  const debouncedSearch = useDebounce(filters.search.trim(), 350);
  const query = useMemo(
    () => ({
      search: debouncedSearch,
      status: filters.status === "all" ? undefined : filters.status,
      applicantType: filters.applicantType === "all" ? undefined : filters.applicantType,
      verificationType: filters.verificationType === "all" ? undefined : filters.verificationType,
      campusId: filters.campusId === "all" ? undefined : filters.campusId,
      sortBy,
      sortDir,
      page,
      pageSize,
    }),
    [debouncedSearch, filters, sortBy, sortDir, page, pageSize]
  );

  const { data, isLoading, error, refetch } = useAdminVerifications(query);
  const countsQuery = useAdminVerificationCounts();

  // Sync non-sensitive filters to URL (debounced to avoid history spam).
  const urlParams = searchParams.toString();
  useEffect(() => {
    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      if (filters.search.trim()) sp.set("q", filters.search.trim());
      if (filters.status !== "all") sp.set("status", filters.status);
      if (filters.applicantType !== "all") sp.set("type", filters.applicantType);
      if (filters.verificationType !== "all") sp.set("vtype", filters.verificationType);
      if (!isCampusScoped && filters.campusId !== "all") sp.set("campus", filters.campusId);
      if (page > 1) sp.set("page", String(page));
      const next = sp.toString();
      if (next !== urlParams) router.replace(`${pathname}?${next}`, { scroll: false });
    }, 350);
    return () => clearTimeout(timer);
  }, [filters, page, urlParams, router, pathname, isCampusScoped]);

  const patchFilters = useCallback((patch: Partial<VerificationFilterState>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: ManagedVerificationSortField) => {
      if (field === sortBy) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDir(field === "applicantName" ? "asc" : "desc");
      }
      setPage(1);
    },
    [sortBy]
  );

  const counts = countsQuery.data ?? null;
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.applicantType !== "all" ||
    filters.verificationType !== "all" ||
    filters.campusId !== "all";

  const clearFilters = useCallback(() => {
    patchFilters(DEFAULT_VERIFICATION_FILTERS);
  }, [patchFilters]);

  return (
    <>
      <AdminPageHeader
        title="Verifications"
        description="Unified view over the real vendor, freelancer and employer verification state. Vendor approve/reject delegates to the vendor console."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
            <BadgeCheck className="h-3.5 w-3.5" />
            {counts ? `${counts.all} rows` : "…"}
          </span>
        }
      />

      {/* Pipeline summary */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-kampmax-border bg-white px-4 py-2.5 text-xs text-kampmax-text-secondary">
        <span>
          Awaiting review{" "}
          <strong className="font-semibold tabular-nums text-kampmax-info">
            {counts?.byStatus.awaiting_review ?? "…"}
          </strong>
        </span>
        <span>
          Verified{" "}
          <strong className="font-semibold tabular-nums text-kampmax-success">
            {counts?.byStatus.verified ?? "…"}
          </strong>
        </span>
        <span>
          Rejected{" "}
          <strong className="font-semibold tabular-nums text-kampmax-error">
            {counts?.byStatus.rejected ?? "…"}
          </strong>
        </span>
        <span>
          Action required{" "}
          <strong className="font-semibold tabular-nums text-kampmax-warning">
            {counts?.byStatus.action_required ?? "…"}
          </strong>
        </span>
        <span className="text-kampmax-border">•</span>
        <span>
          Vendors{" "}
          <strong className="font-semibold tabular-nums">{counts?.byApplicantType.vendor ?? "…"}</strong>
        </span>
        <span>
          Freelancers{" "}
          <strong className="font-semibold tabular-nums">{counts?.byApplicantType.freelancer ?? "…"}</strong>
        </span>
        <span>
          Employers{" "}
          <strong className="font-semibold tabular-nums">{counts?.byApplicantType.employer ?? "…"}</strong>
        </span>
        <span className="text-kampmax-border">•</span>
        <span>
          With documents{" "}
          <strong className="font-semibold tabular-nums">{counts?.withDocuments ?? "…"}</strong>
        </span>
      </div>

      {isCampusScoped && admin?.campusId && (
        <div className="mb-4 rounded-lg border border-kampmax-info/30 bg-kampmax-info/5 px-4 py-2.5 text-xs text-kampmax-text-secondary">
          Campus-scoped view — only showing verifications from{" "}
          <strong className="font-medium">{admin.campusId}</strong>.
        </div>
      )}

      <VerificationFilters
        filters={filters}
        onChange={patchFilters}
        counts={counts?.byStatus ?? { awaiting_review: 0, verified: 0, rejected: 0, action_required: 0 }}
        hideCampus={isCampusScoped}
      />

      {hasActiveFilters && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="rounded-md border border-kampmax-border px-2.5 py-1 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="mt-4">
        {isLoading && !data ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-kampmax-surface-hover" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-kampmax-error/30 bg-kampmax-error/5 p-6 text-center">
            <p className="text-sm font-medium text-kampmax-error">Failed to load verifications</p>
            <p className="mt-1 text-xs text-kampmax-text-muted">{adminErrorMessage(error)}</p>
            <button
              onClick={() => void refetch()}
              className="mt-3 rounded-md bg-kampmax-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-kampmax-primary/90"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <VerificationsTable
              rows={data?.items ?? []}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={toggleSort}
              onOpen={(id) => router.push(`/admin/verifications/${id}`)}
              emptyHint={
                hasActiveFilters
                  ? "No verification rows match the current filters."
                  : "No verification data on this platform yet."
              }
            />

            {data && data.totalPages > 1 && (
              <div className="mt-4 flex justify-end">
                <Pagination
                  page={data.page}
                  pageSize={data.pageSize}
                  total={data.total}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function VerificationsSkeleton() {
  return (
    <>
      <div className="mb-6 h-10 w-48 animate-pulse rounded bg-kampmax-surface-hover" />
      <div className="mb-4 h-6 w-full animate-pulse rounded bg-kampmax-surface-hover" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-kampmax-surface-hover" />
        ))}
      </div>
    </>
  );
}
