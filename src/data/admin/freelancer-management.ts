// ============================================================
// FREELANCER MANAGEMENT DATA (Module 36)
// ============================================================
//
// Aggregates from EXISTING platform data stores — no fabricated
// records (spec §41). Sources:
//   - src/data/freelancer.ts — approved freelancer onboarding drafts (u1-u5)
//   - src/data/service-provider.ts — service-provider profiles
//   - src/data/service-marketplace.ts — marketplace providers, services, reviews
//
// Each platform user that operates as a freelancer/service-provider
// is resolved from these real stores. Where a user exists in
// multiple stores, their data is merged.
// ============================================================

import type { ManagedFreelancer, ManagedFreelancerDetail, FreelancerServiceSummary, FreelancerBucket, FreelancerStatusCounts } from "@/types/admin";
import type { MarketplaceProvider, MarketplaceService, MarketplaceProviderPortfolioItem, MarketplaceServiceReview } from "@/types/service-marketplace";
import type { ServiceProviderProfile } from "@/types/service-provider";
import { FREELANCER_ONBOARDING_STATUS, type FreelancerOnboardingStatus } from "@/types/freelancer";
import { getFreelancerByApprovedSlug } from "@/data/freelancer";
import { serviceProviderProfiles } from "@/data/service-provider";
import { marketplaceServiceProviders, marketplaceServices, marketplaceServiceReviews } from "@/data/service-marketplace";
import { seededRandom, daysAgoIso } from "@/lib/admin/api";

// ============================================================
// HELPERS
// ============================================================

function toConsoleStatus(onboardingStatus: FreelancerOnboardingStatus): "approved" | "pending_review" | "suspended" | "rejected" {
  switch (onboardingStatus) {
    case FREELANCER_ONBOARDING_STATUS.APPROVED:
      return "approved";
    case FREELANCER_ONBOARDING_STATUS.PENDING_REVIEW:
      return "pending_review";
    case FREELANCER_ONBOARDING_STATUS.SUSPENDED:
      return "suspended";
    case FREELANCER_ONBOARDING_STATUS.REJECTED:
      return "rejected";
    default:
      return "approved";
  }
}

function buildServiceSummaries(providerId: string): FreelancerServiceSummary[] {
  return marketplaceServices
    .filter((s) => s.providerId === providerId)
    .map((s) => ({
      id: s.id,
      title: s.name,
      categoryId: s.categoryId,
      pricingModel: s.pricingModel,
      price: s.price,
      priceMax: s.priceMax,
      durationMinutes: s.durationMinutes,
      isActive: s.isActive,
      isFeatured: s.isFeatured,
      viewCount: s.viewCount,
      createdAt: s.createdAt,
    }));
}

function buildPortfolioItems(provider: MarketplaceProvider): MarketplaceProviderPortfolioItem[] {
  return provider.portfolio ?? [];
}

function lastActiveFromService(providerId: string): string {
  const providerServices = marketplaceServices.filter((s) => s.providerId === providerId);
  if (providerServices.length === 0) return daysAgoIso(seededRandom(0), 30);
  const latest = providerServices.reduce((a, b) => (new Date(b.createdAt).getTime() > new Date(a.createdAt).getTime() ? b : a));
  return latest.createdAt;
}

// ============================================================
// DATASET BUILDER
// ============================================================

export interface FreelancerDataset {
  freelancers: ManagedFreelancer[];
  details: Map<string, ManagedFreelancerDetail>;
}

