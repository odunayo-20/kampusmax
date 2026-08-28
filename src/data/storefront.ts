import type {
  StoreAbout,
  StoreAvailabilityStatus,
  StoreDeliveryInfo,
  StorePolicy,
  StoreVerificationStatus,
} from "@/types/storefront";

// ============================================================
// PUBLIC STOREFRONT MOCK DATA
// ============================================================
//
// This data is what the backend would expose through a *public* vendor
// storefront endpoint. It contains ONLY public-facing information.
//
// SECURITY: never place internal vendor data here (bank/payout details,
// moderation data, risk scores, private contact info, verification documents).
// These fields are intentionally omitted.

export interface StorefrontMeta {
  vendorId: string;
  logo?: string;
  tagline: string;
  verificationStatus: StoreVerificationStatus;
  availabilityStatus: StoreAvailabilityStatus;
  followers: number;
  established?: string;
  responseTime?: string;
  about: StoreAbout;
  policies: StorePolicy[];
  delivery: StoreDeliveryInfo;
  contactSupported: boolean;
  /** Future service providers may support services. */
  supportsServices: boolean;
}

const defaultAbout = (description: string): StoreAbout => ({
  description,
  campus: "Rufus Giwa Polytechnic",
  operatingHours: "Mon – Sat, 9:00am – 6:00pm",
  established: "2024",
  businessCategory: "Campus Store",
  yearsActive: 1,
  responseTime: "Usually replies within a few hours",
});

const defaultDelivery: StoreDeliveryInfo = {
  campusDelivery: true,
  pickupAvailable: true,
  deliveryAreas: ["Hostel blocks", "Lecture halls", "Main campus"],
  estimatedDelivery: "1 – 2 days on campus",
  deliveryPolicy:
    "Campus deliveries within the same day if ordered before 4pm. Pickup available at the vendor's collection point.",
};

