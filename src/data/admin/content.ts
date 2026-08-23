import {
  AdminReview,
  CampusPost,
  ContentReport,
  Dispute,
} from "@/types/admin";
import { mockProducts } from "./catalog";
import { mockOrders } from "./commerce";
import { mockUsers, mockVendors } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// CAMPUS FEED POSTS (moderation view)
// ------------------------------------------------------------

const POST_EXCERPTS: Record<string, readonly string[]> = {
  discussion: [
    "Is it just me or has transport fare from Backline doubled this week?",
    "Best reading spot during exam week? Library is always full.",
    "Thoughts on the new faculty block opening next semester?",
  ],
  question: [
    "Anyone know when course registration portal closes?",
    "Where can I print colored pages around campus cheaply?",
    "Does the school shuttle still run after 9pm?",
  ],
  event: [
    "Departmental Week: Jersey day, food fair and talent night!",
    "Tech Meetup - Building products for Nigerian students",
    "Inter-level football finals this Saturday at the sports complex",
  ],
  marketplace: [
    "Selling fairly used mini fridge, perfect for hostel life",
    "Brand new mattresses available for delivery to your lodge",
    "Weekend promo: haircut + shave combo at my shop in town",
  ],
  announcement: [
    "SRC budget town hall holds Wednesday at the auditorium",
    "Water supply maintenance on Saturday morning - store water",
  ],
  lost_found: [
    "Found: student ID card near the science complex gate",
    "Lost: black JBL speaker at Melody Hostel common room",
  ],
};

export function buildMockPosts(count = 14): CampusPost[] {
  const rand = seededRandom(131);
  const types = ["discussion", "question", "event", "marketplace", "announcement", "lost_found"] as const;
  const posts: CampusPost[] = [];

  for (let i = 0; i < count; i++) {
    const author = mockUsers[intBetween(rand, 0, mockUsers.length - 1)];
    const type = pick(rand, types);
    const statusRoll = rand();

    posts.push({
      id: `pst-${String(i + 1).padStart(3, "0")}`,
      authorId: author.id,
      authorName: author.name,
      campusId: author.campusId,
      type,
      excerpt: pick(rand, POST_EXCERPTS[type]),
      status:
        statusRoll > 0.86 ? "flagged" : statusRoll > 0.8 ? "pending" : statusRoll > 0.76 ? "removed" : "published",
      reportsCount: statusRoll > 0.8 ? intBetween(rand, 1, 7) : 0,
      likes: intBetween(rand, 2, 240),
      comments: intBetween(rand, 0, 48),
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 20)),
    });
  }
  return posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const mockPosts: CampusPost[] = buildMockPosts();

// ------------------------------------------------------------
// CONTENT REPORTS
// ------------------------------------------------------------

const REPORT_REASONS = ["spam", "inappropriate", "scam", "harassment", "counterfeit", "other"] as const;
const REPORT_DETAILS: Record<string, string> = {
  spam: "Same listing posted across multiple campuses within an hour.",
  inappropriate: "Content contains offensive language targeting a department.",
  scam: "Seller requested payment outside Kampmax before delivery.",
  harassment: "Repeated abusive messages after a failed negotiation.",
  counterfeit: "Product photos show branded items with suspicious pricing.",
  other: "User reported miscategorized listing with misleading price.",
};

export function buildMockReports(count = 13): ContentReport[] {
  const rand = seededRandom(151);
  const targets = ["post", "product", "user", "review"] as const;
  const reports: ContentReport[] = [];

  for (let i = 0; i < count; i++) {
    const targetType = pick(rand, targets);
    const reason = pick(rand, REPORT_REASONS);
    const reporter = mockUsers[intBetween(rand, 0, mockUsers.length - 1)];
    const reported =
      targetType === "product"
        ? `${pick(rand, mockProducts).title} (${pick(rand, mockVendors).storeName})`
        : pick(rand, mockUsers).name;
    const statusRoll = rand();

    reports.push({
      id: `rpt-${String(i + 1).padStart(3, "0")}`,
      targetType,
      targetId:
        targetType === "post"
          ? pick(rand, mockPosts).id
          : targetType === "product"
            ? pick(rand, mockProducts).id
            : pick(rand, mockUsers).id,
      targetPreview: reported,
      reason,
      detail: REPORT_DETAILS[reason],
      reporterName: reporter.name,
      reportedName: typeof reported === "string" ? reported.split(" (")[0] : "Unknown",
      status:
        statusRoll > 0.72 ? "open" : statusRoll > 0.5 ? "reviewing" : statusRoll > 0.25 ? "resolved" : "dismissed",
      priority:
        reason === "scam" || reason === "counterfeit" ? (rand() > 0.5 ? "high" : "medium") : rand() > 0.6 ? "medium" : "low",
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 14)),
    });
  }
  return reports.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const mockReports: ContentReport[] = buildMockReports();

