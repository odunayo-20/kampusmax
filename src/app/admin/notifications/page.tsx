"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  FileEdit,
  PlusCircle,
  Search,
  XCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { cn, formatDateTime } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { NotificationsTable } from "@/components/admin/notifications/NotificationsTable";
import { NotificationComposerDialog } from "@/components/admin/notifications/NotificationComposerDialog";
import { NotificationDetailDialog } from "@/components/admin/notifications/NotificationDetailDialog";
import {
  NOTIFICATION_STATUS_FILTER_ORDER,
  NOTIFICATION_TYPE_FILTER_ORDER,
  notificationStatusLabel,
  notificationTypeLabel,
} from "@/components/admin/notifications/notifications-meta";
import { notificationManagementService } from "@/services/admin";
import { communityCampusOptions } from "@/data/admin/community";
import type {
  CommunitySectionCounts,
  ManagedNotification,
  ManagedNotificationStatus,
  ManagedNotificationType,
  NotificationComposerInput,
  Paginated,
} from "@/types/admin";

export default function AdminNotificationsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="table" rows={6} />}>
      <NotificationsConsole />
    </Suspense>
  );
}

interface ToastMessage {
  id: number;
  tone: "success" | "error";
  text: string;
}

const CAMPUS_OPTIONS = communityCampusOptions();

function parseInitialStatus(params: { get(name: string): string | null }) {
  const raw = params.get("status");
  return NOTIFICATION_STATUS_FILTER_ORDER.includes(raw as ManagedNotificationStatus)
    ? (raw as ManagedNotificationStatus)
    : "all";
}

type ComposerTarget =
  | { mode: "create" }
  | { mode: "edit"; n: ManagedNotification }
  | null;

