"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "./payments-meta";
import type {
  ManagedPaymentMethod,
  ManagedPaymentStatus,
  PaymentFacets,
} from "@/types/admin";

export interface PaymentsFilterState {
  search: string;
  status: ManagedPaymentStatus | "all";
  method: ManagedPaymentMethod | "all";
  campusId: string;
  vendorId: string;
}

interface PaymentsFiltersProps {
  filters: PaymentsFilterState;
  facets: PaymentFacets | null;
  onChange: (patch: Partial<PaymentsFilterState>) => void;
}

const ALL = "all";

export function PaymentsFilters({ filters, facets, onChange }: PaymentsFiltersProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="w-full sm:w-60">
        <Input
          value={filters.search}
          placeholder="Search txn, reference, customer, order…"
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search payments"
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <Select
        aria-label="Filter by payment status"
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value as PaymentsFilterState["status"] })}
        className="w-auto"
      >
        <option value={ALL}>All statuses</option>
        {(Object.keys(PAYMENT_STATUS_LABELS) as ManagedPaymentStatus[]).map((s) => (
          <option key={s} value={s}>
            {PAYMENT_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by payment method"
        value={filters.method}
        onChange={(e) => onChange({ method: e.target.value as PaymentsFilterState["method"] })}
        className="w-auto"
      >
        <option value={ALL}>All methods</option>
        {(Object.keys(PAYMENT_METHOD_LABELS) as ManagedPaymentMethod[]).map((m) => (
          <option key={m} value={m}>
            {PAYMENT_METHOD_LABELS[m]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by campus"
        value={filters.campusId}
        onChange={(e) => onChange({ campusId: e.target.value })}
        className="w-auto"
      >
        <option value="">All campuses</option>
        {(facets?.campuses ?? []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by vendor"
        value={filters.vendorId}
        onChange={(e) => onChange({ vendorId: e.target.value })}
        className="hidden w-auto lg:block"
      >
        <option value="">All vendors</option>
        {(facets?.vendors ?? []).map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
