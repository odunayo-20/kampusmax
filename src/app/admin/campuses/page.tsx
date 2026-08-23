"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, CheckCircle2, Plus, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Pagination } from "@/components/admin/Pagination";
import { CampusesFilters, type CampusesFilterState } from "@/components/admin/campuses/CampusesFilters";
import { CampusesTable } from "@/components/admin/campuses/CampusesTable";
import { CampusFormDialog } from "@/components/admin/campuses/CampusFormDialog";
import { useDebounce } from "@/hooks/use-debounce";
import { campusManagementService } from "@/services/admin";
import { CAMPUS_STATUS_LABELS } from "@/components/admin/campuses/campuses-meta";
import type {
  CampusCreateInput,
  CampusStatusCounts,
  ManagedCampus,
  Paginated,
  SortDir,
} from "@/types/admin";
import type { ManagedCampusSortField } from "@/services/admin";

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: Paginated<ManagedCampus> };

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

function parseInitialFilters(params: URLSearchParams): CampusesFilterState {
  const rawStatus = params.get("status");
  const status =
    rawStatus && rawStatus in CAMPUS_STATUS_LABELS
      ? (rawStatus as CampusStatusKeys)
      : "all";
  return {
    search: params.get("q") ?? "",
    state: params.get("state") ?? "all",
    status,
  };
}

type CampusStatusKeys = keyof typeof CAMPUS_STATUS_LABELS;

export default function AdminCampusesPage() {
  return (
    <Suspense fallback={<CampusesSkeleton />}>
      <AdminCampusesPageInner />
    </Suspense>
  );
}

function AdminCampusesPageInner() {
  const searchParams = useSearchParams();

  // ----- filters / query state -----
  const [filters, setFilters] = useState<CampusesFilterState>(() =>
    parseInitialFilters(new URLSearchParams(searchParams.toString()))
  );
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 350);
  const [sortBy, setSortBy] = useState<ManagedCampusSortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ----- data state -----
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [counts, setCounts] = useState<CampusStatusCounts | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // ----- overlays -----
  const [creating, setCreating] = useState(false);
  const [formCampus, setFormCampus] = useState<ManagedCampus | null>(null);
  const [savingForm, setSavingForm] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<ManagedCampus | null>(null);
  const [confirmWorking, setConfirmWorking] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  // Keep the debounced query in sync with the immediate input.
  useEffect(() => {
    setFilters((f) => (f.search === debouncedSearch ? f : { ...f, search: debouncedSearch }));
  }, [debouncedSearch]);

  const pushToast = useCallback((tone: ToastMessage["tone"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const loadList = useCallback(async () => {
    setList((prev) => (prev.status === "ready" ? prev : { status: "loading" }));
    try {
      const data = await campusManagementService.list({
        search: filters.search,
        state: filters.state,
        status: filters.status === "all" ? "all" : filters.status,
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
  }, [filters, sortBy, sortDir, page, pageSize]);

  const loadMeta = useCallback(async () => {
    try {
      const [nextCounts, nextStates] = await Promise.all([
        campusManagementService.getCounts(),
        campusManagementService.getStates(),
      ]);
      setCounts(nextCounts);
      setStates(nextStates);
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

  const patchFilters = useCallback((patch: Partial<CampusesFilterState>) => {
    if ("search" in patch) setSearchInput(patch.search ?? "");
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: ManagedCampusSortField) => {
      if (field === sortBy) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDir(field === "name" ? "asc" : "desc");
      }
      setPage(1);
    },
    [sortBy]
  );

  const refresh = useCallback(
    (message?: string) => {
      setReloadKey((k) => k + 1);
      if (message) pushToast("success", message);
    },
    [pushToast]
  );

  async function activateCampus(campus: ManagedCampus) {
    try {
      await campusManagementService.setStatus(campus.id, "active");
      refresh(`${campus.name} is live - trading reopened.`);
    } catch {
      pushToast("error", `Couldn't activate ${campus.name}. Try again.`);
    }
  }

  async function runDeactivate() {
    if (!deactivateTarget) return;
    setConfirmWorking(true);
    try {
      await campusManagementService.setStatus(deactivateTarget.id, "inactive");
      refresh(`${deactivateTarget.name} was deactivated.`);
    } catch {
      pushToast("error", "The action failed. Try again.");
    } finally {
      setConfirmWorking(false);
      setDeactivateTarget(null);
    }
  }

  async function saveForm(input: CampusCreateInput) {
    setSavingForm(true);
    try {
      if (formCampus) {
        const updated = await campusManagementService.update(formCampus.id, input);
        setFormCampus(null);
        refresh(`${updated.name} was updated.`);
      } else {
        const created = await campusManagementService.create(input);
        setCreating(false);
        refresh(`${created.name} was added to the network.`);
      }
    } catch {
      pushToast("error", "Couldn't save the campus. Try again.");
    } finally {
      setSavingForm(false);
    }
  }

  const hasActiveFilters =
    filters.search.trim() !== "" || filters.state !== "all" || filters.status !== "all";

  const readyData = list.status === "ready" ? list.data : null;

  return (
    <>
      <AdminPageHeader
        title="Campuses"
        description="Institutions on the Kampmax network - coverage, scale and lifecycle."
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
              <Building2 className="h-3.5 w-3.5" />
              {counts ? `${counts.all} campuses` : "…"}
            </span>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-3.5 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
            >
              <Plus className="h-4 w-4" />
              Add campus
            </button>
          </>
        }
      />

      <div className="mb-4">
        <CampusesFilters
          filters={{ ...filters, search: searchInput }}
          states={states}
          counts={counts}
          onChange={patchFilters}
        />
      </div>

      <CampusesTable
        page={readyData}
        loading={list.status === "loading"}
        error={list.status === "error"}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
        onRetry={() => setReloadKey((k) => k + 1)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => patchFilters({ search: "", state: "all", status: "all" })}
        onEdit={(campus) => setFormCampus(campus)}
        onActivate={activateCampus}
        onDeactivate={(campus) => setDeactivateTarget(campus)}
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

      <CampusFormDialog
        open={creating || formCampus !== null}
        campus={formCampus}
        states={states}
        saving={savingForm}
        onClose={() => {
          if (savingForm) return;
          setCreating(false);
          setFormCampus(null);
        }}
        onSave={saveForm}
      />

      <ConfirmDialog
        open={deactivateTarget !== null}
        title={`Deactivate ${deactivateTarget?.name ?? ""}?`}
        message="Listings stay intact but the marketplace pauses: students can't place orders and vendors can't receive new ones until the campus is reactivated."
        confirmLabel="Deactivate campus"
        tone="warning"
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

function CampusesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-kampmax-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      <div className="h-80 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
    </div>
  );
}
