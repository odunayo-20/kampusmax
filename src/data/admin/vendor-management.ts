import {
  ManagedVendor,
  ManagedVendorDetail,
  VendorActivityEvent,
  VendorBucket,
  VendorComplaintRow,
  VendorEarningsSummary,
  VendorDocState,
  VendorOrderRow,
  VendorProductRow,
  VendorReviewRow,
  VendorVerificationDocument,
  VendorVerificationDocKind,
  VendorVerificationRecord,
  VendorVerificationStatus,
  VendorStoreLifecycle,
  DisputeCategory,
} from "@/types/admin";
import { mockVendors } from "./people";
import { mockCampuses } from "./campuses";
import { USER_NAME_POOL } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/vendors MODULE
//
// Derives managed vendors from the canonical `mockVendors` seed
// so every vendor id across the platform keeps resolving.
// Deterministic (seeded PRNG) - identical output every reload.
// ------------------------------------------------------------

const { FIRST_NAMES, LAST_NAMES } = USER_NAME_POOL;

const PLATFORM_REVIEWERS = [
  "Adebayo Ogundimu",
  "Chiamaka Eze",
  "Tunde Bakare",
] as const;

const STORE_DESCRIPTIONS = [
  "Student-first store run from campus with same-day hostel delivery.",
  "Curated essentials for undergraduates - quality checked before listing.",
  "Family business serving the campus community since 2021.",
  "Fast-moving gadgets and accessories with warranty on every item.",
  "Printing, binding and academic materials for deadlines of every kind.",
] as const;

const PRODUCT_TITLES = [
  "HP Laptop Charger 65W", "Organic Chemistry 9th Edition", "Ankara Two-Piece Set",
  "Weekend Groceries Box", "Shea Butter Skincare Kit", "Memory Foam Pillow",
  "Bluetooth Speaker Mini", "Graph Ruled Notebook Pack", "Phone Ring Holder",
  "Extension Board 4-Way", "Laundry Basket Large", "Water Bottle 1L Steel",
  "Bed Sheet Set Plain", "Instant Noodles Carton", "USB-C Cable 2m",
] as const;

const ORDER_ITEMS_POOL = [
  "Textbook pack", "Power bank 20000mAh", "Hoodie", "Weekend groceries box",
  "Wireless earbuds", "Foam mattress 4x6", "Skincare kit", "Photocopy bundle",
  "Sneakers", "Bedding set",
] as const;

const REJECT_REASONS = [
  "Government ID details could not be matched against the provided BVN record.",
  "Campus permit expired - reapply with a current letter from student affairs.",
] as const;

const COMPLAINT_SUBJECTS: { subject: string; category: DisputeCategory }[] = [
  { subject: "Delivery promised in 24hrs, now day 3", category: "late_delivery" },
  { subject: "One item missing from sealed package", category: "item_not_received" },
  { subject: "Refund approved but not received", category: "refund_issue" },
  { subject: "Item differs from listed photos", category: "item_not_as_described" },
];

export function bucketOf(
  verificationStatus: VendorVerificationStatus,
  storeStatus: VendorStoreLifecycle
): VendorBucket {
  if (verificationStatus === "pending_verification") return "pending_verification";
  if (verificationStatus === "rejected") return "rejected";
  // Verified vendors fall back to their trading state.
  return storeStatus === "active"
    ? "verified"
    : storeStatus === "suspended"
      ? "suspended"
      : "deactivated";
}

function buildDocuments(
  rand: () => number,
  status: VendorVerificationStatus
): VendorVerificationDocument[] {
  const plan: { kind: VendorVerificationDocKind; label: string }[] = [
    { kind: "cac_certificate", label: "CAC certificate" },
    { kind: "government_id", label: "Government-issued ID" },
    { kind: "address_proof", label: "Proof of address" },
    { kind: "bank_details", label: "Bank account details" },
    { kind: "campus_permit", label: "Campus trade permit" },
  ];

  function rollState(i: number): VendorDocState {
    if (status === "verified") {
      // Verified stores may still have one freshly re-submitted doc.
      return i === 4 && rand() > 0.7 ? "submitted" : "approved";
    }
    if (status === "rejected") {
      return i <= 1 ? "approved" : i === 2 ? "rejected" : i === 3 ? "missing" : "submitted";
    }
    // Pending: mixed completeness for the queue UI.
    const r = rand();
    if (r > 0.75) return "missing";
    if (r > 0.55) return "approved";
    return "submitted";
  }

  return plan.map((p, i) => ({
    id: `doc-${p.kind}`,
    kind: p.kind,
    label: p.label,
    reference: `${p.kind.slice(0, 3).toUpperCase()}-${intBetween(rand, 10000, 99999)}`,
    state: rollState(i),
    note:
      status === "rejected" && i === 2
        ? pick(rand, REJECT_REASONS)
        : undefined,
  }));
}

