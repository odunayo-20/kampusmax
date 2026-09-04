import { FREELANCER_CATEGORIES } from "@/config/freelancer";
import type { FreelancerService } from "@/types/freelancer-services";
import { FREELANCER_SERVICE_PRICING } from "@/types/freelancer-services";
import { formatNaira, formatNairaCompact } from "@/lib/utils";

/** Resolve a category's display name from a categoryId. */
export function categoryLabel(categoryId: string): string {
  return FREELANCER_CATEGORIES.find((c) => c.id === categoryId)?.name ?? "General";
}

/** Resolve all skill names available under a category (for skill pickers). */
export function skillsForCategory(categoryId: string): string[] {
  return FREELANCER_CATEGORIES.find((c) => c.id === categoryId)?.skills ?? [];
}

/** Resolve a category's id from its display name (used by seed/form mapping). */
export function categoryIdFromName(name: string): string | undefined {
  return FREELANCER_CATEGORIES.find((c) => c.name === name)?.id;
}

/** Compact human-readable price summary for a service card. */
export function servicePriceLabel(service: Pick<FreelancerService, "pricing" | "price" | "priceMax">): string | null {
  if (service.price === undefined || service.price === null) return null;
  const base = formatNairaCompact(service.price);
  switch (service.pricing) {
    case FREELANCER_SERVICE_PRICING.HOURLY:
      return `${base}/hr`;
    case FREELANCER_SERVICE_PRICING.STARTING_AT:
      return service.priceMax ? `${base}–${formatNairaCompact(service.priceMax)}` : `From ${base}`;
    case FREELANCER_SERVICE_PRICING.PROJECT:
      return `${base} project`;
    default:
      return base;
  }
}

export { formatNaira };
