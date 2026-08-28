import type {
  DocumentRequirement,
  VendorOnboardingDraft,
} from "@/types/onboarding";
import { VENDOR_ONBOARDING_STATUS } from "@/types/onboarding";

// ============================================================
// VENDOR ONBOARDING MOCK DATA
// ============================================================
//
// The document requirements below MODEL the shape the backend will eventually
// provide:
//   {
//     documentType, required, acceptedFormats, maxSize, status
//   }
// They are NOT hard-coded law — the UI renders whichever requirements the
// backend returns. We do not store uploaded documents here; uploads are
// simulated through the service and reference private/authenticated handles
// only (never public URLs).

export const documentRequirements: DocumentRequirement[] = [
  {
    documentType: "government_id",
    label: "Government-issued ID",
    required: false,
    acceptedFormats: ["jpg", "jpeg", "png", "pdf"],
    maxSizeMb: 5,
  },
  {
    documentType: "business_registration",
    label: "Business registration (where applicable)",
    required: false,
    acceptedFormats: ["pdf", "jpg", "png"],
    maxSizeMb: 8,
  },
];

// The default mock user is a campus student (no vendor yet). We seed a DRAFT
// application so the "Become a Vendor / Continue Vendor Setup" entry point and
// the resume flow are demonstrable. In production this state comes from the
// backend keyed to the authenticated identity.
export const initialDraft: VendorOnboardingDraft = {
  applicationId: "app_demo_001",
  userId: "u1",
  status: VENDOR_ONBOARDING_STATUS.IN_PROGRESS,
  currentStep: 2,
  createdAt: "2026-08-20T09:00:00.000Z",
  updatedAt: "2026-08-20T09:15:00.000Z",
  business: {
    businessType: "individual",
    storeName: "",
    phone: "",
    email: "",
    description: "",
  },
  store: {
    storeName: "",
    storeDescription: "",
    tagline: "",
    logo: null,
    coverImage: null,
  },
  campus: {
    primaryCampusId: "rugipo",
    additionalCampusIds: [],
    pickupAvailable: true,
    deliveryAvailable: false,
  },
  categories: {
    primaryCategoryId: "",
    secondaryCategoryIds: [],
  },
  verification: {
    status: "not_required",
  },
  documents: documentRequirements.map((d) => ({
    ...d,
    id: `doc_${d.documentType}`,
    status: "not_uploaded",
  })),
  payout: {
    status: "not_set_up",
  },
  policies: {
    returnPolicy: "",
    cancellationPolicy: "",
    deliveryPolicy: "",
    pickupPolicy: "",
  },
  settings: {
    storeVisibility: "public",
    orderAcceptance: "accepting",
    pickupAvailable: true,
    deliveryAvailable: false,
    customerContactEnabled: true,
  },
};

// Mutable in-memory store (prototype). The service owns all mutations.
export const onboardingStore = {
  draft: { ...initialDraft },
};
