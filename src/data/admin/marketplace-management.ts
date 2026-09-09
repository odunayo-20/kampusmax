import type {
  MarketplaceActivityEvent,
  MarketplaceFacets,
  MarketplaceFacetOption,
  MarketplaceListingDetail,
  MarketplaceListingRow,
  MarketplaceListingVendor,
  MarketplaceStatusCounts,
  MarketplaceVisibility,
} from "@/types/admin";
import type { Product, Vendor } from "@/types";
import { products } from "@/data/products";
import { vendors } from "@/data/users";
import { storefrontMeta } from "@/data/storefront";
import { categories } from "@/data/categories";
import { campuses } from "@/data/campus";

// ------------------------------------------------------------
// ADMIN MARKETPLACE CONSOLE — derived from the REAL stores.
//
// Every row is computed from the canonical product/vendor/
// storefront/category/campus seeds. Nothing is fabricated with
// PRNGs and no moderation or report data is invented: listings
// without real fields surface explicit nulls instead.
//
// This console is READ-ONLY. The prototype backend has no
// publish/unpublish/hide/restrict/feature endpoints, so no admin
// mutations are exposed here — see MODULE-39-REPORT.md.
// ------------------------------------------------------------

// ------------------------------------------------------------
// VERIFICATION / VISIBILITY MAPPERS
// ------------------------------------------------------------

export function verificationOf(
  vendorId: string,
  seed: Vendor | undefined
): MarketplaceListingRow["vendorVerification"] {
  const storefront = storefrontMeta[vendorId];
  if (storefront) {
    if (storefront.verificationStatus === "verified") return "verified";
    if (storefront.verificationStatus === "restricted") return "restricted";
    if (storefront.verificationStatus === "pending") return "pending";
    return "unverified";
  }
  return seed?.verified ? "verified" : "unverified";
}

export function storefrontAvailabilityOf(
  vendorId: string
): MarketplaceListingRow["storefrontAvailability"] {
  return storefrontMeta[vendorId]?.availabilityStatus ?? null;
}

/**
 * Honest listing visibility, derived ONLY from real product status,
 * publication state and the vendor's storefront availability:
 *   removed/sold          -> trading state dominates sales state
 *   publishedStatus !== active -> drafted/pending/inactive → unpublished
 *   storefront paused/missing  -> not buyer-visible → paused
 *   otherwise                    -> live
 */
export function visibilityOf(product: Product): MarketplaceVisibility {
  if (product.status === "removed") return "removed";
  if (product.status === "sold") return "sold";
  const publication = product.publishedStatus;
  if (publication && publication !== "active") return "unpublished";
  const storefront = storefrontMeta[product.vendorId];
  if (storefront) return storefront.availabilityStatus === "active" ? "live" : "paused_storefront";
  const seed = vendors.find((v) => v.id === product.vendorId);
  return seed?.verified ? "live" : "storefront_missing";
}

function categoryNameOf(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.name ?? categoryId;
}

function campusNameOf(campusId: string): { name: string; abbr: string } {
  const campus = campuses.find((c) => c.id === campusId);
  return campus
    ? { name: campus.name, abbr: campus.abbreviation }
    : { name: campusId, abbr: campusId.toUpperCase() };
}

// ------------------------------------------------------------
// ROW BUILDER
// ------------------------------------------------------------

function buildListingRow(product: Product): MarketplaceListingRow {
  const seed = vendors.find((v) => v.id === product.vendorId);
  const campus = campusNameOf(product.campusId);
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    images: product.images,
    condition: product.condition,
    categoryId: product.categoryId,
    categoryName: categoryNameOf(product.categoryId),
    campusId: product.campusId,
    campusName: campus.name,
    campusAbbr: campus.abbr,
    vendorId: product.vendorId,
    vendorName: seed?.storeName ?? "Unknown vendor",
    vendorVerified: seed?.verified ?? false,
    vendorVerification: verificationOf(product.vendorId, seed),
    storefrontAvailability: storefrontAvailabilityOf(product.vendorId),
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    status: product.status,
    publishedStatus: product.publishedStatus ?? null,
    visibility: visibilityOf(product),
    stock: product.stock ?? null,
    viewCount: product.viewCount ?? null,
    saveCount: product.saveCount ?? null,
    rating: product.rating ?? null,
    ratingCount: product.ratingCount ?? null,
    sku: product.sku ?? null,
    location: product.location ?? null,
    tags: product.tags ?? [],
    hasVariants: product.hasVariants ?? false,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt ?? null,
    archivedAt: product.archivedAt ?? null,
  };
}

