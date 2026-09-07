"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  MessageSquare,
  Send,
  UserCheck,
  UserX,
} from "lucide-react";
import type { EmployerApplicationSummary } from "@/types/opportunity";
import { PROPOSAL_STATUS } from "@/types/opportunity";
import {
  APPLICATION_ACCEPTABLE_FROM,
  APPLICATION_REJECTABLE_FROM,
  APPLICATION_REJECT_REASON_MAX,
  APPLICATION_REVIEWABLE_FROM,
  APPLICATION_SHORTLISTABLE_FROM,
} from "@/config/applications";
import { Button } from "@/components/ui";
import {
  useAcceptApplication,
  useCandidateConversation,
  useRejectApplication,
  useReviewApplication,
  useShortlistApplication,
} from "@/hooks/use-applications";
import { getFriendlyErrorMessage } from "@/lib/error-messages";

const linkButtonClass =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded-md h-8 px-3 text-xs border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100";

/**
 * Status-aware action set for a single application. Every transition is
 * backend-owned: the client never writes a status itself. Reject captures an
 * optional employer-facing reason; Hire is destructive and explains exactly
 * what accepting does (accepted proposal + closed job + contract on its way
 * to the candidate).
 */
export function ApplicationActions({
  application,
}: {
  application: EmployerApplicationSummary;
}) {
  const status = application.proposal.status;
  const candidateName = application.candidate.name;
  const router = useRouter();

  const [confirm, setConfirm] = useState<
    "review" | "shortlist" | "reject" | "hire" | null
  >(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reviewMutation = useReviewApplication();
  const shortlistMutation = useShortlistApplication();
  const rejectMutation = useRejectApplication();
  const acceptMutation = useAcceptApplication();
  const openConversation = useCandidateConversation();

  const pending =
    reviewMutation.isPending ||
    shortlistMutation.isPending ||
    rejectMutation.isPending ||
    acceptMutation.isPending;

  const canReview = APPLICATION_REVIEWABLE_FROM.includes(status);
  const canShortlist = APPLICATION_SHORTLISTABLE_FROM.includes(status);
  const canReject = APPLICATION_REJECTABLE_FROM.includes(status);
  const canHire = APPLICATION_ACCEPTABLE_FROM.includes(status);
  const canMessage =
    status !== PROPOSAL_STATUS.WITHDRAWN && status !== PROPOSAL_STATUS.REJECTED;

  const dismiss = () => {
    setConfirm(null);
    setError(null);
  };

  const runReview = () => {
    setError(null);
    reviewMutation.mutate(application.proposal.id, {
      onSuccess: () => {
        dismiss();
        setSuccess("Marked as under review.");
      },
      onError: (err) => setError(getFriendlyErrorMessage(err)),
    });
  };

  const runShortlist = () => {
    setError(null);
    shortlistMutation.mutate(application.proposal.id, {
      onSuccess: () => {
        dismiss();
        setSuccess(`${candidateName} has been shortlisted.`);
      },
      onError: (err) => setError(getFriendlyErrorMessage(err)),
    });
  };

  const runReject = () => {
    setError(null);
    rejectMutation.mutate(
      { id: application.proposal.id, reason: rejectReason.trim() || undefined },
      {
        onSuccess: () => {
          dismiss();
          setRejectReason("");
          setSuccess(`Application rejected.`);
        },
        onError: (err) => setError(getFriendlyErrorMessage(err)),
      }
    );
  };

  const runHire = () => {
    setError(null);
    acceptMutation.mutate(application.proposal.id, {
      onSuccess: () => {
        dismiss();
        setSuccess(
          `Hired ${candidateName} — the job is closed and a contract is waiting for them.`
        );
      },
      onError: (err) => setError(getFriendlyErrorMessage(err)),
    });
  };

  const handleMessage = async () => {
    setError(null);
    const conversationId = await openConversation(application.candidate.id);
    if (conversationId) {
      router.push(`/chat/${conversationId}`);
    } else {
      setError("We couldn't open a conversation with this candidate.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {canReview && (
          <Button size="sm" disabled={pending} onClick={() => setConfirm("review")}>
            <Eye className="mr-1 h-3.5 w-3.5" aria-hidden /> Review
          </Button>
        )}

        {canShortlist && (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => setConfirm("shortlist")}>
            <Send className="mr-1 h-3.5 w-3.5" aria-hidden /> Shortlist
          </Button>
        )}

        {canReject && (
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => setConfirm("reject")}
          >
            <UserX className="mr-1 h-3.5 w-3.5" aria-hidden /> Reject
          </Button>
        )}

        {canHire && (
          <Button size="sm" disabled={pending} onClick={() => setConfirm("hire")}>
            <UserCheck className="mr-1 h-3.5 w-3.5" aria-hidden /> Hire
          </Button>
        )}

        {canMessage && (
          <button
            type="button"
            onClick={handleMessage}
            disabled={pending}
            className={linkButtonClass}
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden /> Message
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-error-600">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success-700">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {success}
        </p>
      )}

      {/* Review */}
      {confirm === "review" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Move to reviewing">
          <div className="absolute inset-0 bg-black/40" aria-hidden onClick={pending ? undefined : dismiss} />
          <div className="relative w-full max-w-sm rounded-2xl border border-kampmax-border bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-kampmax-text">Review this application?</h2>
            <p className="mt-2 text-sm text-kampmax-text-secondary">
              This marks {candidateName}&apos;s application as under review and
              notifies them.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={dismiss} disabled={pending}>
                Cancel
              </Button>
              <Button size="sm" onClick={runReview} disabled={pending}>
                {pending ? "Working…" : "Move to reviewing"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Shortlist */}
      {confirm === "shortlist" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Shortlist candidate">
          <div className="absolute inset-0 bg-black/40" aria-hidden onClick={pending ? undefined : dismiss} />
          <div className="relative w-full max-w-sm rounded-2xl border border-kampmax-border bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-kampmax-text">Shortlist {candidateName}?</h2>
            <p className="mt-2 text-sm text-kampmax-text-secondary">
              This keeps them in the running and notifies them. You can still
              hire or reject them later.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={dismiss} disabled={pending}>
                Cancel
              </Button>
              <Button size="sm" onClick={runShortlist} disabled={pending}>
                {pending ? "Working…" : "Shortlist"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject */}
      {confirm === "reject" && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Reject application"
        >
          <div className="absolute inset-0 bg-black/40" aria-hidden onClick={pending ? undefined : dismiss} />
          <div className="relative w-full max-w-sm rounded-2xl border border-kampmax-border bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-kampmax-text">Reject this application?</h2>
            <p className="mt-2 text-sm text-kampmax-text-secondary">
              Optional feedback is shown to {candidateName}. This can&apos;t be undone.
            </p>
            <label
              htmlFor="reject-reason"
              className="mt-4 block text-sm font-medium text-kampmax-text"
            >
              Feedback (optional)
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value.slice(0, APPLICATION_REJECT_REASON_MAX))}
              rows={3}
              placeholder="e.g. We went with a candidate with more experience…"
              className="mt-1.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
            />
            <p className="mt-1 text-right text-[11px] text-neutral-400">
              {rejectReason.length}/{APPLICATION_REJECT_REASON_MAX}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={dismiss} disabled={pending}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={runReject} disabled={pending}>
                {pending ? "Working…" : "Reject application"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hire */}
      {confirm === "hire" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Hire candidate">
          <div className="absolute inset-0 bg-black/40" aria-hidden onClick={pending ? undefined : dismiss} />
          <div className="relative w-full max-w-sm rounded-2xl border border-kampmax-border bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-kampmax-text">Hire {candidateName}?</h2>
            <p className="mt-2 text-sm text-kampmax-text-secondary">
              This accepts their application, closes the job to new proposals
              and sends them a contract to review. This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={dismiss} disabled={pending}>
                Cancel
              </Button>
              <Button size="sm" onClick={runHire} disabled={pending}>
                {pending ? "Working…" : "Hire candidate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}