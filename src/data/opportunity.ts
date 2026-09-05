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
  Opportunity,
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
  opportunities.set(id, opp);
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

// ── Opportunity store API ───────────────────────────────────

export function getAllOpportunities(): Opportunity[] {
  return clone(Array.from(opportunities.values()));
}

export function getOpportunityRecord(id: string): Opportunity | null {
  const opp = opportunities.get(id);
  return opp ? clone(opp) : null;
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

  return { items: list, total: list.length };
}

function sortOpportunities(list: Opportunity[], sort: OpportunitySortKey): Opportunity[] {
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
