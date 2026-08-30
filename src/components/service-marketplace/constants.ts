// ============================================================
// SERVICE MARKETPLACE UI MODEL (constants + filter state)
// ============================================================
// Pure UI concerns — no data access. Kept separate so the browse hook,
// filters, sort, and cards all stay in sync.

import type {
  ServicePriceBucket,
  ServiceSortOption,
} from "@/types/service-marketplace";
import type { ServiceProviderLocationType } from "@/types/service-provider";
import { SERVICE_LOCATION_LABELS } from "@/services/service-marketplace";

export interface ServiceMarketplaceFilters {
  q: string;
  categoryId: string;
  campusId: string;
  ratingMin: number; // 0 = any
  priceBucket: ServicePriceBucket;
  locationType: ServiceProviderLocationType | "";
  sort: ServiceSortOption;
}

export const defaultServiceFilters: ServiceMarketplaceFilters = {
  q: "",
  categoryId: "",
  campusId: "",
  ratingMin: 0,
  priceBucket: "",
  locationType: "",
  sort: "recommended",
};

export const PRICE_BUCKET_OPTIONS: { value: ServicePriceBucket; label: string }[] = [
  { value: "", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "under_5000", label: "Under ₦5,000" },
  { value: "5000_10000", label: "₦5,000 – ₦10,000" },
  { value: "10000_25000", label: "₦10,000 – ₦25,000" },
  { value: "25000_plus", label: "₦25,000+" },
];

export const RATING_OPTIONS: { min: number; label: string }[] = [
  { min: 0, label: "Any rating" },
  { min: 4, label: "4.0 & up" },
  { min: 3, label: "3.0 & up" },
  { min: 2, label: "2.0 & up" },
];

export const LOCATION_OPTIONS: { value: ServiceProviderLocationType | ""; label: string }[] = [
  { value: "", label: "Any location" },
  { value: "provider_location", label: SERVICE_LOCATION_LABELS.provider_location },
  { value: "customer_location", label: SERVICE_LOCATION_LABELS.customer_location },
  { value: "both", label: SERVICE_LOCATION_LABELS.both },
  { value: "online", label: SERVICE_LOCATION_LABELS.online },
  { value: "flexible", label: SERVICE_LOCATION_LABELS.flexible },
];

export const SORT_OPTIONS: { value: ServiceSortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "top_rated", label: "Top rated" },
  { value: "most_popular", label: "Most popular" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

export function serviceSortLabel(sort: ServiceSortOption): string {
  return SORT_OPTIONS.find((s) => s.value === sort)?.label ?? "Recommended";
}

export function activeServiceFilterCount(filters: ServiceMarketplaceFilters): number {
  let count = 0;
  if (filters.categoryId) count++;
  if (filters.campusId) count++;
  if (filters.ratingMin) count++;
  if (filters.priceBucket) count++;
  if (filters.locationType) count++;
  return count;
}