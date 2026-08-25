"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Lock,
  Pencil,
  RotateCcw,
  Save,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { PermissionsMatrix } from "./PermissionsMatrix";
import {
  ACTION_LABELS,
  RESOURCE_LABELS,
} from "./rbac-meta";
import { RESOURCE_ACTIONS } from "@/data/admin/rbac";
import { cn } from "@/lib/utils";
import type {
  AdminRoleKey,
  RbacAction,
  RbacResource,
  RbacRole,
  RolePermissionMatrix,
} from "@/types/admin";

interface RoleDetailsPanelProps {
  role: RbacRole;
  saving: boolean;
  onSave: (key: AdminRoleKey, matrix: RolePermissionMatrix) => void;
}

const ROLE_TONES: Record<AdminRoleKey, string> = {
  SUPER_ADMIN: "bg-kampmax-gold/15 text-kampmax-gold-dark",
  ADMIN: "bg-kampmax-blue/10 text-kampmax-blue",
  CAMPUS_ADMIN: "bg-kampmax-info/10 text-kampmax-info",
};

/**
 * Full role inspector: identity header, coverage stats, a plain-
 * language summary of granted permissions and the editable matrix.
 */
export function RoleDetailsPanel({ role, saving, onSave }: RoleDetailsPanelProps) {
  const locked = role.key === "SUPER_ADMIN";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RolePermissionMatrix>(role.permissions);

  // Re-seed the draft whenever the selected role changes.
  useEffect(() => {
    setDraft(role.permissions);
    setEditing(false);
  }, [role]);

  const stats = useMemo(() => {
    let granted = 0;
    let applicable = 0;
    let fullResources = 0;
    let noAccessResources = 0;
    (Object.keys(RESOURCE_ACTIONS) as RbacResource[]).forEach((r) => {
      const actions = RESOURCE_ACTIONS[r];
      const has = actions.filter((a) => draft[r][a]).length;
      granted += has;
      applicable += actions.length;
      if (has === actions.length) fullResources += 1;
      if (has === 0) noAccessResources += 1;
    });
    return { granted, applicable, fullResources, noAccessResources };
  }, [draft]);

  function handleChange(
    resource: RbacResource,
    action: RbacAction,
    value: boolean
  ) {
    setDraft((prev) => ({
      ...prev,
      [resource]: { ...prev[resource], [action]: value },
    }));
  }

  function handleSave() {
    onSave(role.key, draft);
    // Page reloads roles after save; stay in place.
    setEditing(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-kampmax-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  ROLE_TONES[role.key]
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {role.name}
              </span>
              <span className="rounded bg-kampmax-muted px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-kampmax-text-secondary">
                {role.key}
              </span>
              {role.isSystem && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-kampmax-text-secondary">
                  <Lock className="h-3 w-3" aria-hidden />
                  System role
                </span>
              )}
            </div>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-kampmax-text-secondary">
              {role.description}
            </p>
          </div>

          {!locked && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={saving}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-3 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue/90 disabled:opacity-60"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit permissions
            </button>
          )}
          {locked && (
            <span
              title="Super Admin always retains every applicable permission."
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-kampmax-muted/40 px-3 text-xs font-medium text-kampmax-text-secondary"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Locked - full access by design
            </span>
          )}
        </div>

        {/* Coverage stats */}
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile
            icon={ShieldCheck}
            label="Permissions granted"
            value={`${stats.granted}/${stats.applicable}`}
          />
          <StatTile
            icon={CheckCircle2}
            label="Full-access areas"
            value={String(stats.fullResources)}
            tone="success"
          />
          <StatTile
            icon={X}
            label="No access"
            value={String(stats.noAccessResources)}
            tone={stats.noAccessResources > 0 ? "warning" : "neutral"}
          />
          <StatTile
            icon={Users}
            label="Members"
            value={role.membersCount.toLocaleString("en-NG")}
          />
        </dl>
      </div>

      {/* Granted summary */}
      <div className="rounded-lg border border-kampmax-border bg-white p-5">
        <h2 className="text-sm font-semibold text-kampmax-text">
          Which permissions does this role have?
        </h2>
        <p className="mt-0.5 text-xs text-kampmax-text-secondary">
          {locked
            ? "Every applicable permission on every resource is granted."
            : "Grouped by resource - only granted actions are listed."}
        </p>

        <ul className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
          {(Object.keys(RESOURCE_ACTIONS) as RbacResource[]).map((resource) => {
            const grantedActions = RESOURCE_ACTIONS[resource].filter(
              (a) => draft[resource][a]
            );
            const all = RESOURCE_ACTIONS[resource];
            return (
              <li
                key={resource}
                className={cn(
                  "flex min-w-0 flex-col rounded-lg border px-3 py-2.5",
                  grantedActions.length === 0
                    ? "border-dashed border-kampmax-border bg-transparent"
                    : "border-kampmax-border"
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-kampmax-text">
                    {RESOURCE_LABELS[resource]}
                  </span>
                  {grantedActions.length === all.length && all.length > 0 ? (
                    <span className="shrink-0 rounded bg-kampmax-success/10 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-kampmax-success">
                      Full access
                    </span>
                  ) : grantedActions.length === 0 ? (
                    <span className="shrink-0 rounded bg-kampmax-muted px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-kampmax-text-secondary">
                      None
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] tabular-nums text-kampmax-text-secondary">
                      {grantedActions.length}/{all.length}
                    </span>
                  )}
                </span>
                <span className="mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5 text-[11px] leading-snug">
                  {grantedActions.length === 0 ? (
                    <span className="text-kampmax-text-secondary/70 italic">
                      No permissions for this resource.
                    </span>
                  ) : grantedActions.length === all.length ? (
                    <span className="text-kampmax-success">
                      All actions: {all.map((a) => ACTION_LABELS[a]).join(", ")}
                    </span>
                  ) : (
                    grantedActions.map((a) => (
                      <span
                        key={a}
                        className="rounded bg-kampmax-success/10 px-1.5 py-px font-medium capitalize text-kampmax-success"
                      >
                        {ACTION_LABELS[a]}
                      </span>
                    ))
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Matrix */}
      <div className="rounded-lg border border-kampmax-border bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-kampmax-text">
              Permission matrix
            </h2>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              Resources × actions. Dashed cells don&apos;t apply to that
              resource.
            </p>
          </div>
          {editing && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(role.permissions);
                  setEditing(false);
                }}
                disabled={saving}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-kampmax-blue px-3 text-xs font-medium text-white transition-colors hover:bg-kampmax-blue/90 disabled:opacity-60"
              >
                <Save className="h-3 w-3" aria-hidden />
                {saving ? "Saving…" : "Save matrix"}
              </button>
            </div>
          )}
        </div>

        <PermissionsMatrix
          matrix={draft}
          readOnly={locked || !editing}
          onChange={handleChange}
        />

        {editing && (
          <p className="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2.5 text-[11px] leading-snug text-amber-800">
            Prototype only - changes are kept in memory for this session and
            enforce nothing. The real NestJS RBAC backend will own enforcement.
          </p>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <div className="rounded-lg border border-kampmax-border bg-kampmax-muted/30 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium text-kampmax-text-secondary">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-base font-semibold tabular-nums",
          tone === "success" && "text-kampmax-success",
          tone === "warning" && "text-amber-600",
          tone === "neutral" && "text-kampmax-text"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
