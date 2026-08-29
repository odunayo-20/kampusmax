"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui";
import type { VendorFinancialOverview } from "@/types/vendor-financials";

interface FinancialsHeaderProps {
  overview: VendorFinancialOverview;
  onExportStatement: () => void;
}

export function FinancialsHeader({ overview, onExportStatement }: FinancialsHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-kampmax-text">Financials</h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Statements, payouts, and transaction history for your store
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onExportStatement}>
          <Download className="h-4 w-4 mr-2" />
          Export statement
        </Button>
        <Button variant="secondary" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>
    </header>
  );
}