"use client";

import { useRef, useState } from "react";
import { FileText, ImagePlus, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVIDENCE_KIND_LABELS, EVIDENCE_LIMITS } from "@/config/service-order";
import type { BookingEvidence, BookingEvidenceKind } from "@/types/booking";

function kindFor(mime: string): BookingEvidenceKind {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "document";
  return "other";
}

function sizeLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * In-memory evidence upload. Files are read with FileReader and held as data
 * URLs ONLY for the current session — never persisted to localStorage. The
 * real backend owns secure upload & storage; nothing here executes files.
 */
export function EvidenceUpload({
  value,
  onChange,
  disabled,
  hint,
}: {
  value: BookingEvidence[];
  onChange: (next: BookingEvidence[]) => void;
  disabled?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  function remove(id: string) {
    onChange(value.filter((v) => v.id !== id));
  }

  function addFiles(fileList: FileList | null) {
    if (disabled || !fileList || fileList.length === 0) return;
    setError(null);
    const files = Array.from(fileList);
    const room = EVIDENCE_LIMITS.maxFiles - value.length;
    if (room <= 0) {
      setError(`You can attach at most ${EVIDENCE_LIMITS.maxFiles} files.`);
      return;
    }

    const accepted: { ev: BookingEvidence; file: File }[] = [];
    for (const file of files.slice(0, room)) {
      const kind = kindFor(file.type);
      const allowed = EVIDENCE_LIMITS.allowedMimeByKind[kind] as readonly string[];
      if (allowed.length > 0 && !allowed.includes(file.type)) {
        setError(`${file.name} isn't an allowed file type.`);
        return;
      }
      if (file.size > EVIDENCE_LIMITS.maxSizeBytes) {
        setError(`${file.name} is larger than 5 MB.`);
        return;
      }
      accepted.push({
        ev: {
          id: `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          kind,
          name: file.name,
          mime: file.type || "application/octet-stream",
          sizeBytes: file.size,
        },
        file,
      });
    }

    void (async () => {
      const revealed = await Promise.all(
        accepted.map(({ ev, file }) =>
          new Promise<BookingEvidence>((resolve) => {
            if (ev.kind === "image") {
              const reader = new FileReader();
              reader.onload = () => resolve({ ...ev, dataUrl: String(reader.result ?? "") });
              reader.onerror = () => resolve(ev);
              reader.readAsDataURL(file);
              return;
            }
            resolve(ev);
          })
        )
      );
      onChange([...value, ...revealed]);
    })();
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pl-1.5 pr-2"
            >
              {ev.kind === "image" && ev.dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ev.dataUrl}
                  alt=""
                  className={cn(
                    "h-8 w-8 rounded-md object-cover",
                    disabled && "opacity-60"
                  )}
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-200 text-neutral-500">
                  {ev.kind === "image" ? (
                    <ImagePlus className="h-4 w-4" aria-hidden />
                  ) : (
                    <FileText className="h-4 w-4" aria-hidden />
                  )}
                </span>
              )}
              <span className="min-w-0">
                <span className="block max-w-[180px] truncate text-xs font-semibold text-neutral-800">
                  {ev.name}
                </span>
                <span className="block text-[10px] text-neutral-500">
                  {EVIDENCE_KIND_LABELS[ev.kind]} · {sizeLabel(ev.sizeBytes)}
                </span>
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(ev.id)}
                  aria-label={`Remove ${ev.name}`}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-semibold transition-colors",
          disabled
            ? "cursor-not-allowed border-neutral-200 text-neutral-400"
            : "border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-700"
        )}
      >
        <Paperclip className="h-3.5 w-3.5" aria-hidden />
        Add images or a PDF
      </button>

      {hint && <p className="text-[11px] text-neutral-500">{hint}</p>}
      {error && (
        <p role="alert" className="text-[11px] font-medium text-error-600">
          {error}
        </p>
      )}
    </div>
  );
}