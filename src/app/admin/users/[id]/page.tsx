"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Flag,
  History,
  Lock,
  Pencil,
  Power,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira, formatNairaCompact } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  DeactivateConfirm,
  ResetStateConfirm,
  SuspendConfirm,
} from "@/components/admin/ConfirmDialog";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EditUserDialog } from "@/components/admin/users/EditUserDialog";
import {
  ActivityTimeline,
  DrawerOrdersList,
  ReportList,
} from "@/components/admin/users/UserDetailSections";
import { UserProfileOverview } from "@/components/admin/users/UserProfileOverview";
import { UserAvatar, UserRoleBadge, UserStatusBadge } from "@/components/admin/users/UserBadges";
import { getActionAvailability } from "@/components/admin/users/users-meta";
import {
  useAdminUser,
  useAdminUserActivity,
  useAdminUserResetStateMutation,
  useAdminUserSetStatusMutation,
  useAdminUserUpdateMutation,
} from "@/hooks/admin/use-admin-users";
import { useActionGuard } from "@/hooks/admin/use-action-guard";
import type { ManagedUserStatus, ManagedUserUpdateInput } from "@/types/admin";
import type { UserActionPolicy } from "@/services/admin";

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

type DetailTab = "overview" | "orders" | "activity" | "reports";

