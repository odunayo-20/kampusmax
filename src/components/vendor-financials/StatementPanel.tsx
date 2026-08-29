"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Download, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { Select } from "@/components/ui";
import { formatNaira, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { VendorStatement, VendorStatementLine, VendorStatementQuery } from "@/types/vendor-financials";

interface StatementPanelProps {
  statement: VendorStatement;
  onExport: () => void;
  onPeriodChange: (period: string) => void;
  availablePeriods: string[];
}

export function StatementPanel({ statement, onExport, onPeriodChange, availablePeriods }: StatementPanelProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      onExport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <section aria-labelledby="statement-heading" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="statement-heading" className="text-lg font-semibold text-kampmax-text">
            Statement — {statement.periodLabel}
          </h2>
          <p className="mt-1 text-sm text-kampmax-text-secondary">
            {formatDate(statement.from)} – {formatDate(statement.to)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statement.periodLabel} onChange={(e) => onPeriodChange(e.target.value)} className="w-full sm:w-56">
            {availablePeriods.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
          <Button variant="secondary" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Statement lines */}
      <div className="rounded-xl border border-kampmax-border bg-white overflow-hidden">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-kampmax-border bg-neutral-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
                Line item
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-kampmax-text-secondary">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kampmax-border">
            {statement.lines.map((line) => (
              <tr key={line.key} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      variant={line.tone === "positive" ? "success" : line.tone === "negative" ? "error" : "neutral"}
                      label={line.label}
                      dot
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  <span className={cn(line.tone === "positive" ? "text-kampmax-success" : line.tone === "negative" ? "text-kampmax-error" : "text-kampmax-text")}>
                    {line.value >= 0 ? "+" : ""}{formatNaira(line.value)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-kampmax-text-secondary">
                  {line.count}
                </td>
              </tr>
            ))}
            <tr className="bg-neutral-50">
              <td className="px-4 py-3 font-semibold text-kampmax-text">Opening balance</td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-kampmax-text">{formatNaira(statement.openingBalance)}</td>
              <td className="px-4 py-3 text-sm text-kampmax-text-secondary">—</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="px-4 py-3 font-semibold text-kampmax-text">Net movement</td>
              <td className="px-4 py-3 text-right font-mono font-semibold">
                <span className={cn(statement.closingBalance - statement.openingBalance >= 0 ? "text-kampmax-success" : "text-kampmax-error")}>
                  {statement.closingBalance - statement.openingBalance >= 0 ? "+" : ""}{formatNaira(statement.closingBalance - statement.openingBalance)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-kampmax-text-secondary">—</td>
            </tr>
            <tr className="bg-primary-50">
              <td className="px-4 py-3 font-bold text-kampmax-text">Closing balance</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-kampmax-text">{formatNaira(statement.closingBalance)}</td>
              <td className="px-4 py-3 text-sm text-kampmax-text-secondary">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-kampmax-text-secondary">
        Generated {formatDate(statement.generatedAt)}. This statement is backend-generated and
        cannot be modified. {statement.exportable && "CSV export is available."}
      </p>
    </section>
  );
}