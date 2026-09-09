"use client";

import type { ManagedVerificationRow, ManagedVerificationSortField } from "@/types/admin";
import type { SortDir } from "@/types/admin";
import { formatDate } from "@/lib/utils";
import {
  VerificationStatusBadge,
  VerificationApplicantTypeBadge,
  VerificationTypeBadge,
} from "./VerificationBadges";
import { formatVerificationDate } from "./verifications-meta";

export function VerificationsTable({
  rows,
  sortBy,
  sortDir,
  onSort,
  onOpen,
  emptyHint,
}: {
  rows: ManagedVerificationRow[];
  sortBy: ManagedVerificationSortField;
  sortDir: SortDir;
  onSort: (field: ManagedVerificationSortField) => void;
  onOpen: (id: string) => void;
  emptyHint?: string;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-kampmax-border bg-kampmax-surface p-12 text-center text-sm text-kampmax-text-muted">
        {emptyHint ?? "No verification rows match the current filters."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-kampmax-border">
      <table className="min-w-full divide-y divide-kampmax-border text-sm">
        <thead className="bg-kampmax-surface-hover">
          <tr>
            <Th>Verification</Th>
            <Th>Type</Th>
            <Th>Applicant</Th>
            <SortableTh field="applicantName" active={sortBy === "applicantName"} dir={sortDir} onClick={onSort}>
              Name
            </SortableTh>
            <SortableTh field="submittedAt" active={sortBy === "submittedAt"} dir={sortDir} onClick={onSort}>
              Submitted
            </SortableTh>
            <SortableTh field="updatedAt" active={sortBy === "updatedAt"} dir={sortDir} onClick={onSort}>
              Updated
            </SortableTh>
            <Th>Documents</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kampmax-border bg-kampmax-surface">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-kampmax-surface-hover/50">
              <td>
                <div className="flex flex-col">
                  <span className="font-medium text-kampmax-text">{row.applicantName}</span>
                  <span className="text-xs text-kampmax-text-muted">{row.applicantSummary}</span>
                </div>
              </td>
              <td>
                <VerificationTypeBadge type={row.verificationType} />
              </td>
              <td>
                <VerificationApplicantTypeBadge type={row.applicantType} />
              </td>
              <td>
                <VerificationStatusBadge status={row.status} />
              </td>
              <td className="whitespace-nowrap text-xs text-kampmax-text-muted">
                {formatVerificationDate(row.submittedAt)}
              </td>
              <td className="whitespace-nowrap text-xs text-kampmax-text-muted">
                {formatVerificationDate(row.updatedAt)}
              </td>
              <td className="whitespace-nowrap text-xs text-kampmax-text-muted">
                {row.documentsCount > 0
                  ? `${row.documentsCount} uploaded`
                  : row.documentsTotal > 0
                    ? `${row.documentsTotal} required`
                    : "—"}
              </td>
              <td className="text-right">
                <button
                  onClick={() => onOpen(row.id)}
                  className="inline-flex items-center rounded-md bg-kampmax-primary/10 px-2.5 py-1 text-xs font-medium text-kampmax-primary hover:bg-kampmax-primary/20"
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-kampmax-text-muted ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function SortableTh({
  field,
  active,
  dir,
  onClick,
  children,
  className,
}: {
  field: ManagedVerificationSortField;
  active: boolean;
  dir: SortDir;
  onClick: (field: ManagedVerificationSortField) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
        active ? "text-kampmax-primary" : "text-kampmax-text-muted"
      } ${className ?? ""}`}
    >
      <button
        onClick={() => onClick(field)}
        className="inline-flex items-center gap-1 hover:text-kampmax-primary"
      >
        {children}
        {active && (
          <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>
        )}
      </button>
    </th>
  );
}
