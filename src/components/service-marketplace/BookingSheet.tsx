"use client";

import { useEffect } from "react";
import { X, CalendarClock, Send, Heart } from "lucide-react";

interface BookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  providerDisplayName: string;
  onRequestQuote: () => void;
  onSave?: () => void;
  saved?: boolean;
}

/**
 * Placeholder for the future booking engine (next milestone). Booking, payment,
 * and escrow intentionally do NOT exist yet — today a customer can request a
 * quote or save the service.
 */
export function BookingSheet({
  isOpen,
  onClose,
  serviceName,
  providerDisplayName,
  onRequestQuote,
  onSave,
  saved,
}: BookingSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-sheet-title"
    >
      <div className="bg-white w-full max-w-md sm:rounded-xl rounded-t-2xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <CalendarClock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 id="booking-sheet-title" className="text-sm font-bold text-neutral-900">
                Book {serviceName}
              </h2>
              <p className="text-xs text-neutral-500">with {providerDisplayName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed">
          Online booking and payments arrive in an upcoming milestone. Until then
          you can request a quote and the provider will get back to you with
          availability and pricing.
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onRequestQuote}
            className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            <Send className="h-4 w-4" aria-hidden />
            Request a quote
          </button>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              aria-pressed={saved}
              className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-100"
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-error-600 text-error-600" : ""}`} aria-hidden />
              {saved ? "Saved" : "Save this service"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}