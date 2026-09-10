"use client";

import { useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  RotateCcw,
  Users,
  XCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { ErrorState } from "@/components/admin/ErrorState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { RoleDetailsPanel } from "@/components/admin/rbac/RoleDetailsPanel";
import {
  useAdminRbacRole,
  useResetRolePermissions,
  useUpdateRolePermissions,
} from "@/hooks/admin/use-admin-rbac";
import {
  countGrantedPermissions,
  totalApplicablePermissions,
} from "@/data/admin/rbac";
import { RESOURCE_ACTIONS } from "@/data/admin/rbac";
import { toPermissionIds } from "@/types/admin";
import type {
  AdminRoleKey,
  RolePermissionMatrix,
} from "@/types/admin";
import { cn } from "@/lib/utils";

const ROLE_KEY_TO_USERS_FILTER: Record<AdminRoleKey, string> = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  CAMPUS_ADMIN: "campus_admin",
};

const ROLE_NAMES: Record<AdminRoleKey, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CAMPUS_ADMIN: "Campus Admin",
};

export default function AdminRoleDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="cards" rows={4} />}>
      <AdminRoleDetailPageInner />
    </Suspense>
  );
}

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

function AdminRoleDetailPageInner() {
  const params = useParams<{ key: string }>();
  const rawKey = (params?.key ?? "").trim().toUpperCase();
  const key = rawKey as AdminRoleKey;

  const roleQuery = useAdminRbacRole(key);
  const updateMutation = useUpdateRolePermissions();
  const resetMutation = useResetRolePermissions();

  const [resetOpen, setResetOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  function pushToast(tone: ToastMessage["tone"], text: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }

  const role = roleQuery.data ?? null;
  const knownKey = rawKey in ROLE_NAMES;

  const effectiveIds = useMemo(
    () => (role ? toPermissionIds(role.permissions, RESOURCE_ACTIONS) : []),
    [role]
  );

  if (roleQuery.isLoading) return <LoadingSkeleton variant="cards" rows={4} />;

  if (roleQuery.isError || !knownKey || !role)
    return (
      <>
        <AdminPageHeader
          title="Role"
          description="Roles & Permissions detail."
          actions={
            <Link
              href="/admin/permissions"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back to Roles &amp; Permissions
            </Link>
          }
        />
        <div className="mt-4">
          <ErrorState
            onRetry={() => void roleQuery.refetch()}
            message={`No role found for "${rawKey}".`}
          />
        </div>
      </>
    );

  const isSuperAdmin = role.key === "SUPER_ADMIN";
  const usersRoleFilter = ROLE_KEY_TO_USERS_FILTER[role.key];
  const currentRole = role;

  async function handleSave(key: AdminRoleKey, matrix: RolePermissionMatrix) {
    try {
      await updateMutation.mutateAsync({ key, permissions: matrix });
      pushToast("success", `${ROLE_NAMES[currentRole.key]} matrix saved (local mock - not enforced).`);
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Couldn't save the matrix.");
    }
  }

  async function confirmReset() {
    try {
      await resetMutation.mutateAsync(currentRole.key);
      setResetOpen(false);
      pushToast(
        "success",
        `${ROLE_NAMES[currentRole.key]} reset to system defaults for this session.`
      );
    } catch (err) {
      setResetOpen(false);
      pushToast("error", err instanceof Error ? err.message : "Couldn't reset the role.");
    }
  }

  return (
    <>
      <AdminPageHeader
        title={ROLE_NAMES[role.key]}
        description={`Role permissions for ${role.key}. Display state only - the NestJS backend owns enforcement.`}
        actions={
          <>
            <Link
              href={`/admin/users?role=${usersRoleFilter}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/60"
            >
              <Users className="h-3.5 w-3.5" aria-hidden />
              View operators
            </Link>
            <Link
              href="/admin/permissions"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Back
            </Link>
            {!isSuperAdmin && (
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                disabled={resetMutation.isPending}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                {resetMutation.isPending ? "Resetting…" : "Reset to defaults"}
              </button>
            )}
          </>
        }
      />

      {/* Identity strip */}
      <div className="mb-4 rounded-lg border border-kampmax-border bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-kampmax-muted px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
            {role.key}
          </span>
          {role.isSystem && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-kampmax-text-secondary">
              <Lock className="h-3 w-3" aria-hidden />
              System role
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-kampmax-text-secondary">
            <Users className="h-3 w-3" aria-hidden />
            {role.membersCount.toLocaleString("en-NG")} assigned operator
            {role.membersCount === 1 ? "" : "s"}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded bg-kampmax-success/10 px-2 py-1 text-[11px] font-semibold tabular-nums text-kampmax-success">
            <CheckCircle2 className="h-3 w-3" aria-hidden />
            {countGrantedPermissions(role.permissions)}/
            {totalApplicablePermissions()} permissions granted
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-kampmax-text-secondary">
          {role.description}
        </p>
      </div>

      <RoleDetailsPanel
        role={role}
        saving={updateMutation.isPending || resetMutation.isPending}
        onSave={(key, matrix) => void handleSave(key, matrix)}
      />

      {/* Effective permission ids (display only) */}
      <div className="mt-4 rounded-lg border border-kampmax-border bg-white p-5">
        <h2 className="text-sm font-semibold text-kampmax-text">
          Effective permission identifiers
        </h2>
        <p className="mt-0.5 text-xs text-kampmax-text-secondary">
          The flat resource.action strings a NestJS guard would match on.
          Shown for transparency - the prototype enforces nothing.
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {effectiveIds.map((id) => (
            <li
              key={id}
              className="rounded border border-kampmax-border bg-kampmax-muted/40 px-2 py-0.5 font-mono text-[11px] text-kampmax-text"
            >
              {id}
            </li>
          ))}
        </ul>
        {effectiveIds.length === 0 && (
          <p className="mt-2 text-xs italic text-kampmax-text-secondary/70">
            No permissions are assigned to this role.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={resetOpen}
        title={`Reset ${ROLE_NAMES[role.key]} to defaults?`}
        message="This restores the role's permission matrix to the platform's seeded values for this session. Any matrix edits made in the console will be discarded. The mock stores nothing permanently, so this affects in-memory state only."
        confirmLabel="Reset permissions"
        tone="default"
        loading={resetMutation.isPending}
        onConfirm={() => void confirmReset()}
        onCancel={() => setResetOpen(false)}
      />

      {/* Toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex max-w-sm items-start gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-sm shadow-lg animate-[kampmax-fade-in_.18s_ease-out]",
              t.tone === "success" ? "border-kampmax-border" : "border-kampmax-error/30"
            )}
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