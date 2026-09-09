// ============================================================
// ADMIN VERIFICATION & KYC OPERATIONS DATA (Module 43)
// ============================================================
//
// One normalized dataset over the REAL verification state held by the
// vendor, employer and freelancer (marketplace provider) stores. No
// Kampmax store holds a unified "verification request" entity, admin
// task assignment, expiry, priority or resubmission history — so none of
// those exist here. Rows are derived per applicant type from the owning
// store's real status value; the console vocabulary below is a LABEL on
// top of that value, never a fabricated backend field.
//
// Sources (all read-only):
//   - vendors     → buildManagedVendorDataset()   (Module 35)
//   - employers   → buildEmployerDataset()        (Module 37)
//   - freelancers → marketplaceServiceProviders   (freelancer console)
//   - documents   → vendor verification records, vendor onboarding
//                   requirements, freelancer document requirements
//                   (REAL config only — no storage layer exists)
// ============================================================

import type {
  ManagedVerificationApplicantSummary,
  ManagedVerificationApplicantType,
  ManagedVerificationCounts,
  ManagedVerificationDecisionSupport,
  ManagedVerificationDetail,
  ManagedVerificationDocumentPolicyItem,
  ManagedVerificationHistoryItem,
  ManagedVerificationListQuery,
  ManagedVerificationRow,
  ManagedVerificationType,
  ManagedVendor,
  VendorVerificationStatus,
} from "@/types/admin";
import { buildManagedVendorDataset } from "./vendor-management";
import { buildEmployerDataset } from "./employer-management";
import { listEmployerRecords } from "@/data/employer";
import { marketplaceServiceProviders } from "@/data/service-marketplace";
import type { MarketplaceProvider } from "@/types/service-marketplace";
import { documentRequirements } from "@/data/onboarding";
import { spDocumentRequirements } from "@/data/service-provider";
import { getCampusShortName } from "./campuses";

// ============================================================
// CONSOLE STATUS DERIVATION (real source value → label)
// ============================================================

function vendorConsoleStatus(status: VendorVerificationStatus): ManagedVerificationRow["status"] {
  switch (status) {
    case "verified":
      return "verified";
    case "rejected":
      return "rejected";
    default:
      return "awaiting_review";
  }
}

function employerConsoleStatus(status: string | null): ManagedVerificationRow["status"] | null {
  switch (status) {
    case "verified":
      return "verified";
    case "rejected":
      return "rejected";
    case "action_required":
      return "action_required";
    case "pending":
      return "awaiting_review";
    default:
      // not_started (and unknown) → no verification surface to review.
      return null;
  }
}

function freelancerVerificationType(type: string | undefined): ManagedVerificationType {
  if (type === "business") return "business";
  if (type === "address") return "address";
  if (type === "email") return "email";
  if (type === "professional") return "professional";
  return "identity";
}

// ============================================================
// DEEP LINKS (existing responsible consoles — never duplicated here)
// ============================================================

export function verificationApplicantHref(
  type: ManagedVerificationApplicantType,
  applicantId: string
): string {
  switch (type) {
    case "vendor":
      return `/admin/vendors/${applicantId}`;
    case "freelancer":
      return `/admin/freelancers/${applicantId}`;
    case "employer":
      return `/admin/employers/${applicantId}`;
  }
}

export function verificationIdOf(
  type: ManagedVerificationApplicantType,
  applicantId: string
): string {
  return `vrf-${type}-${applicantId}`;
}

// ============================================================
// ROW BUILDERS
// ============================================================

function vendorRow(v: ManagedVendor): ManagedVerificationRow {
  const status = vendorConsoleStatus(v.verificationStatus);
  return {
    id: verificationIdOf("vendor", v.id),
    applicantType: "vendor",
    applicantId: v.id,
    applicantName: v.storeName,
    applicantSummary: v.owner?.name ?? "",
    verificationType: "business",
    status,
    sourceStatus: v.verificationStatus,
    statusNote: `Storefront verification status: ${v.verificationStatus}`,
    submittedAt: v.verification.submittedAt ?? null,
    updatedAt: v.verification.reviewedAt ?? null,
    reviewedAt: v.verification.reviewedAt ?? null,
    reviewedBy: v.verification.reviewedBy ?? null,
    rejectionReason: v.verification.rejectionReason ?? null,
    documentsCount: v.verification.documents.length,
    documentsTotal: 0,
    campusId: v.campusId,
    campusName: getCampusShortName(v.campusId),
    ownerName: v.owner?.name ?? "",
    applicantHref: verificationApplicantHref("vendor", v.id),
  };
}