type PendingConfirm = { kind: "suspend" | "deactivate" | "reset" };

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "activity", label: "Activity" },
  { key: "reports", label: "Reports" },
];

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [tab, setTab] = useState<DetailTab>("overview");

  // ----- overlays -----
  const [editing, setEditing] = useState(false);
  const [softSaving, setSoftSaving] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [confirmWorking, setConfirmWorking] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);
  const { runExclusive } = useActionGuard();

  const pushToast = useCallback((tone: ToastMessage["tone"], text: string) => {
    const cid = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id: cid, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== cid)), 3800);
  }, []);

  const detailQuery = useAdminUser(id);
  const activityQuery = useAdminUserActivity(id);
  const setStatusMutation = useAdminUserSetStatusMutation();
  const updateMutation = useAdminUserUpdateMutation();
  const resetMutation = useAdminUserResetStateMutation();

  async function runSetStatus(userId: string, status: ManagedUserStatus, successMessage: string) {
    await runExclusive(`user-status:${userId}:${status}`, async () => {
      const result = await setStatusMutation.mutateAsync({ id: userId, status });
      if (result.ok) {
        pushToast("success", successMessage);
      } else {
        pushToast("error", result.message);
      }
    });
  }

  async function runConfirmedAction() {
    if (!pendingConfirm || !detailQuery.data || !detailQuery.data.ok) return;
    const user = detailQuery.data.detail.user;
    setConfirmWorking(true);
    try {
      if (pendingConfirm.kind === "suspend") {
        await runSetStatus(user.id, "suspended", `${user.name} has been suspended.`);
      } else if (pendingConfirm.kind === "deactivate") {
        await runSetStatus(user.id, "deactivated", `${user.name}'s account was deactivated.`);
      } else {
        const result = await resetMutation.mutateAsync(user.id);
        if (result.ok) {
          pushToast("success", `${user.name}'s account state was reset.`);
        } else {
          pushToast("error", result.message);
        }
      }
    } finally {
      setConfirmWorking(false);
      setPendingConfirm(null);
    }
  }

  async function saveEdit(userId: string, patch: ManagedUserUpdateInput) {
    setSoftSaving(true);
    try {
      const result = await updateMutation.mutateAsync({ id: userId, patch });
      if (result.ok) {
        setEditing(false);
        pushToast("success", `${result.user.name} was updated successfully.`);
      } else {
        pushToast("error", result.message);
      }
    } finally {
      setSoftSaving(false);
    }
  }

  // ----- render guards -----

  if (!id || (detailQuery.data && !detailQuery.data.ok && detailQuery.data.code === "NOT_FOUND")) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <ErrorState
          title="User not found"
          message="This account may have been removed or the link is incorrect."
        />
        <div className="mt-3 text-center">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-blue hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  if (detailQuery.isPending) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 animate-pulse rounded bg-kampmax-muted" />
        <LoadingSkeleton variant="cards" rows={6} />
        <div className="h-64 animate-pulse rounded-lg bg-white ring-1 ring-kampmax-border" />
      </div>
    );
  }

  const result = detailQuery.data;

  if (!result) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-4">
        <ErrorState
          title="User not found"
          message="This account may have been removed or the link is incorrect."
        />
        <div className="mt-3 text-center">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-blue hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  if (!result.ok) {
    const forbidden = result.code === "FORBIDDEN";
    return (
      <div className="rounded-lg border border-kampmax-border bg-white p-6">
        <ErrorState
          title={forbidden ? "Access restricted" : "Couldn't load profile"}
          message={
            forbidden
              ? "This account is outside your campus scope. A super admin or admin can open it for you."
              : "The user record failed to load. Try again."
          }
          onRetry={forbidden ? undefined : () => void detailQuery.refetch()}
        />
        <div className="mt-3 text-center">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-kampmax-blue hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  const detail = result.detail;
  const policy = result.policy;
  const user = detail.user;
  const availability = getActionAvailability(user);

  if (!detail) {
    return <LoadingSkeleton variant="detail" rows={6} />;
  }

  const counts: Record<DetailTab, number> = {
    overview: 0,
    orders: detail.orders.length,
    activity: detail.activity.length,
    reports: detail.reports.length,
  };

  return (
    <>
      {/* Back link */}
      <Link
        href="/admin/users"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:text-kampmax-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All users
      </Link>

      <AdminPageHeader
        title={user.name}
        description={`${id} · joined ${formatDate(user.joinedAt)} · last active ${new Date(user.lastActiveAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`}
        actions={
          <>
            <UserRoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
            {!user.isVerified && (
              <StatusBadge variant="warning" label="unverified email" dot={false} />
            )}
            {policy.canManage && policy.canEdit && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-3 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {policy.canManage && availability.canActivate && (
              <button
                type="button"
                onClick={() => void runSetStatus(user.id, "active", `${user.name} can sign in again - account activated.`)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-success/40 bg-white px-3 text-sm font-medium text-kampmax-success transition-colors hover:bg-kampmax-success/5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Activate
              </button>
            )}
            {policy.canManage && availability.canSuspend && (
              <button
                type="button"
                onClick={() => setPendingConfirm({ kind: "suspend" })}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Suspend
              </button>
            )}
            {policy.canManage && availability.canDeactivate && (
              <button
                type="button"
                onClick={() => setPendingConfirm({ kind: "deactivate" })}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
              >
                <Power className="h-3.5 w-3.5" />
                Deactivate
              </button>
            )}
            {policy.canManage && availability.canResetState && (
              <button
                type="button"
                onClick={() => setPendingConfirm({ kind: "reset" })}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset state
              </button>
            )}
          </>
        }
      />

      {/* Read-only scope note */}
      {!policy.canManage && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-kampmax-border bg-kampmax-muted/40 px-3.5 py-2.5 text-xs leading-relaxed text-kampmax-text-secondary">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            View-only. {policy.reasons.join(" ")}
          </span>
        </div>
      )}

      {/* ---------- Overview stats ---------- */}
      <section aria-label="Account metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Orders"
          value={user.ordersCount.toLocaleString("en-NG")}
          icon={ShoppingBag}
          tone="blue"
          hint="Lifetime orders"
        />
        <StatCard
          label="Lifetime spend"
          value={formatNairaCompact(user.totalSpent)}
          icon={Wallet}
          tone="gold"
          hint="Across ordered transactions"
        />
        <StatCard
          label="Wallet balance"
          value={formatNairaCompact(detail.wallet.balance)}
          icon={Wallet}
          tone={detail.wallet.status === "active" ? "success" : "error"}
          hint={detail.wallet.status === "active" ? "Wallet active" : "Wallet frozen"}
        />
        <StatCard
          label="Open disputes"
          value={user.disputeCount.toLocaleString("en-NG")}
          icon={History}
          tone={user.disputeCount > 0 ? "error" : "default"}
          hint="Lifetime disputes opened"
        />
        <StatCard
          label="Reports"
          value={detail.reports.length.toLocaleString("en-NG")}
          icon={Flag}
          tone={detail.reports.length > 0 ? "error" : "default"}
          hint="Reports against this account"
        />
        <StatCard
          label="Activity events"
          value={detail.activity.length.toLocaleString("en-NG")}
          icon={History}
          tone="default"
          hint="Account events tracked"
        />
      </section>

      {/* ---------- Tabs ---------- */}
      <div
        role="tablist"
        aria-label="User profile sections"
        className="mt-5 flex gap-1 overflow-x-auto border-b border-kampmax-border no-scrollbar"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
              tab === t.key
                ? "border-kampmax-blue text-kampmax-blue"
                : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
            }`}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums text-kampmax-text-secondary">
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4" role="tabpanel">
        {tab === "overview" && (
          <UserProfileOverview
            detail={detail}
            onJumpToActivity={() => setTab("activity")}
            onJumpToReports={() => setTab("reports")}
            onOpenCampus={
              detail.campus
                ? () => router.push(`/admin/campuses/${detail.campus!.id}`)
                : undefined
            }
          />
        )}
        {tab === "orders" &&
          (detail.orders.length === 0 ? (
            <TabEmpty label="orders" />
          ) : (
            <section aria-label="Order history" className="rounded-lg border border-kampmax-border bg-white">
              <div className="border-b border-kampmax-border px-4 py-3">
                <h2 className="text-sm font-semibold text-kampmax-text">Order history</h2>
                <p className="mt-0.5 text-xs text-kampmax-text-secondary">
                  {detail.orders.length} most recent orders
                </p>
              </div>
              <DrawerOrdersList orders={detail.orders} />
            </section>
          ))}
        {tab === "activity" && (
          <section aria-label="Recent activity" className="rounded-lg border border-kampmax-border bg-white px-4 py-4">
            {activityQuery.isPending ? (
              <LoadingSkeleton variant="table" rows={4} />
            ) : activityQuery.data?.ok ? (
              <ActivityTimeline events={activityQuery.data.items} />
            ) : (
              <ErrorState
                title="Couldn't load activity"
                message="Activity for this account failed to load."
                onRetry={() => void activityQuery.refetch()}
              />
            )}
          </section>
        )}
        {tab === "reports" &&
          (detail.reports.length === 0 ? (
            <TabEmpty label="reports" />
          ) : (
            <section aria-label="Reports against this account" className="rounded-lg border border-kampmax-border bg-white">
              <div className="border-b border-kampmax-border px-4 py-3">
                <h2 className="text-sm font-semibold text-kampmax-text">Reports against this account</h2>
                <p className="mt-0.5 text-xs text-kampmax-text-secondary">
                  {detail.reports.length} total
                </p>
              </div>
              <ReportList reports={detail.reports} />
            </section>
          ))}
      </div>

      {/* ---------- Overlays ---------- */}

      <EditUserDialog
        open={editing}
        user={user}
        saving={softSaving}
        onClose={() => !softSaving && setEditing(false)}
        onSave={(patch) => saveEdit(user.id, patch)}
      />

      <SuspendConfirm
        open={pendingConfirm?.kind === "suspend"}
        userName={user.name}
        loading={confirmWorking}
        onConfirm={runConfirmedAction}
        onCancel={() => setPendingConfirm(null)}
      />
      <DeactivateConfirm
        open={pendingConfirm?.kind === "deactivate"}
        userName={user.name}
        loading={confirmWorking}
        onConfirm={runConfirmedAction}
        onCancel={() => setPendingConfirm(null)}
      />
      <ResetStateConfirm
        open={pendingConfirm?.kind === "reset"}
        userName={user.name}
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

function TabEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-kampmax-border bg-white px-4 py-10 text-center">
      <History className="mx-auto h-6 w-6 text-kampmax-text-secondary/50" />
      <p className="mt-2 text-sm font-medium text-kampmax-text">No {label} to show yet</p>
      <p className="mt-0.5 text-xs text-kampmax-text-secondary">
        This section fills up as the account engages with the platform.
      </p>
    </div>
  );
}