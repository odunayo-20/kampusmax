import {
  CampusActivityEvent,
  CampusAdminAssignment,
  CampusOverviewStats,
  ManagedCampus,
  ManagedCampusDetail,
} from "@/types/admin";
import { mockCampuses } from "./campuses";
import { USER_NAME_POOL } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/campuses MODULE
//
// Derives managed campuses from the canonical `mockCampuses`
// seed so every campusId across the platform keeps resolving.
// Deterministic (seeded PRNG) - identical output every reload.
// The service layer owns mutations; these builders run once at
// module init.
// ------------------------------------------------------------

const { FIRST_NAMES, LAST_NAMES } = USER_NAME_POOL;

const STREET_NAMES = [
  "University Road", "Campus Gate Road", "Awolowo Way", "Ring Road",
  "Ondo Expressway", "Akure Road", "Lagos-Ibadan Expressway", "Market Road",
] as const;

const CAMPUS_NAME_SUFFIX = [
  "Main Campus", "Main Campus", "Main Campus", "Take-off Campus",
] as const;

const DESCRIPTION_TEMPLATES: ((c: {
  name: string;
  institution: string;
  city: string;
}) => string)[] = [
  (c) =>
    `Flagship Kampmax campus serving ${c.institution}. Covers hostel delivery, vendor onboarding and student wallet operations around ${c.city}.`,
  (c) =>
    `${c.name} operations hub for ${c.institution}. Fast-growing marketplace with strong demand for textbooks, food and essentials.`,
  (c) =>
    `Kampmax presence at ${c.institution} (${c.city}). Includes campus pickup stations and dedicated exam-season delivery slots.`,
];

function buildAdmins(
  campusId: string,
  rand: () => number,
  count: number,
  seniorityDays: number
): CampusAdminAssignment[] {
  return Array.from({ length: count }).map((_, i) => {
    const name = `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`;
    const slug = name.toLowerCase().replace(/\s+/g, ".");
    return {
      id: `adm-${campusId}-${i + 1}`,
      name,
      email: `${slug}@kampmax.ng`,
      phone: `+234 8${intBetween(rand, 0, 9)}${intBetween(rand, 10000000, 99999999)}`,
      status: rand() > 0.25 ? ("active" as const) : ("invited" as const),
      assignedAt: daysAgoIso(rand, intBetween(rand, 30, Math.max(seniorityDays, 31))),
    };
  });
}

export interface ManagedCampusDataset {
  campuses: ManagedCampus[];
  details: Map<string, ManagedCampusDetail>;
}

export function buildManagedCampusDataset(): ManagedCampusDataset {
  const rand = seededRandom(3117);
  const campuses: ManagedCampus[] = [];
  const details = new Map<string, ManagedCampusDetail>();

  mockCampuses.forEach((seed, i) => {
    // Registered platform users are a fraction of total enrolment,
    // calibrated so the network-wide total lands near ~19.8k users.
    const usersCount = Math.max(40, Math.round(seed.studentCount * (0.065 + rand() * 0.045)));
    const activeUsersCount = Math.round(usersCount * (0.66 + rand() * 0.22));
    const lifetimeOrders = Math.round(seed.ordersThisMonth * (2.3 + rand() * 1.1));
    const lifetimeRevenue = Math.round(seed.gmvThisMonth * (2.2 + rand() * 0.9));

    const admins =
      seed.status === "active"
        ? buildAdmins(seed.id, rand, rand() > 0.55 ? 2 : 1, intBetween(rand, 200, 500))
        : seed.status === "inactive" && rand() > 0.4
          ? buildAdmins(seed.id, rand, 1, 90)
          : [];

    const campus: ManagedCampus = {
      id: seed.id,
      name: `${seed.shortName} ${pick(rand, CAMPUS_NAME_SUFFIX)}`,
      institution: seed.name,
      shortName: seed.shortName,
      state: seed.state,
      city: seed.city,
      address: `${intBetween(rand, 1, 140)} ${pick(rand, STREET_NAMES)}, ${seed.city}`,
      description: pick(rand, DESCRIPTION_TEMPLATES)({
        name: `${seed.shortName} campus`,
        institution: seed.name,
        city: seed.city,
      }),
      logo: null,
      status: seed.status,
      usersCount,
      activeUsersCount,
      vendorsCount: seed.activeVendors,
      productsCount: seed.activeListings,
      ordersCount: lifetimeOrders,
      revenue: lifetimeRevenue,
      admins,
      createdAt: seed.launchDate,
    };
    campuses.push(campus);
    details.set(campus.id, buildCampusDetail(campus, i, rand));
  });

  return { campuses, details };
}