function employerRow(
  id: string,
  name: string,
  organizationName: string | null,
  status: string | null,
  verification: { type: string | null; note: string | null } | null,
  email: string | null,
  phone: string | null,
  campusId: string | null,
  campusName: string | null,
  establishedAt: string | null,
  owner: string | null,
  submittedAt: string | null,
  updatedAt: string | null
): ManagedVerificationRow | null {
  const consoleStatus = employerConsoleStatus(status);
  if (!consoleStatus) return null; // not_started / external → excluded
  const typeValue = verification?.type ?? null;
  return {
    id: verificationIdOf("employer", id),
    applicantType: "employer",
    applicantId: id,
    applicantName: organizationName ?? name,
    applicantSummary: name,
    verificationType: typeValue === null ? null : freelancerVerificationType(typeValue),
    status: consoleStatus,
    sourceStatus: status as string,
    statusNote: verification?.note
      ? `Employer verification: ${status} · ${verification.note}`
      : `Employer onboarding verification: ${status}`,
    submittedAt,
    updatedAt,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    documentsCount: 0,
    documentsTotal: 0,
    campusId,
    campusName: campusName ?? (campusId ? getCampusShortName(campusId) : null),
    ownerName: owner ?? name,
    applicantHref: verificationApplicantHref("employer", id),
  };
}

function freelancerRow(p: MarketplaceProvider): ManagedVerificationRow | null {
  if (p.verificationStatus === "unverified") return null; // excluded
  const status: ManagedVerificationRow["status"] =
    p.verificationStatus === "approved" ? "verified" : "awaiting_review";
  return {
    id: verificationIdOf("freelancer", p.id),
    applicantType: "freelancer",
    applicantId: p.id,
    applicantName: p.displayName,
    applicantSummary: p.specialties?.[0] ?? p.type,
    verificationType: freelancerVerificationType(p.type),
    status,
    sourceStatus: p.verificationStatus,
    statusNote: `Freelancer marketplace verification: ${p.verificationStatus}`,
    submittedAt: null,
    updatedAt: null,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    documentsCount: 0,
    documentsTotal: 0,
    campusId: p.primaryCampusId,
    campusName: getCampusShortName(p.primaryCampusId),
    ownerName: p.displayName,
    applicantHref: verificationApplicantHref("freelancer", p.id),
  };
}

// ============================================================
// DETAIL BUILDERS
// ============================================================

function vendorDetail(v: ManagedVendor): ManagedVerificationDetail {
  const row = vendorRow(v);
  const history: ManagedVerificationHistoryItem[] = [];
  if (v.verification.reviewedAt) {
    history.push({
      id: `vhst-${v.id}-reviewed`,
      kind: v.verificationStatus === "verified" ? "approved" : "rejected",
      title:
        v.verificationStatus === "verified"
          ? "Store verification approved"
          : "Store verification rejected",
      meta: v.verification.reviewedBy
        ? `Action by ${v.verification.reviewedBy}`
        : "Platform console",
      at: v.verification.reviewedAt,
    });
  }
  const supportsAction = v.verificationStatus === "pending_verification";
  const decisionSupport: ManagedVerificationDecisionSupport = {
    actionable: supportsAction,
    canApprove: supportsAction,
    canReject: supportsAction,
    reasonNote: supportsAction
      ? "Approving makes the storefront live immediately; the vendor console performs the same transition."
      : v.verificationStatus === "verified"
        ? "This store is already verified in the vendor console — no action is available here."
        : "This store was rejected in the vendor console and is deactivated. Address it from the vendor console.",
  };
  return {
    verification: row,
    applicant: {
      type: "vendor",
      title: v.storeName,
      subtitle: v.category || null,
      email: v.owner?.email && v.owner.email.length > 0 ? v.owner.email : null,
      phone: v.owner?.phone && v.owner.phone.length > 0 ? v.owner.phone : null,
      accountStatus: `Verification: ${v.verificationStatus} · Store: ${v.storeStatus}`,
      established: v.registeredAt || null,
      description: v.description || null,
      adminHref: row.applicantHref,
      publicHref: null,
    },
    documents: v.verification.documents.map((d) => ({
      id: d.id,
      documentType: d.kind,
      label: d.label,
      required: true,
      status: d.state,
      fileName: null,
      acceptedFormats: [],
      maxSizeMb: 0,
      hasPrivateRef: Boolean(d.reference),
      actionMessage: d.note ?? null,
    })),
    documentPolicy: documentRequirements.map(
      (d): ManagedVerificationDocumentPolicyItem => ({
        documentType: d.documentType,
        label: d.label,
        required: d.required,
        acceptedFormats: d.acceptedFormats,
        maxSizeMb: d.maxSizeMb,
      })
    ),
    history,
    decisionSupport,
  };
}

