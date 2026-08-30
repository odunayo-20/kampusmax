// ============================================================
// SERVICE MARKETPLACE PUBLIC CATALOG (MOCK BACKEND)
// ============================================================
//
// Models the response of the future public services API. Everything in here is
// PUBLIC and backend-authoritative:
//
//   - Only ACTIVE services of APPROVED (listing) providers appear.
//   - No user ids, private addresses, documents, moderation notes, or
//     dashboard-only fields live in this module.
//   - Providers here are public catalog entries; they are NOT auth accounts.
//     `sp1` mirrors the seeded, already-approved provider from the dashboard
//     seed (see @/data/service-provider) so the dashboard and marketplace stay
//     consistent for the same provider.
//
// The UI never decides visibility — this catalog is the source of truth.

import type {
  MarketplaceProvider,
  MarketplaceService,
  MarketplaceServiceReview,
} from "@/types/service-marketplace";
import type { ServiceProviderAvailabilityDay } from "@/types/service-provider";
import { SP_SERVICE_CATEGORIES } from "@/data/service-categories";

// ── Default availability (mirrors provider onboarding defaults) ─

const defaultAvailabilityDays: ServiceProviderAvailabilityDay[] = [
  { dayIndex: 0, label: "Monday", isAvailable: true, openTime: "09:00", closeTime: "18:00" },
  { dayIndex: 1, label: "Tuesday", isAvailable: true, openTime: "09:00", closeTime: "18:00" },
  { dayIndex: 2, label: "Wednesday", isAvailable: true, openTime: "09:00", closeTime: "18:00" },
  { dayIndex: 3, label: "Thursday", isAvailable: true, openTime: "09:00", closeTime: "18:00" },
  { dayIndex: 4, label: "Friday", isAvailable: true, openTime: "09:00", closeTime: "18:00" },
  { dayIndex: 5, label: "Saturday", isAvailable: true, openTime: "10:00", closeTime: "16:00" },
  { dayIndex: 6, label: "Sunday", isAvailable: false },
];

// ── Providers ─────────────────────────────────────────────────

