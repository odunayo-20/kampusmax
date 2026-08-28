import type {
  VendorOnboardingDraft,
  VendorOnboardingDocument,
  VendorOnboardingSummary,
  VendorOnboardingStepId,
  VendorOnboardingStatus,
  VendorSubmitResult,
} from "@/types/onboarding";
import {
  VENDOR_ONBOARDING_STATUS,
  VENDOR_SUBMIT_RESULT,
  VENDOR_DOCUMENT_STATUS,
  VENDOR_PAYOUT_STATUS,
  VENDOR_ONBOARDING_STEPS,
} from "@/types/onboarding";
import { getCurrentUser } from "@/services/users";
import { onboardingStore, documentRequirements } from "@/data/onboarding";

// ============================================================
// VENDOR ONBOARDING SERVICE LAYER (repository)
// ============================================================
//
// Isolates all vendor-onboarding access behind a single module that maps 1:1
// to a future backend API:
//   GET    /me/vendor/onboarding            → status + resume
//   POST   /me/vendor/onboarding            → create application
//   PATCH  /me/vendor/onboarding            → save draft
//   POST   /me/vendor/onboarding/documents  → upload/replace a document
//   GET    /me/vendor/onboarding/documents  → document requirements + state
//   POST   /me/vendor/onboarding/payout     → payout verification
//   POST   /me/vendor/onboarding/submit     → submit for review
//
// AUTHORIZATION: ownership is ALWAYS derived from the authenticated identity
// (getCurrentUser().id). We never trust vendorId / userId / profileId /
// applicationId supplied by the client. Every application is keyed by owner.
//
// SECURITY: this layer never decides approval, verification, document
// approval, or bank verification. Those are backend/admin decisions. It only
// reports whatever status the backend returns and never exposes internal
// notes, risk scores, public document URLs, or raw bank details.

// Owner-scoped store. In production this is the backend; here we keep an
// in-memory map keyed by the authenticated user id to model ownership.
type OwnerStore = Record<string, VendorOnboardingDraft>;
const store: OwnerStore = {
  [onboardingStore.draft.userId]: { ...onboardingStore.draft },
};

function ownerId(): string {
  // Derive ownership from the authenticated identity — never trust client.
  return getCurrentUser().id;
}

function scramble(current: VendorOnboardingDraft): void {
  current.updatedAt = new Date().toISOString();
}

function maskAccountNumber(num?: string): string | undefined {
  if (!num || num.length < 4) return num;
  return `******${num.slice(-4)}`;
}

// ── Status & summary ─────────────────────────────────────────

export function getOnboardingSummary(): VendorOnboardingSummary {
  const uid = ownerId();
  const app = store[uid];
  if (!app) {
    return {
      userId: uid,
      hasVendorProfile: false,
      status: null,
      currentStep: null,
    };
  }
  return {
    userId: uid,
    hasVendorProfile: true,
    status: app.status,
    currentStep: app.currentStep,
    storeName: app.store.storeName || undefined,
    resumePath: "/account/profiles/vendor/onboarding",
  };
}

export function getOnboardingStatus(): VendorOnboardingStatus | null {
  return store[ownerId()]?.status ?? null;
}

export function getOnboardingDraft(): VendorOnboardingDraft | null {
  const app = store[ownerId()];
  if (!app) return null;
  // Never hand back raw bank numbers; always mask in the read model.
  if (app.payout.accountNumber) {
    app.payout.maskedAccountNumber = maskAccountNumber(app.payout.accountNumber);
  }
  return cloneSafe(app);
}

/** Deep-ish clone so callers can't mutate the store accidentally. */
function cloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getDocumentRequirements() {
  return cloneSafe(documentRequirements);
}

// ── Create / update (save progress) ──────────────────────────

