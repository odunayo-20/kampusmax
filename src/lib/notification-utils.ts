/**
 * Frontend-only safety helpers for the notification experience.
 * These are UI concerns — they must never be the source of truth; the
 * notification store remains authoritative and these only decide how the
 * UI renders and where it may navigate.
 */

export {
  getFriendlyErrorMessage as notificationErrorMessage,
} from "@/lib/error-messages";
export { getSafeInternalTarget as getSafeNotificationTarget } from "@/lib/safe-navigation";