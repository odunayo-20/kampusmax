// ============================================================
// GLOBAL SEARCH CONFIG  (Module 31)
// ============================================================
//
// Single source of truth for the unified marketplace search surface.
// The backend governs what can be searched/filtered — this file only
// tunes the client behaviour around that contract.

export const SEARCH_PAGE_SIZE = 12;

/** Query-input debounce before results are refetched. */
export const SEARCH_DEBOUNCE_MS = 350;

/** Minimum characters before type-ahead suggestions are fetched. */
export const SEARCH_SUGGESTIONS_MIN_CHARS = 2;