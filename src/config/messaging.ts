/**
 * Messaging UI limits. These mirror the platform limits the backend will
 * enforce; the frontend only uses them for friendly UX (counter, disabled
 * send, pagination windows). The backend remains the authority on limits.
 */
export const MESSAGE_MAX_LENGTH = 2000;
export const CONVERSATIONS_PAGE_SIZE = 20;
export const MESSAGES_PAGE_SIZE = 30;
export const MESSAGE_SEARCH_DEBOUNCE_MS = 250;
export const MESSAGE_SEND_MIN_DELAY_MS = 150;