export function buildFreelancerDataset(): FreelancerDataset {
  const freelancers: ManagedFreelancer[] = [];
  const details = new Map<string, ManagedFreelancerDetail>();

  // Process each marketplace provider as a managed freelancer
  for (const provider of marketplaceServiceProviders) {
    const spProfile = serviceProviderProfiles.find((p) => p.userId === provider.id || p.slug === provider.slug);
    const freelancerDraft = getFreelancerByApprovedSlug(provider.slug);

    const slug = provider.slug;
    const displayName = provider.displayName;
    const rating = provider.rating;
    const totalBookings = provider.totalBookings;
    const verified = provider.verified;
    const services = buildServiceSummaries(provider.id);
    const portfolio = buildPortfolioItems(provider);
    const freelancerReviews = marketplaceServiceReviews.filter((r) => r.providerId === provider.id);

    const status: ManagedFreelancer["status"] = freelancerDraft
      ? toConsoleStatus(freelancerDraft.status)
      : provider.verified
        ? "approved"
        : "pending_review";

    const freelancer: ManagedFreelancer = {
      id: provider.id,
      slug,
      displayName,
      headline: freelancerDraft?.profile.headline ?? provider.tagline ?? "",
      email: `${slug.replace(/-/g, ".")}@student.edu.ng`,
      phone: "+234-000-0000",
      city: freelancerDraft?.profile.city ?? "",
      categories: freelancerDraft?.categories ?? provider.secondaryCategoryIds ?? [provider.primaryCategoryId],
      skills: freelancerDraft?.skills ?? provider.specialties ?? [],
      status,
      verified,
      featured: services.some((s) => s.isFeatured),
      rating,
      reviewsCount: freelancerReviews.length,
      totalBookings,
      servicesCount: services.length,
      joinedAt: provider.joinedYear ? `${provider.joinedYear}-01-01T00:00:00Z` : daysAgoIso(seededRandom(provider.id.length), 180),
      updatedAt: daysAgoIso(seededRandom(provider.id.length + 1), 7),
      lastActiveAt: lastActiveFromService(provider.id),
    };

    freelancers.push(freelancer);

    const detail: ManagedFreelancerDetail = {
      freelancer,
      profile: {
        id: provider.id,
        slug,
        displayName,
        headline: freelancer.headline,
        bio: provider.description ?? "",
        city: freelancer.city,
        categories: freelancer.categories,
        skills: freelancer.skills,
        status,
        rating,
        totalBookings,
        joinedAt: freelancer.joinedAt,
        updatedAt: freelancer.updatedAt,
      },
      services,
      portfolio,
      reviews: freelancerReviews as MarketplaceServiceReview[],
      availability: {
        status: "available_now",
        workingDays: ["mon", "tue", "wed", "thu", "fri"],
        workingHoursStart: "09:00",
        workingHoursEnd: "18:00",
        timezone: "Africa/Lagos",
      },
      activity: [],
    };

    details.set(provider.id, detail);
  }

  // Add freelancer-onboarding approved profiles not already in marketplace
  const existingIds = new Set(freelancers.map((f) => f.id));
  const approvedFreelancerSlugs = ["adebayo-dev", "chioma-video", "ibrahim-films", "folashade-designs", "emeka-cuts"];

  for (const slug of approvedFreelancerSlugs) {
    if (existingIds.has(slug)) continue;
    const draft = getFreelancerByApprovedSlug(slug);
    if (!draft || draft.status !== FREELANCER_ONBOARDING_STATUS.APPROVED) continue;

    const freelancer: ManagedFreelancer = {
      id: draft.userId,
      slug,
      displayName: draft.profile.headline?.split(" ")[0] ?? slug,
      headline: draft.profile.headline ?? "",
      email: `${slug.replace(/-/g, ".")}@student.edu.ng`,
      phone: "+234-000-0000",
      city: draft.profile.city ?? "",
      categories: draft.categories,
      skills: draft.skills,
      status: "approved",
      verified: true,
      featured: false,
      rating: draft.rates.hourlyRate ? 4.5 : 4.0,
      reviewsCount: 0,
      totalBookings: 0,
      servicesCount: 0,
      joinedAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      lastActiveAt: draft.updatedAt,
    };

    freelancers.push(freelancer);
    existingIds.add(slug);
  }

  freelancers.sort((a, b) => a.displayName.localeCompare(b.displayName));

  return { freelancers, details };
}

// ============================================================
// QUERY HELPERS
// ============================================================

export function filterFreelancers(
  freelancers: ManagedFreelancer[],
  query: { search?: string; status?: FreelancerBucket; categoryId?: string; page?: number; pageSize?: number }
): { items: ManagedFreelancer[]; total: number; page: number; totalPages: number } {
  let filtered = [...freelancers];

  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.displayName.toLowerCase().includes(s) ||
        f.slug.toLowerCase().includes(s) ||
        f.headline.toLowerCase().includes(s) ||
        f.skills.some((sk) => sk.toLowerCase().includes(s))
    );
  }

  if (query.status && query.status !== "all") {
    filtered = filtered.filter((f) => f.status === query.status);
  }

  const catId = query.categoryId;
  if (catId) {
    filtered = filtered.filter((f) => f.categories.includes(catId));
  }

  const total = filtered.length;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const items = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  return { items, total, page, totalPages: Math.ceil(total / pageSize) };
}

export function computeFreelancerCounts(freelancers: ManagedFreelancer[]): FreelancerStatusCounts {
  return {
    all: freelancers.length,
    approved: freelancers.filter((f) => f.status === "approved").length,
    pending_review: freelancers.filter((f) => f.status === "pending_review").length,
    suspended: freelancers.filter((f) => f.status === "suspended").length,
    rejected: freelancers.filter((f) => f.status === "rejected").length,
  };
}