// ------------------------------------------------------------
// PER-CAMPUS DETAIL GENERATORS
// ------------------------------------------------------------

function buildCampusDetail(
  campus: ManagedCampus,
  index: number,
  rand: () => number
): ManagedCampusDetail {
  return {
    campus,
    stats: buildStats(campus),
    activity: buildActivity(campus, index, rand),
  };
}

function buildStats(campus: ManagedCampus): CampusOverviewStats {
  return {
    totalStudents: Math.round(campus.usersCount / 0.085),
    totalUsers: campus.usersCount,
    activeUsers: campus.activeUsersCount,
    vendors: campus.vendorsCount,
    products: campus.productsCount,
    orders: campus.ordersCount,
    revenue: campus.revenue,
    adminsCount: campus.admins.length,
  };
}

type ActivityTemplate = () => { message: string; meta: string };

const ACTIVITY_MESSAGES: Record<
  Exclude<CampusActivityEvent["kind"], never>,
  ActivityTemplate[]
> = {
  order: [
    () => ({ message: "Order volume up for the third straight day", meta: "Commerce" }),
    () => ({ message: "Bulk textbook order delivered to two hostels", meta: "Fulfilment" }),
    () => ({ message: "Peak-hour orders processed without queue delays", meta: "Operations" }),
  ],
  vendor: [
    () => ({ message: "New vendor completed verification documents", meta: "Onboarding" }),
    () => ({ message: "Vendor payout batch processed", meta: "Finance" }),
    () => ({ message: "Top-rated vendor renewed campus-exclusive deal", meta: "Growth" }),
  ],
  user: [
    () => ({ message: "Student signups spiked after orientation drive", meta: "Growth" }),
    () => ({ message: "Wallet funding volume above weekly average", meta: "Wallet" }),
    () => ({ message: "Referral programme credited new cohorts", meta: "Growth" }),
  ],
  listing: [
    () => ({ message: "New listings approved for the marketplace", meta: "Catalog" }),
    () => ({ message: "Seasonal listings refreshed by vendors", meta: "Catalog" }),
  ],
  moderation: [
    () => ({ message: "Flagged listing reviewed and removed", meta: "Trust & Safety" }),
    () => ({ message: "Dispute resolved in favour of the buyer", meta: "Support" }),
    () => ({ message: "Automated account checks passed", meta: "Trust & Safety" }),
  ],
  admin: [
    () => ({ message: "Campus settings updated by platform admin", meta: "Admin console" }),
    () => ({ message: "Weekly performance report exported", meta: "Admin console" }),
  ],
};

function buildActivity(
  campus: ManagedCampus,
  index: number,
  rand: () => number
): CampusActivityEvent[] {
  const events: CampusActivityEvent[] = [];
  const kinds = Object.keys(ACTIVITY_MESSAGES) as CampusActivityEvent["kind"][];

  if (!campus.admins.some((a) => a.status === "active")) {
    events.push({
      id: `cact-${campus.id}-0`,
      kind: "moderation",
      message: "No active campus admin - escalations route to platform admins",
      meta: "Coverage alert",
      at: daysAgoIso(rand, 3 + index),
    });
  }

  for (let i = 0; i < 10; i++) {
    const kind = pick(rand, kinds);
    const templates = ACTIVITY_MESSAGES[kind];
    const tpl = templates[intBetween(rand, 0, templates.length - 1)]();
    events.push({
      id: `cact-${campus.id}-${i + 1}`,
      kind,
      message: tpl.message,
      meta: tpl.meta,
      at: daysAgoIso(rand, intBetween(rand, 0, 21)),
    });
  }
  // Newest first; tie-break deterministically.
  return events.sort(
    (a, b) =>
      new Date(b.at).getTime() - new Date(a.at).getTime() ||
      a.id.localeCompare(b.id)
  );
}
