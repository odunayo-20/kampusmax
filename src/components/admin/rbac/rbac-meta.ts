import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  Landmark,
  Megaphone,
  MessagesSquare,
  Package,
  Scale,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Tags,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { RbacAction, RbacResource } from "@/types/admin";

// ------------------------------------------------------------
// Display metadata for the RBAC console
// ------------------------------------------------------------

export const RESOURCE_LABELS: Record<RbacResource, string> = {
  users: "Users",
  campuses: "Campuses",
  vendors: "Vendors",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  payments: "Payments",
  wallet: "Wallet",
  withdrawals: "Withdrawals",
  promotions: "Promotions",
  campus_content: "Campus Content",
  reviews: "Reviews",
  disputes: "Disputes",
  notifications: "Notifications",
  reports: "Reports",
  settings: "Settings",
};

export const RESOURCE_ICONS: Record<RbacResource, LucideIcon> = {
  users: Users,
  campuses: Building2,
  vendors: Store,
  products: Package,
  categories: Tags,
  orders: ShoppingBag,
  payments: CreditCard,
  wallet: Wallet,
  withdrawals: Landmark,
  promotions: Megaphone,
  campus_content: MessagesSquare,
  reviews: Star,
  disputes: Scale,
  notifications: Bell,
  reports: BarChart3,
  settings: Settings,
};

export const RESOURCE_DESCRIPTIONS: Record<RbacResource, string> = {
  users: "Student and vendor accounts across the platform.",
  campuses: "Campus lifecycle, coverage and admin assignments.",
  vendors: "Store onboarding, verification and trading status.",
  products: "Listings lifecycle from review to takedown.",
  categories: "Marketplace taxonomy and display order.",
  orders: "Order inspection, edits and operational overrides.",
  payments: "Ledger visibility and payment operations.",
  wallet: "Wallet balances and credit/debit adjustments.",
  withdrawals: "Vendor payout requests and approvals.",
  promotions: "Discounts, codes and featured placements.",
  campus_content: "Feed posts, comments, events, polls and announcements.",
  reviews: "Product and vendor feedback moderation.",
  disputes: "Customer dispute cases and resolution flow.",
  notifications: "Broadcast composer and delivery history.",
  reports: "Platform analytics and export tooling.",
  settings: "Global platform configuration.",
};

export const ACTION_LABELS: Record<RbacAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  approve: "Approve",
  suspend: "Suspend",
  manage: "Manage",
};

export const ACTION_HINTS: Record<RbacAction, string> = {
  view: "See this resource in the console.",
  create: "Add new records of this resource.",
  edit: "Change existing records.",
  delete: "Permanently remove records.",
  approve: "Sign off items waiting for review.",
  suspend: "Temporarily hide or pause records.",
  manage: "Advanced lifecycle operations beyond edit.",
};

/** Column order used by the matrix UI. */
export const ACTION_COLUMN_ORDER: RbacAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "suspend",
  "manage",
];