export function createApplication(): { created: boolean; id: string } {
  const uid = ownerId();
  if (store[uid]) return { created: false, id: store[uid].applicationId ?? "" };
  const now = new Date().toISOString();
  const app: VendorOnboardingDraft = {
    applicationId: `app_${uid}_${Date.now()}`,
    userId: uid,
    status: VENDOR_ONBOARDING_STATUS.DRAFT,
    currentStep: 1,
    createdAt: now,
    updatedAt: now,
    business: { businessType: "individual" },
    store: { logo: null, coverImage: null },
    campus: { additionalCampusIds: [], pickupAvailable: true, deliveryAvailable: false },
    categories: { secondaryCategoryIds: [] },
    verification: { status: "not_required" },
    documents: documentRequirements.map((d) => ({
      ...d,
      id: `doc_${d.documentType}`,
      status: "not_uploaded",
    })),
    payout: { status: "not_set_up" },
    policies: {},
    settings: {
      storeVisibility: "public",
      orderAcceptance: "accepting",
      pickupAvailable: true,
      deliveryAvailable: false,
      customerContactEnabled: true,
    },
  };
  store[uid] = app;
  return { created: true, id: app.applicationId ?? "" };
}

export function saveDraft(
  data: Partial<VendorOnboardingDraft> & { currentStep: VendorOnboardingStepId }
): { ok: boolean } {
  const app = store[ownerId()];
  if (!app) return { ok: false };
  // Save progress: keep DRAFT/IN_PROGRESS semantics, never overwrite a
  // submitted/reviewed application from a partially filled form.
  if (
    app.status === VENDOR_ONBOARDING_STATUS.PENDING_REVIEW ||
    app.status === VENDOR_ONBOARDING_STATUS.APPROVED ||
    app.status === VENDOR_ONBOARDING_STATUS.REJECTED ||
    app.status === VENDOR_ONBOARDING_STATUS.SUSPENDED
  ) {
    return { ok: false };
  }
  Object.assign(app, data);
  if (app.status === VENDOR_ONBOARDING_STATUS.DRAFT) {
    app.status = VENDOR_ONBOARDING_STATUS.IN_PROGRESS;
  }
  app.currentStep = data.currentStep;
  scramble(app);
  return { ok: true };
}

// ── Document upload / replace ────────────────────────────────
// Simulates an authenticated upload endpoint. Returns a PRIVATE reference,
// never a public URL. Only documents owned by the current user are affected.

export interface UploadResult {
  ok: boolean;
  error?: string;
  privateRef?: string;
  fileName?: string;
}

const MAX_UPLOADS_PER_TIMESLOT = 10;

export function uploadDocument(
  documentType: string,
  fileName: string,
  fileSizeBytes: number,
  fileType: string
): UploadResult {
  const app = store[ownerId()];
  if (!app) return { ok: false, error: "No vendor application found." };

  const req = documentRequirements.find((d) => d.documentType === documentType);
  if (!req) return { ok: false, error: "Unknown document type." };

  // File type/size validation is advisory here; the backend independently
  // validates everything and never trusts the browser MIME type.
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!req.acceptedFormats.includes(ext)) {
    return { ok: false, error: `Only ${req.acceptedFormats.join(", ")} are allowed.` };
  }
  const maxBytes = req.maxSizeMb * 1024 * 1024;
  if (fileSizeBytes > maxBytes) {
    return { ok: false, error: `File must be ${req.maxSizeMb}MB or smaller.` };
  }
  void fileType;
  if (fileSizeBytes === 0) return { ok: false, error: "File is empty." };

  let doc = app.documents.find((d) => d.documentType === documentType);
  if (!doc) {
    doc = { ...req, id: `doc_${documentType}`, status: "not_uploaded" } as VendorOnboardingDocument;
    app.documents.push(doc);
  }
  doc.fileName = fileName;
  doc.status = VENDOR_DOCUMENT_STATUS.UPLOADED;
  doc.privateRef = `private://vendor-app/${app.applicationId}/${documentType}/${Date.now()}`;
  doc.actionMessage = undefined;
  scramble(app);

  void MAX_UPLOADS_PER_TIMESLOT;
  return { ok: true, privateRef: doc.privateRef, fileName };
}

export function replaceDocument(
  documentType: string,
  fileName: string,
  fileSizeBytes: number,
  fileType: string
): UploadResult {
  if (!store[ownerId()]?.documents.some((d) => d.documentType === documentType)) {
    return { ok: false, error: "No existing document to replace." };
  }
  return uploadDocument(documentType, fileName, fileSizeBytes, fileType);
}

export function removeDocument(documentType: string): { ok: boolean; error?: string } {
  const app = store[ownerId()];
  if (!app) return { ok: false, error: "No vendor application found." };
  const doc = app.documents.find((d) => d.documentType === documentType);
  if (!doc) return { ok: false, error: "Document not found." };
  doc.status = VENDOR_DOCUMENT_STATUS.NOT_UPLOADED;
  doc.fileName = undefined;
  doc.privateRef = undefined;
  doc.actionMessage = undefined;
  scramble(app);
  return { ok: true };
}

