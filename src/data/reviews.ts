import { Review, ReviewSummary, ReviewReport } from "@/types";

export const reviews: Review[] = [
  {
    id: "r1",
    targetId: "p1",
    target: "product",
    userId: "u2",
    rating: 4,
    title: "Good textbook, minor wear",
    comment:
      "Calculus textbook has some highlighting on chapters 3-5 but all pages are intact. The cover is slightly bent but content is perfectly readable. Worth the price for a used textbook.",
    images: [
      { id: "ri1", url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", alt: "Textbook front cover" },
      { id: "ri2", url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400", alt: "Textbook inside pages" },
    ],
    verifiedPurchase: true,
    helpfulCount: 7,
    helpfulBy: ["u1", "u3", "u4"],
    createdAt: "2025-01-13T10:00:00Z",
    vendorId: "v1",
    productId: "p1",
    orderId: "ord1",
  },
  {
    id: "r2",
    targetId: "p1",
    target: "product",
    userId: "u4",
    rating: 5,
    title: "Perfect condition!",
    comment:
      "Arrived in excellent condition. The seller even included a few extra practice sheets. Highly recommend buying from this vendor.",
    verifiedPurchase: true,
    helpfulCount: 3,
    helpfulBy: ["u5"],
    createdAt: "2025-01-15T14:30:00Z",
    vendorId: "v1",
    productId: "p1",
    orderId: "ord4",
  },
  {
    id: "r3",
    targetId: "p3",
    target: "product",
    userId: "u1",
    rating: 5,
    title: "Authentic Nike sneakers",
    comment:
      "These are 100% authentic. I checked the tag and stitching - everything matches the original. Comfortable and stylish. Already getting compliments on campus!",
    images: [
      { id: "ri3", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", alt: "Sneakers side view" },
      { id: "ri4", url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400", alt: "Sneakers on feet" },
      { id: "ri5", url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400", alt: "Sneakers box" },
    ],
    verifiedPurchase: true,
    helpfulCount: 12,
    helpfulBy: ["u2", "u4", "u5"],
    createdAt: "2025-01-14T11:00:00Z",
    vendorId: "v2",
    productId: "p3",
    orderId: "ord2",
  },
  {
    id: "r4",
    targetId: "p5",
    target: "product",
    userId: "u1",
    rating: 4,
    title: "Works great, minor scratch",
    comment:
      "The calculator works perfectly for all my engineering courses. There's a small scratch on the screen but it doesn't affect visibility at all. Battery life is excellent.",
    images: [
      { id: "ri6", url: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400", alt: "Calculator display" },
    ],
    verifiedPurchase: true,
    helpfulCount: 5,
    helpfulBy: ["u3"],
    createdAt: "2025-01-11T09:30:00Z",
    vendorId: "v1",
    productId: "p5",
    orderId: "ord3",
  },
  {
    id: "r5",
    targetId: "p5",
    target: "product",
    userId: "u4",
    rating: 3,
    title: "Decent but overpriced",
    comment:
      "It's an okay calculator but I've seen the same model go for less at other shops. The packaging was basic - just wrapped in newspaper. Would have preferred a proper box.",
    verifiedPurchase: true,
    helpfulCount: 2,
    helpfulBy: [],
    createdAt: "2025-01-16T16:00:00Z",
    vendorId: "v1",
    productId: "p5",
    orderId: "ord5",
  },
  {
    id: "r6",
    targetId: "p11",
    target: "product",
    userId: "u1",
    rating: 5,
    title: "Jollof rice was amazing!",
    comment:
      "The jollof rice from CampusBites is honestly the best on campus. It was delivered hot, the portion was generous, and the chicken was perfectly seasoned. Will definitely order again!",
    images: [
      { id: "ri7", url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400", alt: "Jollof rice plate" },
      { id: "ri8", url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400", alt: "Food packaging" },
    ],
    verifiedPurchase: true,
    helpfulCount: 9,
    helpfulBy: ["u2", "u3", "u4", "u5"],
    createdAt: "2025-01-15T13:00:00Z",
    vendorId: "v3",
    productId: "p11",
    orderId: "ord6",
  },
  {
    id: "r7",
    targetId: "p8",
    target: "product",
    userId: "u5",
    rating: 2,
    title: "Item was smaller than expected",
    comment:
      "The backpack looked bigger in the photos. It barely fits my 14-inch laptop. The material feels cheap and the zipper is already catching. Disappointed for the price.",
    verifiedPurchase: true,
    helpfulCount: 4,
    helpfulBy: ["u1", "u2"],
    createdAt: "2025-01-17T08:15:00Z",
    vendorId: "v2",
    productId: "p8",
    orderId: "ord7",
  },
  {
    id: "r8",
    targetId: "p13",
    target: "product",
    userId: "u3",
    rating: 5,
    title: "Fresh and delicious",
    comment:
      "Ordered suya and pepper soup. Both were incredibly fresh and well-spiced. The suya arrived still warm. Fast delivery too - about 20 minutes. This is my go-to food vendor now.",
    images: [
      { id: "ri9", url: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400", alt: "Suya plate" },
    ],
    verifiedPurchase: true,
    helpfulCount: 6,
    helpfulBy: ["u1", "u4"],
    createdAt: "2025-01-14T20:00:00Z",
    vendorId: "v3",
    productId: "p13",
    orderId: "ord8",
  },
  {
    id: "r9",
    targetId: "p15",
    target: "product",
    userId: "u2",
    rating: 4,
    title: "Great power bank",
    comment:
      "Charges my phone about 3 times from 0 to 100%. The dual USB ports are handy. Only downside is it's a bit heavy but that's expected for 20000mAh.",
    verifiedPurchase: true,
    helpfulCount: 3,
    helpfulBy: ["u1"],
    createdAt: "2025-01-12T15:45:00Z",
    vendorId: "v1",
    productId: "p15",
    orderId: "ord9",
  },
  {
    id: "r10",
    targetId: "p20",
    target: "product",
    userId: "u4",
    rating: 1,
    title: "Stopped working after 3 days",
    comment:
      "The ring light stopped working after just 3 days. The phone holder clamp broke on first use. Very poor quality. I want a refund.",
    verifiedPurchase: true,
    helpfulCount: 8,
    helpfulBy: ["u1", "u2", "u3"],
    createdAt: "2025-01-18T07:00:00Z",
    vendorId: "v1",
    productId: "p20",
    orderId: "ord10",
    vendorResponse: {
      text: "We sincerely apologize for the inconvenience. Please contact us directly and we will arrange a full replacement or refund immediately.",
      createdAt: "2025-01-18T10:30:00Z",
    },
  },
  {
    id: "r11",
    targetId: "p24",
    target: "product",
    userId: "u5",
    rating: 5,
    title: "Perfect notes for exam prep",
    comment:
      "These engineering mathematics hand notes saved my life during exams. Everything is well organized with clear examples. Worth every naira!",
    verifiedPurchase: true,
    helpfulCount: 11,
    helpfulBy: ["u1", "u2", "u3", "u4"],
    createdAt: "2025-01-10T12:00:00Z",
    vendorId: "v1",
    productId: "p24",
    orderId: "ord11",
  },
  {
    id: "r12",
    targetId: "p2",
    target: "product",
    userId: "u3",
    rating: 4,
    title: "Good headphones for the price",
    comment:
      "Sound quality is decent for the price point. Noise cancelling works well in the library. Comfortable for long study sessions. Battery lasts about 8 hours.",
    images: [
      { id: "ri10", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", alt: "Headphones" },
    ],
    verifiedPurchase: true,
    helpfulCount: 4,
    helpfulBy: ["u1"],
    createdAt: "2025-01-09T18:20:00Z",
    vendorId: "v1",
    productId: "p2",
    orderId: "ord12",
  },
  {
    id: "r13",
    targetId: "p4",
    target: "product",
    userId: "u5",
    rating: 5,
    title: "Beautiful Ankara fabric",
    comment:
      "The quality of this Ankara is top-notch. The colors are vibrant and the material is soft. Made two outfits from this and received so many compliments.",
    images: [
      { id: "ri11", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400", alt: "Ankara fabric" },
      { id: "ri12", url: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400", alt: "Ankara outfit" },
    ],
    verifiedPurchase: true,
    helpfulCount: 7,
    helpfulBy: ["u1", "u3"],
    createdAt: "2025-01-13T14:00:00Z",
    vendorId: "v2",
    productId: "p4",
    orderId: "ord13",
  },
  {
    id: "r14",
    targetId: "p6",
    target: "product",
    userId: "u2",
    rating: 3,
    title: "Laptop bag is okay",
    comment:
      "Does the job but the padding could be thicker. I'm worried about my laptop if I accidentally bump into something. The pockets are useful though.",
    verifiedPurchase: true,
    helpfulCount: 1,
    helpfulBy: [],
    createdAt: "2025-01-16T11:30:00Z",
    vendorId: "v1",
    productId: "p6",
    orderId: "ord14",
  },
  {
    id: "r15",
    targetId: "p12",
    target: "product",
    userId: "u2",
    rating: 5,
    title: "Fried rice was heavenly",
    comment:
      "CampusBites fried rice with plantain is a 10/10. The portion is huge - one pack is enough for two meals. Delivery was prompt and the food was still hot.",
    images: [
      { id: "ri13", url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400", alt: "Fried rice plate" },
    ],
    verifiedPurchase: true,
    helpfulCount: 5,
    helpfulBy: ["u4"],
    createdAt: "2025-01-14T12:15:00Z",
    vendorId: "v3",
    productId: "p12",
    orderId: "ord15",
  },
  {
    id: "r16",
    targetId: "p7",
    target: "product",
    userId: "u4",
    rating: 2,
    title: "Pen set was disappointing",
    comment:
      "Half the pens in the set were dry or had poor ink flow. Only 3 out of 6 actually write well. For the price, I expected better quality.",
    verifiedPurchase: true,
    helpfulCount: 3,
    helpfulBy: ["u5"],
    createdAt: "2025-01-17T09:45:00Z",
    vendorId: "v1",
    productId: "p7",
    orderId: "ord16",
  },
  {
    id: "r17",
    targetId: "p9",
    target: "product",
    userId: "u3",
    rating: 5,
    title: "Stylish and comfortable",
    comment:
      "These sneakers are fire! Very comfortable for walking around campus all day. True to size. Got them in black and they go with everything.",
    images: [
      { id: "ri14", url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", alt: "Sneakers worn" },
    ],
    verifiedPurchase: true,
    helpfulCount: 8,
    helpfulBy: ["u1", "u2"],
    createdAt: "2025-01-11T17:00:00Z",
    vendorId: "v2",
    productId: "p9",
    orderId: "ord17",
  },
  {
    id: "r18",
    targetId: "p14",
    target: "product",
    userId: "u4",
    rating: 4,
    title: "Good noodles, could be spicier",
    comment:
      "The indomie special was filling and well-cooked. Came with an egg and veggies. I would have preferred it a bit spicier but that's personal taste.",
    verifiedPurchase: true,
    helpfulCount: 2,
    helpfulBy: [],
    createdAt: "2025-01-15T19:30:00Z",
    vendorId: "v3",
    productId: "p14",
    orderId: "ord18",
  },
  {
    id: "r19",
    targetId: "p10",
    target: "product",
    userId: "u1",
    rating: 5,
    title: "Quality shirt material",
    comment:
      "The shirt material is excellent - thick cotton that doesn't shrink after washing. The stitching is clean. Size L fits perfectly for my frame.",
    verifiedPurchase: true,
    helpfulCount: 6,
    helpfulBy: ["u2", "u5"],
    createdAt: "2025-01-12T13:00:00Z",
    vendorId: "v2",
    productId: "p10",
    orderId: "ord19",
  },
  {
    id: "r20",
    targetId: "p16",
    target: "product",
    userId: "u5",
    rating: 4,
    title: "Good battery backup",
    comment:
      "This power bank is reliable. I've been using it for a month and it still holds charge well. The LED indicator is helpful. Slightly bulky but worth carrying.",
    verifiedPurchase: true,
    helpfulCount: 2,
    helpfulBy: ["u3"],
    createdAt: "2025-01-13T16:45:00Z",
    vendorId: "v1",
    productId: "p16",
    orderId: "ord20",
  },
  {
    id: "r21",
    targetId: "v1",
    target: "vendor",
    userId: "u1",
    rating: 5,
    title: "TechHub Owo is the best!",
    comment:
      "Fast delivery and the laptop was exactly as described. Highly recommend TechHub Owo for any electronics purchase. Very professional seller.",
    verifiedPurchase: true,
    helpfulCount: 4,
    helpfulBy: ["u2"],
    createdAt: "2025-01-12T14:00:00Z",
    vendorId: "v1",
  },
  {
    id: "r22",
    targetId: "v1",
    target: "vendor",
    userId: "u4",
    rating: 4,
    title: "Good but slow delivery",
    comment:
      "Good calculator, works perfectly. Delivery was a bit delayed but the product quality made up for it. Would buy again.",
    verifiedPurchase: true,
    helpfulCount: 1,
    helpfulBy: [],
    createdAt: "2025-01-11T09:30:00Z",
    vendorId: "v1",
  },
  {
    id: "r23",
    targetId: "v1",
    target: "vendor",
    userId: "u3",
    rating: 5,
    title: "Reliable electronics vendor",
    comment:
      "Bought a power bank and headphones from TechHub. Both arrived in perfect condition. Very responsive to messages too.",
    verifiedPurchase: true,
    helpfulCount: 3,
    helpfulBy: ["u5"],
    createdAt: "2025-01-14T10:00:00Z",
    vendorId: "v1",
  },
  {
    id: "r24",
    targetId: "v2",
    target: "vendor",
    userId: "u1",
    rating: 5,
    title: "Best fashion vendor on campus!",
    comment:
      "The sneakers are authentic and exactly as shown. StyleByChi has the best fashion items on campus! Always fresh stock.",
    verifiedPurchase: true,
    helpfulCount: 5,
    helpfulBy: ["u3", "u5"],
    createdAt: "2025-01-14T11:00:00Z",
    vendorId: "v2",
  },
  {
    id: "r25",
    targetId: "v2",
    target: "vendor",
    userId: "u5",
    rating: 4,
    title: "Good clothing selection",
    comment:
      "StyleByChi has a great collection. My only complaint is the delivery time - took 2 days instead of the promised same-day. But the quality was worth the wait.",
    verifiedPurchase: true,
    helpfulCount: 2,
    helpfulBy: ["u4"],
    createdAt: "2025-01-16T15:00:00Z",
    vendorId: "v2",
  },
  {
    id: "r26",
    targetId: "v3",
    target: "vendor",
    userId: "u1",
    rating: 5,
    title: "Best food on campus!",
    comment:
      "CampusBites jollof rice is the best on campus! Always fresh and delivered fast. The suya is also incredible. My go-to for late-night study sessions.",
    verifiedPurchase: true,
    helpfulCount: 7,
    helpfulBy: ["u2", "u4", "u5"],
    createdAt: "2025-01-15T13:00:00Z",
    vendorId: "v3",
  },
  {
    id: "r27",
    targetId: "v3",
    target: "vendor",
    userId: "u4",
    rating: 5,
    title: "Delicious every time",
    comment:
      "I've ordered from CampusBites at least 10 times now and the quality has never dropped. Consistent and delicious. The delivery riders are also polite.",
    verifiedPurchase: true,
    helpfulCount: 4,
    helpfulBy: ["u1"],
    createdAt: "2025-01-17T14:00:00Z",
    vendorId: "v3",
  },
  {
    id: "r28",
    targetId: "v3",
    target: "vendor",
    userId: "u3",
    rating: 4,
    title: "Great food, delivery can improve",
    comment:
      "The food is always excellent but sometimes delivery takes longer than expected during peak hours. Still my favorite food vendor on campus.",
    verifiedPurchase: true,
    helpfulCount: 2,
    helpfulBy: ["u2"],
    createdAt: "2025-01-18T12:30:00Z",
    vendorId: "v3",
  },
  {
    id: "r29",
    targetId: "p22",
    target: "product",
    userId: "u1",
    rating: 4,
    title: "Good notebook for lectures",
    comment:
      "Thick pages that don't bleed through. The ruled lines are well spaced. Only wish it had a hardcover instead of soft.",
    verifiedPurchase: true,
    helpfulCount: 2,
    helpfulBy: [],
    createdAt: "2025-01-14T08:00:00Z",
    vendorId: "v1",
    productId: "p22",
    orderId: "ord21",
  },
  {
    id: "r30",
    targetId: "p18",
    target: "product",
    userId: "u2",
    rating: 5,
    title: "Authentic fragrance",
    comment:
      "This perfume smells amazing and lasts all day. Got many compliments. The bottle design is sleek. Authentic product guaranteed.",
    images: [
      { id: "ri15", url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400", alt: "Perfume bottle" },
    ],
    verifiedPurchase: true,
    helpfulCount: 5,
    helpfulBy: ["u3", "u4"],
    createdAt: "2025-01-11T16:00:00Z",
    vendorId: "v4",
    productId: "p18",
    orderId: "ord22",
  },
];

export const reviewReports: ReviewReport[] = [];

function calculateBreakdown(allReviews: Review[]): ReviewSummary["breakdown"] {
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of allReviews) {
    if (r.rating >= 1 && r.rating <= 5) {
      breakdown[r.rating as keyof typeof breakdown]++;
    }
  }
  return breakdown;
}

export function getReviewSummary(targetId: string, target: "product" | "vendor"): ReviewSummary {
  const filtered = reviews.filter(
    (r) => r.targetId === targetId && r.target === target
  );
  const total = filtered.length;
  const average = total > 0
    ? Math.round((filtered.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
    : 0;
  const breakdown = calculateBreakdown(filtered);
  const highRatings = (breakdown[4] + breakdown[5]);
  const recommendPercentage = total > 0 ? Math.round((highRatings / total) * 100) : 0;

  return { averageRating: average, totalReviews: total, breakdown, recommendPercentage };
}

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