// ------------------------------------------------------------
// REVIEWS
// ------------------------------------------------------------

const REVIEW_COMMENTS = [
  "Item matched the description exactly, seller even delivered to my hostel same evening.",
  "Good quality but took almost two days before pickup was ready.",
  "The textbook had more highlights than expected from the 'Fair' description.",
  "Excellent communication, will definitely buy from this vendor again.",
  "Packaging was poor though the product itself survived.",
  "Vendor refused to respond after payment until I opened a dispute.",
];

export function buildMockReviews(count = 18): AdminReview[] {
  const rand = seededRandom(173);
  const reviews: AdminReview[] = [];

  for (let i = 0; i < count; i++) {
    const customer = mockUsers[intBetween(rand, 0, mockUsers.length - 1)];
    const vendor = pick(rand, mockVendors.filter((v) => v.status === "approved"));
    const isProductTarget = rand() > 0.4;
    const ratingRoll = rand();
    const statusRoll = rand();

    reviews.push({
      id: `rev-${String(i + 1).padStart(3, "0")}`,
      targetType: isProductTarget ? "product" : "vendor",
      targetName: isProductTarget ? pick(rand, mockProducts).title : vendor.storeName,
      customerId: customer.id,
      customerName: customer.name,
      vendorName: vendor.storeName,
      campusId: vendor.campusId,
      rating: ratingRoll > 0.55 ? intBetween(rand, 4, 5) : ratingRoll > 0.3 ? 3 : intBetween(rand, 1, 2),
      comment: pick(rand, REVIEW_COMMENTS),
      status:
        statusRoll > 0.85 ? "flagged" : statusRoll > 0.78 ? "pending" : statusRoll > 0.74 ? "removed" : "published",
      helpfulCount: intBetween(rand, 0, 34),
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 25)),
    });
  }
  return reviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const mockReviews: AdminReview[] = buildMockReviews();

// ------------------------------------------------------------
// DISPUTES
// ------------------------------------------------------------

const DISPUTE_SUBJECTS: { subject: string; category: Dispute["category"] }[] = [
  { subject: "Order marked delivered but nothing arrived", category: "item_not_received" },
  { subject: "Phone battery health far below stated spec", category: "item_not_as_described" },
  { subject: "Mattress arrived torn on one side", category: "damaged_item" },
  { subject: "Delivery promised in 24hrs, now day 4", category: "late_delivery" },
  { subject: "Refund approved 10 days ago, not received", category: "refund_issue" },
  { subject: "Vendor sent wrong textbook edition", category: "item_not_as_described" },
  { subject: "Seller asking extra fee at pickup point", category: "other" },
];

export function buildMockDisputes(count = 11): Dispute[] {
  const rand = seededRandom(191);
  const disputes: Dispute[] = [];

  for (let i = 0; i < count; i++) {
    const template = pick(rand, DISPUTE_SUBJECTS);
    const order = pick(rand, mockOrders);
    const statusRoll = rand();

    disputes.push({
      id: `dsp-${String(i + 1).padStart(3, "0")}`,
      orderId: order?.id ?? `KMP-24${intBetween(rand, 10, 99)}`,
      customerName: order?.customerName ?? pick(rand, mockUsers).name,
      vendorName: order?.vendorName ?? pick(rand, mockVendors).storeName,
      subject: template.subject,
      category: template.category,
      priority:
        template.category === "item_not_received" && rand() > 0.5
          ? "urgent"
          : pick(rand, ["low", "medium", "high"] as const),
      amountInDispute: order?.total ?? intBetween(rand, 20, 400) * 250,
      status:
        statusRoll > 0.68 ? "open" : statusRoll > 0.5 ? "under_review" : statusRoll > 0.36 ? "awaiting_customer" : statusRoll > 0.16 ? "resolved" : "closed",
      messagesCount: intBetween(rand, 2, 24),
      openedAt: daysAgoIso(rand, intBetween(rand, 0, 12)),
      resolvedAt: null,
    });
  }
  return disputes.sort(
    (a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()
  );
}

export const mockDisputes: Dispute[] = buildMockDisputes();
