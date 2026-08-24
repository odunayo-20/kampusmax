"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  FULFILLMENT_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "./orders-meta";
import type {
  ManagedOrderPaymentStatus,
  ManagedOrderStatus,
  OrderFacets,
} from "@/types/admin";

export interface OrdersFilterState {
  search: string;
  status: ManagedOrderStatus | "all";
  paymentStatus: ManagedOrderPaymentStatus | "all";
  fulfillment: keyof typeof FULFILLMENT_LABELS | "all";
  campusId: string;
  vendorId: string;
}

interface OrdersFiltersProps {
  filters: OrdersFilterState;
  facets: OrderFacets | null;
  onChange: (patch: Partial<OrdersFilterState>) => void;
}

const ALL = "all";

export function OrdersFilters({ filters, facets, onChange }: OrdersFiltersProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="w-full sm:w-60">
        <Input
          value={filters.search}
          placeholder="Search order #, customer, vendor…"
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search orders"
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <Select
        aria-label="Filter by order status"
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value as OrdersFilterState["status"] })}
        className="w-auto"
      >
        <option value={ALL}>All statuses</option>
        {(Object.keys(ORDER_STATUS_LABELS) as ManagedOrderStatus[]).map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by payment status"
        value={filters.paymentStatus}
        onChange={(e) =>
          onChange({ paymentStatus: e.target.value as OrdersFilterState["paymentStatus"] })
        }
        className="hidden w-auto md:block"
      >
        <option value={ALL}>All payments</option>
        {(Object.keys(PAYMENT_STATUS_LABELS) as ManagedOrderPaymentStatus[]).map((s) => (
          <option key={s} value={s}>
            {PAYMENT_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by fulfilment method"
        value={filters.fulfillment}
        onChange={(e) =>
          onChange({ fulfillment: e.target.value as OrdersFilterState["fulfillment"] })
        }
        className="hidden w-auto md:block"
      >
        <option value={ALL}>All fulfilment</option>
        {(Object.keys(FULFILLMENT_LABELS) as (keyof typeof FULFILLMENT_LABELS)[]).map((m) => (
          <option key={m} value={m}>
            {FULFILLMENT_LABELS[m]}
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
