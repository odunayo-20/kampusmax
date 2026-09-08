// ============================================================
// FIND WORK & PROPOSALS DATA STORE  (Module 23C)
// ============================================================
// In-memory mock store for the job/opportunity + proposal domain.
// Backend-authoritative: job status, proposal status, ownership and
// eligibility are owned by this store (simulating the future NestJS API).
//
// SECURITY: proposal ownership is always keyed by the authenticated
// freelancer id; status is only ever changed by the store's transition
// functions — never by the client. Saved jobs are keyed per user.
//
// NOTE: Demo opportunities are posted by clients OTHER than the demo
// freelancer (u1) so the Find Work + proposal flow is demonstrable
// end-to-end without a freelancer applying to their own job.

import type {
  EmployerApplicationStatus,
  Opportunity,
  OpportunityEmployer,
  OpportunityInput,
  Proposal,
  ProposalInput,
  ProposalStatus,
  OpportunityQuery,
  OpportunitySortKey,
  OpportunityStatus,
} from "@/types/opportunity";
import {
  OPPORTUNITY_STATUS,
  PROPOSAL_STATUS,
} from "@/types/opportunity";

// ── Helpers ─────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

function freshId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// ── Opportunity store ───────────────────────────────────────

const opportunities = new Map<string, Opportunity>();

function seedOpp(id: string, opp: Opportunity) {
  // Owner is derived from the employer summary, never supplied by a client.
  opportunities.set(id, { ...opp, employerUserId: opp.employer.id });
}

const CLIENT_A = {
  id: "emp_demo1",
  name: "Chidi Okafor",
  descriptor: "Founder, TechBridge Labs",
  location: "Ile-Ife, Osun State",
  verified: true,
};

const CLIENT_B = {
  id: "emp_demo2",
  name: "Amara Osei",
  descriptor: "Product Lead, CampusPay",
  location: "Akoka, Lagos State",
  verified: true,
};

const CLIENT_C = {
  id: "emp_demo3",
  name: "Farouk Bello",
  descriptor: "Owner, Bellohub Studio",
  location: "Owo, Ondo State",
  verified: false,
};

const CLIENT_D = {
  id: "emp_demo4",
  name: "Ngozi Eze",
  descriptor: "Coordinator, Student Innovation Hub",
  location: "Nsukka, Enugu State",
  verified: true,
};

seedOpp("opp_demo1", {
  id: "opp_demo1",
  title: "Build a campus e-commerce storefront with Next.js",
  categoryId: "ec1",
  summary: "Frontend build for campus vendors selling reusable items across hostels.",
  description:
    "We need an experienced developer to build a mobile-first storefront for vendors on campus. The frontend should feel fast, work well on small screens and gracefully handle offline states.\n\nYou will work closely with our product lead and a backend engineer who maintains the REST API. A polished, shippable UI matters more than clever abstractions.",
  requirements:
    "Strong React and Next.js. Good sense of responsive layout and accessibility. Comfortable consuming a REST API and handling loading/error states.\n\nNice to have: Tailwind CSS, TypeScript, familiarity with cash-on-pickup checkout flows.",
  skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript"],
  workArrangement: "hybrid",
  location: { city: "Ile-Ife", state: "Osun", campusId: "oau", remote: true },
  budget: { type: "project", min: 150000, max: 400000, currency: "NGN" },
  duration: "few_weeks",
  experienceLevel: "intermediate",
  postedAt: daysAgo(2),
  deadline: daysFromNow(18),
  status: OPPORTUNITY_STATUS.OPEN,
  employer: CLIENT_A,
  screeningQuestions: [
    { id: "sq1", question: "Share a link to a Next.js project you've built.", optional: false },
    { id: "sq2", question: "What's your preferred way to co-ordinate with a small remote team?", optional: true },
  ],
  attachments: [],
  viewCount: 124,
  proposalCount: 3,
});

seedOpp("opp_demo2", {
  id: "opp_demo2",
  title: "Flutter mobile app for queue management",
  categoryId: "ec2",
  summary: "Cross-platform mobile app to help students book and track service queues on campus.",
  description:
    "We're building an app that lets students join queues for campus services (banking, pharmacy, printing) without standing in line physically. We need help with the Flutter frontend and API integration.",
  requirements:
    "Experience shipping Flutter apps. Comfort with state management, push notifications and consuming REST APIs.\n\nDesign system assets and the backend API are already provided.",
  skills: ["Flutter", "Dart", "React Native"],
  workArrangement: "remote",
  location: { city: "Akoka", state: "Lagos", campusId: "unilag", remote: true },
  budget: { type: "project", min: 300000, max: 800000, currency: "NGN" },
  duration: "one_to_three_months",
  experienceLevel: "experienced",
  postedAt: daysAgo(5),
  deadline: daysFromNow(24),
  status: OPPORTUNITY_STATUS.OPEN,
  employer: CLIENT_B,
  screeningQuestions: [
    { id: "sq1", question: "Do you have a published Flutter app on the Play Store?", optional: false },
  ],
  attachments: [],
  viewCount: 210,
  proposalCount: 5,
});