function buildVerification(
  rand: () => number,
  status: VendorVerificationStatus,
  registeredDaysAgo: number
): VendorVerificationRecord {
  if (status === "pending_verification") {
    return {
      emailVerified: true,
      phoneVerified: rand() > 0.3,
      bvnVerified: false,
      documents: buildDocuments(rand, status),
      submittedAt: daysAgoIso(rand, intBetween(rand, 1, Math.min(registeredDaysAgo, 21))),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    };
  }
  if (status === "rejected") {
    const reason = pick(rand, REJECT_REASONS);
    return {
      emailVerified: true,
      phoneVerified: true,
      bvnVerified: false,
      documents: buildDocuments(rand, status),
      submittedAt: daysAgoIso(rand, intBetween(rand, registeredDaysAgo, registeredDaysAgo)),
      reviewedAt: daysAgoIso(rand, intBetween(rand, 1, Math.max(registeredDaysAgo - 1, 1))),
      reviewedBy: pick(rand, PLATFORM_REVIEWERS),
      rejectionReason: reason,
    };
  }
  return {
    emailVerified: true,
    phoneVerified: true,
    bvnVerified: true,
    documents: buildDocuments(rand, status),
    submittedAt: daysAgoIso(rand, registeredDaysAgo),
    reviewedAt: daysAgoIso(rand, intBetween(rand, 1, Math.max(registeredDaysAgo - 1, 1))),
    reviewedBy: pick(rand, PLATFORM_REVIEWERS),
    rejectionReason: null,
  };
}

/** Deterministic lifecycle assignment with forced coverage rows. */
function rollLifecycle(
  seedStatus: string,
  i: number
): { verification: VendorVerificationStatus; store: VendorStoreLifecycle } {
  if (seedStatus === "pending") {
    return { verification: "pending_verification", store: "deactivated" };
  }
  if (i === 6) return { verification: "rejected", store: "deactivated" };
  if (seedStatus === "suspended") {
    return { verification: "verified", store: "suspended" };
  }
  if (i === 11) return { verification: "verified", store: "deactivated" };
  return { verification: "verified", store: "active" };
}

export interface ManagedVendorDataset {
  vendors: ManagedVendor[];
  details: Map<string, ManagedVendorDetail>;
}

export function buildManagedVendorDataset(): ManagedVendorDataset {
  const rand = seededRandom(4242);
  const activeCampuses = mockCampuses.filter((c) => c.status === "active");
  const vendors: ManagedVendor[] = [];
  const details = new Map<string, ManagedVendorDetail>();

  mockVendors.forEach((seed, i) => {
    const lifecycle = rollLifecycle(seed.status, i);
    const registeredDaysAgo = intBetween(rand, 30, 400);
    const ownerName = seed.ownerName;
    const ordersCount =
      lifecycle.verification === "verified" ? intBetween(rand, 12, 320) : 0;
    const totalSales = ordersCount * intBetween(rand, 30, 160) * 50;
    const complaintsCount =
      lifecycle.store === "deactivated" && lifecycle.verification !== "verified"
        ? 0
        : rand() > 0.62 ? intBetween(rand, 1, 5) : 0;

    const vendor: ManagedVendor = {
      id: seed.id,
      storeName: seed.storeName,
      ownerId: seed.ownerId,
      owner: {
        id: seed.ownerId,
        name: ownerName,
        email: `${ownerName.toLowerCase().replace(/\s+/g, ".")}@student.edu.ng`,
        phone: seed.phone,
        isIdVerified: lifecycle.verification === "verified" ? true : rand() > 0.5,
        joinedAt: daysAgoIso(rand, registeredDaysAgo + intBetween(rand, 10, 200)),
        ordersCount:
          lifecycle.verification === "verified" ? intBetween(rand, 1, 20) : 0,
        totalSpent: intBetween(rand, 4, 90) * 250,
      },
      campusId: pick(rand, activeCampuses).id,
      category: seed.category,
      description: pick(rand, STORE_DESCRIPTIONS),
      verificationStatus: lifecycle.verification,
      storeStatus: lifecycle.store,
      verification: buildVerification(rand, lifecycle.verification, registeredDaysAgo),
      productsCount:
        lifecycle.store === "active" ? seed.productsCount : intBetween(rand, 0, 24),
      ordersCount,
      totalSales,
      earnings: Math.round(totalSales * 0.92),
      walletBalance: seed.walletBalance,
      fulfillmentRate: seed.fulfillmentRate,
      rating: seed.rating,
      reviewsCount:
        lifecycle.store === "active" ? seed.reviewsCount : intBetween(rand, 0, 40),
      complaintsCount,
      registeredAt: seed.joinedAt,
      lastActiveAt: daysAgoIso(
        rand,
        lifecycle.store === "active" ? intBetween(rand, 0, 7) : intBetween(rand, 8, 60)
      ),
    };
    vendors.push(vendor);
    details.set(vendor.id, buildVendorDetail(vendor, rand));
  });

  return { vendors, details };
}

