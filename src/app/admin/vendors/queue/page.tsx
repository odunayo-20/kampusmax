"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CircleDashed,
  Inbox,
  ShieldQuestion,
  Tag,
  XCircle,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { VerificationReviewDialog } from "@/components/admin/vendors/VerificationReviewDialog";
import { StoreAvatar } from "@/components/admin/vendors/VendorBadges";
import { campusService, vendorManagementService } from "@/services/admin";
import type { ManagedVendor } from "@/types/admin";

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

export default function AdminVendorQueuePage() {
  const [queue, setQueue] = useState<ManagedVendor[] | null>(null);
  const [campusNames, setCampusNames] = useState<Record<string, string>>({});
  const [error, setError] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<ManagedVendor | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  const pushToast = useCallback((tone: ToastMessage["tone"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const loadQueue = useCallback(async () => {
    setQueue((prev) => (prev ? prev : null));
    try {
      const [page, campuses] = await Promise.all([
        vendorManagementService.list({
          queue: "pending_verification",
          sortBy: "registeredAt",
          sortDir: "asc",
          pageSize: 100,
        }),
        campusService.list(),
      ]);
      setQueue(page.items);
      setCampusNames(
        Object.fromEntries(campuses.map((c) => [c.id, c.shortName]))
      );
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  async function approve(vendor: ManagedVendor) {
    setWorkingId(vendor.id);
    try {
      await vendorManagementService.approve(vendor.id);
      setQueue((q) => q?.filter((v) => v.id !== vendor.id) ?? q);
      pushToast("success", `${vendor.storeName} verified - storefront is live.`);
    } catch {
      pushToast("error", `Couldn't approve ${vendor.storeName}. Try again.`);
    } finally {
      setWorkingId(null);
    }
  }

  async function reject(vendor: ManagedVendor, reason: string) {
    setWorkingId(vendor.id);
    try {
      await vendorManagementService.reject(vendor.id, reason);
      setQueue((q) => q?.filter((v) => v.id !== vendor.id) ?? q);
      pushToast("success", `${vendor.storeName}'s application was rejected.`);
    } catch {
      pushToast("error", `Couldn't reject ${vendor.storeName}. Try again.`);
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <>
      <Link
        href="/admin/vendors"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-kampmax-text-secondary transition-colors hover:text-kampmax-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All vendors
      </Link>

      <AdminPageHeader
        title="Verification queue"
        description="Vendors awaiting document review. Approving makes their storefront live immediately."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 py-1.5 text-xs font-medium text-kampmax-text-secondary">
            <Inbox className="h-3.5 w-3.5" />
            {queue ? `${queue.length} pending` : "…"}
          </span>
        }
      />

      {/* ---------- Body ---------- */}
      {queue === null && !error && (
        <div className="space-y-3">
          <LoadingSkeleton variant="cards" rows={3} />
        </div>
      )}

      {error && queue === null && <ErrorState onRetry={() => void loadQueue()} />}

      {queue !== null && queue.length === 0 && (
        <div className="rounded-lg border border-kampmax-border bg-white p-4">
          <EmptyState
            icon={BadgeCheck}
            title="Queue is clear"
            message="Every application has been reviewed. New submissions land here automatically."
            action={
              <Link
                href="/admin/vendors"
                className="inline-flex h-9 items-center rounded-md bg-kampmax-blue px-3 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue-dark"
              >
                Back to vendors
              </Link>
            }
          />
        </div>
      )}

      {queue !== null && queue.length > 0 && (
        <ul role="list" className="space-y-3">
          {queue.map((vendor) => (
            <QueueCard
              key={vendor.id}
              vendor={vendor}
              campusName={campusNames[vendor.campusId] ?? vendor.campusId}
              working={workingId === vendor.id}
              onQuickApprove={() => void approve(vendor)}
              onOpenReview={() => setReviewTarget(vendor)}
            />
          ))}
        </ul>
      )}

      {/* ---------- Overlays ---------- */}

      <VerificationReviewDialog
        key={reviewTarget?.id ?? "none"}
        open={reviewTarget !== null}
        vendor={reviewTarget}
        mode="review"
        onClose={() => setReviewTarget(null)}
        onApprove={async (vendor) => {
          setReviewTarget(null);
          await approve(vendor);
        }}
        onReject={async (vendor, reason) => {
          setReviewTarget(null);
          await reject(vendor, reason);
        }}
      />

      {/* ---------- Toasts ---------- */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex max-w-sm items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm shadow-lg animate-[kampmax-fade-in_.18s_ease-out] ${
              t.tone === "success"
                ? "border-kampmax-success/30 bg-white text-kampmax-text"
                : "border-kampmax-error/30 bg-white text-kampmax-text"
            }`}
          >
            {t.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-success" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-kampmax-error" />
            )}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Queue card
// ------------------------------------------------------------

function QueueCard({
  vendor,
  campusName,
  working,
  onQuickApprove,
  onOpenReview,
}: {
  vendor: ManagedVendor;
  campusName: string;
  working: boolean;
  onQuickApprove: () => void;
  onOpenReview: () => void;
}) {
  const docs = vendor.verification.documents;
  const approved = docs.filter((d) => d.state === "approved").length;
  const percent = Math.round((approved / Math.max(docs.length, 1)) * 100);
  const missing = docs.filter((d) => d.state === "missing").length;
  const submittedDays = vendor.verification.submittedAt
    ? Math.max(
        1,
        Math.round(
          (Date.now() - new Date(vendor.verification.submittedAt).getTime()) /
            86_400_000
        )
      )
    : null;

  return (
    <li className="rounded-lg border border-kampmax-border bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Identity */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <StoreAvatar vendor={vendor} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-kampmax-text">
              {vendor.storeName}
            </p>
            <p className="truncate text-xs text-kampmax-text-secondary">
              {vendor.owner.name} ·{" "}
              <span className="font-mono">{vendor.id}</span>
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-kampmax-text-secondary">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3 w-3 opacity-60" />
                {campusName}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Tag className="h-3 w-3 opacity-60" />
                {vendor.category}
              </span>
            </p>
          </div>
        </div>

        {/* Completeness */}
        <div className="w-full sm:w-52">
          <div className="flex items-center justify-between text-[11px] font-medium text-kampmax-text-secondary">
            <span>
              Documents · {approved}/{docs.length} approved
            </span>
            <span className="tabular-nums">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${vendor.storeName} document completeness`}
            className="mt-1 h-1.5 overflow-hidden rounded-full bg-kampmax-muted"
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                percent >= 80
                  ? "bg-kampmax-success"
                  : percent >= 40
                    ? "bg-kampmax-gold"
                    : "bg-kampmax-warning"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <MiniFlag ok={vendor.verification.emailVerified} label="Email" />
            <MiniFlag ok={vendor.verification.phoneVerified} label="Phone" />
            <MiniFlag ok={missing === 0} label={missing === 0 ? "No docs missing" : `${missing} doc${missing === 1 ? "" : "s"} missing`} />
          </div>
        </div>

        {/* Meta + actions */}
        <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end">
          <p className="text-[11px] tabular-nums text-kampmax-text-secondary">
            Submitted{" "}
            {submittedDays !== null
              ? `${timeAgo(vendor.verification.submittedAt!)}`
              : "—"}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenReview}
              disabled={working}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-2.5 text-xs font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted disabled:opacity-50"
            >
              <ShieldQuestion className="h-3.5 w-3.5" />
              Review
            </button>
            <button
              type="button"
              onClick={onQuickApprove}
              disabled={working}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-kampmax-success px-2.5 text-xs font-medium text-white transition-colors hover:bg-kampmax-success/90 disabled:opacity-50"
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              Approve
            </button>
          </div>
        </div>
      </div>

      {submittedDays !== null && submittedDays > 14 && (
        <p className="mt-2.5 rounded-md bg-kampmax-warning/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-700">
          Waiting for {submittedDays} days - consider following up with the owner at{" "}
          {vendor.owner.email}.
        </p>
      )}
    </li>
  );
}

function MiniFlag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-px text-[10px] font-medium",
        ok
          ? "bg-kampmax-success/10 text-kampmax-success"
          : "bg-kampmax-warning/10 text-amber-700"
      )}
    >
      {ok ? (
        <CheckCircle2 className="h-2.5 w-2.5" />
      ) : (
        <CircleDashed className="h-2.5 w-2.5" />
      )}
      {label}
    </span>
  );
}
