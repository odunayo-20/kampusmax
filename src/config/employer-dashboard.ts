// ============================================================
// EMPLOYER DASHBOARD CONFIG  (Module 27)
// ============================================================
// Presentation constants for the employer dashboard shell. The full
// employer dashboard is Module 29 — this module only scaffolds the
// section set and the path helper used by the main layout so the global
// chrome is hidden inside /employer/*.

export const EMPLOYER_DASHBOARD_SECTIONS = [
  "/employer",
  "/employer/dashboard",
  "/employer/jobs",
  "/employer/applications",
  "/employer/contracts",
  "/employer/settings",
] as const;