// ------------------------------------------------------------
// PER-VENDOR DETAIL GENERATORS
// ------------------------------------------------------------

function buildVendorDetail(
  vendor: ManagedVendor,
  rand: () => number
): ManagedVendorDetail {
  return {
    vendor,
    campus: mockCampuses.find((c) => c.id === vendor.campusId) ?? null,
    earnings: buildEarnings(vendor, rand),
    products: buildProducts(vendor, rand),
    orders: buildOrders(vendor, rand),
    reviews: buildReviews(vendor, rand),
    complaints: buildComplaints(vendor, rand),
    activity: buildActivity(vendor, rand),
  };
}

function buildEarnings(
  vendor: ManagedVendor,
  rand: () => number
): VendorEarningsSummary {
  const commissionRate = 0.08;
  const commissionPaid = Math.round(vendor.totalSales * commissionRate);
  return {
    grossSales: vendor.totalSales,
    commissionRate,
    commissionPaid,
    netEarnings: vendor.totalSales - commissionPaid,
    pendingPayout: vendor.walletBalance,
    lastPayoutAt:
      vendor.totalSales > 0
        ? daysAgoIso(rand, intBetween(rand, 2, 30))
        : null,
  };
}

function buildProducts(
  vendor: ManagedVendor,
  rand: () => number
): VendorProductRow[] {
  if (vendor.productsCount === 0) return [];
  const count = Math.min(Math.max(Math.round(vendor.productsCount / 8), 3), 6);
  return Array.from({ length: count }).map((_, i) => ({
    id: `prd-${vendor.id}-${i + 1}`,
    title: PRODUCT_TITLES[intBetween(rand, 0, PRODUCT_TITLES.length - 1)],
    price: intBetween(rand, 12, 480) * 250,
    stock: rand() > 0.85 ? 0 : intBetween(rand, 1, 60),
    status: pick(rand, [
      "available", "available", "available", "sold", "pending_review", "flagged",
    ] as const),
    soldCount: intBetween(rand, 0, 140),
    createdAt: daysAgoIso(rand, intBetween(rand, 5, 300)),
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildOrders(
  vendor: ManagedVendor,
  rand: () => number
): VendorOrderRow[] {
  if (vendor.ordersCount === 0) return [];
  const count = Math.min(Math.max(Math.round(vendor.ordersCount / 14), 3), 8);
  return Array.from({ length: count }).map((_, i) => {
    const itemsCount = intBetween(rand, 1, 4);
    return {
      id: `KMP-${4200 + Number(vendor.id.split("-")[1]) * 11 + i}`,
      customerName: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
      itemsSummary: `${itemsCount}\u00d7 ${pick(rand, ORDER_ITEMS_POOL)}`,
      itemsCount,
      total: intBetween(rand, 10, 260) * 250,
      status: pick(rand, [
        "delivered", "delivered", "delivered", "out_for_delivery",
        "confirmed", "placed", "cancelled",
      ] as const),
      paymentStatus: rand() > 0.88 ? ("pending" as const) : ("paid" as const),
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 45)),
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildReviews(
  vendor: ManagedVendor,
  rand: () => number
): VendorReviewRow[] {
  if (vendor.reviewsCount === 0) return [];
  const count = Math.min(Math.max(Math.round(vendor.reviewsCount / 18), 2), 6);
  const COMMENTS = [
    "Item matched the description exactly - delivered to my hostel same evening.",
    "Good quality but pickup took almost two days to get ready.",
    "Excellent communication, will definitely buy again.",
    "Packaging was poor though the product survived.",
    "Vendor went out of their way to swap a size for me. Great service.",
  ] as const;
  return Array.from({ length: count }).map((_, i) => {
    const ratingRoll = rand();
    return {
      id: `rev-${vendor.id}-${i + 1}`,
      customerName: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
      targetName: PRODUCT_TITLES[intBetween(rand, 0, PRODUCT_TITLES.length - 1)],
      rating: ratingRoll > 0.55 ? intBetween(rand, 4, 5) : ratingRoll > 0.3 ? 3 : intBetween(rand, 1, 2),
      comment: pick(rand, COMMENTS),
      status: rand() > 0.85 ? ("flagged" as const) : ("published" as const),
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 40)),
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildComplaints(
  vendor: ManagedVendor,
  rand: () => number
): VendorComplaintRow[] {
  return Array.from({ length: vendor.complaintsCount }).map((_, i) => {
    const template = pick(rand, COMPLAINT_SUBJECTS);
    const statusRoll = rand();
    return {
      id: `cmp-${vendor.id}-${i + 1}`,
      orderId: `KMP-${intBetween(rand, 4000, 4999)}`,
      customerName: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
      subject: template.subject,
      category: template.category,
      priority: template.category === "item_not_received" && rand() > 0.5
        ? ("urgent" as const)
        : pick(rand, ["low", "medium", "high"] as const),
      amountInDispute: intBetween(rand, 20, 400) * 250,
      status:
        statusRoll > 0.68 ? ("open" as const)
        : statusRoll > 0.45 ? ("under_review" as const)
        : statusRoll > 0.25 ? ("resolved" as const)
        : ("closed" as const),
      openedAt: daysAgoIso(rand, intBetween(rand, 1, 35)),
    };
  }).sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
}

type ActivityTemplate = () => { message: string; meta: string };

const ACTIVITY_MESSAGES: Record<
  Exclude<VendorActivityEvent["kind"], never>,
  ActivityTemplate[]
> = {
  order: [
    () => ({ message: "New order received and confirmed", meta: "Commerce" }),
    () => ({ message: "Order marked delivered by campus courier", meta: "Fulfilment" }),
    () => ({ message: "Order cancelled by customer before preparation", meta: "Commerce" }),
  ],
  product: [
    () => ({ message: "New listing published to the storefront", meta: "Catalog" }),
    () => ({ message: "Prices updated across seasonal listings", meta: "Catalog" }),
    () => ({ message: "Listing flagged for review by automated checks", meta: "Trust & Safety" }),
  ],
  wallet: [
    () => ({ message: "Payout request submitted", meta: "Finance" }),
    () => ({ message: "Wallet credited after completed order", meta: "Finance" }),
  ],
  moderation: [
    () => ({ message: "Customer complaint escalated to support", meta: "Support" }),
    () => ({ message: "Dispute resolved in the vendor's favour", meta: "Support" }),
  ],
  admin: [
    () => ({ message: "Store settings updated by platform admin", meta: "Admin console" }),
    () => ({ message: "Verification documents reviewed", meta: "Verification" }),
  ],
  auth: [
    () => ({ message: "Owner signed in from a new device", meta: "Android · Chrome" }),
    () => ({ message: "Password changed successfully", meta: "Security" }),
  ],
};

function buildActivity(
  vendor: ManagedVendor,
  rand: () => number
): VendorActivityEvent[] {
  const events: VendorActivityEvent[] = [];
  let seq = 0;

  // Verification history is always pinned at the top when present.
  if (vendor.verification.reviewedBy) {
    events.push({
      id: `vact-${vendor.id}-v${++seq}`,
      kind: "admin",
      message:
        vendor.verificationStatus === "verified"
          ? `Verification approved by ${vendor.verification.reviewedBy}`
          : `Verification rejected by ${vendor.verification.reviewedBy}`,
      meta: "Verification",
      at: vendor.verification.reviewedAt ?? daysAgoIso(rand, 10),
    });
  }

  const kinds = Object.keys(ACTIVITY_MESSAGES) as VendorActivityEvent["kind"][];
  for (let i = 0; i < 10; i++) {
    const kind = pick(rand, kinds);
    const templates = ACTIVITY_MESSAGES[kind];
    const tpl = templates[intBetween(rand, 0, templates.length - 1)]();
    events.push({
      id: `vact-${vendor.id}-${seq + 1}`,
      kind,
      message: tpl.message,
      meta: tpl.meta,
      at: daysAgoIso(rand, intBetween(rand, 0, 25)),
    });
    seq++;
  }
  return events.sort(
    (a, b) =>
      new Date(b.at).getTime() - new Date(a.at).getTime() ||
      a.id.localeCompare(b.id)
  );
}
