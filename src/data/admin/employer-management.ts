// ============================================================
// EMPLOYER MANAGEMENT DATA (Module 37)
// ============================================================
//
// Aggregates from EXISTING platform data stores — no fabricated
// records (spec §45). Sources:
//   - src/data/employer.ts      — employer onboarding drafts (backend store)
//   - src/data/opportunity.ts   — jobs, live proposals, application counts
//   - src/data/contracts.ts     — contracts (client = employer id)
//   - src/data/profile-reviews.ts — employer profile reviews (Module 33)
//
// A "managed employer" is any platform entity with an employer
// onboarding draft OR ownership of jobs in the marketplace. When a
// record exists in both (e.g. u1 / Oluwaseun Labs), the draft drives
// identity/status and the job store drives hiring activity. Job-only
// posters (external clients) surface honestly as such — no invented
// profiles or statuses.
// ============================================================

import type {
  ManagedEmployer,
  ManagedEmployerDetail,
  EmployerJobSummary,
  EmployerHiringSummary,
  EmployerActivityEvent,
  EmployerBucket,
  EmployerStatusCounts,
} from "@/types/admin";
import type { Opportunity } from "@/types/opportunity";
import type { EmployerOnboardingDraft } from "@/types/employer";
import { EMPLOYER_ONBOARDING_STATUS } from "@/types/employer";
import { CONTRACT_STATUS } from "@/types/contract";
import { listEmployerRecords } from "@/data/employer";
import { computeEmployerCompletion } from "@/services/employer";
import {
  getAllOpportunities,
  countEmployerApplicationStatuses,
  getProposalsForOpportunities,
  getProposalCountForOpportunity,
} from "@/data/opportunity";
import { getContractsForEmployer } from "@/data/contracts";
import {
  getProfileReviewSummaryData,
  getProfileReviewsData,
} from "@/data/profile-reviews";
import { getCampusShortName } from "@/data/admin/campuses";

// ============================================================
// HELPERS
// ============================================================

function toConsoleStatus(
  status: EmployerOnboardingDraft["status"]
): ManagedEmployer["status"] {
  switch (status) {
    case EMPLOYER_ONBOARDING_STATUS.APPROVED:
      return "active";
    case EMPLOYER_ONBOARDING_STATUS.PENDING_REVIEW:
      return "pending_review";
    case EMPLOYER_ONBOARDING_STATUS.SUSPENDED:
      return "suspended";
    case EMPLOYER_ONBOARDING_STATUS.REJECTED:
      return "rejected";
    default:
      return "incomplete";
  }
}

