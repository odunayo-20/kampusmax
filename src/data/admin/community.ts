import {
  CommunityComment,
  CommunityEvent,
  CommunityPost,
  CommunityReport,
  ManagedAnnouncement,
  ManagedPoll,
} from "@/types/admin";
import { mockCampuses } from "./campuses";
import { mockAdmins, mockUsers } from "./people";
import {
  daysAgoIso,
  intBetween,
  pick,
  seededRandom,
} from "@/lib/admin/api";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/campus MODULE
//
// Six sections: posts, comments, events, announcements,
// reports and polls. Deterministic (seeded PRNG) so counts and
// previews are stable across reloads. Report rows are generated
// against real target ids and post.reportsCount is derived from
// them so the two sections always agree.
// ------------------------------------------------------------

function daysFromNowIso(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

const ACTIVE_CAMPUS_IDS = mockCampuses
  .filter((c) => c.status === "active")
  .map((c) => c.id);

const POST_TYPE_CYCLE = [
  "discussion",
  "question",
  "event",
  "marketplace",
  "announcement",
  "lost_found",
] as const;

/** Index-bucketed: published x10, hidden x4, reported x5, removed x3, under_review x3. */
const POST_STATUS_PATTERN = [
  "published", "reported", "hidden", "published", "under_review",
  "published", "removed", "reported", "published", "hidden",
  "under_review", "published", "reported", "published", "removed",
  "hidden", "published", "reported", "under_review", "published",
  "removed", "hidden", "reported", "published", "published",
] as const;

const POST_CONTENT_POOL = [
  "Has anyone used the new pickup station beside the faculty of science? Waited almost 20 minutes yesterday and the attendant said the system was down again.",
  "Selling my barely-used HP Pavilion, 8GB RAM, 512GB SSD. Battery still holds 5 hours. Perfect for engineering students who need AutoCAD on the go. DM me.",
  "Reminder that the GST 201 tutorial holds tomorrow at 4pm in LT2. We're covering differential equations, bring your past questions.",
  "Lost my black Jansport backpack around New Conavet Hall this morning. It has my lab manual and a calculator inside. Please reach out if you find it.",
  "The queue at the campus gate every morning is becoming unbearable. Can Kampmax deliveries please include a morning slot before 8am?",
  "Shoutout to the vendor that delivered my textbooks in under 2 hours during the rain. That was honestly impressive service.",
  "Is anyone else getting double wallet debit notifications when paying for orders? Happened twice this week already.",
  "Looking for 2 more roommates for a self-cone near the South Gate. Rent is split three ways, light and water included.",
  "The cafeteria jollof has really fallen off this semester. Fight me in the replies but we all know it's true.",
  "Selling brand-new lab coats (white, size M/L) for 4500 each. Cheaper than what the shops around campus charge, collection at Bello hostel.",
  "Group project partners for CSC 305, please behave yourselves. Some of us actually want to graduate with a good grade.",
  "PSA: there will be no light in the hostels tomorrow from 9am due to maintenance. Charge your devices tonight.",
  "Found a set of keys near the sports complex with a red keychain. Keeping it safe at the student center desk.",
  "Which network gives the best data deal around campus these days? Airtel has been terrible in my lodge lately.",
  "The inter-departmental football finals was lit! Congrats to Computer Science for lifting the trophy again.",
  "Anyone know a reliable tailor around Akungba that can deliver before convocation? My outfit is still with the first one for 3 weeks now.",
];

/** Index-bucketed: upcoming x3, live x2, completed x3, draft x2, cancelled x2. */
const EVENT_STATUS_PATTERN = [
  "upcoming", "completed", "live", "draft", "upcoming",
  "cancelled", "completed", "live", "upcoming", "completed",
  "draft", "cancelled",
] as const;

const EVENT_SEEDS: { title: string; venue: string }[] = [
  { title: "Tech & Innovation Summit", venue: "Auditorium" },
  { title: "Freshers Welcome Hangout", venue: "Campus Open Field" },
  { title: "Inter-Departmental Football Finals", venue: "Sports Complex" },
  { title: "Campus Market Day", venue: "Student Center" },
  { title: "Career & Internship Fair 2026", venue: "Faculty of Science Hall" },
  { title: "Music & Arts Night", venue: "New Conavet Hall" },
  { title: "Startup Pitch Night", venue: "Innovation Hub" },
  { title: "Tutorial Week: GST 101 Crash Course", venue: "LT2" },
  { title: "Movie Under the Stars", venue: "Campus Open Field" },
  { title: "Entrepreneurship Webinar", venue: "Online - Google Meet" },
  { title: "Campus Clean-Up Drive", venue: "Main Gate Assembly Point" },
  { title: "Alumni Homecoming Networking", venue: "Auditorium Annex" },
];

/** Index-bucketed: published x4, scheduled x2, draft x2, archived x2. */
const ANNOUNCEMENT_STATUS_PATTERN = [
  "published", "scheduled", "archived", "published", "draft",
  "published", "scheduled", "archived", "published", "draft",
] as const;

const ANNOUNCEMENT_PLACEMENT_CYCLE = [
  "feed_top",
  "push",
  "feed_banner",
  "email",
] as const;

const ANNOUNCEMENT_SEEDS: { title: string; body: string }[] = [
  {
    title: "Mid-Semester Sale Week is Live",
    body: "Vendors across all campuses are running discounts up to 40% off essentials. Browse the deals tab in the app between Monday and Sunday to catch them.",
  },
  {
    title: "Exam Season Delivery Schedule",
    body: "During exam weeks, delivery slots shift to 4pm-9pm so riders avoid the library rush hours. Place orders before noon for same-day delivery.",
  },
  {
    title: "Wallet Cashback Promo Returns",
    body: "Fund your Kampmax wallet with N5,000 or more and get 2% cashback credited instantly. Promo runs until the end of the month.",
  },
  {
    title: "Two New Campuses Join Kampmax",
    body: "We are officially live in UNILAG and Covenant University. Students there can now order, sell and book pickup stations from today.",
  },
  {
    title: "Safety Tips for In-Person Meetups",
    body: "For marketplace trades outside the delivery network, always meet in public campus zones and use the in-app confirmation before releasing payment.",
  },
  {
    title: "Referral Program: Invite & Earn",
    body: "Share your referral code and earn N500 wallet credit when your friend completes their first order. No cap on referrals this semester.",
  },
  {
    title: "Hostel Delivery Now Live in RUGIPO",
    body: "Bello, Ekan and Etiti hostels are now covered by door delivery. Update your address in the app to see the new slots.",
  },
  {
    title: "Vendor Verification Drive",
    body: "All vendors must complete re-verification before the next semester begins. Upload your valid student ID or business permit from the vendor console.",
  },
  {
    title: "Scheduled Maintenance This Weekend",
    body: "Orders will be paused briefly on Saturday between 1am and 3am while we upgrade the payment service. Wallet balance is not affected.",
  },
  {
    title: "Campus Ambassador Applications Open",
    body: "We are recruiting campus ambassadors for the new session. Apply through the app before Friday - stipends and free merch included.",
  },
];

/** Index-bucketed: open x7, reviewing x4, actioned x4, dismissed x3. */
const REPORT_STATUS_PATTERN = [
  "open", "actioned", "open", "dismissed", "reviewing", "open",
  "actioned", "open", "reviewing", "dismissed", "open", "actioned",
  "reviewing", "open", "dismissed", "reviewing", "actioned", "open",
] as const;

const REPORT_REASON_CYCLE = [
  "spam", "harassment", "scam", "misinformation", "inappropriate", "other",
] as const;

const REPORT_DETAIL_POOL = [
  "Same advert posted five times within an hour in the campus feed.",
  "User is threatening the buyer over a delayed pickup in the comments.",
  "Asked for transfer to a personal account outside the app before delivery.",
  "Claimed the school is increasing fees with a fake screenshot attached.",
  "Explicit language reported by three different students in the thread.",
  "Posting referral links repeatedly under unrelated discussions.",
  "Seller disappeared after payment confirmation screenshot was sent.",
  "Impersonating a lecturer's name to collect 'clearance fee' from freshers.",
];

const POLL_SEEDS: { question: string; options: string[] }[] = [
  {
    question: "Which pickup station should we add next?",
    options: ["South Gate Lodge", "Medical Complex", "New Conavet Hall", "Sports Complex"],
  },
  {
    question: "Best time for exam-season deliveries?",
    options: ["Morning (8-11am)", "Afternoon (12-4pm)", "Evening (4-9pm)"],
  },
  {
    question: "Preferred way to pay on Kampmax?",
    options: ["Wallet", "Card", "Bank transfer", "Paystack checkout"],
  },
  {
    question: "Should weekend market days continue?",
    options: ["Yes, keep them", "Only monthly", "Stop them"],
  },
  {
    question: "Top feature you want next semester?",
    options: ["Group buying", "Textbook rental", "Live order tracking+", "Vendor ratings revamp"],
  },
  {
    question: "How often do you use campus pickup stations?",
    options: ["Weekly", "Occasionally", "Never, door delivery only"],
  },
  {
    question: "Rate the new app update",
    options: ["Love it", "It's okay", "Prefer the old one"],
  },
  {
    question: "What should Campus Market Day feature next?",
    options: ["Food stalls", "Thrift fashion", "Gadget swaps", "Book exchange"],
  },
];

export interface CommunityDataset {
  posts: CommunityPost[];
  comments: CommunityComment[];
  events: CommunityEvent[];
  announcements: ManagedAnnouncement[];
  reports: CommunityReport[];
  polls: ManagedPoll[];
}

export function buildCommunityDataset(): CommunityDataset {
  const rand = seededRandom(2029);
  const authors = mockUsers.slice(0);

  // ---------------- Posts ----------------
  const posts: CommunityPost[] = POST_STATUS_PATTERN.map((status, i) => {
    const user = authors[(i * 5 + 3) % authors.length];
    const ageDays = intBetween(rand, 0, 21);
    return {
      id: `cmt-${String(i + 1).padStart(3, "0")}`,
      author: { id: user.id, name: user.name },
      campusId: user.campusId,
      type: POST_TYPE_CYCLE[i % POST_TYPE_CYCLE.length],
      content: POST_CONTENT_POOL[i % POST_CONTENT_POOL.length],
      likeCount: intBetween(rand, 2, 180),
      commentCount: intBetween(rand, 0, 46),
      shareCount: intBetween(rand, 0, 24),
      reportsCount: 0, // filled after reports exist
      status,
      createdAt: daysAgoIso(rand, ageDays),
    };
  });

  // ---------------- Comments ----------------
  const comments: CommunityComment[] = Array.from({ length: 28 }).map((_, i) => {
    const post = posts[intBetween(rand, 0, posts.length - 1)];
    const user = authors[(i * 7 + 1) % authors.length];
    const roll = rand();
    return {
      id: `cmc-${String(i + 1).padStart(3, "0")}`,
      postId: post.id,
      postExcerpt:
        post.content.length > 64
          ? `${post.content.slice(0, 64)}...`
          : post.content,
      author: { id: user.id, name: user.name },
      content: POST_CONTENT_POOL[(i + 6) % POST_CONTENT_POOL.length],
      campusId: post.campusId,
      likeCount: intBetween(rand, 0, 32),
      status: roll > 0.86 ? "removed" : roll > 0.72 ? "hidden" : "published",
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 14)),
    };
  });

  // ---------------- Events ----------------
  const events: CommunityEvent[] = EVENT_STATUS_PATTERN.map((status, i) => {
    const seed = EVENT_SEEDS[i % EVENT_SEEDS.length];
    const user = authors[(i * 3 + 8) % authors.length];
    const capacity = pick(rand, [80, 120, 150, 200, 250, 300]);
    let startsAt: string;
    let endsAt: string;
    switch (status) {
      case "live":
        startsAt = daysFromNowIso(-intBetween(rand, 4, 20) / 24);
        endsAt = daysFromNowIso(intBetween(rand, 2, 8) / 24);
        break;
      case "upcoming":
        startsAt = daysFromNowIso(intBetween(rand, 2, 16));
        endsAt = "";
        endsAt = new Date(
          new Date(startsAt).getTime() + intBetween(rand, 3, 8) * 3_600_000
        ).toISOString();
        break;
      case "cancelled":
        startsAt = daysFromNowIso(intBetween(rand, 3, 9));
        endsAt = new Date(
          new Date(startsAt).getTime() + 4 * 3_600_000
        ).toISOString();
        break;
      case "draft":
        startsAt = daysFromNowIso(intBetween(rand, 7, 20));
        endsAt = new Date(
          new Date(startsAt).getTime() + 5 * 3_600_000
        ).toISOString();
        break;
      default: // completed
        startsAt = daysAgoIso(rand, intBetween(rand, 5, 18));
        endsAt = new Date(
          new Date(startsAt).getTime() + intBetween(rand, 3, 6) * 3_600_000
        ).toISOString();
    }
    return {
      id: `cme-${String(i + 1).padStart(3, "0")}`,
      title: seed.title,
      organizer: { id: user.id, name: user.name },
      campusId: pick(rand, ACTIVE_CAMPUS_IDS),
      venue: seed.venue,
      startsAt,
      endsAt,
      attendeeCount:
        status === "completed" || status === "live"
          ? intBetween(rand, Math.floor(capacity * 0.35), capacity)
          : intBetween(rand, 0, Math.floor(capacity * 0.6)),
      capacity,
      status,
      createdAt: daysAgoIso(rand, intBetween(rand, 2, 30)),
    };
  });

  // ---------------- Announcements ----------------
  const announcements: ManagedAnnouncement[] = ANNOUNCEMENT_STATUS_PATTERN.map(
    (status, i) => {
      const seed = ANNOUNCEMENT_SEEDS[i % ANNOUNCEMENT_SEEDS.length];
      const campusRoll = rand();
      const campusIds =
        campusRoll > 0.82
          ? [] // all campuses
          : campusRoll > 0.58
            ? [...ACTIVE_CAMPUS_IDS].sort(() => rand() - 0.5).slice(0, 2)
            : [pick(rand, ACTIVE_CAMPUS_IDS)];
      const publishAt =
        status === "scheduled"
          ? daysFromNowIso(intBetween(rand, 3, 12))
          : status === "published"
            ? daysAgoIso(rand, intBetween(rand, 2, 15))
            : status === "archived"
              ? daysAgoIso(rand, intBetween(rand, 30, 60))
              : null;
      const createdAt = daysAgoIso(rand, intBetween(rand, 5, 40));
      return {
        id: `cmn-${String(i + 1).padStart(3, "0")}`,
        title: seed.title,
        body: seed.body,
        placement: ANNOUNCEMENT_PLACEMENT_CYCLE[i % ANNOUNCEMENT_PLACEMENT_CYCLE.length],
        campusIds,
        publishAt,
        createdBy: pick(rand, mockAdmins).name,
        status,
        createdAt,
        updatedAt: publishAt ?? createdAt,
      };
    }
  );

  // ---------------- Reports (against real targets) ----------------
  const reports: CommunityReport[] = [];
  const reportTargetPool: {
    targetType: CommunityReport["targetType"];
    targetId: string;
    preview: string;
  }[] = [];

  posts.forEach((p) => {
    if (
      p.status === "reported" ||
      p.status === "under_review" ||
      p.status === "removed" ||
      p.status === "published"
    ) {
      reportTargetPool.push({
        targetType: "post",
        targetId: p.id,
        preview:
          p.content.length > 56 ? `${p.content.slice(0, 56)}...` : p.content,
      });
    }
  });
  comments.forEach((c) =>
    reportTargetPool.push({ targetType: "comment", targetId: c.id, preview: `${c.postExcerpt}` })
  );
  events.forEach((e) =>
    reportTargetPool.push({ targetType: "event", targetId: e.id, preview: e.title })
  );

  // Build polls first (reports may reference them)
  const polls: ManagedPoll[] = POLL_SEEDS.map((seed, i) => {
    const status = i % 3 === 2 ? "closed" : "active";
    const votes = seed.options.map(() => intBetween(rand, 4, 160));
    return {
      id: `cmp-${String(i + 1).padStart(3, "0")}`,
      question: seed.question,
      options: seed.options.map((label, o) => ({ label, votes: votes[o] })),
      campusId: pick(rand, ACTIVE_CAMPUS_IDS),
      totalVotes: votes.reduce((a, b) => a + b, 0),
      endsAt:
        status === "active"
          ? daysFromNowIso(intBetween(rand, 2, 20))
          : daysAgoIso(rand, intBetween(rand, 1, 12)),
      status: status as ManagedPoll["status"],
      createdAt: daysAgoIso(rand, intBetween(rand, 3, 25)),
    };
  });
  polls.forEach((pl) =>
    reportTargetPool.push({ targetType: "poll", targetId: pl.id, preview: pl.question })
  );

  REPORT_STATUS_PATTERN.forEach((status, i) => {
    const target =
      reportTargetPool[(i * 4 + 2) % reportTargetPool.length];
    const reason = REPORT_REASON_CYCLE[i % REPORT_REASON_CYCLE.length];
    reports.push({
      id: `cmr-${String(i + 1).padStart(3, "0")}`,
      targetType: target.targetType,
      targetId: target.targetId,
      targetPreview: target.preview,
      reason,
      detail: REPORT_DETAIL_POOL[i % REPORT_DETAIL_POOL.length],
      reporterName: authors[(i * 9 + 5) % authors.length].name,
      priority:
        reason === "harassment" || reason === "scam"
          ? rand() > 0.35
            ? "high"
            : "medium"
          : rand() > 0.7
            ? "medium"
            : "low",
      status,
      createdAt: daysAgoIso(rand, intBetween(rand, 0, 14)),
    });
  });

  // Derive post.reportsCount from actual report rows so sections agree.
  posts.forEach((p) => {
    p.reportsCount = reports.filter(
      (r) => r.targetType === "post" && r.targetId === p.id
    ).length;
  });
  // Guarantee the moderation columns tell a story even if seed luck is thin.
  const reportedPosts = posts.filter((p) => p.reportsCount === 0);
  if (reportedPosts.length > 0 && reports.length >= 4) {
    const p0 = posts.find((x) => x.status === "reported");
    const p1 = posts.find((x) => x.status === "under_review");
    if (p0)
      p0.reportsCount = Math.max(p0.reportsCount, reports.filter((r) => r.targetType === "post").length || 2);
    if (p1 && p1 !== p0) p1.reportsCount = Math.max(1, p1.reportsCount);
  }

  return { posts, comments, events, announcements, reports, polls };
}

export const communityDataset: CommunityDataset = buildCommunityDataset();

/** Campus filter options shared by every section toolbar. */
export function communityCampusOptions(): {
  id: string;
  name: string;
  shortName: string;
}[] {
  return mockCampuses.map((c) => ({
    id: c.id,
    name: c.name,
    shortName: c.shortName,
  }));
}