seedOpp("opp_demo3", {
  id: "opp_demo3",
  title: "Landing page + brand identity for a student cafe",
  categoryId: "ec1",
  summary: "Quick landing page and logo refresh for a new campus cafe.",
  description:
    "We're opening a cafe on campus and need a modern one-page site and a logo. Content and photos will be provided. We need it within two weeks.",
  requirements:
    "A solid eye for design, HTML/CSS/JavaScript, and experience with brand identity. A portfolio or similar past work is required.",
  skills: ["React", "JavaScript", "HTML/CSS", "Figma"],
  workArrangement: "on_campus",
  location: { city: "Owo", state: "Ondo", campusId: "rugipo", remote: false },
  budget: { type: "project", min: 80000, max: 180000, currency: "NGN" },
  duration: "short_term",
  experienceLevel: "entry_level",
  postedAt: daysAgo(1),
  deadline: daysFromNow(10),
  status: OPPORTUNITY_STATUS.OPEN,
  employer: CLIENT_C,
  screeningQuestions: [],
  attachments: [],
  viewCount: 58,
  proposalCount: 1,
});

seedOpp("opp_demo4", {
  id: "opp_demo4",
  title: "Content writer for campus innovation blog",
  categoryId: "ec5",
  summary: "Write 8 articles about student startups and campus innovation.",
  description:
    "We run a blog celebrating student founders and campus innovation. We need a writer to produce engaging, well-researched articles. Each article is a fixed fee.",
  requirements:
    "Excellent written English and ability to interview founders. Portfolio or writing samples required.",
  skills: ["Copywriting", "Content Writing", "Blog Writing", "Editing"],
  workArrangement: "remote",
  location: { city: "Nsukka", state: "Enugu", campusId: "unn", remote: true },
  budget: { type: "project", min: 120000, max: 200000, currency: "NGN" },
  duration: "few_weeks",
  experienceLevel: "intermediate",
  postedAt: daysAgo(3),
  deadline: daysFromNow(15),
  status: OPPORTUNITY_STATUS.OPEN,
  employer: CLIENT_D,
  screeningQuestions: [
    { id: "sq1", question: "Link a published article you're proud of.", optional: false },
  ],
  attachments: [],
  viewCount: 96,
  proposalCount: 2,
});

seedOpp("opp_closed", {
  id: "opp_closed",
  title: "Data analyst for school project (closed)",
  categoryId: "ec9",
  summary: "This opportunity is no longer accepting proposals.",
  description:
    "We needed help cleaning and analysing survey data for a research project. This listing is now closed.",
  requirements: "Python, Excel, data cleaning, reporting.",
  skills: ["Python", "Data Analysis", "Excel"],
  workArrangement: "remote",
  location: { city: "Ibadan", state: "Oyo", campusId: "ui", remote: true },
  budget: { type: "project", min: 90000, max: 150000, currency: "NGN" },
  duration: "short_term",
  experienceLevel: "entry_level",
  postedAt: daysAgo(20),
  deadline: daysAgo(3),
  status: OPPORTUNITY_STATUS.CLOSED,
  employer: CLIENT_D,
  screeningQuestions: [],
  attachments: [],
  viewCount: 300,
  proposalCount: 12,
});

seedOpp("opp_expired", {
  id: "opp_expired",
  title: "Short video editor for promo (expired)", 
  categoryId: "ec6",
  summary: "The submission deadline has passed.",
  description:
    "We were looking for a video editor to cut campus event promos. The deadline has passed and applications are closed.",
  requirements: "Video editing, Adobe Premiere, motion graphics.",
  skills: ["Video Editing", "Adobe Premiere", "Final Cut Pro"],
  workArrangement: "on_site",
  location: { city: "Owerri", state: "Imo", campusId: "futo", remote: false },
  budget: { type: "project", min: 100000, max: 220000, currency: "NGN" },
  duration: "short_term",
  experienceLevel: "intermediate",
  postedAt: daysAgo(35),
  deadline: daysAgo(10),
  status: OPPORTUNITY_STATUS.EXPIRED,
  employer: CLIENT_B,
  screeningQuestions: [],
  attachments: [],
  viewCount: 150,
  proposalCount: 6,
});

// ── Demo employer (u1) job listings ─────────────────────────
// Module 27: the demo employer (u1, Oluwaseun Labs) owns a set of jobs
// across every backend status so the employer management surface can be
// demonstrated. The OPEN listing's skills intentionally fall outside the
// demo freelancer's profile so the marketplace never invites the demo user
// to apply to their own employer's job.

const EMPLOYER_U1 = {
  id: "u1",
  name: "Oluwaseun Labs",
  descriptor: "Technology • Rufus Giwa Polytechnic",
  location: "Owo, Ondo State",
  verified: true,
};

