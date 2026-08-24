"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  Flag,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { cn, formatDateShort } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { ReviewsTable } from "@/components/admin/reviews/ReviewsTable";
import { ReviewDetailDialog } from "@/components/admin/reviews/ReviewDetailDialog";
import {
  REVIEW_STATUS_FILTER_ORDER,
  reviewStatusLabel,
} from "@/components/admin/reviews/reviews-meta";
import { reviewManagementService } from "@/services/admin";
import { communityCampusOptions } from "@/data/admin/community";
import type {
  CommunitySectionCounts,
  ManagedReview,
  ManagedReviewStatus,
  Paginated,
} from "@/types/admin";

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="table" rows={6} />}>
      <ReviewsConsole />
    </Suspense>
  );
}

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

type PendingAction =
  | { kind: "hide"; r: ManagedReview }
  | { kind: "restore"; r: ManagedReview }
  | { kind: "remove"; r: ManagedReview }
  | null;

type RatingFilter = 1 | 2 | 3 | 4 | 5 | "all";

function parseInitialStatus(params: { get(name: string): string | null }) {
  const raw = params.get("status");
  return REVIEW_STATUS_FILTER_ORDER.includes(raw as ManagedReviewStatus)
    ? (raw as ManagedReviewStatus)
    : "all";
}

const CAMPUS_OPTIONS = communityCampusOptions();