function titleCase(value: string): string {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isContractActive(status: string): boolean {
  return status !== CONTRACT_STATUS.COMPLETED && status !== CONTRACT_STATUS.CANCELLED;
}

function latestIso(dates: (string | undefined)[]): string {
  let latest: string | undefined;
  for (const d of dates) {
    if (!d) continue;
    if (!latest || new Date(d).getTime() > new Date(latest).getTime()) latest = d;
  }
  return latest ?? new Date(0).toISOString();
}

function earliestIso(dates: string[]): string {
  return dates.reduce((a, b) => (new Date(b).getTime() < new Date(a).getTime() ? b : a));
}

export function employerCampusIdOf(draft: EmployerOnboardingDraft | null, jobs: Opportunity[]): string | null {
  if (draft?.location.campusId) return draft.location.campusId;
  for (const j of jobs) {
    if (j.location.campusId) return j.location.campusId;
  }
  return null;
}

function buildActivity(
  draft: EmployerOnboardingDraft | null,
  jobs: Opportunity[],
  proposals: ReturnType<typeof getProposalsForOpportunities>,
  contracts: ReturnType<typeof getContractsForEmployer>,
  reviewedBy: ReturnType<typeof getProfileReviewsData>
): EmployerActivityEvent[] {
  const events: EmployerActivityEvent[] = [];

  if (draft) {
    if (draft.submittedAt) {
      events.push({
        id: `act-sub-${draft.userId}`,
        kind: "verification",
        message: "Employer profile submitted for review",
        meta: "Onboarding",
        at: draft.submittedAt,
      });
    }
    if (draft.status === EMPLOYER_ONBOARDING_STATUS.APPROVED && draft.approvedSlug) {
      events.push({
        id: `act-appr-${draft.userId}`,
        kind: "verification",
        message: "Employer profile approved",
        meta: `Public slug /employer/${draft.approvedSlug}`,
        at: draft.updatedAt,
      });
    }
    if (draft.status === EMPLOYER_ONBOARDING_STATUS.SUSPENDED) {
      events.push({
        id: `act-susp-${draft.userId}`,
        kind: "admin",
        message: "Employer profile suspended",
        meta: draft.adminMessage ?? "Admin action",
        at: draft.updatedAt,
      });
    }
    if (draft.status === EMPLOYER_ONBOARDING_STATUS.REJECTED) {
      events.push({
        id: `act-rej-${draft.userId}`,
        kind: "admin",
        message: "Employer profile rejected",
        meta: draft.reviewReason ?? draft.adminMessage ?? "Admin action",
        at: draft.updatedAt,
      });
    }
  }

  for (const job of jobs) {
    events.push({
      id: `act-job-${job.id}`,
      kind: "jobs",
      message: `Posted job "${job.title}"`,
      meta: titleCase(job.status),
      at: job.postedAt,
    });
  }

  const jobTitle = new Map(jobs.map((j) => [j.id, j.title]));
  for (const p of proposals) {
    if (p.status !== "accepted") continue;
    const title = jobTitle.get(p.opportunityId);
    events.push({
      id: `act-acpt-${p.id}`,
      kind: "hiring",
      message: title ? `Hired freelancer on "${title}"` : "Proposal accepted",
      meta: `Freelancer ${p.freelancerId}`,
      at: p.updatedAt,
    });
  }

  for (const c of contracts) {
    if (c.status !== CONTRACT_STATUS.COMPLETED) continue;
    events.push({
      id: `act-contract-${c.id}`,
      kind: "hiring",
      message: `Contract completed: ${c.projectTitle}`,
      meta: c.id,
      at: c.updatedAt,
    });
  }

  for (const r of reviewedBy.items) {
    events.push({
      id: `act-review-${r.id}`,
      kind: "reviews",
      message: `Received a ${r.rating}-star review`,
      meta: r.author.name,
      at: r.createdAt,
    });
  }

  events.sort((a, b) => b.at.localeCompare(a.at));
  return events.slice(0, 30);
}

// ============================================================
// DATASET BUILDER
// ============================================================

export interface EmployerDataset {
  employers: ManagedEmployer[];
  details: Map<string, ManagedEmployerDetail>;
}

export function buildEmployerDataset(): EmployerDataset {
  const allOpps = getAllOpportunities();
  const drafts = new Map(
    listEmployerRecords().map((d) => [d.userId, d] as const)
  );
  const owners = new Map<string, Opportunity["employer"]>();
  for (const opp of allOpps) {
    if (!owners.has(opp.employer.id)) owners.set(opp.employer.id, opp.employer);
  }

  const ids = Array.from(new Set([...drafts.keys(), ...owners.keys()])).sort();
  const employers: ManagedEmployer[] = [];
  const details = new Map<string, ManagedEmployerDetail>();

  for (const id of ids) {
    const draft = drafts.get(id) ?? null;
    const ownerInfo = owners.get(id) ?? null;
    const jobs = allOpps.filter((o) => o.employer.id === id);
    const jobIds = jobs.map((j) => j.id);
    const appCounts = countEmployerApplicationStatuses(jobIds);
    const proposals = getProposalsForOpportunities(jobIds);
    const contracts = getContractsForEmployer(id);
    const reviews = getProfileReviewSummaryData(id, "employer");
    const recentReviews = getProfileReviewsData(id, "employer", {
      page: 1,
      pageSize: 5,
      sort: "recent",
    });

    const campusId = employerCampusIdOf(draft, jobs);
    const campusName = campusId ? getCampusShortName(campusId) : null;

    const onboardedCity = draft?.location.city ?? null;
    const onboardedState = draft?.location.state ?? null;
    const ownerParts = (ownerInfo?.location ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const city = onboardedCity ?? ownerParts[0] ?? null;
    const state = onboardedState ?? ownerParts[1] ?? null;

    const status = draft ? toConsoleStatus(draft.status) : ("external" as const);
    const activeJobs = jobs.filter((j) => j.status === "open").length;
    const applicationsReceived = jobIds.reduce(
      (sum, jid) => sum + getProposalCountForOpportunity(jid),
      0
    );
    const contractsActive = contracts.filter((c) => isContractActive(c.status)).length;
    const contractsCompleted = contracts.filter((c) => c.status === CONTRACT_STATUS.COMPLETED).length;

    const orgName = draft?.organization.name ?? null;
    const descriptorParts = [
      orgName,
      draft && (draft.organization.industry || draft.profile.industry) ? draft.organization.industry || draft.profile.industry : null,
      draft && campusName ? campusName : null,
    ].filter(Boolean);

    const name = draft
      ? draft.profile.displayName || orgName || "Employer"
      : (ownerInfo?.name ?? id);

    const employer: ManagedEmployer = {
      id,
      userId: draft ? draft.userId : null,
      name,
      organizationName: orgName,
      slug: draft?.approvedSlug ?? null,
      descriptor: draft ? descriptorParts.join(" · ") || "Employer" : (ownerInfo?.descriptor ?? "External client"),
      email: draft?.contact.email ?? null,
      phone: draft?.contact.phone ?? null,
      website: draft?.profile.website ?? draft?.organization.website ?? null,
      logoUrl: draft?.profile.logoUrl ?? null,
      industry: draft?.organization.industry ?? draft?.profile.industry ?? null,
      campusId,
      campusName,
      city,
      state,
      status,
      onboardingStatus: draft?.status ?? null,
      verificationStatus: draft?.verification.status ?? null,
      verified: draft ? draft.verification.status === "verified" : (ownerInfo?.verified ?? false),
      hasEmployerProfile: !!draft,
      profileCompletion: draft ? computeEmployerCompletion(draft) : 0,
      hiringStatus: activeJobs > 0 ? "hiring" : "not_hiring",
      activeJobs,
      totalJobs: jobs.length,
      applicationsReceived,
      hires: appCounts.accepted,
      contractsTotal: contracts.length,
      contractsActive,
      rating: reviews.averageRating,
      reviewsCount: reviews.count,
      joinedAt: draft ? draft.createdAt : earliestIso(jobs.map((j) => j.postedAt)),
      lastActiveAt: latestIso([
        draft?.updatedAt,
        ...jobs.map((j) => j.postedAt),
        ...proposals.map((p) => p.updatedAt),
      ]),
    };

    employers.push(employer);
    details.set(id, buildDetail(employer, draft, jobs, {
      appCounts,
      proposals,
      contracts,
      contractsCompleted,
      reviews,
      recentReviews,
    }));
  }

  employers.sort((a, b) => a.name.localeCompare(b.name));
  return { employers, details };
}

interface DetailSources {
  appCounts: ReturnType<typeof countEmployerApplicationStatuses>;
  proposals: ReturnType<typeof getProposalsForOpportunities>;
  contracts: ReturnType<typeof getContractsForEmployer>;
  contractsCompleted: number;
  reviews: ReturnType<typeof getProfileReviewSummaryData>;
  recentReviews: ReturnType<typeof getProfileReviewsData>;
}

function buildDetail(
  employer: ManagedEmployer,
  draft: EmployerOnboardingDraft | null,
  jobs: Opportunity[],
  sources: DetailSources
): ManagedEmployerDetail {
  const jobCounts: EmployerHiringSummary["jobCounts"] = {
    open: 0,
    closed: 0,
    expired: 0,
    draft: 0,
    pending_review: 0,
    cancelled: 0,
    all: jobs.length,
  };
  for (const j of jobs) {
    const key = j.status as keyof typeof jobCounts;
    if (key in jobCounts) jobCounts[key] += 1;
  }

  const jobSummaries: EmployerJobSummary[] = jobs
    .map((j) => ({
      id: j.id,
      title: j.title,
      status: j.status,
      postedAt: j.postedAt,
      deadline: j.deadline,
      viewCount: j.viewCount,
      applications: getProposalCountForOpportunity(j.id),
    }))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  const location = [employer.city, employer.state].filter(Boolean).join(", ");

  const profile = draft
    ? {
        displayName: draft.profile.displayName ?? employer.name,
        headline: draft.profile.headline ?? "",
        about: draft.profile.about ?? "",
        industry: draft.profile.industry ?? draft.organization.industry ?? "",
        website: draft.profile.website ?? draft.organization.website ?? null,
        location: location || "Not specified",
        workPreference: draft.location.workPreference || null,
        remoteAvailable: draft.location.remoteAvailable ?? false,
        categories: draft.preferences.categories ?? [],
        experience: draft.preferences.experience ?? null,
        workType: draft.preferences.workType ?? null,
        projectDuration: draft.preferences.projectDuration ?? null,
        budgetMin: draft.preferences.budgetMin ?? null,
        budgetMax: draft.preferences.budgetMax ?? null,
      }
    : null;

  const organization =
    draft && draft.organization.name
      ? {
          name: draft.organization.name,
          businessType: draft.organization.businessType ?? "",
          industry: draft.organization.industry ?? "",
          description: draft.organization.description ?? "",
          size: draft.organization.size ?? "",
          website: draft.organization.website ?? null,
        }
      : null;

  const hiring: EmployerHiringSummary = {
    jobCounts,
    applicationCounts: sources.appCounts,
    contractsTotal: sources.contracts.length,
    contractsActive: employer.contractsActive,
    contractsCompleted: sources.contractsCompleted,
    hires: sources.appCounts.accepted,
  };

  return {
    employer,
    profile,
    organization,
    hiring,
    jobs: jobSummaries,
    reviews: sources.reviews,
    verification: draft
      ? {
          status: draft.verification.status,
          type: draft.verification.type ?? null,
          note: draft.verification.note ?? null,
        }
      : null,
    activity: buildActivity(draft, jobs, sources.proposals, sources.contracts, sources.recentReviews),
  };
}

// ============================================================
// QUERY HELPERS
// ============================================================

export function filterEmployers(
  employers: ManagedEmployer[],
  query: {
    search?: string;
    status?: EmployerBucket;
    verification?: string;
    campusId?: string;
    industry?: string;
    page?: number;
    pageSize?: number;
  }
): { items: ManagedEmployer[]; total: number; page: number; totalPages: number } {
  let filtered = [...employers];

  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        (e.organizationName ?? "").toLowerCase().includes(s) ||
        (e.slug ?? "").toLowerCase().includes(s) ||
        e.descriptor.toLowerCase().includes(s) ||
        (e.email ?? "").toLowerCase().includes(s) ||
        (e.city ?? "").toLowerCase().includes(s) ||
        (e.state ?? "").toLowerCase().includes(s) ||
        (e.campusName ?? "").toLowerCase().includes(s)
    );
  }

  if (query.status && query.status !== "all") {
    filtered = filtered.filter((e) => e.status === query.status);
  }

  if (query.verification && query.verification !== "all") {
    if (query.verification === "none") {
      filtered = filtered.filter((e) => e.verificationStatus === null);
    } else {
      filtered = filtered.filter((e) => e.verificationStatus === query.verification);
    }
  }

  if (query.campusId && query.campusId !== "all") {
    filtered = filtered.filter((e) => e.campusId === query.campusId);
  }

  if (query.industry && query.industry !== "all") {
    filtered = filtered.filter((e) => e.industry === query.industry);
  }

  const total = filtered.length;
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 10);
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function computeEmployerCounts(
  employers: ManagedEmployer[]
): EmployerStatusCounts {
  return {
    all: employers.length,
    active: employers.filter((e) => e.status === "active").length,
    pending_review: employers.filter((e) => e.status === "pending_review").length,
    suspended: employers.filter((e) => e.status === "suspended").length,
    rejected: employers.filter((e) => e.status === "rejected").length,
    external: employers.filter((e) => e.status === "external").length,
    incomplete: employers.filter((e) => e.status === "incomplete").length,
  };
}

export function employerIndustries(employers: ManagedEmployer[]): string[] {
  const set = new Set<string>();
  for (const e of employers) {
    if (e.industry) set.add(e.industry);
  }
  return Array.from(set).sort();
}