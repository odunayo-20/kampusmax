"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionsToolbar } from "@/components/vendor-financials/TransactionsToolbar";
import { TransactionTable } from "@/components/vendor-financials/TransactionTable";
import { VendorPagination } from "@/components/vendor-shared/VendorPagination";
import { FinancialsSkeleton } from "@/components/vendor-financials/FinancialsSkeleton";
import { getTransactions } from "@/services/vendor-financials";
import type { VendorFinancialQuery, VendorFinancialTransaction, VendorFinancialPage } from "@/types/vendor-financials";

const DEFAULT_PAGE_SIZE = 10;

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [query, setQuery] = useState<VendorFinancialQuery>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sort: "newest",
  });
  const [data, setData] = useState<VendorFinancialPage<VendorFinancialTransaction> | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from URL params
  useEffect(() => {
    const initialQuery: VendorFinancialQuery = {
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: "newest",
      search: searchParams.get("search") ?? undefined,
      type: (searchParams.get("type") as VendorFinancialQuery["type"]) ?? "all",
      status: (searchParams.get("status") as VendorFinancialQuery["status"]) ?? "all",
      sign: (searchParams.get("sign") as VendorFinancialQuery["sign"]) ?? "all",
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    };
    setQuery(initialQuery);
    setPage(1);
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = getTransactions(query);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQueryChange = (newQuery: Partial<VendorFinancialQuery>) => {
    const merged = { ...query, ...newQuery, page: newQuery.page ?? 1 };
    setQuery(merged);
    setPage(merged.page ?? 1);
  };

  const handlePageChange = (newPage: number) => {
    handleQueryChange({ page: newPage });
  };

  if (loading) return <FinancialsSkeleton />;
  if (!data) return <div className="text-center py-12 text-kampmax-text-secondary">No access</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kampmax-text">Transactions</h1>
          <p className="mt-1 text-sm text-kampmax-text-secondary">
            Complete ledger of all money movements
          </p>
        </div>
      </header>

      <TransactionsToolbar
        query={query}
        onQueryChange={handleQueryChange}
        total={data.total}
      />

      <TransactionTable items={data.items} onRowClick={(tx) => router.push(`/vendor/financials/${tx.id}`)} />

      <VendorPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        pageSize={data.pageSize}
        itemLabel="transactions"
        onPageChange={handlePageChange}
      />
    </div>
  );
}