function ReviewsConsole() {
  const searchParams = useSearchParams();

  // ----- filters -----
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim(), 350);
  const [status, setStatus] = useState<ManagedReviewStatus | "all">(() =>
    parseInitialStatus(searchParams)
  );
  const [rating, setRating] = useState<RatingFilter>("all");
  const [vendorId, setVendorId] = useState("all");
  const [campusId, setCampusId] = useState("all");
  const [purchase, setPurchase] = useState<"all" | "verified" | "unverified">(
    "all"
  );
  const [reportedOnly, setReportedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // ----- data -----
  const [list, setList] = useState<Paginated<ManagedReview> | null>(null);
  const [counts, setCounts] =
    useState<CommunitySectionCounts<ManagedReviewStatus> | null>(null);
  const [vendorOptions, setVendorOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ----- overlays -----
  const [detailTarget, setDetailTarget] = useState<{
    id: string;
    focusReports?: boolean;
  } | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [working, setWorking] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  function pushToast(tone: ToastMessage["tone"], text: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }

  // Keep the URL shareable without re-render loops.
  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : "/admin/reviews");
  }, [status]);

  const loadMeta = useCallback(async () => {
    try {
      const [c, v] = await Promise.all([
        reviewManagementService.getCounts(),
        reviewManagementService.getVendorOptions(),
      ]);
      setCounts(c);
      setVendorOptions(v);
    } catch {
      /* non-critical */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await reviewManagementService.list({
        search: search || undefined,
        status,
        rating,
        vendorId,
        campusId,
        purchase,
        reportedOnly,
        page,
        pageSize,
      });
      setList(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, rating, vendorId, campusId, purchase, reportedOnly, page, pageSize]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  // ----- mutations -----

  async function runModeration(action: NonNullable<PendingAction>) {
    setWorking(true);
    try {
      if (action.kind === "hide") {
        await reviewManagementService.setStatus(action.r.id, "hidden");
        pushToast(
          "success",
          `Review ${action.r.id.toUpperCase()} hidden from the product page.`
        );
      } else if (action.kind === "restore") {
        await reviewManagementService.setStatus(action.r.id, "published");
        pushToast(
          "success",
          `Review ${action.r.id.toUpperCase()} restored to the product page.`
        );
      } else {
        await reviewManagementService.setStatus(action.r.id, "removed");
        pushToast(
          "success",
          `Review ${action.r.id.toUpperCase()} removed for policy violation.`
        );
      }
      setPending(null);
      await Promise.all([loadList(), loadMeta()]);
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't update that review."
      );
    } finally {
      setWorking(false);
    }
  }

  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    status !== "all" ||
    rating !== "all" ||
    vendorId !== "all" ||
    campusId !== "all" ||
    purchase !== "all" ||
    reportedOnly;

  function clearFilters() {
    setSearchInput("");
    setStatus("all");
    setRating("all");
    setVendorId("all");
    setCampusId("all");
    setPurchase("all");
    setReportedOnly(false);
  }

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Moderate product and vendor feedback, verify purchases and triage abuse reports."
        actions={
          counts && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary">
                <Star className="h-3.5 w-3.5 opacity-60" />
                {counts.all.toLocaleString("en-NG")} total reviews
              </span>
              <span
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-md border bg-white px-3 text-xs font-medium",
                  counts.byStatus.reported + counts.byStatus.under_review > 0
                    ? "border-red-200 bg-red-50 text-kampmax-error"
                    : "border-kampmax-border text-kampmax-text-secondary"
                )}
              >
                <Flag className="h-3.5 w-3.5 opacity-70" />
                {counts.byStatus.reported + counts.byStatus.under_review} need attention
              </span>
            </div>
          )
        }
      />

      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter reviews by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        {(["all", ...REVIEW_STATUS_FILTER_ORDER] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={status === tab}
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={cn(
              "-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-1.5 text-[13px] font-medium transition-colors",
              status === tab
                ? "border-kampmax-blue text-kampmax-blue"
                : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
            )}
          >
            {tab === "all" ? "All" : reviewStatusLabel(tab)}
            {counts && (
              <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums">
                {tab === "all" ? counts.all : counts.byStatus[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="my-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-56">
            <Input
              value={searchInput}
              placeholder="Search reviewer, product or text…"
              leftIcon={<Search className="h-4 w-4" />}
              aria-label="Search reviews"
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={rating === "all" ? "all" : String(rating)}
            aria-label="Filter by rating"
            onChange={(e) => {
              setRating(
                e.target.value === "all"
                  ? "all"
                  : (Number(e.target.value) as RatingFilter)
              );
              setPage(1);
            }}
            className="w-auto h-9 text-xs"
          >
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? "" : "s"}
              </option>
            ))}
          </Select>
          <Select
            value={vendorId}
            aria-label="Filter by vendor"
            onChange={(e) => {
              setVendorId(e.target.value);
              setPage(1);
            }}
            className="h-9 max-w-[190px] text-xs"
          >
            <option value="all">All vendors</option>
            {vendorOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
          <Select
            value={campusId}
            aria-label="Filter by campus"
            onChange={(e) => {
              setCampusId(e.target.value);
              setPage(1);
            }}
            className="h-9 max-w-[170px] text-xs"
          >
            <option value="all">All campuses</option>
            {CAMPUS_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName} - {c.name}
              </option>
            ))}
          </Select>
          <button
            type="button"
            role="switch"
            aria-checked={reportedOnly}
            onClick={() => {
              setReportedOnly((v) => !v);
              setPage(1);
            }}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
              reportedOnly
                ? "border-kampmax-error/30 bg-kampmax-error/10 text-kampmax-error"
                : "border-kampmax-border bg-white text-kampmax-text-secondary hover:bg-kampmax-muted/60"
            )}
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            Reported only
          </button>
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Verified / unverified segmented toggle */}
          <div
            role="radiogroup"
            aria-label="Filter by purchase verification"
            className="inline-flex overflow-hidden rounded-md border border-kampmax-border bg-white text-xs"
          >
            {(
              [
                { key: "all", label: "Any purchase" },
                {
                  key: "verified",
                  label: "Verified",
                  icon: BadgeCheck,
                },
                { key: "unverified", label: "Unverified" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={purchase === opt.key}
                onClick={() => {
                  setPurchase(opt.key);
                  setPage(1);
                }}
                className={cn(
                  "inline-flex h-8 items-center gap-1 px-2.5 font-medium transition-colors",
                  purchase === opt.key
                    ? "bg-kampmax-navy text-white"
                    : "text-kampmax-text-secondary hover:bg-kampmax-muted/60"
                )}
              >
                {"icon" in opt && opt.icon && <opt.icon className="h-3 w-3" aria-hidden />}
                {opt.label}
              </button>
            ))}
          </div>
          <span className="hidden text-xs tabular-nums text-kampmax-text-secondary lg:inline">
            {list ? `${list.total.toLocaleString("en-NG")} reviews match` : ""}
          </span>
        </div>
      </div>

      {/* Table + pagination */}
      <ReviewsTable
        items={list?.items ?? []}
        loading={loading && !list}
        error={error}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => void loadList()}
        onClearFilters={clearFilters}
        onView={(r) => setDetailTarget({ id: r.id })}
        onHide={(r) => setPending({ kind: "hide", r })}
        onRestore={(r) => setPending({ kind: "restore", r })}
        onRemove={(r) => setPending({ kind: "remove", r })}
        onInvestigate={(r) => setDetailTarget({ id: r.id, focusReports: true })}
      />

      {list && list.totalPages > 1 && (
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={list.total}
          totalPages={list.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPage(1);
            setPageSize(n);
          }}
          className="mt-3 rounded-lg border border-kampmax-border bg-white"
        />
      )}

      {/* View review / investigate reports */}
      <ReviewDetailDialog
        reviewId={detailTarget?.id ?? null}
        focusReports={detailTarget?.focusReports}
        onClose={() => setDetailTarget(null)}
        onToast={pushToast}
        onMutated={() => void Promise.all([loadList(), loadMeta()])}
      />

      {/* Moderation confirmations */}
      <ConfirmDialog
        open={pending?.kind === "hide"}
        title={`Hide this review?`}
        message={
          pending?.kind === "hide"
            ? `“${formatDateShort(pending.r.createdAt)}” review of “${pending.r.targetTitle}” disappears from the product page immediately but stays recoverable. The reviewer can appeal.`
            : ""
        }
        confirmLabel="Hide review"
        tone="warning"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending?.kind === "restore"}
        title="Restore this review?"
        message={
          pending?.kind === "restore"
            ? "The review returns to the product page as published. Any open reports stay open until you triage them."
            : ""
        }
        confirmLabel="Restore review"
        tone="default"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending?.kind === "remove"}
        title="Remove this review?"
        message={
          pending?.kind === "remove"
            ? "This permanently removes the review and records a policy violation on the reviewer's account."
            : ""
        }
        confirmLabel="Remove review"
        tone="danger"
        loading={working}
        onConfirm={() => pending && void runModeration(pending)}
        onCancel={() => setPending(null)}
      />

      {/* Toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex max-w-sm items-start gap-2 rounded-lg border border-kampmax-border bg-white px-3.5 py-2.5 text-sm shadow-lg animate-[kampmax-fade-in_.18s_ease-out]"
          >
            {t.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-success" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-error" />
            )}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
