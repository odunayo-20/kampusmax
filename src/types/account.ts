import type { LoyaltyTier, OrderStatus, Review } from "./index";

// ============================================================
// CUSTOMER ACCOUNT DOMAIN TYPES
// ============================================================
//
// These map 1:1 to a future `GET /me/*` account API. All balances and reward
// values are display-only — the backend remains authoritative for balances,
// reward conversions, and entitlement.

export type ActiveProfile =
  | "customer"
  | "vendor"
  | "freelancer"
  | "service_provider"
  | "employer"
  | "ambassador";

export interface KampmaxProfile {
  key: ActiveProfile;
  label: string;
  description: string;
  /** True only when the profile is actually active for the current user. */
  active: boolean;
  /** Call-to-action label when the profile is not yet active, e.g. "Become a Vendor". */
  cta?: string;
  /** Future onboarding/switching route. */
  route?: string;
  /** Map to the same user account — never a separate auth account. */
  sameAccount: true;
}

// ── Kampmax Coin (readiness) ─────────────────────────────────────────────

export type KampmaxCoinTransactionType =
  | "earned_purchase"
  | "earned_referral"
  | "spent"
  | "pending";

export interface KampmaxCoinTransaction {
  id: string;
  type: KampmaxCoinTransactionType;
  description: string;
  amount: number; // KMC
  nairaValue: number; // display only — backend authoritative
  created: string;
}

export interface KampmaxCoinAccount {
  /** Backend flag — when false the program isn't active and must show a coming-soon state. */
  isActive: boolean;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  pending: number;
  available: number;
  transactions: KampmaxCoinTransaction[];
  /** Set when the backend has not enabled Kampmax Coin. */
  disabledReason?: string;
}

// ── Loyalty / Rewards ────────────────────────────────────────────────────

export type RewardEventType = "earned" | "used" | "pending";

export interface RewardEvent {
  id: string;
  type: RewardEventType;
  points: number;
  description: string;
  createdAt: string;
}

export interface RewardsAccount {
  points: number;
  tier: LoyaltyTier;
  pointsToNairaRate: number; // display only — backend authoritative
  lifetimePoints: number;
  earned: number;
  used: number;
  pending: number;
  history: RewardEvent[];
}

// ── Dashboard summary ────────────────────────────────────────────────────

export interface AccountOrderStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface AccountOverview {
  userId: string;
  orderStats: AccountOrderStats;
  wishlistCount: number;
  savedForLaterCount: number;
  unreadNotifications: number;
  coin: Pick<KampmaxCoinAccount, "isActive" | "balance">;
  rewards: Pick<RewardsAccount, "points" | "tier" | "pending">;
  recentOrders: import("./index").Order[];
  // VS-grade future: profiles attached to the same account
  profiles: KampmaxProfile[];
}

// ── Multi-vendor / tracking config keys ─────────────────────────────────

export interface OrderVendorGroup {
  vendorId: string;
  vendorName: string;
  items: import("./index").Order["items"];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  estimatedDelivery?: string;
}