seedOpp("opp_my_open", {
  id: "opp_my_open",
  title: "Video editor for product launch promos",
  categoryId: "ec7",
  summary:
    "Cut 4 launch promos for our student-entrepreneur tools. Raw footage and brand kit provided.",
  description:
    "We're launching a new tool for student entrepreneurs and need short, punchy promos for social and our site. You'll work from a provided shot list and brand kit.\n\nScope: four 30–60s promos, one vertical cut each, plus captions. Rough cuts within a week of kick-off.",
  requirements:
    "Comfortable with Premiere Pro or DaVinci Resolve. Motion graphics for titles is a plus. A short portfolio or sample reel is required.",
  skills: ["Video Editing", "Adobe Premiere", "DaVinci Resolve", "Motion Graphics"],
  workArrangement: "hybrid",
  location: { city: "Owo", state: "Ondo", campusId: "rugipo", remote: true },
  budget: { type: "project", min: 120000, max: 250000, currency: "NGN" },
  duration: "short_term",
  experienceLevel: "intermediate",
  postedAt: daysAgo(1),
  deadline: daysFromNow(12),
  status: OPPORTUNITY_STATUS.OPEN,
  employer: EMPLOYER_U1,
  employerUserId: "u1",
  screeningQuestions: [
    { id: "sq1", question: "Link a promo or reel you've edited.", optional: false },
  ],
  attachments: [],
  viewCount: 41,
  proposalCount: 4,
});

seedOpp("opp_my_draft", {
  id: "opp_my_draft",
  title: "Design newsletter templates for student founders",
  categoryId: "ec3",
  summary: "A set of clean, mobile-friendly newsletter templates in Figma.",
  description:
    "We send a weekly newsletter to student founders and need a reusable template system: header, story cards, CTA blocks and a sponsor slot.\n\nDeliverables are Figma files plus a short style note we can hand to a developer.",
  requirements:
    "Strong Figma skills and an eye for mobile-first layout. Experience with email design is a plus.",
  skills: ["Figma", "Graphic Design", "Email Design"],
  workArrangement: "remote",
  location: { city: "Owo", state: "Ondo", campusId: "rugipo", remote: true },
  budget: { type: "project", min: 60000, max: 140000, currency: "NGN" },
  duration: "few_weeks",
  experienceLevel: "entry_level",
  postedAt: daysAgo(3),
  deadline: daysFromNow(20),
  status: OPPORTUNITY_STATUS.DRAFT,
  employer: EMPLOYER_U1,
  employerUserId: "u1",
  screeningQuestions: [],
  attachments: [],
  viewCount: 0,
  proposalCount: 0,
});

seedOpp("opp_my_pending", {
  id: "opp_my_pending",
  title: "Website copy for our studio site",
  categoryId: "ec5",
  summary: "Homepage, about and services copy for the Oluwaseun Labs website.",
  description:
    "We're refreshing our studio website. We need clear, friendly copy for five pages and a set of SEO meta descriptions.\n\nWe'll provide the outline and tone notes; you write, we edit together.",
  requirements: "Excellent written English. Portfolio or writing samples required.",
  skills: ["Copywriting", "Content Writing", "SEO"],
  workArrangement: "remote",
  location: { city: "Owo", state: "Ondo", campusId: "rugipo", remote: true },
  budget: { type: "project", min: 50000, max: 120000, currency: "NGN" },
  duration: "few_weeks",
  experienceLevel: "intermediate",
  postedAt: daysAgo(2),
  deadline: daysFromNow(16),
  status: OPPORTUNITY_STATUS.PENDING_REVIEW,
  employer: EMPLOYER_U1,
  employerUserId: "u1",
  screeningQuestions: [],
  attachments: [],
  viewCount: 0,
  proposalCount: 0,
});

seedOpp("opp_my_closed", {
  id: "opp_my_closed",
  title: "Mobile app UI exploration (closed)",
  categoryId: "ec4",
  summary: "This listing is closed — no longer accepting proposals.",
  description:
    "We explored visual routes for a student tools app. The listing is now closed.",
  requirements: "UI/UX design, Figma, low-fi to hi-fi exploration.",
  skills: ["UI/UX Design", "Figma", "Prototyping"],
  workArrangement: "remote",
  location: { city: "Owo", state: "Ondo", campusId: "rugipo", remote: true },
  budget: { type: "project", min: 80000, max: 200000, currency: "NGN" },
  duration: "few_weeks",
  experienceLevel: "intermediate",
  postedAt: daysAgo(14),
  deadline: daysAgo(2),
  status: OPPORTUNITY_STATUS.CLOSED,
  employer: EMPLOYER_U1,
  employerUserId: "u1",
  screeningQuestions: [],
  attachments: [],
  viewCount: 86,
  proposalCount: 2,
});

// ── Opportunity store API ───────────────────────────────────

/**
 * Replaces the static seed `proposalCount` with the live count derived from
 * the proposal store (Module 28). The number an employer sees is always the
 * current volume of (non-draft, non-withdrawn) proposals — never a stale
 * literal recorded at publish time.
 */
export function hydrateOpportunityCounts(opp: Opportunity): Opportunity {
  const hydrated = { ...clone(opp) };
  hydrated.proposalCount = getProposalCountForOpportunity(opp.id);
  return hydrated;
}

export function getAllOpportunities(): Opportunity[] {
  return Array.from(opportunities.values()).map(hydrateOpportunityCounts);
}

export function getOpportunityRecord(id: string): Opportunity | null {
  const opp = opportunities.get(id);
  return opp ? hydrateOpportunityCounts(opp) : null;
}

