import {
  ContentReport,
  ManagedProduct,
  ManagedProductDetail,
  ProductActivityEvent,
  ProductReviewRow,
  ProductSpecification,
} from "@/types/admin";
import { mockProducts } from "./catalog";
import { mockCampuses } from "./campuses";
import { USER_NAME_POOL } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/products CONSOLE
//
// Derives managed products from the canonical `mockProducts`
// seed so every product id across the platform keeps resolving.
// Deterministic (seeded PRNG) - identical output every reload.
// ------------------------------------------------------------

const { FIRST_NAMES, LAST_NAMES } = USER_NAME_POOL;

const PLATFORM_REVIEWERS = [
  "Adebayo Ogundimu",
  "Chiamaka Eze",
  "Tunde Bakare",
] as const;

// Stable Unsplash photo pools per category family (w=600 for detail,
// the same URL scales down fine for thumbnails).
const IMAGE_POOLS: Record<string, readonly string[]> = {
  electronics: [
    "photo-1541807084-5c52b6b3adef",
    "photo-1496181133206-80ce9b88a853",
    "photo-1527443224154-c4a3942d3acf",
  ],
  phones: [
    "photo-1511707171634-5f897ff02aa9",
    "photo-1592750475338-74b7b21085ab",
    "photo-1510557880182-3d4d3cba35a5",
  ],
  audio: [
    "photo-1505740420928-5e560c06d30e",
    "photo-1608043152269-423dbba4e7e1",
    "photo-1484704849700-f032a568e944",
  ],
  books: [
    "photo-1544947950-fa07a98d237f",
    "photo-1543002588-bfa74002ed7e",
    "photo-1512820790803-83ca734da794",
    "photo-1524578271613-d550eacf6090",
  ],
  fashion: [
    "photo-1551028719-00167b16eac5",
    "photo-1542291026-7eec264c27ff",
    "photo-1521572163474-6864f9cf17ab",
    "photo-1608256246200-53e635b5b65f",
  ],
  groceries: [
    "photo-1542838132-92c53300491e",
    "photo-1610348725531-843dff563e2c",
    "photo-1506617564039-2f3b650b7010",
  ],
  beauty: [
    "photo-1596462502278-27bfdc403348",
    "photo-1571781926291-c477ebfd024b",
    "photo-1522335789203-aabd1fc54bc9",
  ],
  home: [
    "photo-1555041469-a586c61ea9bc",
    "photo-1584100936595-c0654b55a2e2",
    "photo-1513694203232-719a280e022f",
  ],
  services: [
    "photo-1568205612837-017257d2310a",
    "photo-1450101499163-c8848c66ca85",
    "photo-1580828343064-fde4fc206bc6",
  ],
  sports: [
    "photo-1517836357463-d25dfeac3438",
    "photo-1571019613454-1cb2f99b2d8b",
    "photo-1547919307-1ecb10702e6f",
  ],
};

