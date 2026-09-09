"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileText,
  History,
  Info,
  Link2,
  XCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import {
  VerificationStatusBadge,
  VerificationApplicantTypeBadge,
  VerificationTypeBadge,
} from "@/components/admin/verifications/VerificationBadges";
import {
  STATUS_CARD_META,
  verificationStatusLabel,
  formatVerificationDate,
} from "@/components/admin/verifications/verifications-meta";
import {
  useAdminVerification,
  useAdminVerificationApproveMutation,
  useAdminVerificationRejectMutation,
} from "@/hooks/admin/use-admin-verifications";
import type { ManagedVerificationDetail, ManagedVerificationDocumentPolicyItem } from "@/types/admin";

type TabKey = "overview" | "documents" | "actions";

const TABS: { key: TabKey; label: string; icon: typeof Info }[] = [
  { key: "overview", label: "Overview", icon: Info },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "actions", label: "Actions", icon: CheckCircle2 },
];

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

export default function VerificationDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <VerificationDetailPageInner />
    </Suspense>
  );
}

function VerificationDetailPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: detail, isLoading, error } = useAdminVerification(id);
  const approveMutation = useAdminVerificationApproveMutation();
  const rejectMutation = useAdminVerificationRejectMutation();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);

  const pushToast = useCallback((tone: ToastMessage["tone"], text: string) => {
    const newId = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id: newId, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== newId)), 4000);
  }, []);

  const handleApprove = useCallback(async () => {
    if (!detail) return;
    try {
      await approveMutation.mutateAsync(detail.verification.id);
      pushToast("success", `${detail.verification.applicantName} verification approved — storefront is live.`);
      setConfirmAction(null);
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Approval failed.");
    }
  }, [detail, approveMutation, pushToast]);

  const handleReject = useCallback(async () => {
    if (!detail) return;
    if (!rejectReason.trim()) {
      pushToast("error", "A rejection reason is required.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: detail.verification.id, reason: rejectReason.trim() });
      pushToast("success", `${detail.verification.applicantName} verification rejected.`);
      setConfirmAction(null);
      setRejectReason("");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Rejection failed.");
    }
  }, [detail, rejectMutation, rejectReason, pushToast]);

  if (isLoading) return <DetailSkeleton />;

  if (error || !detail) {
    return (
      <>
        <AdminPageHeader
          title="Verification"
          description="Verification not found or outside your campus scope."
          actions={
            <button
              onClick={() => router.push("/admin/verifications")}
              className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border px-3 py-1.5 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to list
            </button>
          }
        />
        <div className="mt-6 rounded-lg border border-kampmax-border bg-kampmax-surface p-12 text-center text-sm text-kampmax-text-muted">
          {error ? String(error) : "This verification could not be found."}
        </div>
      </>
    );
  }

  const { verification: row, applicant, documents, documentPolicy, history, decisionSupport } = detail;
  const statusMeta = STATUS_CARD_META[row.status];

  return (
    <>
      {/* Toast stack */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg ${
              t.tone === "success"
                ? "border-kampmax-success/30 bg-kampmax-success/10 text-kampmax-success"
                : "border-kampmax-error/30 bg-kampmax-error/10 text-kampmax-error"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl border border-kampmax-border bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-kampmax-text">
              {confirmAction === "approve" ? "Approve verification" : "Reject verification"}
            </h3>
            <p className="mt-2 text-sm text-kampmax-text-secondary">
              {confirmAction === "approve"
                ? `Approving ${row.applicantName} will set their storefront to live immediately. This mirrors the vendor console's approval.`
                : `Rejecting ${row.applicantName} will deactivate their store. This mirrors the vendor console's rejection.`}
            </p>

            {confirmAction === "reject" && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-kampmax-text-secondary">
                  Rejection reason <span className="text-kampmax-error">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-kampmax-border px-3 py-2 text-sm text-kampmax-text focus:border-kampmax-error focus:outline-none focus:ring-1 focus:ring-kampmax-error/50"
                  placeholder="Required — explain why this store is being rejected…"
                />
                <p className="mt-1 text-xs text-kampmax-text-muted">
                  This reason is stored in the vendor verification overlay and visible in the vendor console.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmAction(null);
                  setRejectReason("");
                }}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="rounded-lg border border-kampmax-border px-4 py-2 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction === "approve" ? handleApprove : handleReject}
                disabled={
                  approveMutation.isPending ||
                  rejectMutation.isPending ||
                  (confirmAction === "reject" && !rejectReason.trim())
                }
                className={`rounded-lg px-4 py-2 text-xs font-medium text-white disabled:opacity-50 ${
                  confirmAction === "approve"
                    ? "bg-kampmax-success hover:bg-kampmax-success/90"
                    : "bg-kampmax-error hover:bg-kampmax-error/90"
                }`}
              >
                {approveMutation.isPending || rejectMutation.isPending
                  ? "Processing…"
                  : confirmAction === "approve"
                    ? "Approve now"
                    : "Reject now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminPageHeader
        title={row.applicantName}
        description={`${row.applicantSummary || row.applicantType} · ${row.campusName ?? row.campusId ?? "Platform"}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <VerificationStatusBadge status={row.status} />
            <VerificationApplicantTypeBadge type={row.applicantType} />
            <VerificationTypeBadge type={row.verificationType} />
            <button
              onClick={() => router.push("/admin/verifications")}
              className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-kampmax-border px-3 py-1.5 text-xs font-medium text-kampmax-text-muted hover:text-kampmax-text"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>
        }
      />

      {/* Source-status honesty note */}
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 px-4 py-2.5 text-xs text-kampmax-text-secondary">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kampmax-text-muted" />
        <span>
          <strong className="font-medium">Source status:</strong> {row.statusNote}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-kampmax-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "border-kampmax-primary text-kampmax-primary"
                : "border-transparent text-kampmax-text-muted hover:text-kampmax-text"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Status card */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card label="Status" hint={statusMeta.hint}>
              <VerificationStatusBadge status={row.status} />
            </Card>
            <Card label="Verification type" hint="Derived from the owning store">
              <VerificationTypeBadge type={row.verificationType} />
            </Card>
            <Card label="Submitted" hint={row.submittedAt ? "Real store timestamp" : "No submission on record"}>
              <span className="text-sm font-medium text-kampmax-text">
                {formatVerificationDate(row.submittedAt)}
              </span>
            </Card>
            <Card label="Reviewed" hint={row.reviewedBy ? `By ${row.reviewedBy}` : "Not yet reviewed"}>
              <span className="text-sm font-medium text-kampmax-text">
                {formatVerificationDate(row.reviewedAt)}
              </span>
            </Card>
          </div>

          {/* Applicant card */}
          <div className="rounded-lg border border-kampmax-border bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
              Applicant
            </h3>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kampmax-primary/10 text-sm font-semibold text-kampmax-primary">
                {row.applicantName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-kampmax-text">{applicant.title}</p>
                {applicant.subtitle && (
                  <p className="text-xs text-kampmax-text-muted">{applicant.subtitle}</p>
                )}
                {applicant.email && (
                  <p className="text-xs text-kampmax-text-muted">{applicant.email}</p>
                )}
                {applicant.phone && (
                  <p className="text-xs text-kampmax-text-muted">{applicant.phone}</p>
                )}
                {applicant.accountStatus && (
                  <p className="mt-1 text-xs text-kampmax-text-muted">{applicant.accountStatus}</p>
                )}
                {applicant.description && (
                  <p className="mt-2 max-w-lg text-xs text-kampmax-text-muted">{applicant.description}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href={applicant.adminHref}
                className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary hover:text-kampmax-text"
              >
                <Link2 className="h-3.5 w-3.5" />
                Open in {row.applicantType} console
              </a>
            </div>
          </div>

          {/* Decision support summary */}
          {decisionSupport.actionable ? (
            <div className="rounded-lg border border-kampmax-success/30 bg-kampmax-success/5 p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-kampmax-success">
                Decision support
              </h3>
              <p className="text-sm text-kampmax-text-secondary">{decisionSupport.reasonNote}</p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setConfirmAction("approve")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-kampmax-success px-3 py-1.5 text-xs font-medium text-white hover:bg-kampmax-success/90"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  onClick={() => setConfirmAction("reject")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-kampmax-error px-3 py-1.5 text-xs font-medium text-white hover:bg-kampmax-error/90"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
                Decision support
              </h3>
              <p className="text-sm text-kampmax-text-secondary">{decisionSupport.reasonNote}</p>
            </div>
          )}

          {/* History */}
          <div className="rounded-lg border border-kampmax-border bg-white p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
              <History className="mr-1.5 inline h-3.5 w-3.5" />
              Verification history
            </h3>
            {history.length ? (
              <ul className="space-y-3">
                {history.map((h) => (
                  <li key={h.id} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-kampmax-primary" />
                    <div>
                      <p className="text-sm font-medium text-kampmax-text">{h.title}</p>
                      <p className="text-xs text-kampmax-text-muted">
                        {h.meta} · {formatVerificationDate(h.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-kampmax-text-muted">
                No verification events recorded on this platform yet. This applicant's owning store does not maintain a verification timeline.
              </p>
            )}
          </div>

          {row.rejectionReason && (
            <div className="rounded-lg border border-kampmax-error/30 bg-kampmax-error/5 p-5">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-kampmax-error">
                <AlertTriangle className="h-3.5 w-3.5" /> Rejection reason
              </h3>
              <p className="text-sm text-kampmax-text-secondary">{row.rejectionReason}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-6">
          {documents.length ? (
            <div className="rounded-lg border border-kampmax-border bg-white">
              <div className="px-5 py-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
                  Uploaded documents
                </h3>
              </div>
              <div className="divide-y divide-kampmax-border">
                {documents.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 px-5 py-3">
                    <FileText className="h-4 w-4 shrink-0 text-kampmax-text-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-kampmax-text">{d.label}</p>
                      <p className="text-xs text-kampmax-text-muted">
                        {d.documentType} · {d.required ? "Required" : "Optional"} · Status: {d.status}
                      </p>
                    </div>
                    {d.hasPrivateRef && (
                      <span className="inline-flex items-center gap-1 rounded bg-kampmax-info/10 px-2 py-1 text-[10px] font-medium text-kampmax-info">
                        Secure ref on record
                      </span>
                    )}
                    <button
                      disabled
                      className="rounded-md border border-kampmax-border px-3 py-1 text-xs font-medium text-kampmax-text-muted opacity-50"
                      title="No storage backend — preview requires the production upload service."
                    >
                      Preview (unavailable)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-kampmax-border bg-kampmax-surface p-8 text-center">
              <FileText className="mx-auto mb-2 h-8 w-8 text-kampmax-text-muted/50" />
              <p className="text-sm font-medium text-kampmax-text-muted">No documents on record</p>
              <p className="mt-1 max-w-md mx-auto text-xs text-kampmax-text-muted">
                The prototype backend does not implement document storage, upload or signed URLs. No
                applicant in the current seed data has uploaded documents. The secure preview requires the
                production storage layer.
              </p>
            </div>
          )}

          {/* Document policy (real backend config) */}
          {documentPolicy && documentPolicy.length > 0 && (
            <div className="rounded-lg border border-kampmax-border bg-white p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
                Platform document requirements ({row.applicantType} applications)
              </h3>
              <p className="mb-3 text-xs text-kampmax-text-secondary">
                These are the real, backend-configured document requirements for this applicant type — not
                fabricated per-applicant data.
              </p>
              <div className="space-y-2">
                {documentPolicy.map((d: ManagedVerificationDocumentPolicyItem, i: number) => (
                  <div
                    key={`${d.documentType}-${i}`}
                    className="flex items-center gap-3 rounded-md border border-kampmax-border px-3 py-2"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-kampmax-text-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-kampmax-text">{d.label}</p>
                      <p className="text-xs text-kampmax-text-muted">
                        {d.required ? "Required" : "Optional"} · Max {d.maxSizeMb} MB · Accepted:{" "}
                        {d.acceptedFormats.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!documentPolicy && (
            <div className="rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
                Document policy
              </h3>
              <p className="text-xs text-kampmax-text-muted">
                This applicant type's owning store does not carry a document requirement policy in the
                prototype backend.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "actions" && (
        <div className="space-y-6">
          {decisionSupport.actionable ? (
            <div className="rounded-lg border border-kampmax-border bg-white p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
                Available actions
              </h3>
              <p className="mb-4 text-sm text-kampmax-text-secondary">
                This vendor's storefront is pending verification. The following actions delegate to the
                vendor management service — the same path used in <code>/admin/vendors</code>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction("approve")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-kampmax-success px-4 py-2 text-sm font-medium text-white hover:bg-kampmax-success/90"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve verification
                </button>
                <button
                  onClick={() => setConfirmAction("reject")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-kampmax-error px-4 py-2 text-sm font-medium text-white hover:bg-kampmax-error/90"
                >
                  <XCircle className="h-4 w-4" /> Reject verification
                </button>
              </div>
              <p className="mt-3 text-xs text-kampmax-text-muted">
                Approving will set the vendor's storefront to "verified" and make it live. Rejecting will
                deactivate the store — the rejection reason is required and visible in the vendor console.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-kampmax-border bg-kampmax-surface p-8 text-center">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-kampmax-text-muted/50" />
              <p className="text-sm font-medium text-kampmax-text-muted">
                No verification actions in this backend
              </p>
              <p className="mt-1 max-w-md mx-auto text-xs text-kampmax-text-muted">
                {decisionSupport.reasonNote}
              </p>
              <a
                href={applicant.adminHref}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-kampmax-border px-4 py-2 text-xs font-medium text-kampmax-text-secondary hover:text-kampmax-text"
              >
                <Link2 className="h-3.5 w-3.5" /> Open in {row.applicantType} console
              </a>
            </div>
          )}

          <div className="rounded-lg border border-kampmax-border bg-kampmax-surface-hover/50 p-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-kampmax-text-muted">
              Deep links
            </h3>
            <ul className="space-y-2 text-xs text-kampmax-text-secondary">
              <li>
                <a
                  href={applicant.adminHref}
                  className="inline-flex items-center gap-1.5 font-medium text-kampmax-primary hover:underline"
                >
                  <Link2 className="h-3.5 w-3.5" /> {row.applicantType} admin console — {row.applicantId}
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function Card({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-kampmax-border bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-kampmax-text-muted">{label}</p>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-0.5 text-[10px] text-kampmax-text-muted">{hint}</p>}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <div className="mb-6 h-10 w-64 animate-pulse rounded bg-kampmax-surface-hover" />
      <div className="mb-4 h-6 w-full animate-pulse rounded bg-kampmax-surface-hover" />
      <LoadingSkeleton rows={6} />
    </>
  );
}