/** Public open jobs for an employer's public profile page (no auth required). */
export function getOpenJobsForEmployer(
  employerUserId: string
): Pick<Opportunity, "id" | "title" | "summary" | "budget" | "duration" | "experienceLevel" | "postedAt" | "location">[] {
  return Array.from(opportunities.values())
    .filter((o) => o.employerUserId === employerUserId && o.status === "open")
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .map((o) => ({
      id: o.id,
      title: o.title,
      summary: o.summary,
      budget: o.budget,
      duration: o.duration,
      experienceLevel: o.experienceLevel,
      postedAt: o.postedAt,
      location: o.location,
    }));
}

export function incrementOpportunityViews(id: string): void {
  const opp = opportunities.get(id);
  if (opp) opp.viewCount += 1;
}

// ── Query (public discovery — server-side search/filter/sort/paginate) ──
// Only statuses a freelancer may view are returned (OPEN by default).

export function queryOpportunityRecords(
  query: OpportunityQuery,
  allowedStatuses: OpportunityStatus[]
): { items: Opportunity[]; total: number } {
  let list = Array.from(opportunities.values()).filter((o) =>
    allowedStatuses.includes(o.status)
  );

  const search = query.search?.trim().toLowerCase();
  if (search) {
    list = list.filter(
      (o) =>
        o.title.toLowerCase().includes(search) ||
        o.summary.toLowerCase().includes(search) ||
        o.description.toLowerCase().includes(search) ||
        o.skills.some((s) => s.toLowerCase().includes(search))
    );
  }

  if (query.categoryId) {
    list = list.filter((o) => o.categoryId === query.categoryId);
  }
  if (query.experience) {
    list = list.filter((o) => o.experienceLevel === query.experience);
  }
  if (query.arrangement) {
    list = list.filter((o) => o.workArrangement === query.arrangement);
  }
  if (query.budgetType) {
    list = list.filter((o) => o.budget.type === query.budgetType);
  }

  list = sortOpportunities(list, query.sort ?? "newest");

  return { items: list.map(hydrateOpportunityCounts), total: list.length };
}

export function sortOpportunities(list: Opportunity[], sort: OpportunitySortKey): Opportunity[] {
  const budgetOf = (o: Opportunity) => o.budget.max ?? o.budget.min ?? 0;
  switch (sort) {
    case "oldest":
      return [...list].sort((a, b) => +new Date(a.postedAt) - +new Date(b.postedAt));
    case "budget_high":
      return [...list].sort((a, b) => budgetOf(b) - budgetOf(a));
    case "budget_low":
      return [...list].sort((a, b) => budgetOf(a) - budgetOf(b));
    case "deadline":
      return [...list].sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));
    case "newest":
    default:
      return [...list].sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
  }
}

// ── Employer-owned job management (Module 27) ───────────────
// Owner-scoped record operations. Status is only ever written by these
// transition functions (simulating the backend) — never by the client.

export function listEmployerOpportunityRecords(ownerId: string): Opportunity[] {
  return Array.from(opportunities.values())
    .filter((o) => o.employerUserId === ownerId)
    .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt))
    .map(hydrateOpportunityCounts);
}

export function countOpportunitiesByStatus(
  ownerId: string
): Record<OpportunityStatus, number> & { all: number } {
  const counts: Record<OpportunityStatus, number> & { all: number } = {
    draft: 0,
    pending_review: 0,
    open: 0,
    closed: 0,
    expired: 0,
    cancelled: 0,
    all: 0,
  };
  for (const o of opportunities.values()) {
    if (o.employerUserId !== ownerId) continue;
    counts.all += 1;
    counts[o.status] += 1;
  }
  return counts;
}

export function createOpportunityRecord(
  ownerId: string,
  input: OpportunityInput,
  employerSummary: OpportunityEmployer
): Opportunity {
  const now = nowIso();
  const opportunity: Opportunity = {
    id: freshId("opp"),
    title: input.title,
    categoryId: input.categoryId,
    summary: input.summary,
    description: input.description,
    requirements: input.requirements,
    skills: [...input.skills],
    workArrangement: input.workArrangement,
    location: { ...input.location },
    budget: { ...input.budget },
    duration: input.duration,
    experienceLevel: input.experienceLevel,
    deadline: input.deadline,
    screeningQuestions: input.screeningQuestions.map((q) => ({
      ...q,
      id: q.id || freshId("sq"),
    })),
    attachments: [],
    postedAt: now,
    status: OPPORTUNITY_STATUS.DRAFT,
    employer: { ...employerSummary },
    employerUserId: ownerId,
    viewCount: 0,
    proposalCount: 0,
  };
  opportunities.set(opportunity.id, opportunity);
  return hydrateOpportunityCounts(clone(opportunity));
}