function NotificationsConsole() {
  const searchParams = useSearchParams();

  // ----- filters -----
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim(), 350);
  const [status, setStatus] = useState<ManagedNotificationStatus | "all">(() =>
    parseInitialStatus(searchParams)
  );
  const [type, setType] = useState<ManagedNotificationType | "all">("all");
  const [page, setPage] = useState(1);

  // ----- data -----
  const [list, setList] = useState<Paginated<ManagedNotification> | null>(null);
  const [counts, setCounts] =
    useState<CommunitySectionCounts<ManagedNotificationStatus> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ----- overlays -----
  const [composerTarget, setComposerTarget] = useState<ComposerTarget>(null);
  const [composerSaving, setComposerSaving] = useState(false);
  const [detailTarget, setDetailTarget] = useState<ManagedNotification | null>(
    null
  );
  const [sendNowTarget, setSendNowTarget] =
    useState<ManagedNotification | null>(null);
  const [working, setWorking] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  function pushToast(tone: ToastMessage["tone"], text: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }

  // URL sync for deep-linkable status tabs.
  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `?${qs}` : "/admin/notifications"
    );
  }, [status]);

  const loadMeta = useCallback(async () => {
    try {
      setCounts(await notificationManagementService.getCounts());
    } catch {
      /* non-critical */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await notificationManagementService.list({
        search: search || undefined,
        status,
        type,
        page,
        pageSize: 10,
      });
      setList(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, type, page]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  // ----- mutations -----

  async function submitComposer(
    input: NotificationComposerInput & {
      submitAs: "draft" | "scheduled" | "sent";
    }
  ) {
    if (!composerTarget) return;
    setComposerSaving(true);
    try {
      if (composerTarget.mode === "edit") {
        const id = composerTarget.n.id;
        await notificationManagementService.update(id, input);
        if (input.submitAs === "sent") {
          await notificationManagementService.sendNow(id);
          pushToast("success", `“${input.title}” sent (intent recorded - no delivery fired).`);
        } else if (input.scheduleAt) {
          await notificationManagementService.schedule(id, input.scheduleAt);
          pushToast("success", `“${input.title}” scheduled for ${formatDateTime(input.scheduleAt)}.`);
        } else {
          pushToast("success", `Draft “${input.title}” saved.`);
        }
      } else if (input.submitAs === "scheduled" && input.scheduleAt) {
        const created = await notificationManagementService.create({
          ...input,
          scheduleAt: null,
        });
        await notificationManagementService.schedule(created.id, input.scheduleAt);
        pushToast("success", `“${input.title}” scheduled for ${formatDateTime(input.scheduleAt)}.`);
      } else if (input.submitAs === "sent") {
        await notificationManagementService.create(input);
        pushToast("success", `“${input.title}” sent (intent recorded - no delivery fired).`);
      } else {
        await notificationManagementService.create({ ...input, scheduleAt: null });
        pushToast("success", `Draft “${input.title}” saved.`);
      }
      setComposerTarget(null);
      await Promise.all([loadList(), loadMeta()]);
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't save the broadcast."
      );
    } finally {
      setComposerSaving(false);
    }
  }

  async function confirmSendNow() {
    if (!sendNowTarget) return;
    setWorking(true);
    try {
      await notificationManagementService.sendNow(sendNowTarget.id);
      pushToast(
        "success",
        `“${sendNowTarget.title}” marked as sent. Channels are UI-only - nothing was delivered.`
      );
      setSendNowTarget(null);
      await Promise.all([loadList(), loadMeta()]);
    } catch (err) {
      pushToast(
        "error",
        err instanceof Error ? err.message : "Couldn't send that broadcast."
      );
      setSendNowTarget(null);
    } finally {
      setWorking(false);
    }
  }

  const hasActiveFilters = searchInput.trim().length > 0 || status !== "all" || type !== "all";

  return (
    <>
      <AdminPageHeader
        title="Notifications"
        description="Compose, schedule and audit platform broadcasts. Delivery channels are UI-only placeholders."
        actions={
          <>
            {counts && (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3 text-xs font-medium text-kampmax-text-secondary">
                  <BellRing className="h-3.5 w-3.5 opacity-60" />
                  {counts.byStatus.sent} sent
                </span>
                <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-3 text-xs font-medium text-kampmax-info">
                  <Clock3 className="h-3.5 w-3.5" />
                  {counts.byStatus.scheduled} scheduled
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setComposerTarget({ mode: "create" })}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-3 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue/90"
            >
              <PlusCircle className="h-4 w-4" />
              New notification
            </button>
          </>
        }
      />

      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter notifications by status"
        className="flex gap-1 overflow-x-auto border-b border-kampmax-border px-3 py-2 no-scrollbar"
      >
        {(["all", ...NOTIFICATION_STATUS_FILTER_ORDER] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={status === tab}
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={cn(
              "-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-1.5 text-[13px] font-medium transition-colors",
              status === tab
                ? "border-kampmax-blue text-kampmax-blue"
                : "border-transparent text-kampmax-text-secondary hover:text-kampmax-text"
            )}
          >
            {tab === "all" ? "All" : notificationStatusLabel(tab)}
            {counts && (
              <span className="rounded-full bg-kampmax-muted px-1.5 py-px text-[10px] font-semibold tabular-nums">
                {tab === "all" ? counts.all : counts.byStatus[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="my-3 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            value={searchInput}
            placeholder="Search title or message…"
            leftIcon={<Search className="h-4 w-4" />}
            aria-label="Search notifications"
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={type}
          aria-label="Filter by type"
          onChange={(e) => {
            setType(e.target.value as ManagedNotificationType | "all");
            setPage(1);
          }}
          className="w-auto h-9 text-xs"
        >
          <option value="all">All types</option>
          {NOTIFICATION_TYPE_FILTER_ORDER.map((t) => (
            <option key={t} value={t}>
              {notificationTypeLabel(t)}
            </option>
          ))}
        </Select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setStatus("all");
              setType("all");
            }}
            className="text-xs font-medium text-kampmax-blue hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table + pagination (history lives here: sent + scheduled + drafts) */}
      <NotificationsTable
        items={list?.items ?? []}
        loading={loading && !list}
        error={error}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => void loadList()}
        onClearFilters={() => {
          setSearchInput("");
          setStatus("all");
          setType("all");
        }}
        onView={(n) => setDetailTarget(n)}
        onEdit={(n) => setComposerTarget({ mode: "edit", n })}
        onSendNow={(n) => setSendNowTarget(n)}
      />

      {list && list.totalPages > 1 && (
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={list.total}
          totalPages={list.totalPages}
          onPageChange={setPage}
          className="mt-3 rounded-lg border border-kampmax-border bg-white"
        />
      )}

      {/* Create / edit composer */}
      <NotificationComposerDialog
        open={composerTarget !== null}
        notification={composerTarget?.mode === "edit" ? composerTarget.n : null}
        campusOptions={CAMPUS_OPTIONS}
        loading={composerSaving}
        onClose={() => setComposerTarget(null)}
        onSubmit={(input) => void submitComposer(input)}
      />

      {/* View details */}
      <NotificationDetailDialog
        notification={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      {/* Send-now confirmation */}
      <ConfirmDialog
        open={sendNowTarget !== null}
        title={`Send “${sendNowTarget?.title}”?`}
        message={
          sendNowTarget == null
            ? ""
            : `This records an immediate broadcast to the selected audience. Prototype note: no in-app/push/email/SMS provider is contacted - only the history entry is created.`
        }
        confirmLabel="Send now"
        tone="default"
        loading={working}
        onConfirm={() => void confirmSendNow()}
        onCancel={() => setSendNowTarget(null)}
      />

      {/* Toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex max-w-sm items-start gap-2 rounded-lg border border-kampmax-border bg-white px-3.5 py-2.5 text-sm shadow-lg animate-[kampmax-fade-in_.18s_ease-out]"
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
