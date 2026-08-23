import {
  AdminProfile,
  AdminVendor,
  PlatformUser,
  VendorStatus,
} from "@/types/admin";
import { mockCampuses } from "./campuses";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// ADMINS (operations team)
// ------------------------------------------------------------

export const mockAdmins: AdminProfile[] = [
  {
    id: "adm-001",
    name: "Adebayo Ogundimu",
    email: "adebayo@kampmax.ng",
    role: "SUPER_ADMIN",
    campusId: null,
    avatar: "AO",
    title: "Platform Owner",
    lastLoginAt: "2026-08-22T08:12:00.000Z",
  },
  {
    id: "adm-002",
    name: "Chiamaka Eze",
    email: "chiamaka@kampmax.ng",
    role: "ADMIN",
    campusId: null,
    avatar: "CE",
    title: "Operations Lead",
    lastLoginAt: "2026-08-21T16:40:00.000Z",
  },
  {
    id: "adm-003",
    name: "Tunde Bakare",
    email: "tunde.bakare@kampmax.ng",
    role: "ADMIN",
    campusId: null,
    avatar: "TB",
    title: "Finance & Payments",
    lastLoginAt: "2026-08-20T11:05:00.000Z",
  },
  {
    id: "adm-004",
    name: "Fatima Yusuf",
    email: "fatima.yusuf@kampmax.ng",
    role: "CAMPUS_ADMIN",
    campusId: "rugipo",
    avatar: "FY",
    title: "RUGIPO Campus Manager",
    lastLoginAt: "2026-08-22T07:55:00.000Z",
  },
  {
    id: "adm-005",
    name: "Emeka Nwosu",
    email: "emeka.nwosu@kampmax.ng",
    role: "CAMPUS_ADMIN",
    campusId: "futa",
    avatar: "EN",
    title: "FUTA Campus Manager",
    lastLoginAt: "2026-08-19T14:22:00.000Z",
  },
];

// ------------------------------------------------------------
// PLATFORM USERS (students + vendor owners)
// ------------------------------------------------------------

const FIRST_NAMES = [
  "Adaeze", "Chinedu", "Ifeoma", "Oluwaseun", "Blessing", "Kelechi",
  "Aisha", "Yusuf", "Ngozi", "Damola", "Chidera", "Halimat",
  "Emeka", "Funmilayo", "Ibrahim", "Chioma", "Segun", "Amaka",
  "Musa", "Toyin", "Obinna", "Rukayat", "Efe", "Bukola",
] as const;

const LAST_NAMES = [
  "Okafor", "Adeyemi", "Balogun", "Okonkwo", "Lawal", "Igwe",
  "Adewale", "Mohammed", "Umeh", "Oyelaran", "Bassey", "Danjuma",
  "Nwachukwu", "Salami", "Abubakar", "Eze", "Ogbeide", "Ashiru",
] as const;

const HOSTELS = [
  "Melody Hostel", "Campus Gate Annex", "Peace Villa", "Student Village Block C",
  "De Truth Lodge", "Anglican Sabo", "Backline Quarters", "New Site Phase 2",
] as const;

function makeEmail(name: string, i: number): string {
  const slug = name.toLowerCase().replace(/\s+/g, ".");
  return [slug, i % 3 === 0 ? "gmail.com" : i % 3 === 1 ? "yahoo.com" : "student.edu.ng"].join("@");
}

