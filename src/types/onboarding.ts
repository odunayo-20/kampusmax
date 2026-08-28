// ============================================================
// VENDOR ONBOARDING DOMAIN TYPES
// ============================================================
//
// Vendor onboarding is attached to the SAME Kampmax user account. A vendor is
// NOT a separate auth account — the existing authenticated user activates a
// Vendor Profile alongside their Customer Profile.
//
// SECURITY: the frontend never decides approval/verification/status. Every
// status value displayed is backend-authoritative. The mock service below only
// models the backend contract so the UI can be swapped to real API calls
// without changing components.

// ── Centralized status configuration ─────────────────────────
// Single source of truth for every status string. UI code must import these
// constants rather than repeating status literals.

export const VENDOR_ONBOARDING_STATUS = {
  DRAFT: "DRAFT",
  IN_PROGRESS: "IN_PROGRESS",
  PENDING_REVIEW: "PENDING_REVIEW",
  MORE_INFORMATION_REQUIRED: "MORE_INFORMATION_REQUIRED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type VendorOnboardingStatus =
  (typeof VENDOR_ONBOARDING_STATUS)[keyof typeof VENDOR_ONBOARDING_STATUS];

export const VENDOR_ONBOARDING_STEP = {
  BUSINESS: 1,
  STORE: 2,
  CAMPUS: 3,
  CATEGORY: 4,
  VERIFICATION: 5,
  DOCUMENTS: 6,
  PAYOUT: 7,
  POLICIES: 8,
} as const;

export type VendorOnboardingStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const VENDOR_ONBOARDING_STEPS = 8;

// ── Document status (single source of truth) ─────────────────

export const VENDOR_DOCUMENT_STATUS = {
  NOT_UPLOADED: "not_uploaded",
  UPLOADING: "uploading",
  UPLOADED: "uploaded",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  REQUIRES_REPLACEMENT: "requires_replacement",
} as const;

export type VendorDocumentStatus =
  (typeof VENDOR_DOCUMENT_STATUS)[keyof typeof VENDOR_DOCUMENT_STATUS];

// ── Verification section status ──────────────────────────────

export const VENDOR_VERIFICATION_TYPE = {
  IDENTITY: "identity",
  BUSINESS: "business",
  ADDRESS: "address",
} as const;

export type VendorVerificationType =
  (typeof VENDOR_VERIFICATION_TYPE)[keyof typeof VENDOR_VERIFICATION_TYPE];

export const VENDOR_VERIFICATION_STATUS = {
  NOT_REQUIRED: "not_required",
  PENDING: "pending",
  APPROVED: "approved",
  ACTION_REQUIRED: "action_required",
} as const;

export type VendorVerificationStatus =
  (typeof VENDOR_VERIFICATION_STATUS)[keyof typeof VENDOR_VERIFICATION_STATUS];

// ── Payout verification status ───────────────────────────────
// The frontend never decides whether an account is genuinely verified; the
// backend/payment provider does. We only render whatever status the backend
// returns and never expose raw bank details.

export const VENDOR_PAYOUT_STATUS = {
  NOT_SET_UP: "not_set_up",
  PENDING_VERIFICATION: "pending_verification",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VendorPayoutStatus =
  (typeof VENDOR_PAYOUT_STATUS)[keyof typeof VENDOR_PAYOUT_STATUS];

// ── Submission result (backend-authoritative) ────────────────

export const VENDOR_SUBMIT_RESULT = {
  SUBMITTED: "submitted",
  MISSING_INFORMATION: "missing_information",
  DOCUMENT_REQUIRED: "document_required",
  VERIFICATION_REQUIRED: "verification_required",
  PAYOUT_VERIFICATION_REQUIRED: "payout_verification_required",
  ALREADY_SUBMITTED: "already_submitted",
} as const;

export type VendorSubmitResult =
  (typeof VENDOR_SUBMIT_RESULT)[keyof typeof VENDOR_SUBMIT_RESULT];

// ── Form data model ──────────────────────────────────────────
// Mirrors what the future backend API accepts. Only necessary fields are
// collected — small campus sellers are not forced through formal company
// registration.

export type VendorBusinessType =
  | "individual"
  | "registered_business";

export interface VendorOnboardingDraft {
  /** backend-owned identifier (never trusted from the client). */
  applicationId?: string;
  userId: string;
  status: VendorOnboardingStatus;
  /** Highest step the user has reached; resume continues here. */
  currentStep: VendorOnboardingStepId;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  /** Public/admin-approved explanation only — never internal notes. */
  adminMessage?: string;
  /** Set when approved. The final public storefront slug. */
  approvedSlug?: string;

  business: {
    businessType: VendorBusinessType;
    storeName?: string;
    phone?: string;
    email?: string;
    description?: string;
    categoryId?: string;
  };

  store: {
    storeName?: string;
    storeDescription?: string;
    tagline?: string;
    logo?: string | null;
    coverImage?: string | null;
    categoryId?: string;
  };

  campus: {
    primaryCampusId?: string;
    additionalCampusIds: string[];
    deliveryArea?: string;
    pickupAvailable?: boolean;
    deliveryAvailable?: boolean;
  };

  categories: {
    primaryCategoryId?: string;
    secondaryCategoryIds: string[];
  };

  verification: {
    type?: VendorVerificationType;
    status: VendorVerificationStatus;
  };

  documents: VendorOnboardingDocument[];

  payout: {
    bankCode?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    status: VendorPayoutStatus;
    /** Masked account number for display (e.g. ******1234). */
    maskedAccountNumber?: string;
  };

  policies: {
    returnPolicy?: string;
    cancellationPolicy?: string;
    deliveryPolicy?: string;
    pickupPolicy?: string;
  };

  settings: {
    storeVisibility: "public" | "disabled";
    orderAcceptance: "accepting" | "paused";
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
    customerContactEnabled: boolean;
  };
}

// ── Document record ──────────────────────────────────────────
// Sensitive. Only documents belonging to the authenticated user are shown.
// Never expose permanent public URLs.

export interface VendorOnboardingDocument {
  id?: string;
  documentType: string;
  label: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeMb: number;
  status: VendorDocumentStatus;
  fileName?: string;
  /** Private/authenticated access reference — NOT a public URL. */
  privateRef?: string;
  /** Backend-returned rejection/action message (never internal notes). */
  actionMessage?: string;
}

// ── Canned, backend-configured document list ─────────────────
// The exact requirements come from the backend; we just model the shape.

export interface DocumentRequirement {
  documentType: string;
  label: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeMb: number;
}

// ── Onboarding entry/status summary (for the profile center) ─

export interface VendorOnboardingSummary {
  userId: string;
  hasVendorProfile: boolean;
  status: VendorOnboardingStatus | null;
  currentStep: VendorOnboardingStepId | null;
  storeName?: string;
  /** URL to resume, safe for the logged-in owner only. */
  resumePath?: string;
}

// ── Helpers ──────────────────────────────────────────────────

export const ONBOARDING_STEP_LABELS: Record<VendorOnboardingStepId, string> = {
  1: "Business Information",
  2: "Store Information",
  3: "Campus & Service Area",
  4: "Categories",
  5: "Verification",
  6: "Documents",
  7: "Payout Account",
  8: "Store Policies",
};

export const ONBOARDING_STEP_DESCRIPTIONS: Record<VendorOnboardingStepId, string> = {
  1: "Tell us about you and your business.",
  2: "Set up the store customers will see.",
  3: "Choose where you operate on campus.",
  4: "Pick the categories you sell in.",
  5: "Check what verification you may need.",
  6: "Upload any required identification documents.",
  7: "Add a payout account your sales will go to.",
  8: "Set the customer-facing policies for your store.",
};

/** Statuses that should show a focused "action" state, not the steps. */
export const BLOCKING_ONBOARDING_STATUSES: VendorOnboardingStatus[] = [
  VENDOR_ONBOARDING_STATUS.PENDING_REVIEW,
  VENDOR_ONBOARDING_STATUS.APPROVED,
  VENDOR_ONBOARDING_STATUS.REJECTED,
  VENDOR_ONBOARDING_STATUS.SUSPENDED,
];
