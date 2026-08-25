"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Info,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { ErrorState } from "@/components/admin/ErrorState";
import { cn } from "@/lib/utils";
import { RoleDetailsPanel } from "@/components/admin/rbac/RoleDetailsPanel";
import {
  countGrantedPermissions,
  totalApplicablePermissions,
} from "@/data/admin/rbac";
import { rbacService } from "@/services/admin";
import type {
  AdminRoleKey,
  RbacRole,
  RolePermissionMatrix,
} from "@/types/admin";

export default function AdminPermissionsPage() {
  return <PermissionsConsole />;
}

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

function PermissionsConsole() {
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [selected, setSelected] = useState<AdminRoleKey>("ADMIN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  function pushToast(tone: ToastMessage["tone"], text: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await rbacService.listRoles();
      setRoles(list);
      // Keep a valid selection after reloads.
      setSelected((prev) =>
        list.some((r) => r.key === prev) ? prev : list[0]?.key ?? "SUPER_ADMIN"
      );
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedRole = roles.find((r) => r.key === selected) ?? null;

  async function handleSave(key: AdminRoleKey, matrix: RolePermissionMatrix) {
    setSaving(true);
    try {
      await rbacService.updatePermissions(key, matrix);
      await load();
      pushToast(
        "success",
        `${key.replaceAll("_", " ")} matrix saved (local mock - nothing is enforced yet).`
      );
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't save the matrix."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Roles & Permissions"
        description="Inspect and configure what each admin role can do across every platform resource."
        actions={
          <span className="hidden h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary lg:inline-flex">
            <Info className="h-3.5 w-3.5 opacity-60" />
            Prototype - permissions are display state, not enforced
          </span>
        }
      />

      {loading ? (
        <LoadingSkeleton variant="cards" rows={3} />
      ) : error || roles.length === 0 ? (
        <ErrorState onRetry={() => void load()} />
      ) : (
        <div className="space-y-4">
          {/* Role selector cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {roles.map((role) => {
              const active = selected === role.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(role.key)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    active
                      ? "border-kampmax-blue/50 bg-kampmax-blue/5 shadow-sm ring-1 ring-kampmax-blue/30"
                      : "border-kampmax-border bg-white hover:border-kampmax-blue/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-kampmax-text">
                      <ShieldCheck
                        className={cn(
                          "h-4 w-4",
                          active ? "text-kampmax-blue" : "text-kampmax-text-secondary"
                        )}
                        aria-hidden
                      />
                      {role.name}
                    </span>
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full border-2 transition-colors",
                        active
                          ? "border-kampmax-blue bg-kampmax-blue"
                          : "border-kampmax-border bg-white"
                      )}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-kampmax-text-secondary">
                    {role.description}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-kampmax-border pt-2 text-[11px] tabular-nums text-kampmax-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden />
                      {role.membersCount} member{role.membersCount === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-kampmax-text">
                      <CheckCircle2 className="h-3 w-3 text-kampmax-success" aria-hidden />
                      {countGrantedPermissions(role.permissions)}/
                      {totalApplicablePermissions()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details */}
          {selectedRole && (
            <RoleDetailsPanel
              role={selectedRole}
              saving={saving}
              onSave={(key, matrix) => void handleSave(key, matrix)}
            />
          )}
        </div>
      )}

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
