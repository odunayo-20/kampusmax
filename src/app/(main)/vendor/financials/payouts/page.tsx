"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PayoutAccountCard } from "@/components/vendor-financials/PayoutAccountCard";
import { PayoutsTable } from "@/components/vendor-financials/PayoutsTable";
import { PayoutRequestModal } from "@/components/vendor-financials/PayoutRequestModal";
import { VendorPagination } from "@/components/vendor-shared/VendorPagination";
import { FinancialsSkeleton } from "@/components/vendor-financials/FinancialsSkeleton";
import { getPayouts, getPayoutAccount, requestPayout, getFinancialOverview } from "@/services/vendor-financials";
import type { VendorPayout, VendorPayoutStatus, PayoutRequestResult } from "@/types/vendor-financials";

const DEFAULT_PAGE_SIZE = 10;

export default function PayoutsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<VendorPayoutStatus | "all">("all");
  const [data, setData] = useState<{ items: VendorPayout[]; total: number; page: number; pageSize: number; totalPages: number } | null>(null);
  const [account, setAccount] = useState<import("@/types/vendor-financials").VendorPayoutAccount | null>(null);
  const [available, setAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payoutsRes, overview] = await Promise.all([
        Promise.resolve(getPayouts({ page, pageSize, status: statusFilter })),
        Promise.resolve(getFinancialOverview()),
      ]);
      setData(payoutsRes);
      setAccount(overview.account);
      setAvailable(overview.cards.find((c) => c.key === "available")?.value ?? 0);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = (newStatus: VendorPayoutStatus | "all") => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleRequestPayout = () => {
    setModalOpen(true);
  };

  const handleModalSubmit = (input: { amount: number; idempotencyKey: string; confirmed: boolean }) => {
    const res = requestPayout(input);
    if (res.ok) {
      fetchData();
      setModalOpen(false);
    }
    // Modal handles error state internally
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  if (loading) return <FinancialsSkeleton />;
  if (!data) return <div className="text-center py-12 text-kampmax-text-secondary">No access</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kampmax-text">Payouts</h1>
          <p className="mt-1 text-sm text-kampmax-text-secondary">
            Request payouts and view payout history
          </p>
        </div>
      </header>

      <PayoutAccountCard
        account={account!}
        onRequestPayout={handleRequestPayout}
        canRequest={account?.status === "verified"}
      />

      <div className="rounded-xl border border-kampmax-border bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-kampmax-text-secondary">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as VendorPayoutStatus | "all")}
            className="h-10 px-3 text-sm bg-white border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600/20"
          >
            <option value="all">All statuses</option>
            <option value="processing">Processing</option>
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <PayoutsTable items={data.items} onRowClick={(p) => { /* could open detail */ }} />

      <VendorPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        pageSize={data.pageSize}
        itemLabel="payouts"
        onPageChange={handlePageChange}
      />

      <PayoutRequestModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        available={available}
      />
    </div>
  );
}