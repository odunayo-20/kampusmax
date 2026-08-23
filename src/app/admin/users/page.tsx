"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Users, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  ConfirmDialog,
  DeactivateConfirm,
  ResetStateConfirm,
  SuspendConfirm,
} from "@/components/admin/ConfirmDialog";
import { Pagination } from "@/components/admin/Pagination";
import { EditUserDialog } from "@/components/admin/users/EditUserDialog";
import { UserProfileDrawer, type DrawerTab } from "@/components/admin/users/UserProfileDrawer";
import { UsersFilters, type UsersFilterState } from "@/components/admin/users/UsersFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { useDebounce } from "@/hooks/use-debounce";
import { mockCampuses } from "@/data/admin/campuses";
import { userManagementService } from "@/services/admin";
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from "@/components/admin/users/users-meta";
import type {
  ManagedUser,
  ManagedUserRole,
  ManagedUserStatus,
  ManagedUserUpdateInput,
  Paginated,
  SortDir,
  UserStatusCounts,
} from "@/types/admin";
import type { ManagedUserSortField } from "@/services/admin";

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: Paginated<ManagedUser> };

type PendingConfirm = {
  kind: "suspend" | "deactivate" | "reset";
  user: ManagedUser;
};

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

const CAMPUS_OPTIONS = mockCampuses
  .filter((c) => c.status === "active")
  .map((c) => ({ id: c.id, label: c.shortName }));

const CAMPUS_NAMES: Record<string, string> = Object.fromEntries(
  mockCampuses.map((c) => [c.id, c.shortName])
);

function parseInitialFilters(params: URLSearchParams): UsersFilterState {
  const rawStatus = params.get("status");
  const status =
    rawStatus && rawStatus in USER_STATUS_LABELS ? (rawStatus as ManagedUserStatus) : "all";
  const rawRole = params.get("role");
  const role =
    rawRole && rawRole in USER_ROLE_LABELS ? (rawRole as ManagedUserRole) : "all";
  return {
    search: params.get("q") ?? "",
    role,
    campusId: params.get("campus") ?? "all",
    status,
  };
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <AdminUsersPageInner />
    </Suspense>
  );
}

