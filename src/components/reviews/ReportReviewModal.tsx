"use client";

import { useState } from "react";
import { X, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewReportReason } from "@/types";

interface ReportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReviewReportReason, details: string) => void;
}

const reportReasons: { value: ReviewReportReason; label: string }[] = [
  { value: "spam", label: "Spam or fake review" },
  { value: "fake", label: "Not a genuine purchase" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "offensive", label: "Offensive language" },
  { value: "irrelevant", label: "Not related to product" },
  { value: "other", label: "Other" },
];

export function ReportReviewModal({ isOpen, onClose, onSubmit }: ReportReviewModalProps) {
  const [reason, setReason] = useState<ReviewReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  function handleSubmit() {
    if (!reason) return;
    onSubmit(reason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReason(null);
      setDetails("");
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-kampmax-border">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-kampmax-error" />
            <h2 className="text-sm font-bold text-kampmax-text">Report Review</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-kampmax-text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm font-semibold text-kampmax-text">Report Submitted</p>
            <p className="text-xs text-kampmax-text-secondary mt-1">
              We will review this report within 24 hours.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <p className="text-xs text-kampmax-text-secondary">
              Why are you reporting this review?
            </p>

            <div className="space-y-2">
              {reportReasons.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-colors",
                    reason === r.value
                      ? "border-kampmax-error bg-kampmax-error/5 text-kampmax-text"
                      : "border-kampmax-border text-kampmax-text-secondary hover:border-kampmax-text-secondary/50"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide more context..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!reason}
              className="w-full py-2.5 rounded-xl bg-kampmax-error text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
