import {
  ManagedPromotion,
  ManagedPromotionStatus,
  ManagedPromotionType,
  PromotionPlacement,
} from "@/types/admin";
import { mockCategories, mockProducts } from "./catalog";
import { mockCampuses } from "./campuses";
import { mockVendors } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// PROMOTION MANAGEMENT DATASET (/admin/promotions)
//
// Index-bucketed patterns guarantee every type and status is
// always represented regardless of seed luck.
// ------------------------------------------------------------

const TYPE_PATTERN: ManagedPromotionType[] = [
  "promo_code",
  "percentage_discount",
  "featured_vendor",
  "fixed_discount",
  "featured_product",
  "campus_promotion",
];

const STATUS_PATTERN: ManagedPromotionStatus[] = [
  "active",
  "scheduled",
  "active",
  "paused",
  "draft",
  "ended",
  "active",
  "scheduled",
  "active",
  "ended",
  "draft",
  "active",
  "paused",
  "scheduled",
  "ended",
  "active",
  "draft",
  "ended",
];

const PLACEMENTS: PromotionPlacement[] = [
  "homepage_banner",
  "deals_page",
  "category_strip",
  "search_boost",
];

const CODES = [
  "CAMPUS15",
  "FRESHER20",
  "EXAMSAVER",
  "MOVEIN10",
  "DETTY25",
  "READMORE",
];

const NAMES: Record<ManagedPromotionType, string[]> = {
  percentage_discount: [
    "Back to Campus Sale",
    "Flash Weekend - 25% Off",
    "Freshers Welcome Deal",
    "Mid-Semester Markdown",
  ],
  fixed_discount: [
    "Textbook Boost - N1,500 Off",
    "Move-In Week N2,000 Off",
    "Gadget Bundle Discount",
    "Food Friday Flat Discount",
  ],
  promo_code: [
    "Campus Saver Code",
    "New Student Promo Code",
    "Exam Season Code",
    "December Detty Code",
  ],
  featured_product: [
    "Featured Gadget of the Week",
    "Trending Textbook Spotlight",
    "Hostess Essentials Feature",
    "Sneaker Heat Showcase",
  ],
  featured_vendor: [
    "Vendor Spotlight Program",
    "Store of the Week Feature",
    "Trusted Seller Highlight",
    "New Vendor Launch Feature",
  ],
  campus_promotion: [
    "Orientation Week Deals",
    "Matriculation Mega Market",
    "Campus Open Market Day",
    "Hall Week Shopping Fest",
  ],
};

const DESCRIPTIONS: Record<ManagedPromotionType, string> = {
  percentage_discount:
    "Percentage price cut applied to eligible listings while the campaign runs.",
  fixed_discount:
    "Flat naira amount knocked off eligible baskets at checkout.",
  promo_code:
    "Redeemable code customers enter at checkout to unlock the discount.",
  featured_product:
    "Editorial placement pushing a product onto homepage and deals surfaces.",
  featured_vendor:
    "Store spotlight slot featuring a vendor across discovery surfaces.",
  campus_promotion:
    "Campus-wide campaign banner shown to students of the selected schools.",
};

