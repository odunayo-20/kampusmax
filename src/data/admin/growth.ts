import { Promotion } from "@/types/admin";
import { mockVendors } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

export function buildMockPromotions(count = 12): Promotion[] {
  const rand = seededRandom(101);
  const promotions: Promotion[] = [];

  for (let i = 0; i < count; i++) {
    const typeRoll = rand();
    const type = typeRoll > 0.72 ? "flash_sale" : typeRoll > 0.5 ? "free_delivery" : typeRoll > 0.28 ? "coupon" : "discount";
    const scopeRoll = rand();
    const scope = scopeRoll > 0.6 ? "platform" : scopeRoll > 0.3 ? "campus" : "vendor";
    const startOffset = intBetween(rand, -40, 10);
    const durationDays = intBetween(rand, 7, 45);
    const endOffset = startOffset + durationDays;
    const now = Date.now();

    const status =
      new Date(daysAgoIso(rand, -startOffset)).getTime() > now
        ? "scheduled"
        : new Date(daysAgoIso(rand, -endOffset)).getTime() < now
          ? "ended"
          : rand() > 0.85
            ? "paused"
            : "active";

    const usageLimit = rand() > 0.4 ? intBetween(rand, 50, 500) : null;

    promotions.push({
      id: `prm-${String(i + 1).padStart(3, "0")}`,
      title:
        type === "free_delivery"
          ? `Free Delivery Week - ${pick(rand, ["Owo", "Akure", "Lagos", "Ibadan"])}`
          : type === "flash_sale"
            ? `${intBetween(rand, 15, 50)}% Flash Sale`
            : `${type === "coupon" ? "Coupon:" : "Sale:"} ${pick(rand, ["Back to Campus", "Detty December", "Exam Season Saver", "Freshers Welcome"])}`,
      type,
      scope,
      code: type === "coupon" ? pick(rand, ["CAMPUS10", "FRESHER15", "EXAM25", "MOVEIN20", "RUGIPO5"]) : null,
      discountValue: type === "discount" || type === "coupon" || type === "flash_sale" ? intBetween(rand, 5, 40) : null,
      campusId: scope === "campus" ? pick(rand, ["rugipo", "futa", "unilag", "ui"]) : null,
      vendorName: scope === "vendor" ? pick(rand, mockVendors.filter((v) => v.status === "approved")).storeName : null,
      usageCount: intBetween(rand, 0, usageLimit ?? 320),
      usageLimit,
      budget: rand() > 0.3 ? intBetween(rand, 100, 900) * 1000 : null,
      spend: intBetween(rand, 20, 400) * 1000,
      startsAt: daysAgoIso(rand, -startOffset),
      endsAt: daysAgoIso(rand, -endOffset),
      status,
    });
  }
  return promotions;
}

export const mockPromotions: Promotion[] = buildMockPromotions();