export const storefrontMeta: Record<string, StorefrontMeta> = {
  v1: {
    vendorId: "v1",
    tagline: "Electronics and gadgets, tested and verified.",
    verificationStatus: "verified",
    availabilityStatus: "active",
    followers: 342,
    established: "2024",
    responseTime: "Usually replies within 2 hours",
    about: {
      ...defaultAbout(
        "TechHub Owo is a campus electronics store. We sell phones, laptops, chargers, speakers and accessories — every unit tested and verified before listing."
      ),
      responseTime: "Usually replies within 2 hours",
    },
    policies: [
      {
        type: "returns",
        title: "Return policy",
        body: "Items can be returned within 7 days of delivery if malfunctioning, in their original packaging.",
        enabled: true,
      },
      {
        type: "refunds",
        title: "Refund policy",
        body: "Refunds are issued to your Kampmax wallet or original payment method once the returned item is inspected.",
        enabled: true,
      },
      {
        type: "cancellation",
        title: "Cancellation policy",
        body: "Orders can be cancelled before the vendor confirms. After confirmation, contact the vendor directly.",
        enabled: true,
      },
      {
        type: "delivery",
        title: "Delivery policy",
        body: "Same-day campus delivery if ordered before 4pm. Meetup and pickup also supported.",
        enabled: true,
      },
      {
        type: "pickup",
        title: "Pickup policy",
        body: "Pickup is available at the TechHub collection point after you receive a 'Ready for pickup' notification.",
        enabled: true,
      },
    ],
    delivery: {
      ...defaultDelivery,
      deliveryPolicy:
        "Same-day campus delivery if ordered before 4pm. Pickup available at the TechHub collection point.",
    },
    contactSupported: true,
    supportsServices: false,
  },

  v2: {
    vendorId: "v2",
    tagline: "Trendy fashion for the modern campus student.",
    verificationStatus: "verified",
    availabilityStatus: "active",
    followers: 218,
    established: "2024",
    responseTime: "Usually replies within 3 hours",
    about: {
      ...defaultAbout(
        "StyleByChi brings the latest sneakers, hoodies, tees and accessories to campus at student-friendly prices."
      ),
      responseTime: "Usually replies within 3 hours",
    },
    policies: [
      {
        type: "returns",
        title: "Return policy",
        body: "Unworn items with tags can be exchanged within 48 hours of delivery.",
        enabled: true,
      },
      {
        type: "cancellation",
        title: "Cancellation policy",
        body: "Cancellations accepted before the vendor confirms.",
        enabled: true,
      },
      {
        type: "delivery",
        title: "Delivery policy",
        body: "Delivery and meetup options available on campus.",
        enabled: true,
      },
      {
        type: "refunds",
        title: "Refund policy",
        body: "Store policies have not been configured for refunds.",
        enabled: false,
      },
      {
        type: "pickup",
        title: "Pickup policy",
        body: "Store policies have not been configured for pickup.",
        enabled: false,
      },
    ],
    delivery: defaultDelivery,
    contactSupported: true,
    supportsServices: false,
  },

  v3: {
    vendorId: "v3",
    tagline: "Fresh, affordable meals delivered to you.",
    verificationStatus: "verified",
    availabilityStatus: "active",
    followers: 520,
    established: "2024",
    responseTime: "Usually replies within 1 hour",
    about: {
      ...defaultAbout(
        "CampusBites serves fresh, affordable meals — rice, noodles, suya and more — delivered straight to your hostel or lecture hall."
      ),
      responseTime: "Usually replies within 1 hour",
    },
    policies: [
      {
        type: "cancellation",
        title: "Cancellation policy",
        body: "Food orders can be cancelled within 10 minutes of placing.",
        enabled: true,
      },
      {
        type: "delivery",
        title: "Delivery policy",
        body: "Hot delivery across hostels and lecture halls. Fast and reliable.",
        enabled: true,
      },
      {
        type: "returns",
        title: "Return policy",
        body: "Store policies have not been configured.",
        enabled: false,
      },
      {
        type: "refunds",
        title: "Refund policy",
        body: "Store policies have not been configured.",
        enabled: false,
      },
      {
        type: "pickup",
        title: "Pickup policy",
        body: "Store policies have not been configured.",
        enabled: false,
      },
    ],
    delivery: defaultDelivery,
    contactSupported: true,
    supportsServices: false,
  },

  v4: {
    vendorId: "v4",
    tagline: "Textbooks and academic materials for every department.",
    verificationStatus: "verified",
    availabilityStatus: "active",
    followers: 95,
    established: "2023",
    responseTime: "Usually replies within a day",
    about: {
      ...defaultAbout(
        "IfeBookStore sells new and used textbooks and academic materials for all departments at OAU."
      ),
      campus: "Obafemi Awolowo University",
      responseTime: "Usually replies within a day",
    },
    policies: [
      {
        type: "returns",
        title: "Return policy",
        body: "Books can be returned within 7 days if in resaleable condition.",
        enabled: true,
      },
      {
        type: "delivery",
        title: "Delivery policy",
        body: "Delivery available across OAU campus and meetups.",
        enabled: true,
      },
    ],
    delivery: defaultDelivery,
    contactSupported: true,
    supportsServices: false,
  },

  v5: {
    vendorId: "v5",
    tagline: "Official and custom OAU merch.",
    verificationStatus: "pending",
    availabilityStatus: "active",
    followers: 41,
    established: "2024",
    responseTime: "Usually replies within 4 hours",
    about: {
      ...defaultAbout(
        "OAU Merch Shop sells official and custom OAU t-shirts, hoodies, caps and accessories."
      ),
      campus: "Obafemi Awolowo University",
      responseTime: "Usually replies within 4 hours",
    },
    policies: [
      {
        type: "delivery",
        title: "Delivery policy",
        body: "Delivery and pickup available on campus.",
        enabled: true,
      },
    ],
    delivery: defaultDelivery,
    contactSupported: true,
    supportsServices: false,
  },

  v6: {
    vendorId: "v6",
    tagline: "Quality gadgets for UI students.",
    verificationStatus: "verified",
    availabilityStatus: "active",
    followers: 167,
    established: "2023",
    responseTime: "Usually replies within 3 hours",
    about: {
      ...defaultAbout("UI Gadgets offers quality phones, laptops and accessories for University of Ibadan students."),
      campus: "University of Ibadan",
      responseTime: "Usually replies within 3 hours",
    },
    policies: [
      {
        type: "returns",
        title: "Return policy",
        body: "Defective electronics can be returned within 7 days.",
        enabled: true,
      },
      {
        type: "delivery",
        title: "Delivery policy",
        body: "Campus delivery across UI.",
        enabled: true,
      },
    ],
    delivery: defaultDelivery,
    contactSupported: true,
    supportsServices: false,
  },

  v7: {
    vendorId: "v7",
    tagline: "One-stop shop for UNILAG students.",
    verificationStatus: "verified",
    availabilityStatus: "temporarily_unavailable",
    followers: 88,
    established: "2023",
    responseTime: "Usually replies within a day",
    about: {
      ...defaultAbout(
        "Lagos Campus Mall offers electronics, fashion, food and academic materials for UNILAG students."
      ),
      campus: "University of Lagos",
      responseTime: "Usually replies within a day",
    },
    policies: [
      {
        type: "delivery",
        title: "Delivery policy",
        body: "Campus delivery across UNILAG.",
        enabled: true,
      },
    ],
    delivery: defaultDelivery,
    contactSupported: true,
    supportsServices: false,
  },
};

/** Verification state that maps to a customer-facing label without exposing reasons. */
export const VERIFICATION_LABEL: Record<StoreVerificationStatus, string> = {
  verified: "Verified Vendor",
  pending: "Pending Verification",
  unverified: "Unverified",
  restricted: "Restricted",
};

/** Availability state shown to customers without exposing internal reasons. */
export const AVAILABILITY_LABEL: Record<StoreAvailabilityStatus, string> = {
  active: "Open",
  temporarily_unavailable: "Temporarily Unavailable",
  suspended: "Closed",
  closed: "Closed",
};