export function updateDraftOpportunityRecord(
  ownerId: string,
  id: string,
  input: OpportunityInput
): Opportunity | null {
  const opp = opportunities.get(id);
  if (!opp || opp.employerUserId !== ownerId || opp.status !== OPPORTUNITY_STATUS.DRAFT) {
    return null;
  }
  opp.title = input.title;
  opp.categoryId = input.categoryId;
  opp.summary = input.summary;
  opp.description = input.description;
  opp.requirements = input.requirements;
  opp.skills = [...input.skills];
  opp.workArrangement = input.workArrangement;
  opp.location = { ...input.location };
  opp.budget = { ...input.budget };
  opp.duration = input.duration;
  opp.experienceLevel = input.experienceLevel;
  opp.deadline = input.deadline;
  opp.screeningQuestions = input.screeningQuestions.map((q) => ({
    ...q,
    id: q.id || freshId("sq"),
  }));
  opp.attachments = [];
  return hydrateOpportunityCounts(clone(opp));
}

/** DRAFT → PENDING_REVIEW (backend-authorized moderation queue). */
export function publishOpportunityRecord(ownerId: string, id: string): Opportunity | null {
  const opp = opportunities.get(id);
  if (!opp || opp.employerUserId !== ownerId || opp.status !== OPPORTUNITY_STATUS.DRAFT) {
    return null;
  }
  opp.status = OPPORTUNITY_STATUS.PENDING_REVIEW;
  return hydrateOpportunityCounts(clone(opp));
}

/** OPEN → CLOSED (employer retracts a live posting). */
export function closeOpportunityRecord(ownerId: string, id: string): Opportunity | null {
  const opp = opportunities.get(id);
  if (!opp || opp.employerUserId !== ownerId || opp.status !== OPPORTUNITY_STATUS.OPEN) {
    return null;
  }
  opp.status = OPPORTUNITY_STATUS.CLOSED;
  return hydrateOpportunityCounts(clone(opp));
}

// ── Saved jobs (per user, localStorage-synced for resilience) ──

const SAVED_KEY = (uid: string) => `kampmax.savedJobs.${uid}`;

function readSaved(uid: string): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY(uid));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeSaved(uid: string, ids: string[]): void {
  try {
    localStorage.setItem(SAVED_KEY(uid), JSON.stringify(ids));
  } catch {
    // no-op — non-critical persistence
  }
}

export function getSavedOpportunityIds(uid: string): string[] {
  return readSaved(uid);
}

export function saveOpportunityRecord(uid: string, oppId: string): void {
  const ids = readSaved(uid);
  if (!ids.includes(oppId)) {
    ids.push(oppId);
    writeSaved(uid, ids);
  }
}

export function unsaveOpportunityRecord(uid: string, oppId: string): void {
  writeSaved(
    uid,
    readSaved(uid).filter((id) => id !== oppId)
  );
}

// ── Proposal store ──────────────────────────────────────────
// Keyed by proposal id; ownership is the freelancerId the backend derives.

const proposals = new Map<string, Proposal>();

function defaultTimeline(status: ProposalStatus, at: string) {
  return [{ id: freshId("ev"), status, label: statusLabel(status), at }];
}

function statusLabel(status: ProposalStatus): string {
  switch (status) {
    case PROPOSAL_STATUS.DRAFT:
      return "Draft created";
    case PROPOSAL_STATUS.SUBMITTED:
      return "Proposal submitted";
    case PROPOSAL_STATUS.UNDER_REVIEW:
      return "Under review";
    case PROPOSAL_STATUS.SHORTLISTED:
      return "Shortlisted";
    case PROPOSAL_STATUS.ACCEPTED:
      return "Accepted";
    case PROPOSAL_STATUS.REJECTED:
      return "Rejected";
    case PROPOSAL_STATUS.WITHDRAWN:
      return "Withdrawn";
  }
}

export function getProposalById(id: string): Proposal | null {
  const p = proposals.get(id);
  return p ? clone(p) : null;
}

export function getProposalsByFreelancer(freelancerId: string): Proposal[] {
  return clone(
    Array.from(proposals.values())
      .filter((p) => p.freelancerId === freelancerId)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  );
}

export function getProposalForOpportunity(
  freelancerId: string,
  opportunityId: string
): Proposal | null {
  const found = Array.from(proposals.values()).find(
    (p) =>
      p.freelancerId === freelancerId &&
      p.opportunityId === opportunityId &&
      p.status !== PROPOSAL_STATUS.WITHDRAWN
  );
  return found ? clone(found) : null;
}

export function ensureProposalRecord(
  freelancerId: string,
  input: ProposalInput
): { proposal: Proposal } {
  const existing = Array.from(proposals.values()).find(
    (p) =>
      p.freelancerId === freelancerId &&
      p.opportunityId === input.opportunityId &&
      p.status === PROPOSAL_STATUS.DRAFT
  );
  if (existing) {
    existing.coverLetter = input.coverLetter;
    existing.proposedAmount = input.proposedAmount;
    existing.delivery = input.delivery;
    existing.screeningAnswers = input.screeningAnswers.map((a) => ({ ...a }));
    existing.attachments = input.attachments.map((a) => ({ ...a }));
    existing.updatedAt = nowIso();
    return { proposal: clone(existing) };
  }

  const proposal: Proposal = {
    id: freshId("prop"),
    opportunityId: input.opportunityId,
    freelancerId,
    coverLetter: input.coverLetter,
    proposedAmount: input.proposedAmount,
    delivery: input.delivery,
    screeningAnswers: input.screeningAnswers.map((a) => ({ ...a })),
    attachments: input.attachments.map((a) => ({ ...a })),
    status: PROPOSAL_STATUS.DRAFT,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    timeline: defaultTimeline(PROPOSAL_STATUS.DRAFT, nowIso()),
  };
  proposals.set(proposal.id, proposal);
  return { proposal: clone(proposal) };
}

