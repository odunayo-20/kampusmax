"use client";

import { Check, Minus } from "lucide-react";
import { RESOURCE_ACTIONS } from "@/data/admin/rbac";
import { cn } from "@/lib/utils";
import {
  ACTION_COLUMN_ORDER,
  ACTION_HINTS,
  ACTION_LABELS,
  RESOURCE_DESCRIPTIONS,
  RESOURCE_ICONS,
  RESOURCE_LABELS,
} from "./rbac-meta";
import type {
  RbacAction,
  RbacResource,
  RolePermissionMatrix,
} from "@/types/admin";

interface PermissionsMatrixProps {
  matrix: RolePermissionMatrix;
  /** Read-only renders plain indicators instead of checkboxes. */
  readOnly?: boolean;
  onChange?: (resource: RbacResource, action: RbacAction, value: boolean) => void;
}

/**
 * Resources × actions permission grid. Actions that don't apply to
 * a resource render as disabled dashes so the matrix stays honest
 * about what the future NestJS guards will accept.
 */
export function PermissionsMatrix({
  matrix,
  readOnly = false,
  onChange,
}: PermissionsMatrixProps) {
  return (
    <>
      {/* Desktop grid */}
      <div className="hidden overflow-hidden rounded-lg border border-kampmax-border bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-kampmax-border bg-kampmax-muted/40 text-[11px] uppercase tracking-wide text-kampmax-text-secondary">
                <th scope="col" className="px-4 py-2.5 font-medium">Resource</th>
                {ACTION_COLUMN_ORDER.map((a) => (
                  <th key={a} scope="col" className="w-16 px-2 py-2.5 text-center font-medium" title={ACTION_HINTS[a]}>
                    {ACTION_LABELS[a]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-kampmax-border">
              {(Object.keys(RESOURCE_ACTIONS) as RbacResource[]).map((resource) => (
                <tr key={resource} className="transition-colors hover:bg-kampmax-muted/30">
                  <td className="px-4 py-2.5">
                    <MatrixResourceLabel resource={resource} />
                  </td>
                  {ACTION_COLUMN_ORDER.map((action) => {
                    const applicable =
                      RESOURCE_ACTIONS[resource].includes(action);
                    const checked = applicable && matrix[resource][action];
                    if (!applicable)
                      return (
                        <td key={action} className="px-2 py-2.5 text-center">
                          <Minus
                            className="mx-auto h-3.5 w-3.5 text-kampmax-text-secondary/40"
                            aria-label="Not applicable"
                          />
                        </td>
                      );
                    return (
                      <td key={action} className="px-2 py-2.5 text-center">
                        {readOnly ? (
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 items-center justify-center rounded",
                              checked
                                ? "bg-kampmax-success/15 text-kampmax-success"
                                : "bg-kampmax-muted text-kampmax-text-secondary/50"
                            )}
                            title={`${RESOURCE_LABELS[resource]}.${action}: ${checked ? "granted" : "denied"}`}
                          >
                            {checked ? (
                              <Check className="h-3 w-3" aria-hidden />
                            ) : (
                              <Minus className="h-3 w-3" aria-hidden />
                            )}
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              onChange?.(resource, action, e.target.checked)
                            }
                            aria-label={`${ACTION_LABELS[action]} ${RESOURCE_LABELS[resource]}`}
                            title={`${RESOURCE_LABELS[resource]}.${action}`}
                            className="h-4 w-4 cursor-pointer rounded accent-kampmax-blue"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2 md:hidden">
        {(Object.keys(RESOURCE_ACTIONS) as RbacResource[]).map((resource) => (
          <li
            key={resource}
            className="rounded-lg border border-kampmax-border bg-white p-3"
          >
            <MatrixResourceLabel resource={resource} />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {RESOURCE_ACTIONS[resource].map((action) => {
                const checked = matrix[resource][action];
                return readOnly ? (
                  <span
                    key={action}
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-medium",
                      checked ? "text-kampmax-success" : "text-kampmax-text-secondary/60"
                    )}
                  >
                    {checked ? (
                      <Check className="h-3 w-3" aria-hidden />
                    ) : (
                      <Minus className="h-3 w-3" aria-hidden />
                    )}
                    {ACTION_LABELS[action]}
                  </span>
                ) : (
                  <label
                    key={action}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-kampmax-text-secondary"
                  >
                    <input
                      type="checkbox"
                      checked={matrix[resource][action]}
                      onChange={(e) =>
                        onChange?.(resource, action, e.target.checked)
                      }
                      className="h-3.5 w-3.5 rounded accent-kampmax-blue"
                    />
                    {ACTION_LABELS[action]}
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function MatrixResourceLabel({ resource }: { resource: RbacResource }) {
  const Icon = RESOURCE_ICONS[resource];
  return (
    <span className="flex min-w-0 items-center gap-2.5" title={RESOURCE_DESCRIPTIONS[resource]}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-kampmax-muted text-kampmax-text-secondary">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-kampmax-text">
          {RESOURCE_LABELS[resource]}
        </span>
        <span className="block truncate font-mono text-[10px] text-kampmax-text-secondary/70">
          {resource}
        </span>
      </span>
    </span>
  );
}