// ------------------------------------------------------------
// ACTIVITY (derived purely from real listing timestamps)
// ------------------------------------------------------------

function buildListingActivity(product: Product): MarketplaceActivityEvent[] {
  const events: MarketplaceActivityEvent[] = [];
  let seq = 0;
  const push = (
    at: string,
    kind: MarketplaceActivityEvent["kind"],
    message: string,
    meta: string
  ) => {
    events.push({ id: `mktact-${product.id}-${++seq}`, kind, message, meta, at });
  };

  push(product.createdAt, "listing", `Listing “${product.title}” created`, "Listing");

  if (product.updatedAt) {
    if (product.publishedStatus === "active") {
      push(product.updatedAt, "publication", "Publication set to active", "Publication");
    } else {
      push(product.updatedAt, "listing", "Product details updated", "Listing");
    }
  }
  if (product.publishedStatus === "draft") {
    push(product.createdAt, "publication", "Saved as draft (not visible to buyers)", "Publication");
  }
  if (product.archivedAt) {
    push(product.archivedAt, "publication", "Listing archived", "Publication");
  }

  return events.sort((a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id));
}

// ------------------------------------------------------------
// VENDOR PROJECTION (slim, public-safe)
// ------------------------------------------------------------

function buildVendorProjection(vendorId: string): MarketplaceListingVendor | null {
  const seed = vendors.find((v) => v.id === vendorId);
  if (!seed) return null;
  const lastActive = products
    .filter((p) => p.vendorId === vendorId)
    .map((p) => p.updatedAt ?? p.createdAt)
    .sort()
    .at(-1);
  return {
    id: seed.id,
    storeName: seed.storeName,
    description: seed.description,
    campusId: seed.campusId,
    rating: seed.rating,
    productsCount: products.filter((p) => p.vendorId === vendorId).length,
    verified: seed.verified,
    verification: verificationOf(vendorId, seed),
    storefrontAvailability: storefrontAvailabilityOf(vendorId),
    lastActiveAt: lastActive ?? seed.joinDate ?? "",
  };
}

// ------------------------------------------------------------
// DATASET / OVERVIEW / FACETS
// ------------------------------------------------------------

export function buildMarketplaceRows(): MarketplaceListingRow[] {
  return products.map(buildListingRow);
}

export function buildListingDetail(productId: string): MarketplaceListingDetail | null {
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  return {
    listing: buildListingRow(product),
    vendor: buildVendorProjection(product.vendorId),
    activity: buildListingActivity(product),
  };
}

export function getMarketplaceCounts(rows: MarketplaceListingRow[]): MarketplaceStatusCounts {
  const byVisibility: Record<MarketplaceVisibility, number> = {
    live: 0,
    paused_storefront: 0,
    storefront_missing: 0,
    unpublished: 0,
    sold: 0,
    removed: 0,
  };
  let available = 0;
  for (const row of rows) {
    byVisibility[row.visibility] += 1;
    if (row.status === "available") available += 1;
  }
  return {
    all: rows.length,
    available,
    sold: byVisibility.sold,
    removed: byVisibility.removed,
    live: byVisibility.live,
    paused_storefront: byVisibility.paused_storefront,
    storefront_missing: byVisibility.storefront_missing,
    unpublished: byVisibility.unpublished,
  };
}

function facet(
  id: string,
  name: string,
  count: number
): MarketplaceFacetOption {
  return { id, name, count };
}

export function getMarketplaceFacets(rows: MarketplaceListingRow[]): MarketplaceFacets {
  const byCategory = new Map<string, MarketplaceFacetOption>();
  const byCampus = new Map<string, MarketplaceFacetOption>();
  const byVendor = new Map<string, MarketplaceFacetOption>();

  for (const row of rows) {
    const cat = byCategory.get(row.categoryId);
    if (cat) cat.count += 1;
    else byCategory.set(row.categoryId, facet(row.categoryId, row.categoryName, 1));

    const campus = byCampus.get(row.campusId);
    if (campus) campus.count += 1;
    else byCampus.set(row.campusId, facet(row.campusId, row.campusName, 1));

    const vendor = byVendor.get(row.vendorId);
    if (vendor) vendor.count += 1;
    else byVendor.set(row.vendorId, facet(row.vendorId, row.vendorName, 1));
  }

  const sortByName = (a: MarketplaceFacetOption, b: MarketplaceFacetOption) =>
    a.name.localeCompare(b.name);

  return {
    categories: [...byCategory.values()].sort(sortByName),
    campuses: [...byCampus.values()].sort(sortByName),
    vendors: [...byVendor.values()].sort(sortByName),
  };
}