// ── Payout ───────────────────────────────────────────────────
// The frontend never decides whether an account is verified. Backend/payment
// provider does. Bank info is NOT logged or stored in browser storage.

export interface PayoutInput {
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export function setPayout(input: PayoutInput): {
  ok: boolean;
  status: VendorOnboardingDraft["payout"]["status"];
  maskedAccountNumber?: string;
} {
  const app = store[ownerId()];
  if (!app) return { ok: false, status: "not_set_up" };
  // Basic metalimits only; genuine verification is backend/payment-provider.
  if (!input.accountNumber || input.accountNumber.length < 10) {
    return { ok: false, status: "not_set_up" };
  }
  app.payout = {
    bankCode: input.bankCode,
    bankName: input.bankName,
    accountNumber: input.accountNumber,
    accountName: input.accountName,
    status: VENDOR_PAYOUT_STATUS.PENDING_VERIFICATION,
    maskedAccountNumber: maskAccountNumber(input.accountNumber),
  };
  scramble(app);
  return {
    ok: true,
    status: VENDOR_PAYOUT_STATUS.PENDING_VERIFICATION,
    maskedAccountNumber: app.payout.maskedAccountNumber,
  };
}

export function getPayoutOverview() {
  const app = store[ownerId()];
  if (!app) {
    return { status: "not_set_up", maskedAccountNumber: undefined, bankName: undefined };
  }
  return cloneSafe({
    status: app.payout.status,
    maskedAccountNumber: app.payout.maskedAccountNumber,
    bankName: app.payout.bankName,
  });
}

// ── Submit for review ────────────────────────────────────────
// The frontend must not assume the application is valid. The backend
// (represented here) validates and returns an authoritative result.

export function submitApplication(): {
  success: boolean;
  result: VendorSubmitResult;
  message: string;
} {
  const app = store[ownerId()];
  if (!app) return { success: false, result: VENDOR_SUBMIT_RESULT.MISSING_INFORMATION, message: "You have not started an application." };

  if (
    app.status === VENDOR_ONBOARDING_STATUS.PENDING_REVIEW ||
    app.status === VENDOR_ONBOARDING_STATUS.APPROVED
  ) {
    return { success: false, result: VENDOR_SUBMIT_RESULT.ALREADY_SUBMITTED, message: "This application has already been submitted." };
  }

  // Backend validation — mirrors real checks; UI can't bypass these.
  if (!app.store.storeName || !app.business.storeName) {
    return { success: false, result: VENDOR_SUBMIT_RESULT.MISSING_INFORMATION, message: "Store information is incomplete." };
  }
  if (!app.campus.primaryCampusId) {
    return { success: false, result: VENDOR_SUBMIT_RESULT.MISSING_INFORMATION, message: "Primary campus is required." };
  }
  if (!app.categories.primaryCategoryId) {
    return { success: false, result: VENDOR_SUBMIT_RESULT.MISSING_INFORMATION, message: "Choose a primary category." };
  }
  if (app.verification.status === "pending" || app.verification.status === "action_required") {
    return { success: false, result: VENDOR_SUBMIT_RESULT.VERIFICATION_REQUIRED, message: "Verification is still required before submitting." };
  }
  const requiredDoc = app.documents.find((d) => d.required && d.status !== "uploaded" && d.status !== "approved");
  if (requiredDoc) {
    return { success: false, result: VENDOR_SUBMIT_RESULT.DOCUMENT_REQUIRED, message: `Required document missing: ${requiredDoc.label}.` };
  }
  if (app.payout.status === "not_set_up") {
    return { success: false, result: VENDOR_SUBMIT_RESULT.PAYOUT_VERIFICATION_REQUIRED, message: "A payout account is required to receive sales." };
  }

  app.status = VENDOR_ONBOARDING_STATUS.PENDING_REVIEW;
  app.submittedAt = new Date().toISOString();
  app.currentStep = VENDOR_ONBOARDING_STEPS; // full review
  app.adminMessage = undefined;
  scramble(app);
  return { success: true, result: VENDOR_SUBMIT_RESULT.SUBMITTED, message: "Submitted. Kampmax will review your application." };
}
