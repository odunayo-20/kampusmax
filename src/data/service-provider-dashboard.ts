import type {
  ServiceProviderActivityEvent,
  ServiceProviderDashboardRecord,
  ServiceProviderDashboardService,
  ServiceProviderDashboardPortfolioItem,
  ServiceProviderNotification,
  ServiceProviderReview,
  ServiceProviderSettings,
} from "@/types/service-provider-dashboard";
import { DEFAULT_SERVICE_PROVIDER_SETTINGS } from "@/types/service-provider-dashboard";
import {
  SERVICE_PROVIDER_ONBOARDING_STATUS,
  SERVICE_PROVIDER_VERIFICATION_STATUS,
  SERVICE_PROVIDER_VERIFICATION_TYPE,
} from "@/types/service-provider";
import { mockServiceProviderProfile } from "@/data/service-provider";
import { remapSpCategoryId } from "@/data/service-categories";

// ============================================================
// SERVICE PROVIDER DASHBOARD SEED DATA  (Module 16)
// ============================================================
//
// Owner-scoped mock of the future backend dashboard resources:
//   GET /service-provider/dashboard
//   GET /service-provider/profile
//   GET /service-provider/services
//   GET /service-provider/availability
//   GET /service-provider/portfolio
//   GET /service-provider/reviews
//   GET /service-provider/notifications
//   GET /service-provider/settings
//
// Everything is keyed by the OWNER user id. Activity events and notifications
// are seeded to model backend behaviour — they are the data the mock backend
// returns, never UI-fabricated entries.
//
// SECURITY: no private home address, phone, email, or document data is stored
// here. Public-facing assets are visible; private documents stay out.

// ── Per-owner seed derivations ───────────────────────────────

const profile = mockServiceProviderProfile;

const seededServices: ServiceProviderDashboardService[] = profile.services.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  categoryId: remapSpCategoryId(s.categoryId),
  pricingModel: s.pricingModel,
  price: s.price,
  priceMax: s.priceMax,
  durationMinutes: s.durationMinutes,
  locationType: s.locationType,
  status: s.status,
  images: s.images,
  updatedAt: "2026-01-18T10:00:00Z",
}));

const seededPortfolio: ServiceProviderDashboardPortfolioItem[] = profile.portfolio.map((p) => ({
  id: p.id,
  image: p.image,
  title: p.title,
  description: p.description,
  categoryId: remapSpCategoryId(p.categoryId),
  visible: true,
  createdAt: "2026-01-17T09:00:00Z",
}));

export function createSeededDashboardRecord(): ServiceProviderDashboardRecord {
  return {
    providerId: profile.id,
    userId: profile.userId,
    slug: profile.slug,
    status: SERVICE_PROVIDER_ONBOARDING_STATUS.APPROVED,
    createdAt: profile.joinDate ?? "2026-01-15T09:00:00Z",
    updatedAt: "2026-01-20T08:00:00Z",
    profile: {
      displayName: profile.displayName,
      tagline: profile.tagline ?? "",
      description: profile.description ?? "",
      logo: profile.logo,
      coverImage: profile.coverImage,
      bio: profile.description ?? "",
      yearsExperience: 4,
      languages: ["English", "Yoruba"],
      qualifications: ["Diploma in Computer Engineering"],
      certifications: ["Phone Repair Certification", "CompTIA A+ (In Progress)"],
    },
    category: {
      primaryCategoryId: profile.primaryCategoryId,
      secondaryCategoryIds: profile.secondaryCategoryIds,
    },
    location: {
      type: profile.location.type,
      primaryCampusId: profile.location.primaryCampusId,
      additionalCampusIds: [...profile.location.additionalCampusIds],
      serviceCities: [...(profile.location.serviceCities ?? [])],
      serviceRadiusKm: profile.location.serviceRadiusKm ?? 10,
    },
    availability: {
      days: profile.availability.days.map((d) => ({ ...d })),
      appointmentBufferMinutes: profile.availability.appointmentBufferMinutes ?? 15,
      minAdvanceNoticeHours: profile.availability.minAdvanceNoticeHours ?? 2,
      maxAdvanceBookingDays: profile.availability.maxAdvanceBookingDays ?? 30,
      bookingPreference: profile.availability.bookingPreference,
    },
    pricing: {
      travelFee: profile.pricing.travelFee ?? 0,
      emergencyFee: profile.pricing.emergencyFee ?? 0,
      weekendFee: profile.pricing.weekendFee ?? 0,
      minimumBookingQuantity: profile.pricing.minimumBookingQuantity ?? 1,
    },
    verification: {
      type: profile.verification.type ?? SERVICE_PROVIDER_VERIFICATION_TYPE.IDENTITY,
      status: profile.verification.status ?? SERVICE_PROVIDER_VERIFICATION_STATUS.APPROVED,
    },
    services: seededServices,
    portfolio: seededPortfolio,
    metrics: {
      totalBookings: profile.totalBookings,
      upcomingBookings: 0, // booking engine arrives in a later module
      averageRating: profile.rating,
      profileViews: 128,
      responseTime: profile.responseTime,
    },
  };
}

// ── Activity (backend events) ────────────────────────────────