export function updateProposalDraftRecord(id: string, input: ProposalInput): Proposal | null {
  const p = proposals.get(id);
  if (!p || p.status !== PROPOSAL_STATUS.DRAFT) return null;
  p.coverLetter = input.coverLetter;
  p.proposedAmount = input.proposedAmount;
  p.delivery = input.delivery;
  p.screeningAnswers = input.screeningAnswers.map((a) => ({ ...a }));
  p.attachments = input.attachments.map((a) => ({ ...a }));
  p.updatedAt = nowIso();
  return clone(p);
}

export function submitProposalRecord(id: string): Proposal | null {
  const p = proposals.get(id);
  if (!p) return null;
  if (p.status !== PROPOSAL_STATUS.DRAFT) return null;
  p.status = PROPOSAL_STATUS.SUBMITTED;
  p.submittedAt = nowIso();
  p.updatedAt = nowIso();
  p.timeline.push({
    id: freshId("ev"),
    status: PROPOSAL_STATUS.SUBMITTED,
    label: "Proposal submitted",
    at: nowIso(),
  });
  return clone(p);
}

export function withdrawProposalRecord(id: string): Proposal | null {
  const p = proposals.get(id);
  if (!p) return null;
  const withdrawable: ProposalStatus[] = [
    PROPOSAL_STATUS.SUBMITTED,
    PROPOSAL_STATUS.UNDER_REVIEW,
    PROPOSAL_STATUS.SHORTLISTED,
  ];
  if (!withdrawable.includes(p.status)) return null;
  p.status = PROPOSAL_STATUS.WITHDRAWN;
  p.updatedAt = nowIso();
  p.timeline.push({
    id: freshId("ev"),
    status: PROPOSAL_STATUS.WITHDRAWN,
    label: "Proposal withdrawn",
    at: nowIso(),
  });
  return clone(p);
}

// ── Seeded proposals for the demo employer (u1) jobs ────────
// Module 28: the employer Applications surface needs realistic volume across
// every status it can act on. These proposals are submitted by REAL seed users
// (u2–u5) whose approved freelancer profiles back the candidate previews.
// Only the demo owner's jobs carry proposals so the surface never leaks other
// employers' candidates.

function seededProposal(seed: {
  id: string;
  opportunityId: string;
  freelancerId: string;
  coverLetter: string;
  proposedAmount: number;
  delivery: { value: number; unit: "days" | "weeks" | "months" };
  screeningAnswers: { questionId: string; answer: string }[];
  attachments: Proposal["attachments"];
  status: ProposalStatus;
  submittedDaysAgo: number;
  extraTimeline?: { status: ProposalStatus; label: string; daysAgo: number }[];
  rejectionReason?: string;
}): void {
  const at = daysAgo(seed.submittedDaysAgo);
  const timeline = [
    {
      id: freshId("ev"),
      status: PROPOSAL_STATUS.SUBMITTED,
      label: "Proposal submitted",
      at,
    },
    ...(seed.extraTimeline ?? []).map((e) => ({
      id: freshId("ev"),
      status: e.status,
      label: e.label,
      at: daysAgo(e.daysAgo),
    })),
  ];
  const proposal: Proposal = {
    id: seed.id,
    opportunityId: seed.opportunityId,
    freelancerId: seed.freelancerId,
    coverLetter: seed.coverLetter,
    proposedAmount: seed.proposedAmount,
    delivery: seed.delivery,
    screeningAnswers: seed.screeningAnswers.map((a) => ({ ...a })),
    attachments: seed.attachments.map((a) => ({ ...a })),
    status: seed.status,
    createdAt: at,
    updatedAt: seed.extraTimeline?.length
      ? daysAgo(seed.extraTimeline[seed.extraTimeline.length - 1].daysAgo)
      : at,
    submittedAt: at,
    rejectionReason: seed.rejectionReason,
    timeline,
  };
  proposals.set(seed.id, proposal);
}

// Job: opp_my_open (video editor for launch promos — OPEN)
seededProposal({
  id: "ap_open_1",
  opportunityId: "opp_my_open",
  freelancerId: "u2",
  coverLetter:
    "Hi — I've cut promos for campus startups and local brands for two years, and your shot list is right in my wheelhouse. I can deliver all four cuts (plus vertical versions) with tight, trend-aware captions.\n\nI'd start with a rough of the first promo within 48 hours so you can lock the tone early, and I'll be on hand for one round of revisions per cut.",
  proposedAmount: 180000,
  delivery: { value: 7, unit: "days" },
  screeningAnswers: [
    {
      questionId: "sq1",
      answer: "Here's a 30s launch promo I recently edited: https://youtu.be/example-chioma-promo",
    },
  ],
  attachments: [
    { id: "att_o1", filename: "chioma-sample-reel.mp4", sizeBytes: 18400000, mimeType: "video/mp4" },
  ],
  status: PROPOSAL_STATUS.UNDER_REVIEW,
  submittedDaysAgo: 2,
  extraTimeline: [
    { status: PROPOSAL_STATUS.UNDER_REVIEW, label: "Application is being reviewed", daysAgo: 1 },
  ],
});