function AdminUsersPageInner() {
  const searchParams = useSearchParams();

  // ----- filters / query state -----
  const [filters, setFilters] = useState<UsersFilterState>(() =>
    parseInitialFilters(new URLSearchParams(searchParams.toString()))
  );
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 350);
  const [sortBy, setSortBy] = useState<ManagedUserSortField>("joinedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ----- data state -----
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [counts, setCounts] = useState<UserStatusCounts | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // ----- overlays -----
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
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
      const data = await userManagementService.list({
        search: filters.search,
        role: filters.role,
        campusId: filters.campusId,
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

  const loadCounts = useCallback(async () => {
    try {
      setCounts(await userManagementService.getCounts());
    } catch {
      /* counts are non-critical */
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList, reloadKey]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts, reloadKey]);

  // ----- handlers -----

  const patchFilters = useCallback((patch: Partial<UsersFilterState>) => {
    if ("search" in patch) setSearchInput(patch.search ?? "");
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (field: ManagedUserSortField) => {
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

  const afterMutation = useCallback(
    (message: string) => {
      setReloadKey((k) => k + 1);
      setRefreshKey((k) => k + 1);
      pushToast("success", message);
    },
    [pushToast]
  );

  async function activateUser(user: ManagedUser) {
    try {
      await userManagementService.setStatus(user.id, "active");
      afterMutation(`${user.name} can sign in again - account activated.`);
    } catch {
      pushToast("error", `Couldn't activate ${user.name}. Try again.`);
    }
  }

  function openDrawer(user: ManagedUser, tab: DrawerTab = "overview") {
    setDrawerTab(tab);
    setDrawerUserId(user.id);
  }

  async function runConfirmedAction() {
    if (!pendingConfirm) return;
    const { kind, user } = pendingConfirm;
    setConfirmWorking(true);
    try {
      if (kind === "suspend") {
        await userManagementService.setStatus(user.id, "suspended");
        afterMutation(`${user.name} has been suspended.`);
      } else if (kind === "deactivate") {
        await userManagementService.setStatus(user.id, "deactivated");
        afterMutation(`${user.name}'s account was deactivated.`);
      } else {
        await userManagementService.resetAccountState(user.id);
        afterMutation(`${user.name}'s account state was reset.`);
      }
    } catch {
      pushToast("error", "The action failed. Try again.");
    } finally {
      setConfirmWorking(false);
      setPendingConfirm(null);
    }
  }

  async function saveEdit(patch: ManagedUserUpdateInput) {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const updated = await userManagementService.update(editingUser.id, patch);
      setEditingUser(null);
      afterMutation(`${updated.name} was updated successfully.`);
    } catch {
      pushToast("error", "Couldn't save changes. Try again.");
    } finally {
      setSavingEdit(false);
    }
  }

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.role !== "all" ||
    filters.campusId !== "all" ||
    filters.status !== "all";

  const readyData = list.status === "ready" ? list.data : null;

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Every account on Kampmax - customers, vendors and staff."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
            <Users className="h-3.5 w-3.5" />
            {counts ? `${counts.all.toLocaleString("en-NG")} total accounts` : "…"}
          </span>
        }
      />

      <div className="mb-4">
        <UsersFilters
          filters={{ ...filters, search: searchInput }}
          campuses={CAMPUS_OPTIONS}
          counts={counts}
          onChange={patchFilters}
        />
      </div>

      <UsersTable
        page={readyData}
        loading={list.status === "loading"}
        error={list.status === "error"}
        campusNames={CAMPUS_NAMES}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={toggleSort}
        onRetry={() => setReloadKey((k) => k + 1)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() =>
          patchFilters({ search: "", role: "all", campusId: "all", status: "all" })
        }
        onView={(u) => openDrawer(u)}
        onEdit={(u) => setEditingUser(u)}
        onViewActivity={(u) => openDrawer(u, "activity")}
        onSuspend={(u) => setPendingConfirm({ kind: "suspend", user: u })}
        onActivate={activateUser}
        onDeactivate={(u) => setPendingConfirm({ kind: "deactivate", user: u })}
        onResetState={(u) => setPendingConfirm({ kind: "reset", user: u })}
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

      <UserProfileDrawer
        userId={drawerUserId}
        initialTab={drawerTab}
        refreshKey={refreshKey}
        onClose={() => setDrawerUserId(null)}
        onView={(u) => {
          setDrawerUserId(null);
          setTimeout(() => openDrawer(u), 30);
        }}
        onEdit={(u) => setEditingUser(u)}
        onViewActivity={(u) => openDrawer(u, "activity")}
        onSuspend={(u) => setPendingConfirm({ kind: "suspend", user: u })}
        onActivate={activateUser}
        onDeactivate={(u) => setPendingConfirm({ kind: "deactivate", user: u })}
        onResetState={(u) => setPendingConfirm({ kind: "reset", user: u })}
      />

      <EditUserDialog
        open={editingUser !== null}
        user={editingUser}
        campuses={CAMPUS_OPTIONS}
        saving={savingEdit}
        onClose={() => !savingEdit && setEditingUser(null)}
        onSave={saveEdit}
      />

      {/* Confirmation dialogs (destructive actions only) */}
      <SuspendConfirm
        open={pendingConfirm?.kind === "suspend"}
        userName={pendingConfirm?.user.name ?? ""}
        loading={confirmWorking}
        onConfirm={runConfirmedAction}
        onCancel={() => setPendingConfirm(null)}
      />
      <DeactivateConfirm
        open={pendingConfirm?.kind === "deactivate"}
        userName={pendingConfirm?.user.name ?? ""}
        loading={confirmWorking}
        onConfirm={runConfirmedAction}
        onCancel={() => setPendingConfirm(null)}
      />
      <ResetStateConfirm
        open={pendingConfirm?.kind === "reset"}
        userName={pendingConfirm?.user.name ?? ""}
        loading={confirmWorking}
        onConfirm={runConfirmedAction}
        onCancel={() => setPendingConfirm(null)}
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

function UsersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-kampmax-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      <div className="h-96 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
    </div>
  );
}
