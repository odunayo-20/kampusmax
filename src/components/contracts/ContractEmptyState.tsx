"use client";

import Link from "next/link";
import { Handshake, Search, CheckCircle2, XCircle, FileWarning } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Accessible empty/error states for the contracts module. They provide useful
// next actions and never populate fake projects.

export function ContractEmptyState({
  title,
  body,
  actionLabel,
  actionHref,
  kind = "empty",
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  kind?: "empty" | "success" | "cancel" | "error";
}) {
  const Icon: LucideIcon =
    kind === "success"
      ? CheckCircle2
      : kind === "cancel"
      ? XCircle
      : kind === "error"
      ? FileWarning
      : Handshake;
  const styles =
    kind === "success"
      ? "bg-success-50 text-success-600 ring-success-100"
      : kind === "cancel"
      ? "bg-error-50 text-error-600 ring-error-100"
      : kind === "error"
      ? "bg-error-50 text-error-600 ring-error-100"
      : "bg-primary-50 text-primary-600 ring-primary-100";

  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${styles}`}>
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-bold text-kampmax-text">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-kampmax-text-secondary">{body}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-[#1258C7]"
        >
          <Search className="h-4 w-4" aria-hidden />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// Used when a contract is not found / no longer accessible.
export function ContractNotFound({
  message,
}: {
  message?: string;
}) {
  return (
    <div className="rounded-xl border border-kampmax-border bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50 text-error-600 ring-1 ring-error-100">
        <FileWarning className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-bold text-kampmax-text">
        {message ?? "This contract is no longer available."}
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-kampmax-text-secondary">
        The contract may have been cancelled, completed, or you may no longer
        have access to it.
      </p>
      <Link
        href="/freelancer/contracts"
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-kampmax-border bg-white px-4 py-2 text-sm font-semibold text-kampmax-text hover:bg-kampmax-muted"
      >
        Back to Contracts
      </Link>
    </div>
  );
}