seededProposal({
  id: "ap_open_2",
  opportunityId: "opp_my_open",
  freelancerId: "u3",
  coverLetter:
    "Editor and colorist here. I work in Premiere and Resolve, and I'll handle rough cuts, grade, captions and the vertical re-cuts for social. For this project I'd propose a structured week: Day 1–2 roughs, Day 3–4 revision round, Day 5–7 finals.\n\nMotion titles are a strength — happy to build a small branded pack you can reuse later.",
  proposedAmount: 160000,
  delivery: { value: 10, unit: "days" },
  screeningAnswers: [
    {
      questionId: "sq1",
      answer: "My Founder Stories series (ep 1): https://youtu.be/example-ibrahim-ep1",
    },
  ],
  attachments: [
    { id: "att_o2", filename: "ibrahim-brand-intro.mp4", sizeBytes: 21000000, mimeType: "video/mp4" },
  ],
  status: PROPOSAL_STATUS.SHORTLISTED,
  submittedDaysAgo: 3,
  extraTimeline: [
    { status: PROPOSAL_STATUS.SHORTLISTED, label: "Shortlisted", daysAgo: 1 },
  ],
});

seededProposal({
  id: "ap_open_3",
  opportunityId: "opp_my_open",
  freelancerId: "u5",
  coverLetter:
    "Just applied for this — I specialise in short-form edits with fast pacing and bold captions. I can turn around a rough of the first promo within 48 hours and keep the cadence on the remaining three. I only use licensed music/brand kit assets.",
  proposedAmount: 150000,
  delivery: { value: 5, unit: "days" },
  screeningAnswers: [
    {
      questionId: "sq1",
      answer: "Sample vertical reel: https://www.instagram.com/reel/example-emeka",
    },
  ],
  attachments: [],
  status: PROPOSAL_STATUS.SUBMITTED,
  submittedDaysAgo: 0,
});

seededProposal({
  id: "ap_open_4",
  opportunityId: "opp_my_open",
  freelancerId: "u5",
  coverLetter:
    "I can handle the four launch promos incl. captions and vertical cuts — here's a link to a similar cafe-launch reel pack I built.",
  proposedAmount: 120000,
  delivery: { value: 6, unit: "days" },
  screeningAnswers: [
    {
      questionId: "sq1",
      answer: "Cafe launch reel: https://youtu.be/example-cafe-launch",
    },
  ],
  attachments: [],
  status: PROPOSAL_STATUS.WITHDRAWN,
  submittedDaysAgo: 7,
  extraTimeline: [
    { status: PROPOSAL_STATUS.WITHDRAWN, label: "Proposal withdrawn", daysAgo: 6 },
  ],
});

seededProposal({
  id: "ap_open_5",
  opportunityId: "opp_my_open",
  freelancerId: "u4",
  coverLetter:
    "My background is product/UI design, but I also build motion titles and simple animated promos for brand sites, which may suit the lighter cuts in this scope. Full transparency that editing at this pace isn't my core service.",
  proposedAmount: 135000,
  delivery: { value: 14, unit: "days" },
  screeningAnswers: [
    {
      questionId: "sq1",
      answer: "Motion design sample: https://dribbble.com/shots/example-motion",
    },
  ],
  attachments: [],
  status: PROPOSAL_STATUS.REJECTED,
  submittedDaysAgo: 5,
  extraTimeline: [
    { status: PROPOSAL_STATUS.REJECTED, label: "Application rejected", daysAgo: 2 },
  ],
  rejectionReason: "We need a dedicated video editor — editing pace and depth didn't match this scope.",
});

// Job: opp_my_closed (mobile app UI exploration — CLOSED)
seededProposal({
  id: "ap_closed_1",
  opportunityId: "opp_my_closed",
  freelancerId: "u4",
  coverLetter:
    "I proposed the UI exploration as a set of Figma flows: low-fi wireframes, two visual routes, and a clickable prototype with a compact style guide. My proposal issue mirrors the scope exactly — happy to zoom in on anything here.",
  proposedAmount: 185000,
  delivery: { value: 10, unit: "days" },
  screeningAnswers: [],
  attachments: [
    { id: "att_c1", filename: "folashade-exploration.pdf", sizeBytes: 3400000, mimeType: "application/pdf" },
  ],
  status: PROPOSAL_STATUS.ACCEPTED,
  submittedDaysAgo: 12,
  extraTimeline: [
    { status: PROPOSAL_STATUS.ACCEPTED, label: "Accepted", daysAgo: 6 },
  ],
});

seededProposal({
  id: "ap_closed_2",
  opportunityId: "opp_my_closed",
  freelancerId: "u2",
  coverLetter:
    "I can deliver the UI exploration scope — wireframes through hi-fi Figma prototype with a reusable component kit. I'd present two visual directions before polishing the selected route.",
  proposedAmount: 175000,
  delivery: { value: 8, unit: "days" },
  screeningAnswers: [],
  attachments: [],
  status: PROPOSAL_STATUS.SHORTLISTED,
  submittedDaysAgo: 13,
  extraTimeline: [
    { status: PROPOSAL_STATUS.SHORTLISTED, label: "Shortlisted", daysAgo: 9 },
  ],
});

