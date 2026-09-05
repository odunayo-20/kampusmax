/**
 * Frontend-only safety helpers for the notification experience.
 * These are UI concerns — they must never be the source of truth; the
 * notification store remains authoritative and these only decide how the
 * UI renders and where it may navigate.
 */

/**
 * Verifies a notification `actionUrl` is a safe, internal navigatable path.
 * Only same-origin, scheme-less absolute paths starting with "/" are allowed.
 * Anything that could escape the app (schemes, protocol-relative URLs,
 * backslashes, control characters) is rejected and rendered as a plain
 * notification with no navigation.
 */
export function getSafeNotificationTarget(
  url: string | undefined | null
): string | null {
  if (!url) return null;
  if (url.length > 2048) return null;
  if (!url.startsWith("/")) return null;
  if (url.startsWith("//")) return null;
  // Backslashes and control characters are not valid internal paths.
  if (/[\\\x00-\x1F]/.test(url)) return null;
  // Reject internal paths whose first segment contains a colon (scheme
  // smuggling like "/javascript:..." or "///evil").
  if (/^\/[^/]*:/.test(url)) return null;
  return url;
}

const NOTIFICATION_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have permission to view notifications.",
  NOT_FOUND: "That notification no longer exists.",
  CONFLICT: "This change could not be applied. Please try again.",
  VALIDATION: "Something was missing. Please try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  SERVER: "Something went wrong on our end. Please try again.",
  NETWORK: "You appear to be offline. Check your connection and try again.",
  TIMEOUT: "The request timed out. Please try again.",
};

/**
 * Maps a thrown error to a friendly, user-facing message.
 * Raw server/exception text is never surfaced to the user.
 */
export function notificationErrorMessage(error: unknown): string {
  if (!error) return NOTIFICATION_ERROR_MESSAGES.SERVER;

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;
  if (typeof code === "string" && NOTIFICATION_ERROR_MESSAGES[code]) {
    return NOTIFICATION_ERROR_MESSAGES[code];
  }

  const message =
    error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("unauthorized") || normalized.includes("401"))
    return NOTIFICATION_ERROR_MESSAGES.UNAUTHORIZED;
  if (normalized.includes("forbidden") || normalized.includes("403"))
    return NOTIFICATION_ERROR_MESSAGES.FORBIDDEN;
  if (normalized.includes("not found") || normalized.includes("404"))
    return NOTIFICATION_ERROR_MESSAGES.NOT_FOUND;
  if (normalized.includes("conflict") || normalized.includes("409"))
    return NOTIFICATION_ERROR_MESSAGES.CONFLICT;
  if (normalized.includes("validation") || normalized.includes("422"))
    return NOTIFICATION_ERROR_MESSAGES.VALIDATION;
  if (normalized.includes("rate limit") || normalized.includes("429"))
    return NOTIFICATION_ERROR_MESSAGES.RATE_LIMITED;
  if (normalized.includes("offline") || normalized.includes("network"))
    return NOTIFICATION_ERROR_MESSAGES.NETWORK;
  if (normalized.includes("timeout") || normalized.includes("timed out"))
    return NOTIFICATION_ERROR_MESSAGES.TIMEOUT;

  return NOTIFICATION_ERROR_MESSAGES.SERVER;
}