export const marketplaceServiceProviders: MarketplaceProvider[] = [
  {
    id: "sp1",
    slug: "adebayo-tech-services",
    displayName: "Adebayo Tech Services",
    tagline: "Your campus tech expert",
    description:
      "Professional phone repair, laptop troubleshooting, and software installation services. Fast turnaround, student-friendly prices. Operating from my workshop at Engineering Block, RUGIPO.",
    logoUrl: "https://picsum.photos/seed/sp1-logo/200/200",
    coverUrl: null,
    type: "individual",
    verified: true,
    verificationStatus: "approved",
    rating: 4.9,
    ratingCount: 37,
    totalBookings: 47,
    primaryCategoryId: "cat4",
    secondaryCategoryIds: ["cat3"],
    specialties: ["Phone Repair", "Laptop Repair", "Software Setup", "Data Recovery"],
    primaryCampusId: "rugipo",
    additionalCampusIds: ["oau", "ui"],
    serviceCities: ["Owo", "Akure"],
    serviceRadiusKm: 15,
    responseTime: "Within 2 hours",
    joinedYear: 2026,
    languages: ["English", "Yoruba"],
    availability: {
      days: defaultAvailabilityDays,
      bookingPreference: "request_approval",
      minAdvanceNoticeHours: 2,
    },
    portfolio: [
      {
        id: "sp1-port1",
        image: "https://picsum.photos/seed/sp1-port1/600/400",
        title: "iPhone 13 Screen Replacement",
        description: "Completed in 45 minutes with OEM-quality screen. Customer picked up same day.",
        categoryId: "cat4",
      },
      {
        id: "sp1-port2",
        image: "https://picsum.photos/seed/sp1-port2/600/400",
        title: "Laptop Motherboard Repair",
        description: "Diagnosed and fixed liquid damage on a MacBook Pro. Data preserved, full functionality restored.",
        categoryId: "cat4",
      },
      {
        id: "sp1-port3",
        image: "https://picsum.photos/seed/sp1-port3/600/400",
        title: "Custom PC Build",
        description: "Assembled a gaming rig for a student. Cable management, stress testing, and driver setup included.",
        categoryId: "cat3",
      },
    ],
    policies: [
      { title: "Warranty", body: "30-day warranty on parts replaced. Warranty does not cover liquid damage or physical abuse." },
      { title: "Cancellation", body: "Free cancellation up to 2 hours before your appointment. Late cancellations may incur a small fee." },
    ],
  },
  {
    id: "sp2",
    slug: "zainab-beauty-studio",
    displayName: "Zainab Beauty Studio",
    tagline: "Look your best, feel confident",
    description:
      "Home-based beauty studio offering manicures, makeup, and hair styling. Using quality products at student-friendly prices. Close to the North Gate, RUGIPO.",
    logoUrl: "https://picsum.photos/seed/sp2-logo/200/200",
    coverUrl: "https://picsum.photos/seed/sp2-cover/1200/400",
    type: "individual",
    verified: true,
    verificationStatus: "approved",
    rating: 4.7,
    ratingCount: 52,
    totalBookings: 63,
    primaryCategoryId: "cat1",
    secondaryCategoryIds: [],
    specialties: ["Makeup", "Manicure", "Hair Styling"],
    primaryCampusId: "rugipo",
    additionalCampusIds: [],
    serviceCities: ["Owo"],
    serviceRadiusKm: 8,
    responseTime: "Within a few hours",
    joinedYear: 2025,
    languages: ["English", "Yoruba"],
    availability: {
      days: defaultAvailabilityDays,
      bookingPreference: "instant",
      minAdvanceNoticeHours: 3,
    },
    portfolio: [
      {
        id: "sp2-port1",
        image: "https://picsum.photos/seed/sp2-port1/600/400",
        title: "Bridal Makeup",
        description: "Soft-glam bridal look for a campus wedding. Long-wear products used.",
        categoryId: "cat1",
      },
      {
        id: "sp2-port2",
        image: "https://picsum.photos/seed/sp2-port2/600/400",
        title: "Gel Manicure set",
        description: "Clear-over-pink gel manicure with cuticle care. Lasts 2+ weeks.",
        categoryId: "cat1",
      },
    ],
    policies: [
      { title: "No-show", body: "Please cancel or reschedule at least 3 hours ahead. Repeated no-shows may affect future bookings." },
    ],
  },
  {
    id: "sp3",
    slug: "tutorade-academy",
    displayName: "TutorAde Academy",
    tagline: "Structured lessons that actually stick",
    description:
      "Final-year engineering student offering focused one-on-one and small-group lessons in mathematics, physics, and programming. Proven track record with students averaging one grade better.",
    logoUrl: "https://picsum.photos/seed/sp3-logo/200/200",
    coverUrl: "https://picsum.photos/seed/sp3-cover/1200/400",
    type: "individual",
    verified: true,
    verificationStatus: "approved",
    rating: 4.8,
    ratingCount: 28,
    totalBookings: 41,
    primaryCategoryId: "cat2",
    secondaryCategoryIds: ["cat3"],
    specialties: ["Mathematics", "Physics", "Programming", "Exams Prep"],
    primaryCampusId: "oau",
    additionalCampusIds: [],
    serviceCities: ["Ile-Ife"],
    serviceRadiusKm: 10,
    responseTime: "Within 2 hours",
    joinedYear: 2025,
    languages: ["English", "Yoruba"],
    availability: {
      days: defaultAvailabilityDays.map((d) =>
        d.dayIndex === 6 ? { ...d, isAvailable: true, openTime: "14:00", closeTime: "18:00" } : d
      ),
      bookingPreference: "request_approval",
      minAdvanceNoticeHours: 1,
    },
    portfolio: [
      {
        id: "sp3-port1",
        image: "https://picsum.photos/seed/sp3-port1/600/400",
        title: "UTME Maths Crash Course",
        description: "6-week intensive covering algebra, calculus, and word problems.",
        categoryId: "cat2",
      },
      {
        id: "sp3-port2",
        image: "https://picsum.photos/seed/sp3-port2/600/400",
        title: "Intro to Python (group)",
        description: "8-student cohort over 5 Saturdays. Capstone mini-project at the end.",
        categoryId: "cat3",
      },
    ],
    policies: [
      { title: "Booking", body: "Lessons are scheduled at agreed times. Sessions start and end on time out of respect for both parties." },
    ],
  },
  {
    id: "sp4",
    slug: "quickfix-gadget-repairs",
    displayName: "QuickFix Gadget Repairs",
    tagline: "Damn good gadget fixes",
    description:
      "Gadget repair lab at UI fixing screens, batteries, chargers, and power banks. Diagnostics done on the spot — you only pay when the fix is agreed.",
    logoUrl: "https://picsum.photos/seed/sp4-logo/200/200",
    coverUrl: null,
    type: "business",
    verified: true,
    verificationStatus: "approved",
    rating: 4.5,
    ratingCount: 19,
    totalBookings: 25,
    primaryCategoryId: "cat4",
    secondaryCategoryIds: ["cat3"],
    specialties: ["Screen Repair", "Battery Replacement", "Power Bank Repair"],
    primaryCampusId: "ui",
    additionalCampusIds: [],
    serviceCities: ["Ibadan"],
    serviceRadiusKm: 12,
    responseTime: "Within 6 hours",
    joinedYear: 2025,
    languages: ["English", "Yoruba"],
    availability: {
      days: defaultAvailabilityDays,
      bookingPreference: "request_approval",
      minAdvanceNoticeHours: 4,
    },
    portfolio: [
      {
        id: "sp4-port1",
        image: "https://picsum.photos/seed/sp4-port1/600/400",
        title: "Samsung Screen Swap",
        description: "OLED panel replaced in under an hour at our Ikeja-Idi-Ape lab.",
        categoryId: "cat4",
      },
      {
        id: "sp4-port2",
        image: "https://picsum.photos/seed/sp4-port2/600/400",
        title: "Power Bank Cell Swap",
        description: "Replaced aging cells in a 20,000mAh power bank. Charges to full again.",
        categoryId: "cat4",
      },
    ],
    policies: [
      { title: "Diagnostics", body: "Diagnostics are free when a repair proceeds. Non-repair diagnostics attract a flat ₦1,000 fee." },
      { title: "Warranty", body: "3-month warranty on all parts we install." },
    ],
  },
  {
    id: "sp5",
    slug: "printhub-creative",
    displayName: "PrintHub Creative",
    tagline: "Print & design, done right",
    description:
      "Design and print solutions for students and small businesses — posters, banners, thesis copies, and logo design. Pickup at UNILAG or delivery around campus.",
    logoUrl: "https://picsum.photos/seed/sp5-logo/200/200",
    coverUrl: null,
    type: "business",
    verified: false,
    verificationStatus: "unverified",
    rating: 4.2,
    ratingCount: 33,
    totalBookings: 44,
    primaryCategoryId: "cat12",
    secondaryCategoryIds: ["cat5"],
    specialties: ["Printing", "Poster Design", "Logo Design", "Thesis Binding"],
    primaryCampusId: "unilag",
    additionalCampusIds: [],
    serviceCities: ["Lagos"],
    serviceRadiusKm: 10,
    responseTime: "Within a day",
    joinedYear: 2024,
    languages: ["English"],
    availability: {
      days: defaultAvailabilityDays.filter((d) => d.dayIndex !== 5),
      bookingPreference: "instant",
      minAdvanceNoticeHours: 6,
    },
    portfolio: [
      {
        id: "sp5-port1",
        image: "https://picsum.photos/seed/sp5-port1/600/400",
        title: "Campus Talent Show Poster",
        description: "A2 posters printed and delivered to 6 notice boards.",
        categoryId: "cat12",
      },
      {
        id: "sp5-port2",
        image: "https://picsum.photos/seed/sp5-port2/600/400",
        title: "Final Year Project Covers",
        description: "Hardcover binding with foil-embossed titles for 40 students.",
        categoryId: "cat12",
      },
    ],
    policies: [
      { title: "Turnaround", body: "Standard printing is 24 hours. Rush orders (same day) attract a 50% surcharge." },
    ],
  },
  {
    id: "sp6",
    slug: "fitlife-personal-training",
    displayName: "FitLife Personal Training",
    tagline: "Train smarter, not harder",
    description:
      "Certified personal trainer offering one-on-one sessions and structured online workout plans. Gym at UNILAG Sports Centre or train from your hostel room.",
    logoUrl: "https://picsum.photos/seed/sp6-logo/200/200",
    coverUrl: "https://picsum.photos/seed/sp6-cover/1200/400",
    type: "individual",
    verified: true,
    verificationStatus: "approved",
    rating: 4.4,
    ratingCount: 21,
    totalBookings: 30,
    primaryCategoryId: "cat10",
    secondaryCategoryIds: [],
    specialties: ["Personal Training", "HIIT", "Nutrition Basics", "Online Coaching"],
    primaryCampusId: "unilag",
    additionalCampusIds: [],
    serviceCities: ["Lagos"],
    serviceRadiusKm: 9,
    responseTime: "Within 4 hours",
    joinedYear: 2025,
    languages: ["English"],
    availability: {
      days: defaultAvailabilityDays,
      bookingPreference: "instant",
      minAdvanceNoticeHours: 12,
    },
    portfolio: [
      {
        id: "sp6-port1",
        image: "https://picsum.photos/seed/sp6-port1/600/400",
        title: "8-week transformation",
        description: "Combined strength + nutrition coaching for a final-year student.",
        categoryId: "cat10",
      },
      {
        id: "sp6-port2",
        image: "https://picsum.photos/seed/sp6-port2/600/400",
        title: "Hostel-room HIIT",
        description: "No-equipment conditioning circuit designed for small spaces.",
        categoryId: "cat10",
      },
    ],
    policies: [
      { title: "Sessions", body: "Sessions are valid for 30 days from purchase. Missed sessions can be moved once with 12-hours notice." },
    ],
  },
];

