"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ExportFormat = "csv" | "pdf" | "xlsx";

const FORMATS: {
  key: ExportFormat;
  label: string;
  hint: string;
  icon: typeof FileText;
}[] = [
  { key: "csv", label: "CSV", hint: "Raw rows for spreadsheets", icon: FileSpreadsheet },
  { key: "xlsx", label: "Excel", hint: "Formatted workbook", icon: FileSpreadsheet },
  { key: "pdf", label: "PDF", hint: "Print-ready summary", icon: FileText },
];

/**
 * PLACEHOLDER export control. The prototype never produces a file -
 * selecting a format shows a confirmation state and the host page
 * receives a toast via `onExported`.
 */
export function ExportButton({
  onExported,
  disabled,
}: {
  onExported?: (format: ExportFormat) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ExportFormat | null>(null);
  const [done, setDone] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleExport(format: ExportFormat) {
    setPending(format);
    // Simulated latency so the placeholder feels real.
    setTimeout(() => {
      setPending(null);
      setDone(true);
      onExported?.(format);
      setTimeout(() => {
        setDone(false);
        setOpen(false);
      }, 1200);
    }, 700);
  }

  return (
    <div className="relative">
      <button
        type="button"
        ref={btnRef}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
      >
        {done ? (
          <Check className="h-3.5 w-3.5 text-kampmax-success" />
        ) : (
          <Download className="h-3.5 w-3.5 opacity-70" />
        )}
        {done ? "Queued" : "Export"}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: -9999, left: -9999 }}
            className="z-[90] mt-1 w-52 overflow-hidden rounded-lg border border-kampmax-border bg-white py-1 shadow-lg"
          >
            <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-kampmax-text-secondary">
              Placeholder - no file is generated
            </p>
            {FORMATS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="menuitem"
                disabled={pending !== null}
                onClick={() => handleExport(f.key)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
              >
                <f.icon className="h-4 w-4 shrink-0 text-kampmax-text-secondary" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-kampmax-text">
                    {pending === f.key ? "Preparing…" : f.label}
                  </span>
                  <span className="block truncate text-[10px] text-kampmax-text-secondary">
                    {f.hint}
                  </span>
                </span>
                {pending === f.key && (
                  <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-kampmax-text-secondary" />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
