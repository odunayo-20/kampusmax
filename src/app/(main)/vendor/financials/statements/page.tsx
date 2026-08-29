"use client";

import { useEffect, useState, useCallback } from "react";
import { StatementPanel } from "@/components/vendor-financials/StatementPanel";
import { FinancialsSkeleton } from "@/components/vendor-financials/FinancialsSkeleton";
import { getStatement, exportStatementCsv, getFinancialOverview } from "@/services/vendor-financials";
import type { VendorStatement } from "@/types/vendor-financials";

export default function StatementsPage() {
  const [period, setPeriod] = useState("2026-08");
  const [statement, setStatement] = useState<VendorStatement | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>(["2026-08", "2026-07", "2026-06"]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchStatement = useCallback(async () => {
    setLoading(true);
    try {
      const stmt = getStatement({ month: period });
      setStatement(stmt);
    } catch {
      setStatement(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  const handleExport = () => {
    setExporting(true);
    try {
      const res = exportStatementCsv({ month: period });
      if (res.ok) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  if (loading) return <FinancialsSkeleton />;
  if (!statement) return <div className="text-center py-12 text-kampmax-text-secondary">No access</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kampmax-text">Statements</h1>
          <p className="mt-1 text-sm text-kampmax-text-secondary">
            Download monthly financial statements
          </p>
        </div>
      </header>

      <StatementPanel
        statement={statement}
        onExport={handleExport}
        onPeriodChange={handlePeriodChange}
        availablePeriods={availablePeriods}
      />
    </div>
  );
}