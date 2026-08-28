import type { UserRole } from "@/types";

/**
 * Footer navigation configuration.
 *
 * Internal links use Next.js `Link` (client-side navigation). Any route that
 * does not yet exist in the app is marked with `placeholder: true` so it can
 * be wired up once the corresponding page ships. Placeholders render as
 * non-navigating, disabled-looking anchors so they never cause a 404 or a
 * page reload gut.
 */

export interface FooterLink {
  label: string;
  href: string;
  /** True when the target route does not exist yet. */
  placeholder?: boolean;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export const footerSections: FooterSection[] = [
  {
    id: "shop",
    title: "Shop",
    links: [
      { label: "Browse Products", href: "/marketplace" },
      { label: "Categories", href: "/marketplace" },
      { label: "Nearby Vendors", href: "/marketplace", placeholder: true },
      { label: "Featured Products", href: "/marketplace", placeholder: true },
      { label: "Deals & Offers", href: "/marketplace", placeholder: true },
      { label: "New Arrivals", href: "/marketplace", placeholder: true },
    ],
  },
  {
    id: "services",
    title: "Services & Opportunities",
    links: [
      { label: "Find Services", href: "/services", placeholder: true },
      { label: "Find Freelancers", href: "/services", placeholder: true },
      { label: "Post a Service", href: "/services", placeholder: true },
      { label: "Find Jobs", href: "/jobs", placeholder: true },
      { label: "Post a Job", href: "/jobs", placeholder: true },
      { label: "Become a Service Provider", href: "/services", placeholder: true },
    ],
  },
  {
    id: "sell",
    title: "Sell & Earn",
    links: [
      { label: "Become a Vendor", href: "/vendor", placeholder: true },
      { label: "Vendor Dashboard", href: "/vendor" },
      { label: "Vendor Resources", href: "/vendor", placeholder: true },
      { label: "Become a Campus Ambassador", href: "/onboarding", placeholder: true },
      { label: "Referral Program", href: "/profile", placeholder: true },
      { label: "Earning Opportunities", href: "/vendor/earnings", placeholder: true },
    ],
  },
  {
    id: "help",
    title: "Help & Company",
    links: [
      { label: "Help Center", href: "/profile/help", placeholder: true },
      { label: "Contact Us", href: "/profile/help", placeholder: true },
      { label: "About Kampmax", href: "/home", placeholder: true },
      { label: "Safety & Trust", href: "/home", placeholder: true },
      { label: "FAQs", href: "/profile/help", placeholder: true },
      { label: "Terms & Conditions", href: "/profile/help", placeholder: true },
      { label: "Privacy Policy", href: "/profile/help", placeholder: true },
      { label: "Refund Policy", href: "/profile/help", placeholder: true },
    ],
  },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/profile/help", placeholder: true },
  { label: "Terms & Conditions", href: "/profile/help", placeholder: true },
  { label: "Refund Policy", href: "/profile/help", placeholder: true },
  { label: "Cookie Policy", href: "/profile/help", placeholder: true },
];

export function getLegalLinks(): FooterLink[] {
  return LEGAL_LINKS;
}

export type FooterRole = UserRole | "freelancer" | "employer" | "ambassador";

/**
 * Contextual quick links surfaced for the current user, based on role.
 * Only roles that exist in the current app (`student`, `vendor`) produce
 * links today; the other role types are reserved for the future ecosystem.
 */
const CONTEXTUAL_LINKS: Record<FooterRole, FooterLink[]> = {
  student: [
    { label: "My Orders", href: "/orders" },
    { label: "Wishlist", href: "/profile/wishlist" },
    { label: "My Account", href: "/profile" },
  ],
  vendor: [
    { label: "Vendor Dashboard", href: "/vendor" },
    { label: "Products", href: "/vendor/products" },
    { label: "Orders", href: "/vendor/orders" },
    { label: "Wallet", href: "/vendor/wallet" },
  ],
  admin: [],
  freelancer: [
    { label: "Services", href: "/services", placeholder: true },
    { label: "Jobs", href: "/jobs", placeholder: true },
    { label: "Proposals", href: "/profile", placeholder: true },
    { label: "Earnings", href: "/profile/wallet", placeholder: true },
  ],
  employer: [
    { label: "Post Job", href: "/jobs", placeholder: true },
    { label: "Manage Jobs", href: "/jobs", placeholder: true },
    { label: "Applicants", href: "/jobs", placeholder: true },
  ],
  ambassador: [
    { label: "Ambassador Dashboard", href: "/profile", placeholder: true },
    { label: "Referrals", href: "/profile", placeholder: true },
    { label: "Earnings", href: "/profile/wallet", placeholder: true },
  ],
};

export function getContextualLinks(role: FooterRole): FooterLink[] {
  return CONTEXTUAL_LINKS[role];
}