// ── Employer proposal reads (Module 28) ──────────────────────
// Employers read the SAME Proposal records the freelancer submits — no
// separate application model is ever created. Drafts are never exposed to
// employers; ownership filtering happens at the service layer.

export function getProposalsForOpportunity(opportunityId: string): Proposal[] {
  return clone(
    Array.from(proposals.values())
      .filter(
        (p) => p.opportunityId === opportunityId && p.status !== PROPOSAL_STATUS.DRAFT
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  );
}

export function getProposalsForOpportunities(opportunityIds: string[]): Proposal[] {
  const ids = new Set(opportunityIds);
  return clone(
    Array.from(proposals.values())
      .filter((p) => ids.has(p.opportunityId) && p.status !== PROPOSAL_STATUS.DRAFT)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  );
}

export function getProposalCountForOpportunity(opportunityId: string): number {
  let count = 0;
  for (const p of proposals.values()) {
    if (p.opportunityId !== opportunityId) continue;
    if (
      p.status === PROPOSAL_STATUS.DRAFT ||
      p.status === PROPOSAL_STATUS.WITHDRAWN
    ) {
      continue;
    }
    count += 1;
  }
  return count;
}

export function countEmployerApplicationStatuses(
  opportunityIds: string[]
): Record<EmployerApplicationStatus | "all", number> {
  const ids = new Set(opportunityIds);
  const counts: Record<EmployerApplicationStatus | "all", number> = {
    submitted: 0,
    under_review: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
    all: 0,
  };
  for (const p of proposals.values()) {
    if (!ids.has(p.opportunityId)) continue;
    if (p.status === PROPOSAL_STATUS.DRAFT) continue;
    counts.all += 1;
    counts[p.status] += 1;
  }
  return counts;
}

// ── Employer proposal transitions (backend-owned) ───────────
// Status is only ever written here — never by the client. Each transition
// enforces its allowed source states and records a timeline event.

function pushTimelineEvent(
  p: Proposal,
  status: ProposalStatus,
  label: string
): void {
  p.timeline.push({ id: freshId("ev"), status, label, at: nowIso() });
}

/** SUBMITTED → UNDER_REVIEW */
export function setProposalUnderReviewRecord(id: string): Proposal | null {
  const p = proposals.get(id);
  if (!p || p.status !== PROPOSAL_STATUS.SUBMITTED) return null;
  p.status = PROPOSAL_STATUS.UNDER_REVIEW;
  p.updatedAt = nowIso();
  pushTimelineEvent(p, PROPOSAL_STATUS.UNDER_REVIEW, "Application is being reviewed");
  return clone(p);
}

/** SUBMITTED | UNDER_REVIEW → SHORTLISTED */
export function setProposalShortlistedRecord(id: string): Proposal | null {
  const p = proposals.get(id);
  if (!p) return null;
  const from: ProposalStatus[] = [
    PROPOSAL_STATUS.SUBMITTED,
    PROPOSAL_STATUS.UNDER_REVIEW,
  ];
  if (!from.includes(p.status)) return null;
  p.status = PROPOSAL_STATUS.SHORTLISTED;
  p.updatedAt = nowIso();
  pushTimelineEvent(p, PROPOSAL_STATUS.SHORTLISTED, "Shortlisted");
  return clone(p);
}

/** SUBMITTED | UNDER_REVIEW | SHORTLISTED → REJECTED (optional reason) */
export function setProposalRejectedRecord(
  id: string,
  reason?: string
): Proposal | null {
  const p = proposals.get(id);
  if (!p) return null;
  const from: ProposalStatus[] = [
    PROPOSAL_STATUS.SUBMITTED,
    PROPOSAL_STATUS.UNDER_REVIEW,
    PROPOSAL_STATUS.SHORTLISTED,
  ];
  if (!from.includes(p.status)) return null;
  p.status = PROPOSAL_STATUS.REJECTED;
  p.rejectionReason = reason?.trim() ? reason.trim() : undefined;
  p.updatedAt = nowIso();
  pushTimelineEvent(p, PROPOSAL_STATUS.REJECTED, "Application rejected");
  return clone(p);
}

/** SUBMITTED | UNDER_REVIEW | SHORTLISTED → ACCEPTED (hire) */
export function setProposalAcceptedRecord(id: string): Proposal | null {
  const p = proposals.get(id);
  if (!p) return null;
  const from: ProposalStatus[] = [
    PROPOSAL_STATUS.SUBMITTED,
    PROPOSAL_STATUS.UNDER_REVIEW,
    PROPOSAL_STATUS.SHORTLISTED,
  ];
  if (!from.includes(p.status)) return null;
  p.status = PROPOSAL_STATUS.ACCEPTED;
  p.updatedAt = nowIso();
  pushTimelineEvent(p, PROPOSAL_STATUS.ACCEPTED, "Accepted");
  return clone(p);
}
