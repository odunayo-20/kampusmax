"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

interface ServiceConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "destructive" | "secondary";
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Minimal accessible confirmation dialog (fixed overlay + role=dialog).
 * Used for destructive/state actions — never acts after a single accidental
 * click; the user must explicitly confirm.
 */
export function ServiceConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "destructive",
  isBusy,
  onConfirm,
  onCancel,
}: ServiceConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-50 text-error-600">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 id="confirm-title" className="text-sm font-semibold text-neutral-900">
              {title}
            </h2>
            <p id="confirm-desc" className="mt-1 text-xs text-neutral-500">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isBusy}>
            Cancel
          </Button>
          <Button
            variant={tone === "destructive" ? "destructive" : "secondary"}
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