function imagePoolFor(categoryName: string): readonly string[] {
  const c = categoryName.toLowerCase();
  if (c.includes("phone")) return IMAGE_POOLS.phones;
  if (c.includes("audio")) return IMAGE_POOLS.audio;
  if (c.includes("book") || c.includes("text")) return IMAGE_POOLS.books;
  if (c.includes("fashion")) return IMAGE_POOLS.fashion;
  if (c.includes("groceries") || c.includes("food")) return IMAGE_POOLS.groceries;
  if (c.includes("beauty")) return IMAGE_POOLS.beauty;
  if (c.includes("home")) return IMAGE_POOLS.home;
  if (c.includes("service") || c.includes("printing")) return IMAGE_POOLS.services;
  if (c.includes("sport")) return IMAGE_POOLS.sports;
  return IMAGE_POOLS.electronics;
}

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?q=80&w=600&auto=format&fit=crop`;
}

const DESCRIPTIONS = [
  "Carefully checked before listing - what you see is exactly what gets delivered to your hostel gate.",
  "Sourced from trusted suppliers and priced for the student budget without cutting corners on quality.",
  "Bought during a bulk restock; a few units left at this price before the next shipment lands.",
  "Popular with students on this campus - order early in the week to guarantee same-day pickup.",
  "Includes everything shown in the photos. Message the store for bulk or departmental orders.",
] as const;

const EXTRA_SPEC_POOL = [
  { label: "Warranty", values: ["7 days checking", "14 days", "None", "30 days seller"] },
  { label: "Brand", values: ["Generic", "Oraimo", "HP", "Adidas", "Anker", "Local"] },
  { label: "Colour", values: ["Black", "Blue", "Silver", "Brown", "Multicolour"] },
  { label: "Weight", values: ["0.5 kg", "1 kg", "2.5 kg", "Varies by unit"] },
  { label: "Delivery", values: ["Pickup only", "Hostel delivery", "Meetup + delivery", "Nationwide"] },
] as const;

const REVIEW_COMMENTS = [
  "Exactly as described - delivered to my hostel same evening.",
  "Good value for the price, no complaints so far.",
  "Seller was responsive and pickup was quick at the usual spot.",
  "Item works fine but the packaging could be better.",
  "Second time buying this - consistent quality every time.",
  "Took slightly longer than promised but the item is solid.",
];

const REPORT_REASONS = [
  { reason: "counterfeit", detail: "Item looks fake compared to official product photos." },
  { reason: "scam", detail: "Vendor asked to complete payment outside the app via bank transfer." },
  { reason: "inappropriate", detail: "Listing photos contain unrelated content." },
  { reason: "spam", detail: "Same listing reposted five times today to crowd the feed." },
  { reason: "other", detail: "Price changed after I placed the order." },
] as const;

export function buildManagedProductDataset() {
  const rand = seededRandom(777);
  const products: ManagedProduct[] = [];
  const details = new Map<string, ManagedProductDetail>();

  mockProducts.forEach((seed, i) => {
    // Lifecycle mapping with forced coverage rows.
    let status: ManagedProduct["status"];
    switch (seed.status) {
      case "pending_review":
        status = "pending_approval";
        break;
      case "flagged":
        status = "suspended";
        break;
      case "sold":
        status = "out_of_stock";
        break;
      case "removed":
        status = i % 2 === 0 ? "rejected" : "archived";
        break;
      default:
        status = seed.stock === 0 ? "out_of_stock" : "active";
    }

    const registeredDaysAgo = intBetween(rand, 3, 300);
    const salesCount =
      status === "active" || status === "out_of_stock"
        ? intBetween(rand, 2, 180)
        : intBetween(rand, 0, 20);
    const revenue = Math.round(salesCount * seed.price * (0.85 + rand() * 0.3));
    const reviewsCount =
      status === "active" ? intBetween(rand, 0, 60) : intBetween(rand, 0, 12);
    const ratingRaw = 3 + rand() * 2;
    const rating = Math.min(5, Number(ratingRaw.toFixed(1)));
    const reportsCount =
      status === "suspended" ? intBetween(rand, 2, 9) : rand() > 0.88 ? intBetween(rand, 1, 3) : 0;

    const pool = imagePoolFor(seed.categoryName);
    const images = [
      pool[i % pool.length],
      pool[(i + 1) % pool.length],
      pool[(i + 2) % pool.length],
    ].map(unsplash);

    const specifications = buildSpecifications(seed.condition);

    const product: ManagedProduct = {
      id: seed.id,
      title: seed.title,
      images,
      slug: seed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: pick(rand, DESCRIPTIONS),
      specifications,
      vendorId: seed.vendorId,
      vendorName: seed.vendorName,
      categoryId: seed.categoryId,
      categoryName: seed.categoryName,
      campusId: seed.campusId,
      price: seed.price,
      originalPrice: seed.originalPrice,
      condition: seed.condition,
      status,
      moderation: buildModeration(rand, status, registeredDaysAgo),
      stock:
        status === "out_of_stock"
          ? 0
          : status === "archived" || status === "rejected"
            ? seed.stock
            : Math.max(seed.stock, 1),
      views: seed.views,
      saves: seed.saves,
      salesCount,
      revenue,
      rating,
      reviewsCount,
      reportsCount,
      createdAt: seed.createdAt,
      updatedAt: daysAgoIso(rand, intBetween(rand, 0, Math.max(registeredDaysAgo - 1, 1))),
    };
    products.push(product);
    details.set(product.id, buildDetail(product, rand));
  });

  return { products, details };
}

function buildSpecifications(condition: ManagedProduct["condition"]): ProductSpecification[] {
  const specs: ProductSpecification[] = [{ label: "Condition", value: condition }];
  // Deterministic subset of extra specs (3 of the pool).
  const stride = condition === "New" ? 0 : condition === "Used" ? 1 : 2;
  EXTRA_SPEC_POOL.forEach((entry, i) => {
    specs.push({
      label: entry.label,
      value: entry.values[(i + stride) % entry.values.length],
    });
  });
  return specs;
}

function buildModeration(
  rand: () => number,
  status: ManagedProduct["status"],
  createdDaysAgo: number
): ManagedProduct["moderation"] {
  const submittedAt = daysAgoIso(rand, createdDaysAgo);
  if (status === "pending_approval") {
    return {
      submittedAt,
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      suspensionReason: null,
    };
  }
  const reviewedAt = daysAgoIso(rand, Math.max(intBetween(rand, 0, createdDaysAgo - 1), 0));
  const reviewer = pick(rand, PLATFORM_REVIEWERS);
  if (status === "rejected") {
    return {
      submittedAt,
      reviewedAt,
      reviewedBy: reviewer,
      rejectionReason: pick(rand, REJECT_REASONS),
      suspensionReason: null,
    };
  }
  if (status === "suspended") {
    return {
      submittedAt,
      reviewedAt,
      reviewedBy: reviewer,
      rejectionReason: null,
      suspensionReason: pick(rand, SUSPEND_REASONS),
    };
  }
  return {
    submittedAt,
    reviewedAt,
    reviewedBy: reviewer,
    rejectionReason: null,
    suspensionReason: null,
  };
}

const REJECT_REASONS = [
  "Photos don't show the actual item - re-upload real pictures before resubmitting.",
  "Restricted item category; this listing can't be sold on Kampmax.",
] as const;

const SUSPEND_REASONS = [
  "Multiple buyer complaints about item quality within 7 days.",
  "Suspected counterfeit based on buyer reports and photo review.",
] as const;

// ------------------------------------------------------------
// PER-PRODUCT DETAIL GENERATORS
// ------------------------------------------------------------

function buildDetail(
  product: ManagedProduct,
  rand: () => number
): ManagedProductDetail {
  const campus = mockCampuses.find((c) => c.id === product.campusId) ?? null;
  return {
    product,
    vendor: {
      id: product.vendorId,
      storeName: product.vendorName,
      campusId: product.campusId,
      rating: Math.min(5, Number((product.rating + (rand() - 0.4) * 0.6).toFixed(1))),
      productsCount: intBetween(rand, 4, 48),
    },
    campus,
    reviews: buildReviews(product, rand),
    reports: buildReports(product, rand),
    activity: buildActivity(product, rand),
  };
}

function buildReviews(
  product: ManagedProduct,
  rand: () => number
): ProductReviewRow[] {
  if (product.reviewsCount === 0) return [];
  const count = Math.min(Math.max(Math.round(product.reviewsCount / 8), 2), 6);
  return Array.from({ length: count })
    .map((_, i) => {
      const roll = rand();
      return {
        id: `prev-${product.id}-${i + 1}`,
        customerName: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
        rating: roll > 0.55 ? intBetween(rand, 4, 5) : roll > 0.3 ? 3 : intBetween(rand, 1, 2),
        comment: REVIEW_COMMENTS[intBetween(rand, 0, REVIEW_COMMENTS.length - 1)],
        status: rand() > 0.86 ? ("flagged" as const) : ("published" as const),
        helpfulCount: intBetween(rand, 0, 42),
        createdAt: daysAgoIso(rand, intBetween(rand, 0, 60)),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildReports(
  product: ManagedProduct,
  rand: () => number
): ContentReport[] {
  return Array.from({ length: product.reportsCount }).map((_, i) => {
    const template = REPORT_REASONS[i % REPORT_REASONS.length];
    const statusRoll = rand();
    return {
      id: `rpt-${product.id}-${i + 1}`,
      targetType: "product" as const,
      targetId: product.id,
      targetPreview: product.title,
      reason: template.reason,
      detail: template.detail,
      reporterName: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
      reportedName: product.vendorName,
      status:
        statusRoll > 0.66
          ? ("open" as const)
          : statusRoll > 0.42
            ? ("reviewing" as const)
            : statusRoll > 0.2
              ? ("resolved" as const)
              : ("dismissed" as const),
      priority: template.reason === "scam" ? ("high" as const)
        : template.reason === "counterfeit" ? ("medium" as const)
        : ("low" as const),
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 45)),
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

type ActivityTemplate = () => { message: string; meta: string };

const ACTIVITY_MESSAGES: Record<ProductActivityEvent["kind"], ActivityTemplate[]> = {
  listing: [
    () => ({ message: "Listing details edited by the vendor", meta: "Catalog" }),
    () => ({ message: "Stock quantity updated after restock", meta: "Inventory" }),
    () => ({ message: "New showcase photo added to gallery", meta: "Catalog" }),
  ],
  order: [
    () => ({ message: "Unit sold and marked ready for pickup", meta: "Commerce" }),
    () => ({ message: "Order cancelled by buyer before fulfilment", meta: "Commerce" }),
  ],
  moderation: [
    () => ({ message: "Buyer report submitted against this listing", meta: "Trust & Safety" }),
    () => ({ message: "Automated check flagged the title keywords", meta: "Trust & Safety" }),
  ],
  pricing: [
    () => ({ message: "Price reduced for weekend promo", meta: "Pricing" }),
    () => ({ message: "Compare-at price removed", meta: "Pricing" }),
  ],
  admin: [
    () => ({ message: "Listing reviewed by platform admin", meta: "Admin console" }),
    () => ({ message: "Listing visibility changed by platform admin", meta: "Admin console" }),
  ],
};

function buildActivity(
  product: ManagedProduct,
  rand: () => number
): ProductActivityEvent[] {
  const events: ProductActivityEvent[] = [];

  if (product.moderation.reviewedBy) {
    events.push({
      id: `pact-${product.id}-mod`,
      kind: "admin",
      message:
        product.status === "rejected"
          ? `Rejected by ${product.moderation.reviewedBy}`
          : product.status === "suspended"
            ? `Suspended by ${product.moderation.reviewedBy}`
            : `Approved by ${product.moderation.reviewedBy}`,
      meta: "Moderation",
      at: product.moderation.reviewedAt ?? daysAgoIso(rand, 5),
    });
  }

  const kinds = Object.keys(ACTIVITY_MESSAGES) as ProductActivityEvent["kind"][];
  for (let i = 0; i < 8; i++) {
    const kind = pick(rand, kinds);
    const templates = ACTIVITY_MESSAGES[kind];
    const tpl = templates[intBetween(rand, 0, templates.length - 1)]();
    events.push({
      id: `pact-${product.id}-${i + 1}`,
      kind,
      message: tpl.message,
      meta: tpl.meta,
      at: daysAgoIso(rand, intBetween(rand, 0, 30)),
    });
  }
  return events.sort(
    (a, b) =>
      new Date(b.at).getTime() - new Date(a.at).getTime() ||
      a.id.localeCompare(b.id)
  );
}