export function buildMockUsers(count = 48): PlatformUser[] {
  const rand = seededRandom(42);
  const users: PlatformUser[] = [];
  for (let i = 0; i < count; i++) {
    const name = `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`;
    const kind = i % 4 === 3 ? "vendor" : "student";
    const statusRoll = rand();
    const joinedDaysAgo = intBetween(rand, 5, 420);
    users.push({
      id: `usr-${String(i + 1).padStart(3, "0")}`,
      name,
      email: makeEmail(name.replace(/\s+/g, ".").toLowerCase(), i),
      phone: `+234 8${intBetween(rand, 0, 9)}${intBetween(rand, 10000000, 99999999)}`,
      kind,
      campusId: pick(rand, mockCampuses.filter((c) => c.status === "active")).id,
      status:
        statusRoll > 0.94 ? "banned" : statusRoll > 0.86 ? "suspended" : "active",
      isVerified: rand() > 0.18,
      joinedAt: daysAgoIso(rand, joinedDaysAgo),
      lastActiveAt: daysAgoIso(rand, intBetween(rand, 0, Math.min(joinedDaysAgo, 30))),
      ordersCount: intBetween(rand, 0, 64),
      totalSpent: intBetween(rand, 0, 480) * 250,
      walletBalance: intBetween(rand, 0, 90) * 100,
      disputeCount: rand() > 0.85 ? intBetween(rand, 1, 3) : 0,
    });
  }
  // Guarantee a few notable records for demo/story purposes
  users[2].status = "suspended";
  users[5].disputeCount = 3;
  users[7].kind = "student";
  return users;
}

export const mockUsers: PlatformUser[] = buildMockUsers();

// ------------------------------------------------------------
// VENDORS
// ------------------------------------------------------------

const STORE_PREFIXES = [
  "GadgetHub", "TextbookXpress", "Kiddies&More", "UrbanThreads", "FreshMart",
  "PrintWorks", "BeautyBar", "HomeEssentials", "PhoneClinic", "SneakerPlug",
  "BookVault", "DecorNest", "PowerHouse", "StyleHaven", "FoodiePack",
] as const;

const STORE_SUFFIXES = ["NG", "Store", "HQ", "Kampus", "Express"] as const;

const VENDOR_CATEGORIES = [
  "Electronics", "Books & Academic", "Fashion", "Groceries",
  "Beauty & Personal Care", "Home & Living", "Printing Services",
] as const;

export function buildMockVendors(): AdminVendor[] {
  const rand = seededRandom(7);
  const vendors: AdminVendor[] = [];
  for (let i = 0; i < 24; i++) {
    const storeName = `${STORE_PREFIXES[i % STORE_PREFIXES.length]} ${
      STORE_SUFFIXES[Math.floor(i / STORE_PREFIXES.length) % STORE_SUFFIXES.length]
    }`;
    const ownerName = `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`;
    const statusRoll = rand();
    const status: VendorStatus =
      statusRoll > 0.92 ? "pending" : statusRoll > 0.84 ? "suspended" : "approved";
    const productsCount = intBetween(rand, 4, 68);
    vendors.push({
      id: `vnd-${String(i + 1).padStart(3, "0")}`,
      storeName,
      ownerId: `usr-${String(((i * 4 + 3) % mockUsers.length) + 1).padStart(3, "0")}`,
      ownerName,
      email: `${storeName.toLowerCase().replace(/[^a-z]+/g, ".")}@shop.ng`,
      phone: `+234 8${intBetween(rand, 0, 9)}${intBetween(rand, 10000000, 99999999)}`,
      campusId: pick(rand, mockCampuses.filter((c) => c.status === "active")).id,
      category: pick(rand, VENDOR_CATEGORIES),
      status,
      rating: Math.round((3.2 + rand() * 1.8) * 10) / 10,
      reviewsCount: intBetween(rand, 3, 210),
      productsCount,
      totalSales: intBetween(rand, 20, 900) * 2500,
      walletBalance: intBetween(rand, 0, 240) * 500,
      fulfillmentRate: intBetween(rand, 72, 99),
      joinedAt: daysAgoIso(rand, intBetween(rand, 30, 400)),
    });
  }
  return vendors;
}

export const mockVendors: AdminVendor[] = buildMockVendors();

// Shared pools used by other mock modules
export const USER_NAME_POOL = { FIRST_NAMES, LAST_NAMES };
export const ACTIVE_CAMPUS_IDS = mockCampuses
  .filter((c) => c.status === "active")
  .map((c) => c.id);
