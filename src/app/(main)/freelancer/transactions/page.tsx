"use client";

import { useMemo, useState } from "react";
import { getTransactions } from "@/services/freelancer-financials";
import type { FlFinancialQuery } from "@/types/freelancer-financials";
import { FlFinancialSubnav } from "@/components/freelancer/financials/FlFinancialSubnav";
import { FlTransactionsToolbar } from "@/components/freelancer/financials/FlTransactionsToolbar";
import { FlTransactionsTable } from "@/components/freelancer/financials/FlTransactionsTable";
import { FlPagination } from "@/components/freelancer/financials/FlPagination";
import { FlFinancialEmptyState } from "@/components/freelancer/financials/FlFinancialEmptyState";

// Transactions history (spec §13–§17). Filtering/sorting/pagination run through
// the service layer; the UI never sums or derives money client-side.

export default function FreelancerTransactionsPage() {
  const [query, setQuery] = useState<FlFinancialQuery>({ search: "", type: "all", status: "all", sign: "all", sort: "newest", page: 1, pageSize: 10 });

  const page = useMemo(() => getTransactions(query), [query]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-kampmax-text">Transactions</h1>
        <p className="mt-1 text-sm text-kampmax-text-secondary">
          Your full statement of earnings, fees, refunds and withdrawals.
        </p>
      </header>

      <FlFinancialSubnav />

      <FlTransactionsToolbar query={query} onQueryChange={setQuery} total={page.total} />

      {page.items.length === 0 ? (
        <FlFinancialEmptyState
          title="No transactions found"
          message="Try adjusting your search or filters."
          actionLabel="Clear filters"
          onAction={() => setQuery({ search: "", type: "all", status: "all", sign: "all", sort: "newest", page: 1, pageSize: 10 })}
        />
      ) : (
        <>
          <FlTransactionsTable transactions={page.items} />
          <FlPagination
            page={page.page}
            totalPages={page.totalPages}
            total={page.total}
            pageSize={page.pageSize}
            itemLabel="transactions"
            onPageChange={(p) => setQuery((q) => ({ ...q, page: p }))}
          />
        </>
      )}
    </div>
  );
}
