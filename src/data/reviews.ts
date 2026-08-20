import { Review } from "@/types";

export const reviews: Review[] = [
  {
    id: "r1",
    targetId: "v1",
    target: "vendor",
    userId: "u1",
    rating: 5,
    comment:
      "Great vendor! Fast delivery and the laptop was exactly as described. Highly recommend TechHub Owo.",
    createdAt: "2025-01-12T14:00:00Z",
    vendorId: "v1",
  },
  {
    id: "r2",
    targetId: "v1",
    target: "vendor",
    userId: "u4",
    rating: 4,
    comment:
      "Good calculator, works perfectly. Delivery was a bit delayed but overall satisfied.",
    createdAt: "2025-01-11T09:30:00Z",
    vendorId: "v1",
  },
  {
    id: "r3",
    targetId: "v2",
    target: "vendor",
    userId: "u1",
    rating: 5,
    comment:
      "The sneakers are authentic and exactly as shown. StyleByChi has the best fashion items on campus!",
    createdAt: "2025-01-14T11:00:00Z",
    vendorId: "v2",
  },
  {
    id: "r4",
    targetId: "v3",
    target: "vendor",
    userId: "u4",
    rating: 5,
    comment:
      "CampusBites jollof rice is the best on campus! Always fresh and delivered fast.",
    createdAt: "2025-01-15T13:00:00Z",
    vendorId: "v3",
  },
  {
    id: "r5",
    targetId: "p1",
    target: "product",
    userId: "u4",
    rating: 4,
    comment:
      "Textbook has some highlighting but overall in good condition. Worth the price.",
    createdAt: "2025-01-13T10:00:00Z",
    productId: "p1",
  },
  {
    id: "r6",
    targetId: "v3",
    target: "vendor",
    userId: "u1",
    rating: 5,
    comment:
      "Ordered suya and noodles. Both were hot and delicious. Will order again!",
    createdAt: "2025-01-14T20:00:00Z",
    vendorId: "v3",
  },
];

export function getReviewsByVendor(vendorId: string): Review[] {
  return reviews.filter((r) => r.target === "vendor" && r.vendorId === vendorId);
}

export function getReviewsByProduct(productId: string): Review[] {
  return reviews.filter((r) => r.target === "product" && r.productId === productId);
}

export function getReviewsByUser(userId: string): Review[] {
  return reviews.filter((r) => r.userId === userId);
}

export function getAverageRating(vendorId: string): number {
  const vendorReviews = getReviewsByVendor(vendorId);
  if (vendorReviews.length === 0) return 0;
  const sum = vendorReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / vendorReviews.length) * 10) / 10;
}
