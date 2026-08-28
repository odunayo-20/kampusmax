import type {
  KampmaxCoinAccount,
  KampmaxProfile,
  RewardsAccount,
  RewardEvent,
  ActiveProfile,
} from "@/types/account";
import type { LoyaltyProgram, LoyaltyTier } from "@/types";

// ============================================================
// ACCOUNT MOCK DATA (display-only; backend authoritative)
// ============================================================

// Kampmax Coin is NOT enabled in the backend yet. We model this explicitly so
// the UI can render an honest "coming soon / disabled" state instead of
// pretending it's operational. Balances/rates are never invented on the client.
export const mockKampmaxCoin: KampmaxCoinAccount = {
  isActive: false,
  balance: 0,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  pending: 0,
  available: 0,
  transactions: [],
  disabledReason: "Kampmax Coin is not active yet. When it launches, your earnings will appear here.",
};

// Rewards reuse the existing loyalty program as the source of points/tier.
// The history below is a *display* representation; authoritative point
// accounting is done by the backend.
export function buildRewardsAccount(loyalty: LoyaltyProgram): RewardsAccount {
  const history: RewardEvent[] = [
    {
      id: "rw1",
      type: "earned",
      points: 450,
      description: "Points from your delivered orders",
      createdAt: "2025-01-11T14:30:00Z",
    },
    {
      id: "rw2",
      type: "earned",
      points: 200,
      description: "Welcome bonus points",
      createdAt: "2024-12-01T08:00:00Z",
    },
    {
      id: "rw3",
      type: "used",
      points: 120,
      description: "Redeemed towards an order",
      createdAt: "2024-11-20T16:45:00Z",
    },
  ];

  const earned = history
    .filter((e) => e.type === "earned" || e.type === "pending")
    .reduce((s, e) => s + e.points, 0);
  const used = history
    .filter((e) => e.type === "used")
    .reduce((s, e) => s + e.points, 0);
  const pending = history
    .filter((e) => e.type === "pending")
    .reduce((s, e) => s + e.points, 0);

  return {
    points: loyalty.points,
    tier: loyalty.tier,
    pointsToNairaRate: loyalty.pointsToNairaRate,
    lifetimePoints: loyalty.lifetimePoints,
    earned,
    used,
    pending,
    history,
  };
}

// ── Multi-profile center ────────────────────────────────────────────────
// These are PROFILES on the SAME user account (never separate auth accounts).
// Only "customer" is active in this prototype. Future profiles each have their
// own onboarding entry point but share the one login.
export const mockProfiles: KampmaxProfile[] = [
  {
    key: "customer",
    label: "Customer",
    description: "Shop, track orders and earn rewards on campus.",
    active: true,
    cta: undefined,
    sameAccount: true,
  },
  {
    key: "vendor",
    label: "Vendor",
    description: "Sell products to students on your campus.",
    active: false,
    cta: "Become a Vendor",
    sameAccount: true,
  },
  {
    key: "freelancer",
    label: "Freelancer",
    description: "Offer gigs and freelance services.",
    active: false,
    cta: "Become a Freelancer",
    sameAccount: true,
  },
  {
    key: "service_provider",
    label: "Service Provider",
    description: "List services such as repairs, tutorials and delivery.",
    active: false,
    cta: "Offer Services",
    sameAccount: true,
  },
  {
    key: "employer",
    label: "Employer / Client",
    description: "Post jobs and hire students.",
    active: false,
    cta: "Hire / Post Jobs",
    sameAccount: true,
  },
  {
    key: "ambassador",
    label: "Campus Ambassador",
    description: "Represent Kampmax on your campus.",
    active: false,
    cta: "Become an Ambassador",
    sameAccount: true,
  },
];

export const ACTIVE_PROFILE_KEYS: ActiveProfile[] = ["customer"];

export function tierLabel(tier: LoyaltyTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