function employerDetail(
  id: string,
  name: string,
  organizationName: string | null,
  status: string | null,
  verification: { status: string; type: string | null; note: string | null } | null,
  email: string | null,
  phone: string | null,
  campusId: string | null,
  campusName: string | null,
  description: string | null,
  establishedAt: string | null,
  owner: string | null,
  consoleStatus: string | null,
  events: { kind: string; message: string; meta: string; at: string }[],
  submittedAt: string | null,
  updatedAt: string | null
): ManagedVerificationDetail | null {
  const row = employerRow(
    id,
    name,
    organizationName,
    status,
    verification,
    email,
    phone,
    campusId,
    campusName,
    establishedAt,
    owner,
    submittedAt,
    updatedAt
  );
  if (!row) return null;
  const history: ManagedVerificationHistoryItem[] = events
    .filter((e) => e.kind === "verification")
    .map((e, i) => ({
      id: `vhst-${id}-${i}`,
      kind: e.message.toLowerCase().includes("submitted") ? "submitted" : "status_change",
      title: e.message,
      meta: e.meta,
      at: e.at,
    }));
  return {
    verification: row,
    applicant: {
      type: "employer",
      title: organizationName ?? name,
      subtitle: verification?.note
        ? `Employer verification: ${verification.status} · ${verification.note}`
        : `Employer onboarding verification: ${status ?? "none"}`,
      email,
      phone,
      accountStatus: consoleStatus ?? null,
      established: establishedAt ?? null,
      description: description ?? null,
      adminHref: row.applicantHref,
      publicHref: null,
    },
    documents: [],
    documentPolicy: null, // employer applications carry no document store
    history,
    decisionSupport: {
      actionable: false,
      canApprove: false,
      canReject: false,
      reasonNote:
        "Employer verification is controlled by employer onboarding (application approval/rejection). No verification-level action exists in the backend — review this employer from the employer console.",
    },
  };
}

function freelancerDetail(p: MarketplaceProvider): ManagedVerificationDetail | null {
  const row = freelancerRow(p);
  if (!row) return null;
  return {
    verification: row,
    applicant: {
      type: "freelancer",
      title: p.displayName,
      subtitle: p.specialties?.length ? p.specialties.slice(0, 2).join(", ") : (p.tagline ?? null),
      email: null,
      phone: null,
      accountStatus: `Marketplace verification: ${p.verificationStatus}`,
      established: p.joinedYear ? `${p.joinedYear}` : null,
      description: p.description ?? null,
      adminHref: row.applicantHref,
      publicHref: null,
    },
    documents: [],
    documentPolicy: spDocumentRequirements.map(
      (d): ManagedVerificationDocumentPolicyItem => ({
        documentType: d.documentType,
        label: d.label,
        required: d.required,
        acceptedFormats: d.acceptedFormats,
        maxSizeMb: d.maxSizeMb,
      })
    ),
    history: [],
    decisionSupport: {
      actionable: false,
      canApprove: false,
      canReject: false,
      reasonNote:
        "Freelancer verification is the marketplace listing verification status. The prototype backend has no freelancer verification mutation — review this freelancer from the freelancer console.",
    },
  };
}

// ============================================================
// DATASET
// ============================================================

export interface ManagedVerificationDataset {
  rows: ManagedVerificationRow[];
  byId: Map<string, ManagedVerificationDetail>;
}