// ── Services ──────────────────────────────────────────────────

export const marketplaceServices: MarketplaceService[] = [
  // Adebayo Tech Services (sp1)
  {
    id: "msvc1",
    providerId: "sp1",
    name: "Phone Screen Replacement",
    description:
      "Professional screen replacement for iPhone and Android devices. Includes a 30-day warranty on parts and same-day service for most models.",
    categoryId: "cat4",
    pricingModel: "starting_from",
    price: 5000,
    durationMinutes: 60,
    locationType: "provider_location",
    imageUrl: "https://picsum.photos/seed/msvc1/600/400",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-02-02T09:00:00Z",
    viewCount: 320,
    whatsIncluded: ["Screen part + labour", "30-day part warranty", "Same-day service"],
    tags: ["Phone", "Screen", "Repair"],
  },
  {
    id: "msvc2",
    providerId: "sp1",
    name: "Laptop Diagnostics & Repair",
    description:
      "Hardware and software diagnostics, virus removal, OS installation, and hardware upgrades. A detailed report before any repair begins.",
    categoryId: "cat4",
    pricingModel: "fixed",
    price: 3000,
    durationMinutes: 90,
    locationType: "both",
    imageUrl: "https://picsum.photos/seed/msvc2/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-01-28T09:00:00Z",
    viewCount: 210,
    whatsIncluded: ["Diagnostics report", "Virus removal", "OS installation if needed"],
    tags: ["Laptop", "Diagnostics"],
  },
  {
    id: "msvc3",
    providerId: "sp1",
    name: "Software Installation & Setup",
    description:
      "Install and configure development environments, productivity software, VPNs, and security tools. Done remotely — no need to visit.",
    categoryId: "cat3",
    pricingModel: "fixed",
    price: 2000,
    durationMinutes: 45,
    locationType: "online",
    imageUrl: "https://picsum.photos/seed/msvc3/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-02-10T09:00:00Z",
    viewCount: 142,
    whatsIncluded: ["Software install", "Configuration", "Guidance notes"],
    tags: ["Software", "Setup"],
  },
  {
    id: "msvc4",
    providerId: "sp1",
    name: "Data Recovery",
    description:
      "Recover lost data from damaged hard drives, USB drives, and memory cards. No data, no fee — you only pay when we succeed.",
    categoryId: "cat3",
    pricingModel: "quote",
    price: 0,
    durationMinutes: 120,
    locationType: "provider_location",
    imageUrl: "https://picsum.photos/seed/msvc4/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-01-20T09:00:00Z",
    viewCount: 180,
    whatsIncluded: ["Assessment", "Recovery attempt", "Recovered files on new drive"],
    tags: ["Data", "Recovery"],
  },

  // Zainab Beauty Studio (sp2)
  {
    id: "msvc5",
    providerId: "sp2",
    name: "Gel Manicure",
    description:
      "Full gel manicure with cuticle care and a choice of colour. Lasts 2–3 weeks. Products are sanitised between clients.",
    categoryId: "cat1",
    pricingModel: "fixed",
    price: 3500,
    durationMinutes: 45,
    locationType: "provider_location",
    imageUrl: "https://picsum.photos/seed/msvc5/600/400",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-03-02T09:00:00Z",
    viewCount: 245,
    whatsIncluded: ["Cuticle care", "Gel polish", "Quick-dry topper"],
    tags: ["Manicure", "Nails"],
  },
  {
    id: "msvc6",
    providerId: "sp2",
    name: "Makeup Service",
    description:
      "Glam, everyday, or event makeup using long-wear, skin-friendly products. Bring your own lashes or use ours.",
    categoryId: "cat1",
    pricingModel: "range",
    price: 5000,
    priceMax: 12000,
    durationMinutes: 60,
    locationType: "both",
    imageUrl: "https://picsum.photos/seed/msvc6/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-03-10T09:00:00Z",
    viewCount: 190,
    whatsIncluded: ["Base + colour", "Setting spray", "Touch-up kit"],
    tags: ["Makeup", "Events"],
  },
  {
    id: "msvc7",
    providerId: "sp2",
    name: "Hair Styling",
    description:
      "Braids, twists, silk press, and event styling. Prices depend on length and style — confirm a quote first.",
    categoryId: "cat1",
    pricingModel: "quote",
    price: 0,
    durationMinutes: 120,
    locationType: "provider_location",
    imageUrl: "https://picsum.photos/seed/msvc7/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-02-25T09:00:00Z",
    viewCount: 130,
    tags: ["Hair", "Styling"],
  },

  // TutorAde Academy (sp3)
  {
    id: "msvc8",
    providerId: "sp3",
    name: "UTME Mathematics Tutoring",
    description:
      "One-on-one maths coaching focused on UTME/JAMB and internal exams. We build speed, accuracy, and confidence with past questions.",
    categoryId: "cat2",
    pricingModel: "fixed",
    price: 2500,
    durationMinutes: 60,
    locationType: "both",
    imageUrl: "https://picsum.photos/seed/msvc8/600/400",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-01-15T09:00:00Z",
    viewCount: 310,
    whatsIncluded: ["60-min session", "Practice questions", "Progress notes"],
    tags: ["Maths", "UTME"],
  },
  {
    id: "msvc9",
    providerId: "sp3",
    name: "Intro to Programming (Python)",
    description:
      "Gentle introduction to programming using Python. 5 weekly sessions covering logic, loops, and a final mini-project.",
    categoryId: "cat3",
    pricingModel: "starting_from",
    price: 4000,
    durationMinutes: 90,
    locationType: "online",
    imageUrl: "https://picsum.photos/seed/msvc9/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-02-01T09:00:00Z",
    viewCount: 260,
    whatsIncluded: ["5 sessions", "Notes + exercises", "Mini-project review"],
    tags: ["Python", "Programming"],
  },
  {
    id: "msvc10",
    providerId: "sp3",
    name: "Physics Crash Course",
    description:
      "Structured revision for mechanics, electricity, and waves. Ideal right before tests. Group discounts available.",
    categoryId: "cat2",
    pricingModel: "fixed",
    price: 3000,
    durationMinutes: 120,
    locationType: "both",
    imageUrl: "https://picsum.photos/seed/msvc10/600/400",
    isActive: false,
    isFeatured: false,
    createdAt: "2026-01-05T09:00:00Z",
    viewCount: 95,
    tags: ["Physics", "Revision"],
  },

  // QuickFix Gadget Repairs (sp4)
  {
    id: "msvc11",
    providerId: "sp4",
    name: "Power Bank & Charger Repair",
    description:
      "Troubleshooting and repair for power banks, chargers, and cables. Free diagnostics when a repair proceeds.",
    categoryId: "cat4",
    pricingModel: "fixed",
    price: 1800,
    durationMinutes: 40,
    locationType: "provider_location",
    imageUrl: "https://picsum.photos/seed/msvc11/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-03-05T09:00:00Z",
    viewCount: 120,
    whatsIncluded: ["Diagnosis", "Cell/port replacement", "3-month warranty"],
    tags: ["Power Bank", "Charger"],
  },
  {
    id: "msvc12",
    providerId: "sp4",
    name: "Phone Battery Replacement",
    description:
      "Replace worn-out phone batteries with quality cells. Most models done within an hour.",
    categoryId: "cat4",
    pricingModel: "starting_from",
    price: 4000,
    durationMinutes: 60,
    locationType: "provider_location",
    imageUrl: "https://picsum.photos/seed/msvc12/600/400",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-01-22T09:00:00Z",
    viewCount: 205,
    whatsIncluded: ["Battery + fitting", "Battery health report", "3-month warranty"],
    tags: ["Battery", "Phone"],
  },

  // PrintHub Creative (sp5)
  {
    id: "msvc13",
    providerId: "sp5",
    name: "Poster & Banner Printing",
    description:
      "High-quality A4–A0 printing on gloss or matte stock. Fliers, posters, and banners for events and campaigns.",
    categoryId: "cat12",
    pricingModel: "fixed",
    price: 800,
    durationMinutes: 30,
    locationType: "customer_location",
    imageUrl: "https://picsum.photos/seed/msvc13/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-02-18T09:00:00Z",
    viewCount: 150,
    whatsIncluded: ["Printing", "Delivery within campus"],
    tags: ["Printing", "Poster"],
  },
  {
    id: "msvc14",
    providerId: "sp5",
    name: "Logo & Brand Design",
    description:
      "Simple, modern logo design delivered in PNG and vector files. Two revisions included.",
    categoryId: "cat5",
    pricingModel: "starting_from",
    price: 10000,
    durationMinutes: 180,
    locationType: "online",
    imageUrl: "https://picsum.photos/seed/msvc14/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-01-30T09:00:00Z",
    viewCount: 88,
    whatsIncluded: ["Concepts", "2 revisions", "Source files"],
    tags: ["Design", "Logo"],
  },
  {
    id: "msvc15",
    providerId: "sp5",
    name: "Thesis & Project Binding",
    description:
      "Hardcover and softcover binding for final year projects and theses. Cover art and foil text available.",
    categoryId: "cat12",
    pricingModel: "fixed",
    price: 1500,
    durationMinutes: 20,
    locationType: "both",
    imageUrl: "https://picsum.photos/seed/msvc15/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-01-12T09:00:00Z",
    viewCount: 160,
    whatsIncluded: ["Print + binding", "Cover options", "Same-week pickup"],
    tags: ["Binding", "Thesis"],
  },

  // FitLife Personal Training (sp6)
  {
    id: "msvc16",
    providerId: "sp6",
    name: "Personal Training Session",
    description:
      "One-on-one strength, conditioning, or weight-loss training at the UNILAG Sports Centre. Program adjusted to your level and goals.",
    categoryId: "cat10",
    pricingModel: "range",
    price: 4500,
    priceMax: 8000,
    durationMinutes: 60,
    locationType: "both",
    imageUrl: "https://picsum.photos/seed/msvc16/600/400",
    isActive: true,
    isFeatured: true,
    createdAt: "2026-02-20T09:00:00Z",
    viewCount: 230,
    whatsIncluded: ["1-hour session", "Exercise programme", "Form correction"],
    tags: ["Training", "Fitness"],
  },
  {
    id: "msvc17",
    providerId: "sp6",
    name: "Online Workout Plan",
    description:
      "A structured 4-week plan built around equipment you actually have — including hostel-room no-equipment options. Check-ins via chat.",
    categoryId: "cat10",
    pricingModel: "quote",
    price: 0,
    durationMinutes: 0,
    locationType: "online",
    imageUrl: "https://picsum.photos/seed/msvc17/600/400",
    isActive: true,
    isFeatured: false,
    createdAt: "2026-03-08T09:00:00Z",
    viewCount: 75,
    whatsIncluded: ["4-week plan", "Weekly check-ins"],
    tags: ["Online", "Plan"],
  },
];

