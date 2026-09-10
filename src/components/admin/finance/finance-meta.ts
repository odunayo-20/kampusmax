import type { BadgeVariant } from "@/components/admin/StatusBadge";
import type {
  ManagedFinanceChartKind,
  ManagedReconciliationCheckState,
} from "@/types/admin";

// ------------------------------------------------------------
// RECONCILIATION OUTCOME
// ------------------------------------------------------------

export const RECON_OUTCOME_LABELS: Record<
  ManagedReconciliationCheckState,
  string
> = {
  balanced: "Balanced",
  variance: "Variance",
  informational: "Informational",
};

export function reconOutcomeVariant(
  outcome: ManagedReconciliationCheckState
): BadgeVariant {
  switch (outcome) {
    case "balanced":
      return "success";
    case "variance":
      return "warning";
    case "informational":
      return "info";
  }
}

export function reconOutcomeDot(
  outcome: ManagedReconciliationCheckState
): string {
  switch (outcome) {
    case "balanced":
      return "bg-kampmax-success";
    case "variance":
      return "bg-amber-500";
    case "informational":
      return "bg-kampmax-info";
  }
}

// ------------------------------------------------------------
// PAYOUT / WALLET / PAYMENT STATUS → badge variant
// ------------------------------------------------------------

export function financeStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "successful":
    case "completed":
    case "delivered":
    case "paid":
      return "success";
    case "pending":
    case "processing":
    case "requested":
    case "in_transit":
      return "warning";
    case "failed":
    case "cancelled":
    case "reversed":
      return "error";
    case "refunded":
      return "info";
    default:
      return "neutral";
  }
}

// ------------------------------------------------------------
// CHART KINDS
// ------------------------------------------------------------

export const FINANCE_CHART_KINDS: Record<
  ManagedFinanceChartKind,
  "bar" | "line" | "area" | "hbar"
> = {
  bar: "bar",
  hbar: "hbar",
  line: "line",
};

// ------------------------------------------------------------
// CSV EXPORT (client-side Blob, matching vendor statement exports)
// ------------------------------------------------------------

export function buildCsv(
  columns: { key: string; label: string }[],
  rows: Record<string, string | number | null>[]
): string {
  const esc = (v: string | number | null): string => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => esc(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => esc(row[c.key] ?? "")).join(","))
    .join("\n");
  return `${header}\n${body}\n`;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function fireToast(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("kampmax-toast", { detail: message }));
}