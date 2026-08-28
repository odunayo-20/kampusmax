"use client";

import { useRef, useState } from "react";
import { Upload, X, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

interface BrandUploaderProps {
  label: string;
  previewRef?: string | null;
  previewColor?: string;
  onChange: (data: {
    action: "upload" | "remove";
    fileName: string;
    fileSizeBytes: number;
    fileType: string;
    color: string;
  }) => void;
}

export function BrandUploader({
  label,
  previewRef,
  previewColor,
  onChange,
}: BrandUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const hasPreview = Boolean(previewRef);

  function handleChange(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("File is too large. Maximum size is 8MB.");
      return;
    }
    onChange({
      action: "upload",
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type,
      color: previewColor ?? "",
    });
  }

  return (
    <div className="rounded-lg border border-kampmax-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-kampmax-border"
            style={{ backgroundColor: previewColor }}
          >
            {hasPreview ? (
              <span className="text-xs font-semibold text-white">Logo</span>
            ) : (
              <ImagePlus className="h-5 w-5 text-kampmax-text-secondary" aria-hidden />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-kampmax-text">{label}</p>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              JPG, PNG or WebP · max 8MB
            </p>
            {error && <p className="mt-1 text-xs text-kampmax-error">{error}</p>}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            {hasPreview ? "Replace" : "Upload"}
          </button>
          {hasPreview && (
            <button
              type="button"
              aria-label={`Remove ${label}`}
              onClick={() => onChange({ action: "remove", fileName: "", fileSizeBytes: 0, fileType: "", color: previewColor ?? "" })}
              className="rounded-md border border-neutral-300 p-1.5 text-neutral-500 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        aria-label={`Choose ${label} image`}
        onChange={(e) => {
          handleChange(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
