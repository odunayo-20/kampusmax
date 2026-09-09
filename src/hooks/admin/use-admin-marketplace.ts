"use client";

// ============================================================
// ADMIN MARKETPLACE MANAGEMENT HOOKS (Module 39)
// ============================================================
//
// TanStack Query wrappers over the marketplace-management service
// (read-only listing oversight). Keys are scope-qualified by the
// acting operator's campus so a campus-scoped admin's cache can
// never leak rows/counts across campus boundaries. There are NO
// mutation hooks: the prototype backend exposes no moderation
// endpoints, so this console cannot alter listings yet.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { marketplaceManagementService } from "@/services/admin";
import type { MarketplaceListQuery } from "@/types/admin";
import { useAdminSession } from "@/lib/admin/admin-auth-context";

function useActor() {
  const { admin } = useAdminSession();
  if (!admin) {
    throw new Error("Admin marketplace hooks require an authenticated admin session");
  }
  return admin;
}

export function useAdminMarketplace(query: MarketplaceListQuery) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.marketplace.list(query, admin.campusId),
    queryFn: () => marketplaceManagementService.list(query),
  });
}

export function useAdminMarketplaceCounts() {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.marketplace.counts(admin.campusId),
    queryFn: () => marketplaceManagementService.getCounts(),
  });
}

export function useAdminMarketplaceFacets() {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.marketplace.facets(admin.campusId),
    queryFn: () => marketplaceManagementService.getFacets(),
  });
}

export function useAdminMarketplaceListing(id: string) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.marketplace.detail(id, admin.campusId),
    queryFn: () => marketplaceManagementService.getById(id),
  });
}

export function useAdminMarketplaceActivity(id: string) {
  const admin = useActor();
  return useQuery({
    queryKey: adminKeys.marketplace.activity(id, admin.campusId),
    queryFn: () => marketplaceManagementService.getActivity(id),
  });
}