import {
  ManagedReview,
  ReviewReport,
  ReviewReportStatus,
} from "@/types/admin";
import { mockCampuses } from "./campuses";
import { mockProducts } from "./catalog";
import { mockUsers, mockVendors } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/reviews MODULE
//
// Reviews reference real products, vendors, users and campuses so
// every filter option resolves. Report rows are generated against
// real review ids and review.reportsCount is derived from them so
// the table and the investigate dialog always agree.
// Deterministic (seeded PRNG) - identical output on every reload.
// ------------------------------------------------------------

/** Index-bucketed: published x12, reported x5, hidden x4, removed x3, under_review x3. */
const REVIEW_STATUS_PATTERN = [
  "published", "reported", "published", "hidden", "published",
  "under_review", "published", "removed", "reported", "published",
  "hidden", "published", "reported", "under_review", "published",
  "removed", "hidden", "published", "reported", "published",
  "under_review", "removed", "hidden", "published", "published",
  "published",
] as const;

const REVIEW_COMMENTS: Record<"glow" | "good" | "mixed" | "bad", readonly string[]> =
  {
    glow: [
      "Item matched the description exactly and the vendor delivered to my hostel the same evening. Easily the smoothest order I have placed this semester.",
      "Excellent communication from the seller. Sent photos of the product before meetup and even threw in a free pencil case. Highly recommended!",
      "Perfect condition textbook for half the price at the campus bookshop. Pickup station collection took less than five minutes.",
    ],
    good: [
      "Good quality overall. Delivery took a bit longer than promised but the item is exactly what I needed.",
      "Solid experience. The vendor responded quickly to my questions and packaging was decent.",
      "Product works fine, minor scratches not mentioned in the listing but acceptable for the price.",
    ],
    mixed: [
      "The item is okay but it took almost two days before pickup was ready at the station. Communication could be better.",
      "Product is average - the textbook had more highlights than expected from the 'Fair' description. Still usable though.",
      "Packaging was poor but the product itself survived. Vendor should invest in bubble wrap.",
    ],
    bad: [
      "Vendor refused to respond after payment until I opened a dispute. Took the platform stepping in before anything moved. Very frustrating experience.",
      "Not as described. Listed as 'Like New' but arrived with water damage across the first thirty pages. Requested a refund.",
      "Seller tried to change the price at pickup claiming the listing price was 'old'. Avoid this vendor.",
    ],
  };

const REVIEW_REPORT_REASONS = [
  "fake_review",
  "offensive",
  "unfair",
  "spam",
  "irrelevant",
  "other",
] as const;

const REVIEW_REPORT_DETAILS: Record<string, string> = {
  fake_review:
    "This reviewer has never ordered from this store - looks like a paid five-star review.",
  offensive:
    "The review contains insults aimed at the vendor instead of describing the product.",
  unfair:
    "The complaint describes a different order; my records show this buyer received the correct item.",
  spam:
    "Same one-star text posted on three of our listings within ten minutes.",
  irrelevant:
    "The review complains about Kampmax delivery fees, not about our product or service.",
  other:
    "Reviewer appears to be retaliating because we reported their account earlier.",
};

export interface ReviewManagementDataset {
  reviews: ManagedReview[];
  reports: ReviewReport[];
}