const seededActivity: ServiceProviderActivityEvent[] = [
  {
    id: "act1",
    kind: "review_received",
    title: "New review received",
    message: "Kunle rated Phone Screen Replacement 5 stars.",
    createdAt: "2026-01-20T07:30:00Z",
    href: "/service-provider/reviews",
  },
  {
    id: "act2",
    kind: "service_activated",
    title: "Service activated",
    message: "Data Recovery is now live and bookable.",
    createdAt: "2026-01-19T14:20:00Z",
    href: "/service-provider/services",
  },
  {
    id: "act3",
    kind: "portfolio_item_added",
    title: "Portfolio item added",
    message: "Custom PC Build added to your portfolio.",
    createdAt: "2026-01-17T09:10:00Z",
    href: "/service-provider/portfolio",
  },
  {
    id: "act4",
    kind: "availability_updated",
    title: "Availability updated",
    message: "Your weekly schedule was refreshed.",
    createdAt: "2026-01-16T11:00:00Z",
    href: "/service-provider/availability",
  },
  {
    id: "act5",
    kind: "verification_updated",
    title: "Identity verification approved",
    message: "Your identity documents were verified by Kampmax.",
    createdAt: "2026-01-15T16:45:00Z",
  },
  {
    id: "act6",
    kind: "profile_approved",
    title: "Profile approved",
    message: "Welcome to Kampmax Services — your profile is live.",
    createdAt: "2026-01-15T09:00:00Z",
    href: "/service-provider",
  },
];

// ── Reviews (backend-supplied) ───────────────────────────────

const seededReviews: ServiceProviderReview[] = [
  {
    id: "rev1",
    authorName: "Kunle A.",
    rating: 5,
    comment: "Phone screen replaced in under an hour. Perfect work, friendly service.",
    serviceName: "Phone Screen Replacement",
    createdAt: "2026-01-20T07:25:00Z",
    visible: true,
  },
  {
    id: "rev2",
    authorName: "Tobi O.",
    rating: 5,
    comment: "Laptop sped up significantly. Fair price and very patient explanation of the issue.",
    serviceName: "Laptop Diagnostics & Repair",
    createdAt: "2026-01-18T13:40:00Z",
    visible: true,
  },
  {
    id: "rev3",
    authorName: "Chidinma E.",
    rating: 4,
    comment: "Data recovery saved all my project files. Communication was clear throughout.",
    serviceName: "Data Recovery",
    createdAt: "2026-01-15T10:15:00Z",
    visible: true,
  },
  {
    id: "rev4",
    authorName: "Samuel B.",
    rating: 5,
    comment: "Installed my dev environment and security tools. Very knowledgeable.",
    serviceName: "Software Installation & Setup",
    createdAt: "2026-01-12T17:30:00Z",
    visible: true,
  },
  {
    id: "rev5",
    authorName: "Aisha M.",
    rating: 5,
    comment: "Quick turnaround and quality parts. Would recommend to any student.",
    serviceName: "Phone Screen Replacement",
    createdAt: "2026-01-10T09:20:00Z",
    visible: true,
  },
];

// ── Notifications (owner-scoped) ─────────────────────────────

const seededNotifications: ServiceProviderNotification[] = [
  {
    id: "spn1",
    kind: "new_review",
    title: "New 5-star review",
    body: "Kunle A. reviewed Phone Screen Replacement.",
    read: false,
    createdAt: "2026-01-20T07:26:00Z",
    href: "/service-provider/reviews",
  },
  {
    id: "spn2",
    kind: "service_moderation",
    title: "Service activated",
    body: "Data Recovery was approved and is now active.",
    read: false,
    createdAt: "2026-01-19T14:21:00Z",
    href: "/service-provider/services",
  },
  {
    id: "spn3",
    kind: "verification_update",
    title: "Identity verified",
    body: "Kampmax approved your identity verification.",
    read: true,
    createdAt: "2026-01-15T16:46:00Z",
  },
  {
    id: "spn4",
    kind: "profile_approved",
    title: "Profile approved",
    body: "Your service provider profile is now live on Kampmax.",
    read: true,
    createdAt: "2026-01-15T09:01:00Z",
    href: "/service-provider",
  },
];

// ── Per-owner context ────────────────────────────────────────

interface SpDashboardUserContext {
  record: ServiceProviderDashboardRecord;
  activity: ServiceProviderActivityEvent[];
  reviews: ServiceProviderReview[];
  settings: ServiceProviderSettings;
  notifications: ServiceProviderNotification[];
}

const initialContext: SpDashboardUserContext = {
  record: createSeededDashboardRecord(),
  activity: seededActivity,
  reviews: seededReviews,
  settings: {
    ...DEFAULT_SERVICE_PROVIDER_SETTINGS,
    contactPreferences: {
      allowCalls: true,
      allowMessages: true,
      allowEmail: false,
    },
  },
  notifications: seededNotifications,
};

// In-memory owner-scoped store. Production → backend per-owner rows.
export const spDashboardStore: Record<string, SpDashboardUserContext> = {
  [profile.userId]: initialContext,
};

export function getSpDashboardContext(userId: string): SpDashboardUserContext | undefined {
  return spDashboardStore[userId];
}

export function ensureSpDashboardContext(userId: string): SpDashboardUserContext {
  if (!spDashboardStore[userId]) {
    spDashboardStore[userId] = {
      record: createSeededDashboardRecord(),
      activity: [],
      reviews: [],
      settings: { ...DEFAULT_SERVICE_PROVIDER_SETTINGS },
      notifications: [],
    };
  }
  return spDashboardStore[userId];
}