// ── Reviews (visible / approved only) ─────────────────────────

export const marketplaceServiceReviews: MarketplaceServiceReview[] = [
  { id: "r1", providerId: "sp1", serviceId: "msvc1", authorName: "Chidera N.", rating: 5, comment: "Screen replaced in under an hour. Looks brand new. Highly recommend.", createdAt: "2026-02-14T10:00:00Z" },
  { id: "r2", providerId: "sp1", serviceId: "msvc2", authorName: "Tobi A.", rating: 5, comment: "Laptop is way faster after the clean install. Very professional.", createdAt: "2026-02-02T15:30:00Z" },
  { id: "r3", providerId: "sp1", serviceId: "msvc1", authorName: "Emeka O.", rating: 4, comment: "Good price and quick. Parking nearby is a bit tricky though.", createdAt: "2026-01-25T12:00:00Z" },
  { id: "r4", providerId: "sp2", serviceId: "msvc5", authorName: "Kemi B.", rating: 5, comment: "Gel nails lasted 3 weeks! So neat and clean studio.", createdAt: "2026-03-12T11:00:00Z" },
  { id: "r5", providerId: "sp2", serviceId: "msvc6", authorName: "Aisha S.", rating: 5, comment: "Did my makeup for a post-exam party — it stayed put all night.", createdAt: "2026-03-01T14:00:00Z" },
  { id: "r6", providerId: "sp2", serviceId: "msvc5", authorName: "Funmi L.", rating: 4, comment: "Great job, just a little busy on weekends. Book ahead.", createdAt: "2026-02-20T09:00:00Z" },
  { id: "r7", providerId: "sp3", serviceId: "msvc8", authorName: "Damilare K.", rating: 5, comment: "Went from failing maths to a B. Sessions are clear and structured.", createdAt: "2026-03-05T10:00:00Z" },
  { id: "r8", providerId: "sp3", serviceId: "msvc9", authorName: "Blessing E.", rating: 5, comment: "Finally understand loops! The mini-project sealed it.", createdAt: "2026-02-25T16:00:00Z" },
  { id: "r9", providerId: "sp4", serviceId: "msvc12", authorName: "Ridwan F.", rating: 4, comment: "Battery swapped fast and it holds charge well. Good warranty talk.", createdAt: "2026-02-12T13:00:00Z" },
  { id: "r10", providerId: "sp4", serviceId: "msvc11", authorName: "Peace I.", rating: 5, comment: "Fixed the power bank my laptop wouldn't charge from. Great service.", createdAt: "2026-02-01T10:00:00Z" },
  { id: "r11", providerId: "sp5", serviceId: "msvc13", authorName: "Oluwafemi J.", rating: 4, comment: "Posters came out crisp and on time. Slight colour difference but fine.", createdAt: "2026-02-28T12:00:00Z" },
  { id: "r12", providerId: "sp5", serviceId: "msvc15", authorName: "Adaobi M.", rating: 4, comment: "Binding looks great. They even printed my cover art.", createdAt: "2026-02-10T09:00:00Z" },
  { id: "r13", providerId: "sp6", serviceId: "msvc16", authorName: "Yusuf G.", rating: 5, comment: "Great trainer — sessions are tough but fun. Already seeing results.", createdAt: "2026-03-15T17:00:00Z" },
  { id: "r14", providerId: "sp6", serviceId: "msvc17", authorName: "Ngozi C.", rating: 4, comment: "Plan is realistic for hostel living. Weekly check-ins keep me honest.", createdAt: "2026-03-02T08:00:00Z" },
];

// ── Report reasons (backend-configured) ───────────────────────

export const serviceReportReasons: { value: string; label: string }[] = [
  { value: "fraud", label: "Fraud / scam" },
  { value: "misleading", label: "Misleading information" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

// ── Category helpers (slug + counts) ──────────────────────────

export const SERVICE_CATEGORY_SLUGS: Record<string, string> = SP_SERVICE_CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return acc;
  },
  {} as Record<string, string>
);

export function serviceCategorySlug(categoryId: string): string {
  return SERVICE_CATEGORY_SLUGS[categoryId] ?? categoryId;
}

export function serviceCategoryBySlug(slug: string): { id: string; name: string; group: string } | undefined {
  const entry = Object.entries(SERVICE_CATEGORY_SLUGS).find(([, s]) => s === slug);
  if (!entry) return undefined;
  const cat = SP_SERVICE_CATEGORIES.find((c) => c.id === entry[0]);
  return cat;
}