export function buildReviewManagementDataset(): ReviewManagementDataset {
  const rand = seededRandom(4021);
  const reviewers = mockUsers.slice(0);
  const vendors = mockVendors.filter((v) => v.status === "approved");

  const reviews: ManagedReview[] = REVIEW_STATUS_PATTERN.map(
    (status, i) => {
      const user = reviewers[(i * 6 + 2) % reviewers.length];
      const vendor = vendors[(i * 5 + 1) % vendors.length];
      const isProductTarget = (i % 7) !== 5;
      const product = pick(rand, mockProducts.filter((p) => p.vendorId === vendor.id)) ??
        pick(rand, mockProducts);

      const ratingRoll = rand();
      let rating: ManagedReview["rating"];
      if (status === "reported" || status === "under_review") {
        // Angry one/two-stars get reported - plus the occasional
        // "too good to be true" five-star flagged as fake.
        rating = ratingRoll > 0.55 ? 1 : ratingRoll > 0.25 ? 2 : 5;
      } else if (ratingRoll > 0.55) {
        rating = intBetween(rand, 4, 5) as ManagedReview["rating"];
      } else if (ratingRoll > 0.3) {
        rating = 3;
      } else {
        rating = intBetween(rand, 1, 2) as ManagedReview["rating"];
      }

      const tier: keyof typeof REVIEW_COMMENTS =
        rating >= 5 ? "glow" : rating === 4 ? "good" : rating === 3 ? "mixed" : "bad";
      const commentPool = REVIEW_COMMENTS[tier];

      const verified = status === "removed" ? rand() > 0.6 : rand() > 0.28;

      return {
        id: `mrv-${String(i + 1).padStart(3, "0")}`,
        reviewer: { id: user.id, name: user.name },
        targetType: isProductTarget ? "product" : "vendor",
        targetTitle: isProductTarget ? product.title : vendor.storeName,
        productId: isProductTarget ? product.id : null,
        vendorId: vendor.id,
        vendorName: vendor.storeName,
        campusId: vendor.campusId ?? user.campusId ?? pick(rand, mockCampuses).id,
        rating,
        comment: commentPool[intBetween(rand, 0, commentPool.length - 1)],
        helpfulCount: intBetween(rand, 0, 34),
        verifiedPurchase: verified,
        orderRef: verified ? `KMP-${intBetween(rand, 2100, 9899)}` : null,
        reportsCount: 0, // derived below from actual report rows
        status,
        createdAt: daysAgoIso(rand, intBetween(rand, 0, 30)),
      };
    }
  );

  // ---------------- Reports against reviews ----------------
  const reportTargets = new Map(
    reviews
      .filter((r) => r.status === "reported" || r.status === "under_review")
      .map((r) => [r.id, r])
  );
  // A couple of published reviews also carry open reports.
  reviews
    .filter((r) => r.status === "published")
    .slice(0, 3)
    .forEach((r) => reportTargets.set(r.id, r));

  const reports: ReviewReport[] = [];
  let seq = 0;
  reportTargets.forEach((review) => {
    const count = intBetween(rand, 1, 3);
    for (let k = 0; k < count; k++) {
      const reason = pick(rand, REVIEW_REPORT_REASONS);
      const statusRoll = rand();
      const status: ReviewReportStatus =
        review.status === "under_review"
          ? statusRoll > 0.35
            ? "reviewing"
            : "open"
          : statusRoll > 0.72
            ? "open"
            : statusRoll > 0.45
              ? "reviewing"
              : statusRoll > 0.2
                ? "actioned"
                : "dismissed";
      const reporter = reviewers[(seq * 11 + 4) % reviewers.length];
      reports.push({
        id: `mrr-${String(++seq).padStart(3, "0")}`,
        reviewId: review.id,
        reason,
        detail: REVIEW_REPORT_DETAILS[reason],
        reporterName: reporter.name,
        priority:
          reason === "offensive" || reason === "fake_review"
            ? rand() > 0.4
              ? "high"
              : "medium"
            : rand() > 0.7
              ? "medium"
              : "low",
        status,
        createdAt: daysAgoIso(rand, intBetween(rand, 0, Math.max(1, Math.floor((Date.now() - new Date(review.createdAt).getTime()) / 86_400_000)))),
      });
    }
  });

  // Derive reportsCount from real rows so table + dialog agree.
  reviews.forEach((r) => {
    r.reportsCount = reports.filter((x) => x.reviewId === r.id).length;
  });

  return { reviews, reports };
}

export const reviewManagementDataset: ReviewManagementDataset =
  buildReviewManagementDataset();