export function buildVerificationDataset(): ManagedVerificationDataset {
  const rows: ManagedVerificationRow[] = [];
  const byId = new Map<string, ManagedVerificationDetail>();

  const vendors = buildManagedVendorDataset();
  for (const v of vendors.vendors) {
    const detail = vendorDetail(v);
    rows.push(detail.verification);
    byId.set(detail.verification.id, detail);
  }

  const employers = buildEmployerDataset();
  const draftsByUser = new Map(
    listEmployerRecords().map((d) => [d.userId, d] as const)
  );
  for (const e of employers.employers) {
    const detail = employers.details.get(e.id);
    const verification = detail?.verification;
    const draft = draftsByUser.get(e.id) ?? null;
    const built = employerDetail(
      e.id,
      e.name,
      e.organizationName,
      verification?.status ?? e.verificationStatus ?? null,
      verification
        ? { status: verification.status, type: verification.type, note: verification.note }
        : null,
      e.email,
      e.phone,
      e.campusId,
      e.campusName,
      detail?.organization?.description ?? null,
      e.joinedAt,
      e.name,
      e.status,
      detail?.activity ?? [],
      draft?.submittedAt ?? null,
      draft?.updatedAt ?? null
    );
    if (!built) continue;
    rows.push(built.verification);
    byId.set(built.verification.id, built);
  }

  for (const p of marketplaceServiceProviders) {
    const detail = freelancerDetail(p);
    if (!detail) continue;
    rows.push(detail.verification);
    byId.set(detail.verification.id, detail);
  }

  return { rows, byId };
}

export const verificationDataset: ManagedVerificationDataset = buildVerificationDataset();

// ============================================================
// QUERY HELPERS (data layer; the service adds delay + pagination)
// ============================================================

export function filterVerificationRows(
  rows: ManagedVerificationRow[],
  query: ManagedVerificationListQuery
): ManagedVerificationRow[] {
  const search = query.search?.trim().toLowerCase();
  const status = query.status ?? "all";
  const applicantType = query.applicantType ?? "all";
  const verificationType = query.verificationType ?? "all";
  const campusId = query.campusId ?? "all";

  return rows.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (applicantType !== "all" && r.applicantType !== applicantType) return false;
    if (verificationType !== "all" && r.verificationType !== verificationType) return false;
    if (campusId !== "all" && r.campusId !== campusId) return false;
    if (search) {
      const haystack = [
        r.id,
        r.applicantName,
        r.applicantSummary,
        r.ownerName,
        r.sourceStatus,
        r.statusNote,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export function sortVerificationRows(
  rows: ManagedVerificationRow[],
  sortBy: ManagedVerificationListQuery["sortBy"],
  sortDir: ManagedVerificationListQuery["sortDir"]
): ManagedVerificationRow[] {
  const dir = sortDir === "desc" ? -1 : 1;
  const sorted = [...rows];
  switch (sortBy) {
    case "verificationType":
      sorted.sort((a, b) => (a.verificationType ?? "").localeCompare(b.verificationType ?? "") * dir);
      break;
    case "submittedAt":
      sorted.sort(
        (a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? "") * dir
      );
      break;
    case "updatedAt":
      sorted.sort((a, b) => (a.updatedAt ?? "").localeCompare(b.updatedAt ?? "") * dir);
      break;
    case "applicantName":
    default:
      sorted.sort((a, b) => a.applicantName.localeCompare(b.applicantName) * dir);
      break;
  }
  return sorted;
}

export function computeVerificationCounts(
  rows: ManagedVerificationRow[]
): ManagedVerificationCounts {
  const byStatus: ManagedVerificationCounts["byStatus"] = {
    awaiting_review: 0,
    verified: 0,
    rejected: 0,
    action_required: 0,
  };
  const byApplicantType: ManagedVerificationCounts["byApplicantType"] = {
    vendor: 0,
    freelancer: 0,
    employer: 0,
  };
  let withDocuments = 0;
  for (const r of rows) {
    byStatus[r.status] += 1;
    byApplicantType[r.applicantType] += 1;
    if (r.documentsCount > 0) withDocuments += 1;
  }
  return {
    all: rows.length,
    byStatus,
    byApplicantType,
    withDocuments,
  };
}