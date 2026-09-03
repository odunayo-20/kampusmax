"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatNaira, formatDate, cn } from "@/lib/utils";
import type { Contract } from "@/types/contract";

// Contract acceptance confirmation. The mutation runs through the backend
// (services/contract) which returns a discriminated success/failure result —
// the UI never simulates acceptance locally. The button disables while
// submitting to prevent accidental double submission.

export function AcceptContractDialog({
  contract,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  contract: Contract;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="accept-contract-title"
      aria-describedby="accept-contract-desc"
    >
      <button
        type="button"
        aria-label="Cancel"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => !busy && onClose()}
      />
      <div className="relative w-full max-w-md rounded-xl border border-kampmax-border bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-600 ring-1 ring-success-100">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="accept-contract-title" className="text-sm font-semibold text-kampmax-text">
              Accept Contract?
            </h2>
            <p id="accept-contract-desc" className="mt-1.5 text-sm leading-relaxed text-kampmax-text-secondary">
              You are about to accept this contract and its current terms. This
              creates a contractual work arrangement according to the Kampmax
              platform terms.
            </p>
          </div>
          {!busy && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1 -mt-1 rounded-md p-1 text-kampmax-text-secondary hover:bg-kampmax-muted hover:text-kampmax-text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <dl className="mt-4 space-y-2.5 rounded-lg border border-kampmax-border bg-kampmax-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs text-kampmax-text-secondary">Project</dt>
            <dd className="text-sm font-semibold text-kampmax-text">{contract.projectTitle}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs text-kampmax-text-secondary">Deadline</dt>
            <dd className="text-sm font-semibold text-kampmax-text">
              {formatDate(contract.deadline)}
            </dd>
          </div>
          {typeof contract.agreedAmount === "number" && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-kampmax-text-secondary">Agreed amount</dt>
              <dd className="text-sm font-semibold text-kampmax-text">
                {formatNaira(contract.agreedAmount)}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs text-kampmax-text-secondary">Milestones</dt>
            <dd className="text-sm font-semibold text-kampmax-text">
              {contract.totalMilestones}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-xs text-kampmax-text-muted">
          Please review all contract details before continuing.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-error-100 bg-error-50 p-2.5 text-xs text-error-700"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text hover:bg-kampmax-muted disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
              "bg-success-600 text-white hover:bg-success-700 focus-visible:outline-success-600"
            )}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {busy ? "Accepting…" : "Accept Contract"}
          </button>
        </div>
      </div>
    </div>
  );
}
