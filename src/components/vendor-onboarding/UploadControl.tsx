"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorDocumentStatus } from "@/types/onboarding";
import { uploadDocument, removeDocument } from "@/services/onboarding";

interface UploadControlProps {
  documentType: string;
  label: string;
  status: VendorDocumentStatus;
  /** e.g. ["jpg","jpeg","png","pdf"] */
  acceptedFormats: string[];
  maxSizeMb: number;
  fileName?: string;
  actionMessage?: string;
  required?: boolean;
  onChanged?: () => void;
}

/**
 * Document upload control. Illustrates the SECURITY contract for uploads:
 *  - uploads are authenticated (they are only ever initiated by the logged-in
 *    owner; authorization is derived from identity)
 *  - file type/size are validated client-side for UX, but the backend does the
 *    authoritative validation
 *  - the returned reference is a PRIVATE/authenticated handle, never a public URL
 *  - no sensitive file content is persisted to browser storage
 */
export function UploadControl({
  documentType,
  label,
  status,
  acceptedFormats,
  maxSizeMb,
  fileName,
  actionMessage,
  required,
  onChanged,
}: UploadControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUploaded =
    status === "uploaded" || status === "under_review" || status === "approved";
  const isRejected = status === "rejected" || status === "requires_replacement";

  function handleChange(file: File | undefined) {
    setError(null);
    if (!file) return;
    setBusy(true);
    // Simulate the authenticated upload round-trip.
    const res = uploadDocument(documentType, file.name, file.size, file.type);
    setBusy(false);
    if (!res.ok || !res.privateRef) {
      setError(res.error ?? "Upload failed. Please try again.");
      return;
    }
    onChanged?.();
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isRejected ? "border-error-300 bg-error-50" : "border-neutral-200 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {label}
            {required && <span className="text-error-600"> *</span>}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {acceptedFormats.join(", ").toUpperCase()} · up to {maxSizeMb}MB
          </p>
          {isUploaded && fileName && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-success-700">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {fileName}
            </p>
          )}
          {actionMessage && (
            <p className="mt-1.5 text-xs text-error-700">{actionMessage}</p>
          )}
          {error && <p className="mt-1.5 text-xs text-error-600">{error}</p>}
        </div>

        <div className="shrink-0">
          {isUploaded ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Replace
              </button>
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={() => {
                  removeDocument(documentType);
                  onChanged?.();
                }}
                className="rounded-md border border-neutral-300 p-1.5 text-neutral-500 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              <Upload className="h-3.5 w-3.5" />
              {busy ? "Uploading…" : isRejected ? "Re-upload" : "Upload"}
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={acceptedFormats.map((f) => `.${f}`).join(",")}
        aria-label={label}
        onChange={(e) => {
          handleChange(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
