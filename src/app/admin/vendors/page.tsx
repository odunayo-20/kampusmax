"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BadgeCheck, CheckCircle2, Inbox, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Pagination } from "@/components/admin/Pagination";
import {
  VendorsFilters,
  type VendorsFilterState,
  type VendorsCounts,
} from "@/components/admin/vendors/VendorsFilters";
import { VendorsTable } from "@/components/admin/vendors/VendorsTable";
import { VerificationReviewDialog } from "@/components/admin/vendors/VerificationReviewDialog";
import { ViewOwnerDialog } from "@/components/admin/vendors/ViewOwnerDialog";
import { ViewStoreDialog } from "@/components/admin/vendors/ViewStoreDialog";
import { useDebounce } from "@/hooks/use-debounce";
import { campusService, vendorManagementService } from "@/services/admin";
import { VENDOR_QUEUE_LABELS } from "@/components/admin/vendors/vendors-meta";
import type {
  ManagedVendor,
  Paginated,
  SortDir,
  VendorBucket,
} from "@/types/admin";
import type { ManagedVendorSortField } from "@/services/admin";

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: Paginated<ManagedVendor> };

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

function parseInitialFilters(
  params: URLSearchParams
): VendorsFilterState {
  const rawQueue = params.get("queue");
  const validQueues = Object.keys(VENDOR_QUEUE_LABELS) as (
    | VendorBucket
    | "all"
  )[];
  return {
    search: params.get("q") ?? "",
    queue:
      rawQueue && validQueues.includes(rawQueue as VendorBucket | "all")
        ? (rawQueue as VendorBucket | "all")
        : "all",
    campusId: params.get("campus") ?? "all",
    category: params.get("category") ?? "all",
  };
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={<VendorsSkeleton />}>
      <AdminVendorsPageInner />
    </Suspense>
  );
}

function AdminVendorsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ----- filters / query state -----
  const [filters, setFilters] = useState<VendorsFilterState>(() =>
    parseInitialFilters(new URLSearchParams(searchParams.toString()))
  );
  const [sortBy, setSortBy] = useState<ManagedVendorSortField>("registeredAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ----- data state -----
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [counts, setCounts] = useState<VendorsCounts | null>(null);
  const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // ----- overlays -----
  const [storeTarget, setStoreTarget] = useState<ManagedVendor | null>(null);
  const [ownerTarget, setOwnerTarget] = useState<ManagedVendor | null>(null);
  const [verificationTarget, setVerificationTarget] =
    useState<ManagedVendor | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<ManagedVendor | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ManagedVendor | null>(null);
  const [confirmWorking, setConfirmWorking] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  // Debounced search mirrors the campuses/users consoles.
  const debouncedFilters = useDebounce(filters.search.trim(), 350);
  const effectiveSearch = useMemo(
    () => ({ ...filters, search: debouncedFilters }),
    [filters, debouncedFilters]
  );

  const pushToast = useCallback((tone: ToastMessage["tone"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const loadList = useCallback(async () => {
    setList((prev) => (prev.status === "ready" ? prev : { status: "loading" }));
    try {
      const data = await vendorManagementService.list({
        search: effectiveSearch.search,
        queue: effectiveSearch.queue,
        campusId: effectiveSearch.campusId,
        category: effectiveSearch.category,
        sortBy,
        sortDir,
        page,
        pageSize,
      });
      setList({ status: "ready", data });
      setPage(data.page);
    } catch {
      setList({ status: "error" });
    }
  }, [effectiveSearch, sortBy, sortDir, page, pageSize]);

  const loadMeta = useCallback(async () => {
    try {
      const [nextCounts, allCampuses, nextCategories] = await Promise.all([
        vendorManagementService.getCounts(),
        campusService.list(),
        vendorManagementService.getCategories(),
      ]);
      setCounts(nextCounts);
      setCampuses(allCampuses.map((c) => ({ id: c.id, name: c.shortName })));
      setCategories(nextCategories);
    } catch {
      /* non-critical metadata */
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList, reloadKey]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta, reloadKey]);

  // ----- handlers -----

  const patchFilters = useCallback((patch: Partial<VendorsFilterState>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: ManagedVendorSortField) => {
      if (field === sortBy) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDir(field === "storeName" ? "asc" : "desc");
      }
      setPage(1);
    },
    [sortBy]
  );

  const refresh = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  async function approveVendor(vendor: ManagedVendor) {
    try {
      await vendorManagementService.approve(vendor.id);
      pushToast("success", `${vendor.storeName} verified - storefront is live.`);
      refresh();
    } catch {
      pushToast("error", `Couldn't approve ${vendor.storeName}. Try again.`);
    }
  }

  async function rejectVendor(vendor: ManagedVendor, reason: string) {
    try {
      await vendorManagementService.reject(vendor.id, reason);
      pushToast("success", `${vendor.storeName}'s application was rejected.`);
      refresh();
    } catch {
      pushToast("error", `Couldn't reject ${vendor.storeName}. Try again.`);
    }
  }

  async function activateVendor(vendor: ManagedVendor) {
    try {
      await vendorManagementService.activate(vendor.id);
      pushToast("success", `${vendor.storeName} is trading again.`);
      refresh();
    } catch {
      pushToast("error", `Couldn't activate ${vendor.storeName}. Try again.`);
    }
  }

  async function runSuspend() {
    if (!suspendTarget) return;
    setConfirmWorking(true);
    try {
      await vendorManagementService.suspend(suspendTarget.id);
      pushToast("success", `${suspendTarget.storeName} was suspended.`);
      refresh();
    } catch {
      pushToast("error", "The action failed. Try again.");
    } finally {
      setConfirmWorking(false);
      setSuspendTarget(null);
    }
  }

  async function runDeactivate() {
    if (!deactivateTarget) return;
    setConfirmWorking(true);
    try {
      await vendorManagementService.deactivate(deactivateTarget.id);
      pushToast("success", `${deactivateTarget.storeName} was deactivated.`);
      refresh();
    } catch {
      pushToast("error", "The action failed. Try again.");
    } finally {
      setConfirmWorking(false);
      setDeactivateTarget(null);
    }
  }

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.queue !== "all" ||
    filters.campusId !== "all" ||
    filters.category !== "all";

  const readyData = list.status === "ready" ? list.data : null;
  const campusNames = useMemo(
    () => Object.fromEntries(campuses.map((c) => [c.id, c.name])),
    [campuses]
  );

  return (
    <>
      <AdminPageHeader
        title="Vendors"
        description="Storefront verification, trading lifecycle and marketplace performance."
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
              <BadgeCheck className="h-3.5 w-3.5" />
              {counts ? `${counts.all} stores` : "…"}
            </span>
            <button
              type="button"
              onClick={() =>
                patchFilters({ queue: "pending_verification" })
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted"
            >
              <Inbox className="h-4 w-4" />
              Verification queue
              {(counts?.pending_verification ?? 0) > 0 && (
                <span className="rounded-full bg-kampmax-warning/15 px-1.5 py-px text-[10px] font-semibold tabular-nums text-amber-700">
                  {counts!.pending_verification}
                </span>
              )}
            </button>
          </>
        }
      />

      {/* Pending queue banner */}
      {!hasActiveFilters && (counts?.pending_verification ?? 0) > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kampmax-warning/40 bg-kampmax-warning/10 px-4 py-3">
          <p className="text-sm text-kampmax-text">
            <span className="font-semibold">
              {counts!.pending_verification} vendor
              {counts!.pending_verification === 1 ? "" : "s"}
            </span>{" "}
            awaiting document verification.
          </p>
          <a
            href="/admin/vendors/queue"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-kampmax-navy px-3 text-xs font-medium text-white transition-colors hover:bg-kampmax-navy/90"
          >
            Open queue
          </a>
        </div>
      )}

      <div className="mb-4">
        <VendorsFilters
          filters={filters}
          campuses={campuses}
          categories={categories}
          counts={counts}
          onChange={patchFilters}
        />
      </div>

      <VendorsTable
        campusNames={campusNames}
        page={readyData}
        loading={list.status === "loading"}
        error={list.status === "error"}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
        onRetry={() => setReloadKey((k) => k + 1)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() =>
          patchFilters({
            search: "",
            queue: "all",
            campusId: "all",
            category: "all",
          })
        }
        onViewStore={(v) => setStoreTarget(v)}
        onViewOwner={(v) => setOwnerTarget(v)}
        onReviewVerification={(v) => setVerificationTarget(v)}
        onApprove={(v) => void approveVendor(v)}
        onReject={(v) => setVerificationTarget(v)}
        onSuspend={(v) => setSuspendTarget(v)}
        onActivate={(v) => void activateVendor(v)}
        onDeactivate={(v) => setDeactivateTarget(v)}
      />

      {readyData && readyData.total > 0 && (
        <Pagination
          page={readyData.page}
          pageSize={pageSize}
          total={readyData.total}
          totalPages={readyData.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
        />
      )}

      {/* ---------- Overlays ---------- */}

      <ViewStoreDialog
        open={storeTarget !== null}
        vendor={storeTarget}
        campusName={
          storeTarget ? campusNames[storeTarget.campusId] : undefined
        }
        onClose={() => setStoreTarget(null)}
        onOpenProfile={(id) => {
          setStoreTarget(null);
          router.push(`/admin/vendors/${id}`);
        }}
      />

      <ViewOwnerDialog
        open={ownerTarget !== null}
        vendor={ownerTarget}
        onClose={() => setOwnerTarget(null)}
        onOpenProfile={(id) => {
          setOwnerTarget(null);
          router.push(`/admin/vendors/${id}`);
        }}
      />

      <VerificationReviewDialog
        key={verificationTarget?.id ?? "none"}
        open={verificationTarget !== null}
        vendor={verificationTarget}
        mode="review"
        onClose={() => setVerificationTarget(null)}
        onApprove={async (vendor) => {
          await approveVendor(vendor);
        }}
        onReject={async (vendor, reason) => {
          await rejectVendor(vendor, reason);
        }}
      />

      <ConfirmDialog
        open={suspendTarget !== null}
        title={`Suspend ${suspendTarget?.storeName ?? ""}?`}
        message="All listings are hidden and checkout is blocked immediately. The owner keeps account access and can appeal, but buyers can no longer place orders."
        confirmLabel="Suspend store"
        tone="warning"
        loading={confirmWorking}
        onConfirm={runSuspend}
        onCancel={() => setSuspendTarget(null)}
      />

      <ConfirmDialog
        open={deactivateTarget !== null}
        title={`Deactivate ${deactivateTarget?.storeName ?? ""}?`}
        message="The storefront goes offline for everyone. Unlike suspension this is a permanent off-switch - reactivation requires an explicit admin decision."
        confirmLabel="Deactivate store"
        tone="danger"
        loading={confirmWorking}
        onConfirm={runDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      {/* ---------- Toasts ---------- */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex max-w-sm items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm shadow-lg animate-[kampmax-fade-in_.18s_ease-out] ${
              t.tone === "success"
                ? "border-kampmax-success/30 bg-white text-kampmax-text"
                : "border-kampmax-error/30 bg-white text-kampmax-text"
            }`}
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

function VendorsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-kampmax-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      <div className="h-80 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
    </div>
  );
}
