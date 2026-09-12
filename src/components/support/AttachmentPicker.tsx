"use client";

import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import {
  SUPPORT_ATTACHMENT_ACCEPT,
  SUPPORT_ATTACHMENT_LIMITS,
} from "@/config/support";
import { cn } from "@/lib/utils";
import type { SupportAttachment } from "@/types/admin";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function kindOf(mime: string): SupportAttachment["kind"] {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

let attachmentSeq = 0;

function toAttachment(file: File): SupportAttachment {
  attachmentSeq += 1;
  return {
    id: `att-cst-${Date.now()}-${attachmentSeq}`,
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
    kind: kindOf(file.type || ""),
    uploadedBy: "customer",
  };
}

/**
 * Attachment picker for support requests. In the mock tier this only
 * collects file metadata (the store keeps it for triage); uploads,
 * signed URLs and server-side re-validation are backend work — see
 * KAMPMAX_CUSTOMER_SUPPORT_BACKEND_GAPS.md. The UI still enforces the
 * shared policy (type + size + count) that the API would enforce anyway.
 */
export function AttachmentPicker({
  value,
  onChange,
  compact = false,
}: {
  value: SupportAttachment[];
  onChange: (next: SupportAttachment[]) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const allowed = new Set(Object.values(SUPPORT_ATTACHMENT_LIMITS.allowedMimeByKind).flat());
    const oversized = [...files].filter(
      (f) => f.size > SUPPORT_ATTACHMENT_LIMITS.maxSizeBytes
    );
    if (oversized.length > 0) {
      setError(
        `"${oversized[0].name}" is larger than ${formatBytes(
          SUPPORT_ATTACHMENT_LIMITS.maxSizeBytes
        )}.`
      );
      return;
    }
    const badType = [...files].find((f) => !allowed.has(f.type));
    if (badType) {
      setError(`"${badType.name}" is not a supported file type.`);
      return;
    }
    if (value.length + files.length > SUPPORT_ATTACHMENT_LIMITS.maxFiles) {
      setError(
        `You can add up to ${SUPPORT_ATTACHMENT_LIMITS.maxFiles} files.`
      );
      return;
    }

    const next = [...value];
    for (const file of files) next.push(toAttachment(file));
    onChange(next);
  }

  function remove(id: string) {
    onChange(value.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-kampmax-border bg-kampmax-muted/40 px-3 py-2 text-xs"
            >
              {a.kind === "image" ? (
                <ImageIcon className="h-4 w-4 text-kampmax-blue shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-kampmax-text-secondary shrink-0" />
              )}
              <span className="flex-1 truncate text-kampmax-text">
                {a.name}
              </span>
              <span className="text-kampmax-text-secondary shrink-0">
                {formatBytes(a.sizeBytes)}
              </span>
              <button
                type="button"
                onClick={() => remove(a.id)}
                aria-label={`Remove ${a.name}`}
                className="shrink-0 text-kampmax-text-secondary hover:text-kampmax-error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-dashed border-kampmax-border text-kampmax-text-secondary hover:border-kampmax-blue hover:text-kampmax-blue transition-colors",
          compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
        )}
      >
        <Paperclip className="h-4 w-4" />
        Add files (JPG, PNG, WEBP, PDF — up to 5MB each)
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={SUPPORT_ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-kampmax-error">{error}</p>}
    </div>
  );
}