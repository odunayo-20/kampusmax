"use client";

import { useCallback } from "react";
import { Search, X } from "lucide-react";
import type {
  ManagedVerificationApplicantType,
  ManagedVerificationStatus,
  ManagedVerificationType,
} from "@/types/admin";
import {
  VERIFICATION_STATUS_TABS,
  verificationStatusVariant,
  VERIFICATION_STATUS_LABELS,
  APPLICANT_TYPE_OPTIONS,
  applicantTypeLabel,
  VERIFICATION_TYPE_OPTIONS,
  verificationTypeLabel,
} from "./verifications-meta";

export interface VerificationFilterState {
  search: string;
  status: ManagedVerificationStatus | "all";
  applicantType: ManagedVerificationApplicantType | "all";
  verificationType: ManagedVerificationType | "all";
  campusId: string | "all";
}

export const DEFAULT_VERIFICATION_FILTERS: VerificationFilterState = {
  search: "",
  status: "all",
  applicantType: "all",
  verificationType: "all",
  campusId: "all",
};

export function VerificationFilters({
  filters,
  onChange,
  counts,
  hideCampus,
}: {
  filters: VerificationFilterState;
  onChange: (patch: Partial<VerificationFilterState>) => void;
  counts: Record<ManagedVerificationStatus, number>;
  hideCampus?: boolean;
}) {
  const patch = useCallback(
    (patch: Partial<VerificationFilterState>) => onChange(patch),
    [onChange]
  );

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {VERIFICATION_STATUS_TABS.map((status) => {
          const count =
            status === "all"
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : counts[status] ?? 0;
          return (
            <button
              key={status}
              onClick={() => patch({ status })}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.status === status
                  ? "bg-kampmax-primary text-white"
                  : "bg-kampmax-surface-hover text-kampmax-text-muted hover:text-kampmax-text"
              }`}
            >
              {status === "all" ? "All" : VERIFICATION_STATUS_LABELS[status]}
              <span className="ml-0.5 text-[10px] opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kampmax-text-muted" />
          <input
            type="text"
            placeholder="Search applicants…"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            className="w-full rounded-lg border border-kampmax-border bg-kampmax-surface pl-9 pr-3 py-2 text-sm text-kampmax-text placeholder:text-kampmax-text-muted focus:border-kampmax-primary focus:outline-none focus:ring-1 focus:ring-kampmax-primary/50"
          />
          {filters.search && (
            <button
              onClick={() => patch({ search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-kampmax-text-muted hover:text-kampmax-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select
          value={filters.applicantType}
          onChange={(v) => patch({ applicantType: v as VerificationFilterState["applicantType"] })}
          options={APPLICANT_TYPE_OPTIONS.map((v) => ({
            value: v,
            label: v === "all" ? "All applicant types" : applicantTypeLabel(v),
          }))}
        />

        <Select
          value={filters.verificationType}
          onChange={(v) => patch({ verificationType: v as VerificationFilterState["verificationType"] })}
          options={VERIFICATION_TYPE_OPTIONS.map((v) => ({
            value: v,
            label: v === "all" ? "All verification types" : verificationTypeLabel(v),
          }))}
        />

        {!hideCampus && (
          <button
            onClick={() =>
              patch({
                search: "",
                status: "all",
                applicantType: "all",
                verificationType: "all",
                campusId: "all",
              })
            }
            className="rounded-lg border border-kampmax-border px-3 py-2 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-kampmax-border bg-kampmax-surface px-3 py-2 text-xs text-kampmax-text focus:border-kampmax-primary focus:outline-none focus:ring-1 focus:ring-kampmax-primary/50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