export function buildPromotionManagementDataset(): ManagedPromotion[] {
  const rand = seededRandom(2028);
  const approvedVendors = mockVendors.filter((v) => v.status === "approved");
  const campusIds = mockCampuses.map((c) => c.id);
  const topLevelCategories = mockCategories.filter((c) => c.status === "active");
  const promotableProducts = mockProducts.filter((p) => p.status === "available");

  const rows: ManagedPromotion[] = [];
  let codeCursor = intBetween(rand, 0, CODES.length - 1);

  function nextCode(): string {
    const base = CODES[codeCursor % CODES.length];
    const cycle = Math.floor(codeCursor / CODES.length);
    codeCursor += 1;
    return cycle === 0 ? base : `${base}${cycle + 1}`;
  }

  for (let i = 0; i < STATUS_PATTERN.length; i++) {
    const id = `prm-${String(i + 1).padStart(3, "0")}`;
    const type = TYPE_PATTERN[i % TYPE_PATTERN.length];
    const status = STATUS_PATTERN[i];

    // Calendar windows that make each status truthful.
    let startOffset: number; // days relative to today (negative = future)
    let endOffset: number;
    if (status === "active" || status === "paused") {
      startOffset = intBetween(rand, 1, 30); // started in the past
      endOffset = -intBetween(rand, 5, 45); // ends in the future
    } else if (status === "scheduled") {
      startOffset = -intBetween(rand, 3, 21);
      endOffset = startOffset - intBetween(rand, 14, 40);
    } else if (status === "ended") {
      startOffset = intBetween(rand, 30, 75);
      endOffset = intBetween(rand, 1, 12);
    } else {
      // draft - planned window, not committed yet
      startOffset = -intBetween(rand, 0, 10);
      endOffset = startOffset - intBetween(rand, 10, 30);
    }
    const startsAt = daysAgoIso(rand, startOffset);
    const endsAt = daysAgoIso(rand, endOffset);

    const targeting = {
      campusIds: [] as string[],
      vendorIds: [] as string[],
      productIds: [] as string[],
      categoryIds: [] as string[],
    };

    let discountValue: number | null = null;
    let code: string | null = null;

    switch (type) {
      case "percentage_discount":
        discountValue = pick(rand, [10, 15, 20, 25, 30, 40]);
        break;
      case "fixed_discount":
        discountValue = pick(rand, [500, 1000, 1500, 2000, 2500]);
        break;
      case "promo_code":
        discountValue = pick(rand, [5, 10, 15, 20]);
        code = nextCode();
        break;
      case "featured_product": {
        const product = pick(rand, promotableProducts);
        targeting.productIds = [product.id];
        break;
      }
      case "featured_vendor": {
        const vendor = pick(rand, approvedVendors);
        targeting.vendorIds = [vendor.id];
        break;
      }
      case "campus_promotion": {
        const primary = pick(rand, campusIds);
        targeting.campusIds =
          rand() > 0.6 ? [primary, pick(rand, campusIds)] : [primary];
        break;
      }
    }

    // Discounts and codes are optionally scoped further.
    if (
      (type === "percentage_discount" ||
        type === "fixed_discount" ||
        type === "promo_code") &&
      rand() > 0.45
    ) {
      targeting.campusIds = [pick(rand, campusIds)];
    }
    if (
      (type === "percentage_discount" || type === "fixed_discount") &&
      rand() > 0.6
    ) {
      targeting.categoryIds = [pick(rand, topLevelCategories).id];
    }
    if (type === "percentage_discount" && rand() > 0.75) {
      const vendor = pick(rand, approvedVendors);
      targeting.vendorIds = [vendor.id];
    }

    const usageLimit =
      type === "featured_product" || type === "featured_vendor"
        ? null
        : rand() > 0.35
          ? pick(rand, [100, 200, 300, 500, 1000])
          : null;

    const usageCount =
      status === "ended"
        ? usageLimit ?? intBetween(rand, 80, 400)
        : Math.min(
            usageLimit ?? Number.MAX_SAFE_INTEGER,
            intBetween(rand, 0, Math.max(1, Math.floor((usageLimit ?? 250) * 0.7)))
          );

    const placement: PromotionPlacement =
      type === "featured_product" || type === "featured_vendor"
        ? pick(rand, ["homepage_banner", "category_strip", "search_boost"] as PromotionPlacement[])
        : type === "campus_promotion"
          ? pick(rand, ["homepage_banner", "deals_page"] as PromotionPlacement[])
          : pick(rand, PLACEMENTS);

    const createdAt = daysAgoIso(
      rand,
      Math.max(startOffset, 0) + intBetween(rand, 4, 20)
    );

    rows.push({
      id,
      name: `${pick(rand, NAMES[type])}`,
      description: DESCRIPTIONS[type],
      type,
      status,
      code,
      discountValue,
      minSpend:
        (type === "fixed_discount" || type === "promo_code") && rand() > 0.55
          ? pick(rand, [2000, 5000, 10000])
          : null,
      placement,
      targeting,
      usageCount,
      usageLimit,
      startsAt,
      endsAt,
      createdAt,
      updatedAt: daysAgoIso(rand, Math.min(intBetween(rand, 0, 6), Math.max(startOffset, 0))),
    });
  }

  return rows;
}
