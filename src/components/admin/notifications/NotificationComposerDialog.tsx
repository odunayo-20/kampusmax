"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Info,
  Loader2,
  Save,
  Send,
  Users,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import {
  ALL_DELIVERY_TYPES,
  AUDIENCE_FILTER_ORDER,
  DELIVERY_ICONS,
  DELIVERY_LABELS,
  NOTIFICATION_TYPE_FILTER_ORDER,
  notificationTypeLabel,
} from "./notifications-meta";
import { notificationManagementService } from "@/services/admin";
import type {
  ManagedNotification,
  ManagedNotificationAudience,
  ManagedNotificationType,
  NotificationComposerInput,
  NotificationDeliveryType,
} from "@/types/admin";

interface ComposerDialogProps {
  open: boolean;
  /** Null = create mode. */
  notification: ManagedNotification | null;
  campusOptions: { id: string; name: string; shortName: string }[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    input: NotificationComposerInput & { submitAs: "draft" | "scheduled" | "sent" }
  ) => void;
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/**
 * Broadcast composer. Delivery channels are UI-only: selections are
 * recorded on the broadcast but no push/email/SMS provider fires.
 */
export function NotificationComposerDialog({
  open,
  notification,
  campusOptions,
  loading,
  onClose,
  onSubmit,
}: ComposerDialogProps) {
  const [type, setType] = useState<ManagedNotificationType>("system");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] =
    useState<ManagedNotificationAudience>("all_users");
  const [campusScope, setCampusScope] = useState("all");
  const [deliveryTypes, setDeliveryTypes] = useState<
    NotificationDeliveryType[]
  >(["in_app"]);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [estimate, setEstimate] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    message?: string;
    delivery?: string;
    schedule?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setType(notification?.type ?? "system");
    setTitle(notification?.title ?? "");
    setMessage(notification?.message ?? "");
    setAudience(notification?.audience ?? "all_users");
    setCampusScope(
      notification?.campusId ??
        // Keep the previously picked scope when creating fresh drafts.
        "all"
    );
    setDeliveryTypes(notification?.deliveryTypes ?? ["in_app"]);
    setScheduleMode(notification?.status === "scheduled");
    setScheduleAt(toLocalInputValue(notification?.deliverAt ?? null));
    setErrors({});
  }, [open, notification]);

  // Live audience estimate whenever targeting changes.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    notificationManagementService
      .getEstimate(audience, campusScope === "all" ? null : campusScope)
      .then((n) => !cancelled && setEstimate(n))
      .catch(() => !cancelled && setEstimate(null));
    return () => {
      cancelled = true;
    };
  }, [open, audience, campusScope]);

  function toggleDelivery(t: NotificationDeliveryType) {
    setDeliveryTypes((prev) => {
      const next = prev.includes(t)
        ? prev.filter((x) => x !== t)
        : [...prev, t];
      return next.length === 0 ? prev : next; // keep at least one
    });
  }

  const minScheduleValue = useMemo(
    () => toLocalInputValue(new Date(Date.now() + 60_000).toISOString()),
    []
  );

  function validate(submitAs: "draft" | "scheduled" | "sent") {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "Give the broadcast a title.";
    if (!message.trim()) next.message = "Write the message recipients will see.";
    if (deliveryTypes.length === 0)
      next.delivery = "Pick at least one delivery channel.";
    if (submitAs === "scheduled") {
      if (!scheduleMode || !scheduleAt)
        next.schedule = "Pick a date and time to schedule this broadcast.";
      else if (new Date(scheduleAt).getTime() < Date.now() - 60_000)
        next.schedule = "Scheduled time must be in the future.";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return false;
    }
    setErrors({});
    return true;
  }

  function handleSubmit(submitAs: "draft" | "scheduled" | "sent") {
    if (!validate(submitAs)) return;
    onSubmit({
      type,
      title: title.trim(),
      message: message.trim(),
      audience,
      campusId: campusScope === "all" ? null : campusScope,
      deliveryTypes,
      scheduleAt:
        submitAs === "scheduled" && scheduleAt
          ? new Date(scheduleAt).toISOString()
          : null,
      submitAs,
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={notification ? "Edit notification" : "Create notification"}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={() => !loading && onClose()}
        disabled={loading}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-kampmax-border bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-kampmax-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-kampmax-text">
              {notification ? "Edit notification" : "New notification"}
            </h2>
            <p className="mt-0.5 text-xs text-kampmax-text-secondary">
              Compose a platform broadcast - delivery channels are UI-only in
              this prototype.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={loading}
            className="-mr-1 rounded-md p-1 text-kampmax-text-secondary transition-colors hover:bg-kampmax-muted hover:text-kampmax-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as ManagedNotificationType)}
          >
            {NOTIFICATION_TYPE_FILTER_ORDER.map((t) => (
              <option key={t} value={t}>
                {notificationTypeLabel(t)}
              </option>
            ))}
          </Select>

          <Input
            label="Title"
            value={title}
            placeholder="e.g. Mid-semester sale week is live"
            error={errors.title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label
              htmlFor="notification-message"
              className="mb-1.5 block text-sm font-medium text-kampmax-text"
            >
              Message
            </label>
            <textarea
              id="notification-message"
              rows={4}
              maxLength={400}
              value={message}
              placeholder="What should recipients know? Keep it short and actionable."
              onChange={(e) => setMessage(e.target.value)}
              className={cn(
                "w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1",
                errors.message
                  ? "border-kampmax-error focus:ring-kampmax-error"
                  : "border-kampmax-border focus:ring-kampmax-blue"
              )}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.message ? (
                <p className="text-xs text-kampmax-error">{errors.message}</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] tabular-nums text-kampmax-text-secondary">
                {message.length}/400
              </span>
            </div>
          </div>

          {/* Audience segment */}
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-kampmax-text">
              Audience
            </legend>
            <div className="grid grid-cols-2 gap-1.5">
              {AUDIENCE_FILTER_ORDER.map((a) => (
                <label
                  key={a}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors has-[:checked]:border-kampmax-blue/40 has-[:checked]:bg-kampmax-blue/5",
                    audience === a
                      ? "border-kampmax-blue/40 bg-kampmax-blue/5 text-kampmax-text"
                      : "border-kampmax-border text-kampmax-text-secondary"
                  )}
                >
                  <input
                    type="radio"
                    name="audience"
                    checked={audience === a}
                    onChange={() => setAudience(a)}
                    className="h-3.5 w-3.5 accent-kampmax-blue"
                  />
                  {a === "all_users"
                    ? "All users"
                    : a === "campus_admins"
                      ? "Campus admins"
                      : a.charAt(0).toUpperCase() + a.slice(1)}
                </label>
              ))}
            </div>

            {/* Campus scope */}
            <div className="mt-2">
              <Select
                label="Campus scope (optional)"
                value={campusScope}
                hint="Leave on all campuses or narrow the broadcast to one."
                onChange={(e) => setCampusScope(e.target.value)}
              >
                <option value="all">All campuses</option>
                {campusOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName} - {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </fieldset>

          {/* Delivery channels */}
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-kampmax-text">
              Delivery type
            </legend>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {ALL_DELIVERY_TYPES.map((t) => {
                const Icon = DELIVERY_ICONS[t];
                const checked = deliveryTypes.includes(t);
                return (
                  <label
                    key={t}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors",
                      checked
                        ? "border-kampmax-blue/40 bg-kampmax-blue/5 text-kampmax-text"
                        : "border-kampmax-border text-kampmax-text-secondary"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDelivery(t)}
                      className="h-3.5 w-3.5 accent-kampmax-blue"
                    />
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {DELIVERY_LABELS[t]}
                  </label>
                );
              })}
            </div>
            {errors.delivery && (
              <p className="mt-1 text-xs text-kampmax-error">{errors.delivery}</p>
            )}
          </fieldset>

          {/* Schedule */}
          <div className="rounded-lg border border-kampmax-border bg-kampmax-muted/30 px-3 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scheduleMode}
                onChange={(e) => setScheduleMode(e.target.checked)}
                className="h-4 w-4 rounded accent-kampmax-blue"
              />
              <CalendarClock className="h-4 w-4 text-kampmax-text-secondary" aria-hidden />
              <span className="font-medium text-kampmax-text">
                Schedule instead of sending now
              </span>
            </label>
            {(scheduleMode ||
              (notification?.status === "scheduled")) && (
              <div className="mt-2 pl-6">
                <input
                  type="datetime-local"
                  aria-label="Scheduled delivery time"
                  value={scheduleAt}
                  min={minScheduleValue}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="h-10 w-full rounded-lg border border-kampmax-border bg-white px-3 text-sm focus:border-kampmax-blue focus:outline-none focus:ring-1 focus:ring-kampmax-blue"
                />
                {errors.schedule && (
                  <p className="mt-1 text-xs text-kampmax-error">
                    {errors.schedule}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Live estimate */}
          <p className="flex items-center gap-2 rounded-lg border border-dashed border-kampmax-border px-3 py-2.5 text-xs text-kampmax-text-secondary">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Estimated reach:{" "}
            <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-kampmax-text">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {estimate === null ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                `${estimate.toLocaleString("en-NG")} recipient${estimate === 1 ? "" : "s"}`
              )}
            </span>
            (mock estimate - nothing is delivered in this prototype)
          </p>
        </form>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-kampmax-border px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-9 items-center rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("scheduled")}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-blue/30 bg-kampmax-blue/10 px-3.5 text-sm font-medium text-kampmax-blue transition-colors hover:bg-kampmax-blue/15 disabled:opacity-60"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Schedule
          </button>
          {!notification && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit("draft")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-kampmax-border bg-white px-3.5 text-sm font-medium text-kampmax-text transition-colors hover:bg-kampmax-muted/60 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              Save draft
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("sent")}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-kampmax-blue px-3.5 text-sm font-medium text-white transition-colors hover:bg-kampmax-blue/90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send now
          </button>
        </div>
      </div>
    </div>
  );
}
