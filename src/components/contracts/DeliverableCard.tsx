"use client";

import { MessageSquareText, Paperclip, Link2, RefreshCw } from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";
import { DeliverableStatusBadge } from "./ContractStatusBadge";
import { SafeExternalLink } from "./ContractFiles";
import { formatFileSize } from "@/lib/contract-utils";
import { cn } from "@/lib/utils";
import type { Deliverable } from "@/types/contract";

// A single deliverable. Shows status, message, files, safe links, and client
// feedback (read-only). Text is rendered as plain content — never raw HTML.

export function DeliverableCard({
  deliverable,
  canResubmit,
  onResubmit,
}: {
  deliverable: Deliverable;
  canResubmit?: boolean;
  onResubmit?: () => void;
}) {
  const needsRevision = deliverable.status === "REVISION_REQUESTED";

  return (
    <article className="rounded-xl border border-kampmax-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-base font-bold text-kampmax-text">{deliverable.title}</h4>
          {deliverable.description && (
            <p className="mt-1 text-sm text-kampmax-text-secondary">
              {deliverable.description}
            </p>
          )}
        </div>
        <DeliverableStatusBadge status={deliverable.status} />
      </div>

      {deliverable.status === "REVISION_REQUESTED" && deliverable.clientFeedback && (
        <div className="mt-3 rounded-lg border border-accent-100 bg-accent-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-accent-700">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Revision Requested
          </p>
          <p className="mt-1.5 text-sm text-kampmax-text">
            Client feedback: {deliverable.clientFeedback}
          </p>
          {typeof deliverable.revisionCount === "number" && deliverable.revisionCount > 0 && (
            <p className="mt-1 text-xs text-accent-700">
              {deliverable.revisionCount} revision{deliverable.revisionCount !== 1 ? "s" : ""} so far
            </p>
          )}
        </div>
      )}

      {deliverable.submittedMessage && (
        <div className="mt-3 flex items-start gap-2">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-text-secondary" aria-hidden />
          <p className="text-sm text-kampmax-text-secondary">{deliverable.submittedMessage}</p>
        </div>
      )}

      {deliverable.files && deliverable.files.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-kampmax-text-secondary">
            <Paperclip className="h-3.5 w-3.5" aria-hidden /> Attachments
          </p>
          <ul className="mt-1.5 space-y-1">
            {deliverable.files.map((file) => (
              <li key={file.id} className="flex items-center gap-2 text-sm">
                <span className="truncate text-kampmax-text">{file.filename}</span>
                <span className="shrink-0 text-xs text-kampmax-text-muted">
                  {formatFileSize(file.size)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {deliverable.links && deliverable.links.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-kampmax-text-secondary">
            <Link2 className="h-3.5 w-3.5" aria-hidden /> Links
          </p>
          <ul className="mt-1.5 space-y-1">
            {deliverable.links.map((link, i) => (
              <li key={i} className="truncate text-sm">
                <SafeExternalLink href={link}>{link}</SafeExternalLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-kampmax-border pt-3">
        {deliverable.submittedAt ? (
          <span className="text-xs text-kampmax-text-muted">
            Submitted {timeAgo(deliverable.submittedAt)} · {formatDate(deliverable.submittedAt)}
          </span>
        ) : (
          <span className="text-xs text-kampmax-text-muted">Not yet submitted</span>
        )}
        {needsRevision && canResubmit && onResubmit && (
          <button
            type="button"
            onClick={onResubmit}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md bg-primary-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1258C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Update & Resubmit
          </button>
        )}
      </div>
    </article>
  );
}
