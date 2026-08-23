"use client";

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CalendarClock,
  Flag,
  History,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { cn, formatNaira, timeAgo } from "@/lib/utils";
import { ErrorState } from "@/components/admin/ErrorState";
import { StatusBadge, vendorStatusVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedUserDetail,
} from "@/types/admin";
import { userManagementService } from "@/services/admin";
import { UserAvatar, UserStatusBadge, UserRoleBadge } from "./UserBadges";
import { getActionAvailability } from "./users-meta";
import type { UserActionHandlers } from "./UserActionMenu";
import {
  ActivityTimeline,
  DrawerOrdersList,
  RatingStars,
  ReportList,
  WalletTxns,
} from "./UserDetailSections";

export type DrawerTab = "overview" | "orders" | "activity" | "reports";

interface UserProfileDrawerProps extends UserActionHandlers {
  userId: string | null;
  initialTab?: DrawerTab;
  /** Bumped by the page after any mutation so the drawer refetches. */
  refreshKey: number;
  onClose: () => void;
}

export function UserProfileDrawer({
  userId,
  initialTab = "overview",
  refreshKey,
  onClose,
  ...actions
}: UserProfileDrawerProps) {
  const [detail, setDetail] = useState<ManagedUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<DrawerTab>(initialTab);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    userManagementService
      .getById(userId)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        if (!d) setError(true);
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey]);

  useEffect(() => {
    if (userId === null) return;
    setTab(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (userId === null) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [userId, onClose]);

  if (!userId) return null;

  const user = detail?.user ?? null;

  return (
    <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-label="User profile">
      <button
        type="button"
        aria-label="Close profile"
        tabIndex={-1}
        className="absolute inset-0 animate-[kampmax-fade-in_.15s_ease-out] bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-kampmax-bg shadow-2xl animate-[kampmax-slide-in-right_.2s_ease-out]"
      >
        {/* ---------- Header ---------- */}
        <div className="shrink-0 border-b border-kampmax-border bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5">
              {user ? (
                <UserAvatar user={user} size="lg" />
              ) : (
                <span className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-kampmax-muted" />
              )}
              <div className="min-w-0">
                {user ? (
                  <>
                    <h2 className="truncate text-base font-bold text-kampmax-text">{user.name}</h2>
                    <p className="truncate font-mono text-[11px] text-kampmax-text-secondary">{user.id}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <UserRoleBadge role={user.role} />
                      <UserStatusBadge status={user.status} />
                      {!user.isVerified && (
                        <StatusBadge variant="warning" label="unverified email" dot={false} />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 py-1">
                    <div className="h-4 w-40 animate-pulse rounded bg-kampmax-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-kampmax-muted" />
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1.5 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick actions */}
          {user && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => actions.onEdit(user)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-kampmax-blue px-2.5 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              {getActionAvailability(user).canSuspend && (
                <button
                  type="button"
                  onClick={() => actions.onSuspend(user)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-kampmax-error/40 bg-white px-2.5 text-xs font-medium text-kampmax-error transition-colors hover:bg-kampmax-error/5"
                >
                  Suspend
                </button>
              )}
              {getActionAvailability(user).canActivate && (
                <button
                  type="button"
                  onClick={() => actions.onActivate(user)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-kampmax-success/40 bg-white px-2.5 text-xs font-medium text-kampmax-success transition-colors hover:bg-kampmax-success/5"
                >
                  <ShieldCheck className="h-3 w-3" /> Activate
                </button>
              )}
              {getActionAvailability(user).canDeactivate && (
                <button
                  type="button"
                  onClick={() => actions.onDeactivate(user)}
                  className="inline-flex h-8 items-center rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
                >
                  Deactivate
                </button>
              )}
              <button
                type="button"
                disabled={!getActionAvailability(user).canResetState}
                onClick={() => actions.onResetState(user)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-3 w-3" /> Reset state
              </button>
            </div>
          )}
        </div>

        {/* ---------- Tabs ---------- */}
        <div
          role="tablist"
          aria-label="User profile sections"
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-kampmax-border bg-white px-3 py-2 no-scrollbar"
        >
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")} label="Overview" />
          <TabButton
            active={tab === "orders"}
            onClick={() => setTab("orders")}
            label="Orders"
            count={detail?.orders.length}
            icon={ShoppingBag}
          />
          <TabButton active={tab === "activity"} onClick={() => setTab("activity")} label="Activity" icon={History} />
          <TabButton
            active={tab === "reports"}
            onClick={() => setTab("reports")}
            label="Reports"
            count={detail?.reports.length}
            icon={Flag}
          />
        </div>

        {/* ---------- Body ---------- */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-36 animate-pulse rounded-lg bg-white" />
              <div className="h-48 animate-pulse rounded-lg bg-white" />
            </div>
          ) : error || !detail || !user ? (
            <ErrorState
              title="Couldn't load profile"
              message="The user record failed to load. Try again."
              onRetry={onClose}
              className="border-solid"
            />
          ) : tab === "overview" ? (
            <OverviewTab detail={detail} onJumpToActivity={() => setTab("activity")} onJumpToReports={() => setTab("reports")} />
          ) : tab === "orders" ? (
            <Card title="Order history" subtitle={`${detail.orders.length} most recent orders`}>
              <DrawerOrdersList orders={detail.orders} />
            </Card>
          ) : tab === "activity" ? (
            <Card title="Recent activity" subtitle="Account events across the platform">
              <ActivityTimeline events={detail.activity} />
            </Card>
          ) : (
            <Card title="Reports against this account" subtitle={`${detail.reports.length} total`}>
              <ReportList reports={detail.reports} />
            </Card>
          )}
        </div>

        {loading && detail && (
          <div
            role="status"
            className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-kampmax-navy px-3 py-1.5 text-xs font-medium text-white shadow-lg"
          >
            <Loader2 className="h-3 w-3 animate-spin" /> Refreshing…
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Overview tab sections
// ------------------------------------------------------------

function OverviewTab({
  detail,
  onJumpToActivity,
  onJumpToReports,
}: {
  detail: ManagedUserDetail;
  onJumpToActivity: () => void;
  onJumpToReports: () => void;
}) {
  const { user, campus, wallet } = detail;

  return (
    <div className="space-y-3">
      {/* Profile information */}
      <Card title="Profile information">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 px-4 py-3 sm:grid-cols-2">
          <InfoRow icon={Mail} label="Email" value={user.email} mono />
          <InfoRow icon={Phone} label="Phone" value={user.phone} mono />
          <InfoRow icon={CalendarClock} label="Date joined" value={`${timeAgo(user.joinedAt)} · ${new Date(user.joinedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`} />
          <InfoRow icon={History} label="Last active" value={timeAgo(user.lastActiveAt)} />
          <InfoRow icon={Tag} label="Lifetime orders" value={`${user.ordersCount}`} />
          <InfoRow icon={Wallet} label="Lifetime spend" value={formatNaira(user.totalSpent)} />
        </dl>
      </Card>

      {/* Campus */}
      <Card title="Campus">
        <div className="flex items-start gap-3 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-kampmax-navy/5 text-kampmax-navy">
            <Building2 className="h-4 w-4" />
          </span>
          {campus ? (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-kampmax-text">{campus.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-kampmax-text-secondary">
                <MapPin className="h-3 w-3" />
                {campus.city}, {campus.state} · {campus.shortName}
              </p>
            </div>
          ) : (
            <p className="text-sm text-kampmax-text-secondary">No campus assigned.</p>
          )}
        </div>
      </Card>

      {/* Vendor information (vendors only) */}
      {user.vendorProfile && (
        <Card title="Vendor information" subtitle={`Store operated by ${user.name}`}>
          <div className="px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-kampmax-gold/15 text-kampmax-gold-dark">
                  <Store className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-kampmax-text">
                    {user.vendorProfile.storeName}
                  </p>
                  <p className="truncate text-xs text-kampmax-text-secondary">
                    {user.vendorProfile.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <RatingStars rating={user.vendorProfile.rating} />
                <StatusBadge variant={vendorStatusVariant(user.vendorProfile.status)} label={user.vendorProfile.status} />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-4">
              <MiniStat label="Products" value={String(user.vendorProfile.productsCount)} />
              <MiniStat label="Total sales" value={formatNaira(user.vendorProfile.totalSales)} />
              <MiniStat label="Reviews" value={String(user.vendorProfile.reviewsCount)} />
              <MiniStat label="Fulfillment" value={`${user.vendorProfile.fulfillmentRate}%`} />
            </dl>
          </div>
        </Card>
      )}

      {/* Wallet summary */}
      <Card
        title="Wallet summary"
        subtitle={`Last wallet activity ${timeAgo(wallet.lastActivityAt)}`}
      >
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-kampmax-text-secondary">Current balance</p>
              <p className="text-2xl font-bold tabular-nums text-kampmax-text">{formatNaira(wallet.balance)}</p>
            </div>
            <StatusBadge
              variant={wallet.status === "active" ? "success" : "error"}
              label={wallet.status === "active" ? "wallet active" : "wallet frozen"}
            />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6">
            <MiniStat label="Total credited" value={formatNaira(wallet.totalCredited)} tone="success" />
            <MiniStat label="Total debited" value={formatNaira(wallet.totalDebited)} tone="error" />
          </dl>
          <div className="mt-3 border-t border-kampmax-border/70 pt-1">
            <p className="px-0 pt-2 text-xs font-medium uppercase tracking-wide text-kampmax-text-secondary">
              Recent transactions
            </p>
            <WalletTxns txns={wallet.recentTransactions} />
          </div>
        </div>
      </Card>

      {/* Account status */}
      <Card title="Account status">
        <div className="space-y-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <UserStatusBadge status={user.status} />
            <UserRoleBadge role={user.role} />
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            <InfoRowPlain label="Open disputes" value={String(user.disputeCount)} tone={user.disputeCount > 0 ? "error" : undefined} />
            <InfoRowPlain label="Reports against" value={String(user.reportsCount)} tone={user.reportsCount > 0 ? "error" : undefined} />
          </dl>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onJumpToActivity}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
            >
              <History className="h-3 w-3" /> View activity
            </button>
            <button
              type="button"
              onClick={onJumpToReports}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60"
            >
              Reports ({detail.reports.length})
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------
// Small building blocks
// ------------------------------------------------------------

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-kampmax-border bg-white">
      <header className="border-b border-kampmax-border px-4 py-2.5">
        <h3 className="text-sm font-semibold text-kampmax-text">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-kampmax-text-secondary">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon?: typeof History;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-kampmax-navy text-white"
          : "text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
      )}
    >
      {Icon && <Icon className="h-3 w-3 opacity-70" />}
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
            active ? "bg-white/20" : "bg-kampmax-muted text-kampmax-text-secondary"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs text-kampmax-text-secondary">
        <Icon className="h-3 w-3 shrink-0" />
        {label}
      </dt>
      <dd className={cn("mt-0.5 truncate text-sm font-medium text-kampmax-text", mono && "font-mono text-xs")}>
        {value}
      </dd>
    </div>
  );
}

function InfoRowPlain({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "error";
}) {
  return (
    <div>
      <dt className="text-xs text-kampmax-text-secondary">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          tone === "error" && value !== "0" ? "text-kampmax-error" : "text-kampmax-text",
          tone !== "error" && "text-kampmax-text"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "error";
}) {
  return (
    <div>
      <dt className="text-xs text-kampmax-text-secondary">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          tone === "success" ? "text-kampmax-success" : tone === "error" ? "text-kampmax-error" : "text-kampmax-text"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
