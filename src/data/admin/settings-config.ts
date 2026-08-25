import { PlatformSettingsConfig } from "@/types/admin";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/settings MODULE
//
// Values reconcile with the legacy key/value mockSettings seed
// (8% commission, N500 delivery fee, N2,000 withdrawal minimum,
// twice-daily payouts, BVN required).
//
// PERSISTENCE IS IN-MEMORY ONLY: saves mutate the runtime copy and
// reset on reload. The real backend will own durability.
// ------------------------------------------------------------

export const defaultSettingsConfig: PlatformSettingsConfig = {
  general: {
    platformName: "Kampmax",
    logoUrl: "",
    supportEmail: "help@kampmax.ng",
    supportPhone: "+234 800 000 0000",
  },
  marketplace: {
    commissionRate: 8,
    requireProductApproval: true,
    requireVendorApproval: true,
    cancellation: {
      policy: "before_dispatch",
      autoApproveCustomerCancellations: false,
      cancellationWindowHours: 24,
    },
  },
  orders: {
    delivery: {
      enableHostelDelivery: true,
      deliveryFee: 500,
      freeDeliveryThreshold: 25_000,
    },
    pickup: {
      enablePickupStations: true,
      pickupHoldHours: 48,
    },
    timeouts: {
      vendorAcceptMinutes: 30,
      customerCheckoutMinutes: 15,
    },
  },
  financial: {
    platformFeeRate: 8,
    withdrawalMinimum: 2_000,
    withdrawalFee: 100,
    payoutSchedule: "twice_daily",
    requireBvnForPayouts: true,
  },
  loyalty: {
    pointsPerNaira: 1,
    maxRedemptionPercent: 30,
    pointsExpirationDays: 365,
    enabled: true,
  },
  notifications: {
    orderAlerts: true,
    paymentFailureAlerts: true,
    disputeEscalations: true,
    newVendorSignups: false,
    weeklyDigestEmail: true,
    securityAlerts: true,
  },
  security: {
    sessionTimeoutMinutes: 60,
    maxConcurrentSessions: 3,
    enforceTwoFactor: false,
    passwordMinLength: 10,
    lockoutAfterFailedAttempts: 5,
  },
};

export function createSettingsConfigSeed(): PlatformSettingsConfig {
  return JSON.parse(JSON.stringify(defaultSettingsConfig)) as PlatformSettingsConfig;
}
