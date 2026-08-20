import {
  SavedAddress,
  SavedPaymentMethod,
  NotificationPreferences,
  PrivacySettings,
  SecuritySettings,
  LoyaltyProgram,
} from "@/types";

export const savedAddresses: SavedAddress[] = [
  {
    id: "addr1",
    label: "Hostel",
    address: "Block C, Room 12, RUGIPO Student Village, Owo",
    campusId: "rugipo",
    isDefault: true,
    contactName: "Adebayo Oluwaseun",
    contactPhone: "+234 812 345 6789",
    notes: "Ask the security guard to call me",
  },
  {
    id: "addr2",
    label: "Lecture Hall Area",
    address: "Near Science Block, RUGIPO Main Campus, Owo",
    campusId: "rugipo",
    isDefault: false,
    contactName: "Adebayo Oluwaseun",
    contactPhone: "+234 812 345 6789",
  },
  {
    id: "addr3",
    label: "Home (Owo Town)",
    address: "15 Obalogbo Street, Owo, Ondo State",
    campusId: "rugipo",
    isDefault: false,
    contactName: "Chief Oluwaseun",
    contactPhone: "+234 801 234 5678",
    notes: "Weekend deliveries only",
  },
];

export const savedPaymentMethods: SavedPaymentMethod[] = [
  {
    id: "pm1",
    type: "card",
    label: "GTBank Verve Card",
    last4: "4567",
    brand: "Verve",
    isDefault: true,
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "pm2",
    type: "card",
    label: "Opay Debit Card",
    last4: "8901",
    brand: "Mastercard",
    isDefault: false,
    createdAt: "2025-01-08T14:30:00Z",
  },
  {
    id: "pm3",
    type: "bank_account",
    label: "GTBank Savings",
    last4: "4567",
    bankName: "Guaranty Trust Bank",
    isDefault: false,
    createdAt: "2024-12-20T09:00:00Z",
  },
];

export const defaultNotificationPreferences: NotificationPreferences = {
  orderUpdates: true,
  messages: true,
  promotions: false,
  community: true,
  system: true,
  emailDigest: true,
  pushEnabled: true,
};

export const defaultPrivacySettings: PrivacySettings = {
  showProfileToStudents: true,
  showPhoneToVendors: false,
  showEmailToVendors: false,
  allowDirectMessages: true,
  showOnlineStatus: true,
  showOrderHistory: false,
};

export const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: "sms",
  lastPasswordChange: "2025-01-10T08:00:00Z",
  activeSessions: 2,
  loginNotifications: true,
};

export const loyaltyProgram: LoyaltyProgram = {
  points: 1250,
  tier: "silver",
  pointsToNairaRate: 1,
  lifetimePoints: 4800,
};

export const faqItems = [
  {
    id: "faq1",
    question: "How do I place an order?",
    answer:
      "Browse the marketplace, add items to your cart, and proceed to checkout. You can pay via Paystack, bank transfer, wallet, or cash on delivery for campus pickups.",
  },
  {
    id: "faq2",
    question: "How does campus pickup work?",
    answer:
      "When you select campus pickup at checkout, you'll be shown available pickup points on your campus. After the vendor confirms your order, collect it at the designated location.",
  },
  {
    id: "faq3",
    question: "Can I cancel an order?",
    answer:
      "Yes, you can cancel orders that are in 'Placed' or 'Confirmed' status. Once the vendor starts preparing your order, cancellation is no longer available. Contact support for special cases.",
  },
  {
    id: "faq4",
    question: "How do I become a vendor?",
    answer:
      "Register as a vendor during sign-up or switch your account type in Settings. You'll need to provide your store name and campus. Verified vendors can list products on the marketplace.",
  },
  {
    id: "faq5",
    question: "How are loyalty points calculated?",
    answer:
      "You earn 5% of your order value as loyalty points (1 point = ₦1). Points can be redeemed at checkout for up to 30% of your order total. Your tier increases with more lifetime points.",
  },
  {
    id: "faq6",
    question: "What payment methods are supported?",
    answer:
      "Kampmax supports Paystack (cards, bank transfer, USSD), direct bank transfer, Kampmax Wallet, and cash on delivery for campus pickups.",
  },
];

export const supportContact = {
  email: "support@kampmax.com",
  phone: "+234 800 KAMPMAX (526 7629)",
  whatsapp: "+234 812 000 0000",
  hours: "Mon - Fri, 8:00 AM - 6:00 PM WAT",
  campusReps: "Available during orientation week",
};
