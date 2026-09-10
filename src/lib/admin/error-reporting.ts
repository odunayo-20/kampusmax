// ------------------------------------------------------------
// ADMIN ERROR REPORTING (Module 52)
//
// Error objects (and `String(error)`) must never be rendered into the
// UI: they can leak paths, ids, entity shapes, or backend internals to
// operators and, in the worst case, be reflected back into the DOM.
// This helper renders a single generic message and sends the real
// error to the console for diagnostics. The future NestJS boundary
// should return a normalized { code, message } envelope instead.
// ------------------------------------------------------------

/** Render a safe, generic failure message instead of a raw error. */
export function adminErrorMessage(error: unknown): string {
  if (error) {
    console.error("[admin] request failed:", error);
  }
  return "This request could not be completed. Please try again.";
}