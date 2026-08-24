// ============================================================
// KAMPMAX ADMIN - CENTRALIZED TYPES
// Single source of truth for the admin panel domain model.
// Mirrors the future NestJS API resource shapes 1:1.
// ============================================================

// ------------------------------------------------------------
// AUTH & ROLES
// ------------------------------------------------------------

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "CAMPUS_ADMIN";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  campusId: string | null; // scoped campus for CAMPUS_ADMIN
  avatar: string;
  title: string;
  lastLoginAt: string;
}

// ------------------------------------------------------------
// LIST / PAGINATION CONTRACT (mirrors NestJS pagination DTOs)
// ------------------------------------------------------------

export type SortDir = "asc" | "desc";

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDir;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface RangeFilter {
  from?: string; // ISO date
  to?: string; // ISO date
}

// ------------------------------------------------------------
// CAMPUSES
// ------------------------------------------------------------

export type CampusStatus = "active" | "inactive";

export interface Campus {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  status: CampusStatus;
  studentCount: number;
  activeVendors: number;
  activeListings: number;
  ordersThisMonth: number;
  gmvThisMonth: number;
  launchDate: string;
}

// ------------------------------------------------------------
// USERS (customers + vendor owners, as seen by admin)
// ------------------------------------------------------------

export type PlatformUserKind = "student" | "vendor";
export type PlatformUserStatus = "active" | "suspended" | "banned";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  kind: PlatformUserKind;
  campusId: string;
  status: PlatformUserStatus;
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt: string;
  ordersCount: number;
  totalSpent: number;
  walletBalance: number;
  disputeCount: number;
}

// ------------------------------------------------------------
// USER MANAGEMENT (/admin/users console)
// Full platform directory - customers, vendors and staff accounts -
// governed from the dedicated users module.
// ------------------------------------------------------------

export type ManagedUserRole =
  | "customer"
  | "vendor"
  | "campus_admin"
  | "admin"
  | "super_admin";

export type ManagedUserStatus =
  | "active"
  | "suspended"
  | "pending_verification"
  | "deactivated";

/** Store details attached when role === "vendor". */
export interface ManagedVendorProfile {
  storeName: string;
  category: string;
  status: VendorStatus;
  rating: number;
  reviewsCount: number;
  productsCount: number;
  totalSales: number;
  fulfillmentRate: number;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ManagedUserRole;
  campusId: string;
  status: ManagedUserStatus;
  isVerified: boolean;
  joinedAt: string;
  lastActiveAt: string;
  ordersCount: number;
  totalSpent: number;
  walletBalance: number;
  disputeCount: number;
  reportsCount: number;
  vendorProfile: ManagedVendorProfile | null;
}

export interface ManagedUserUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: ManagedUserRole;
  campusId?: string;
}

export interface UserStatusCounts {
  all: number;
  active: number;
  suspended: number;
  pending_verification: number;
  deactivated: number;
}

export type UserActivityKind =
  | "order"
  | "auth"
  | "wallet"
  | "listing"
  | "moderation"
  | "profile"
  | "admin";

export interface UserActivityEvent {
  id: string;
  kind: UserActivityKind;
  message: string;
  meta: string;
  at: string;
}

export interface UserOrderSummary {
  id: string;
  itemsSummary: string;
  itemsCount: number;
  total: number;
  status: AdminOrderStatus;
  paymentMethod: AdminOrder["paymentMethod"];
  paymentStatus: AdminOrder["paymentStatus"];
  createdAt: string;
}

export interface UserWalletTxn {
  id: string;
  direction: WalletTxnDirection;
  type: AdminWalletTxn["type"];
  amount: number;
  reference: string;
  status: WalletTxnStatus;
  createdAt: string;
}

export interface UserWalletSummary {
  accountId: string;
  balance: number;
  totalCredited: number;
  totalDebited: number;
  status: WalletAccountStatus;
  lastActivityAt: string;
  recentTransactions: UserWalletTxn[];
}

export interface UserProfileReport {
  id: string;
  reason: ContentReport["reason"];
  detail: string;
  reporterName: string;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: string;
}

/** Full payload backing the user profile drawer. */
export interface ManagedUserDetail {
  user: ManagedUser;
  campus: Campus | null;
  wallet: UserWalletSummary;
  orders: UserOrderSummary[];
  activity: UserActivityEvent[];
  reports: UserProfileReport[];
}

// ------------------------------------------------------------
// CAMPUS MANAGEMENT (/admin/campuses console)
// Campuses supported by Kampmax - governed from the dedicated
// campuses module. Ids mirror `Campus` so every campus-scoped
// record in the platform keeps resolving.
// ------------------------------------------------------------

export type CampusAdminAssignmentStatus = "active" | "invited";

export interface CampusAdminAssignment {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CampusAdminAssignmentStatus;
  assignedAt: string;
}

export interface ManagedCampus {
  id: string;
  /** Campus name (e.g. "RUGIPO Main Campus"). */
  name: string;
  /** Owning institution (e.g. "Rufus Giwa Polytechnic"). */
  institution: string;
  shortName: string;
  state: string;
  city: string;
  address: string;
  description: string;
  /** Logo URL or text monogram; null falls back to shortName initials. */
  logo: string | null;
  status: CampusStatus;
  usersCount: number;
  activeUsersCount: number;
  vendorsCount: number;
  productsCount: number;
  ordersCount: number;
  revenue: number;
  admins: CampusAdminAssignment[];
  createdAt: string;
}

export type CampusActivityKind =
  | "order"
  | "vendor"
  | "user"
  | "listing"
  | "moderation"
  | "admin";

export interface CampusActivityEvent {
  id: string;
  kind: CampusActivityKind;
  message: string;
  meta: string;
  at: string;
}

export interface CampusOverviewStats {
  totalStudents: number;
  totalUsers: number;
  activeUsers: number;
  vendors: number;
  products: number;
  orders: number;
  revenue: number;
  adminsCount: number;
}

export interface CampusStatusCounts {
  all: number;
  active: number;
  inactive: number;
}

export interface CampusCreateInput {
  institution: string;
  name: string;
  state: string;
  city: string;
  address?: string;
  description?: string;
  logo?: string | null;
  status: CampusStatus;
}

export interface CampusAdminInput {
  name: string;
  email: string;
  phone: string;
}

export interface ManagedCampusDetail {
  campus: ManagedCampus;
  stats: CampusOverviewStats;
  activity: CampusActivityEvent[];
}

// ------------------------------------------------------------
// VENDORS
// ------------------------------------------------------------

export type VendorStatus = "pending" | "approved" | "suspended" | "rejected";

export interface AdminVendor {
  id: string;
  storeName: string;
  ownerId: string;
  ownerName: string;
  email: string;
  phone: string;
  campusId: string;
  category: string;
  status: VendorStatus;
  rating: number;
  reviewsCount: number;
  productsCount: number;
  totalSales: number;
  walletBalance: number;
  fulfillmentRate: number;
  joinedAt: string;
}

// ------------------------------------------------------------
// VENDOR MANAGEMENT (/admin/vendors console)
// Two-axis lifecycle: verification (documents) x store status
// (trading). The five console buckets are mutually exclusive:
//   pending_verification | verified(active) | rejected |
//   suspended | deactivated
// ------------------------------------------------------------

export type VendorVerificationStatus =
  | "pending_verification"
  | "verified"
  | "rejected";

export type VendorStoreLifecycle = "active" | "suspended" | "deactivated";

/** Console bucket - collapses both axes into one of five queues. */
export type VendorBucket =
  | "pending_verification"
  | "verified"
  | "rejected"
  | "suspended"
  | "deactivated";

export type VendorVerificationDocKind =
  | "cac_certificate"
  | "government_id"
  | "address_proof"
  | "bank_details"
  | "campus_permit";

export type VendorDocState = "submitted" | "approved" | "rejected" | "missing";

export interface VendorVerificationDocument {
  id: string;
  kind: VendorVerificationDocKind;
  label: string;
  reference: string;
  state: VendorDocState;
  note?: string;
}

export interface VendorVerificationRecord {
  emailVerified: boolean;
  phoneVerified: boolean;
  bvnVerified: boolean;
  documents: VendorVerificationDocument[];
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export interface ManagedVendorOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  isIdVerified: boolean;
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
}

export interface ManagedVendor {
  id: string;
  storeName: string;
  ownerId: string;
  owner: ManagedVendorOwner;
  campusId: string;
  category: string;
  description: string;
  verificationStatus: VendorVerificationStatus;
  storeStatus: VendorStoreLifecycle;
  verification: VendorVerificationRecord;
  productsCount: number;
  ordersCount: number;
  /** Lifetime GMV through the store. */
  totalSales: number;
  /** Net after platform commission. */
  earnings: number;
  walletBalance: number;
  fulfillmentRate: number;
  rating: number;
  reviewsCount: number;
  complaintsCount: number;
  registeredAt: string;
  lastActiveAt: string;
}

export type VendorActivityKind =
  | "order"
  | "product"
  | "wallet"
  | "moderation"
  | "admin"
  | "auth";

export interface VendorActivityEvent {
  id: string;
  kind: VendorActivityKind;
  message: string;
  meta: string;
  at: string;
}

export interface VendorProductRow {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: AdminProduct["status"];
  soldCount: number;
  createdAt: string;
}

export interface VendorOrderRow {
  id: string;
  customerName: string;
  itemsSummary: string;
  itemsCount: number;
  total: number;
  status: AdminOrder["status"];
  paymentStatus: AdminOrder["paymentStatus"];
  createdAt: string;
}

export interface VendorReviewRow {
  id: string;
  customerName: string;
  targetName: string;
  rating: number;
  comment: string;
  status: AdminReviewStatus;
  createdAt: string;
}

export interface VendorComplaintRow {
  id: string;
  orderId: string;
  customerName: string;
  subject: string;
  category: DisputeCategory;
  priority: DisputePriority;
  amountInDispute: number;
  status: DisputeStatus;
  openedAt: string;
}

export interface VendorEarningsSummary {
  grossSales: number;
  commissionRate: number;
  commissionPaid: number;
  netEarnings: number;
  pendingPayout: number;
  lastPayoutAt: string | null;
}

export interface VendorStatusCounts {
  all: number;
  pending_verification: number;
  verified: number;
  rejected: number;
  suspended: number;
  deactivated: number;
}

export interface ManagedVendorDetail {
  vendor: ManagedVendor;
  campus: Campus | null;
  earnings: VendorEarningsSummary;
  products: VendorProductRow[];
  orders: VendorOrderRow[];
  reviews: VendorReviewRow[];
  complaints: VendorComplaintRow[];
  activity: VendorActivityEvent[];
}

// ------------------------------------------------------------
// CATEGORIES
// ------------------------------------------------------------

export type CategoryStatus = "active" | "archived";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide icon name key resolved in UI layer
  parentId: string | null;
  productCount: number;
  activeListings: number;
  sortOrder: number;
  status: CategoryStatus;
}

// ------------------------------------------------------------
// PRODUCTS
// ------------------------------------------------------------

export type AdminProductStatus =
  | "available"
  | "pending_review"
  | "flagged"
  | "sold"
  | "removed";

export interface AdminProduct {
  id: string;
  title: string;
  vendorId: string;
  vendorName: string;
  categoryId: string;
  categoryName: string;
  campusId: string;
  price: number;
  originalPrice: number | null;
  condition: "New" | "Used" | "Fair";
  status: AdminProductStatus;
  stock: number;
  views: number;
  saves: number;
  reportsCount: number;
  createdAt: string;
}

// ------------------------------------------------------------
// PRODUCT MANAGEMENT (/admin/products moderation console)
// Lifecycle: pending_approval -> active -> suspended/archived,
// with out_of_stock as a trading state and rejected for listings
// that never passed review.
// ------------------------------------------------------------

export type ManagedProductStatus =
  | "active"
  | "pending_approval"
  | "rejected"
  | "out_of_stock"
  | "suspended"
  | "archived";

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductModerationRecord {
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  suspensionReason: string | null;
}

export interface ManagedProduct {
  id: string;
  title: string;
  /** Remote showcase images (first entry = primary thumbnail). */
  images: string[];
  slug: string;
  description: string;
  specifications: ProductSpecification[];
  vendorId: string;
  vendorName: string;
  categoryId: string;
  categoryName: string;
  campusId: string;
  price: number;
  originalPrice: number | null;
  condition: AdminProduct["condition"];
  status: ManagedProductStatus;
  moderation: ProductModerationRecord;
  stock: number;
  views: number;
  saves: number;
  /** Units sold lifetime. */
  salesCount: number;
  /** Lifetime gross revenue through this listing. */
  revenue: number;
  rating: number;
  reviewsCount: number;
  reportsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductActivityKind =
  | "listing"
  | "order"
  | "moderation"
  | "admin"
  | "pricing";

export interface ProductActivityEvent {
  id: string;
  kind: ProductActivityKind;
  message: string;
  meta: string;
  at: string;
}

export interface ProductReviewRow {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  status: AdminReviewStatus;
  helpfulCount: number;
  createdAt: string;
}

export interface ProductFacets {
  categories: { id: string; name: string }[];
  campuses: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
}

export interface ProductStatusCounts {
  all: number;
  active: number;
  pending_approval: number;
  rejected: number;
  out_of_stock: number;
  suspended: number;
  archived: number;
}

export interface ManagedProductDetail {
  product: ManagedProduct;
  vendor: {
    id: string;
    storeName: string;
    campusId: string;
    rating: number;
    productsCount: number;
  };
  campus: Campus | null;
  reviews: ProductReviewRow[];
  reports: ContentReport[];
  activity: ProductActivityEvent[];
}

// ------------------------------------------------------------
// ORDERS
// ------------------------------------------------------------

export type AdminOrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface AdminOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vendorId: string;
  vendorName: string;
  campusId: string;
  itemsCount: number;
  itemsSummary: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "paystack" | "bank_transfer" | "wallet" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: AdminOrderStatus;
  deliveryMethod: "campus_pickup" | "meetup" | "delivery";
  createdAt: string;
}

// ------------------------------------------------------------
// PAYMENTS
// ------------------------------------------------------------

export type PaymentType =
  | "order_payment"
  | "wallet_funding"
  | "vendor_payout"
  | "refund"
  | "commission";

export type PaymentStatus = "successful" | "pending" | "failed" | "refunded";

export interface PaymentRecord {
  id: string;
  reference: string;
  userId: string;
  userName: string;
  counterparty: string | null; // vendor/store for order payments & payouts
  type: PaymentType;
  method: "paystack" | "wallet" | "bank_transfer" | "cod";
  amount: number;
  fee: number;
  status: PaymentStatus;
  createdAt: string;
}

// ------------------------------------------------------------
// WALLET
// ------------------------------------------------------------

export type WalletOwnerType = "user" | "vendor";
export type WalletAccountStatus = "active" | "frozen";

export interface WalletAccount {
  id: string;
  ownerType: WalletOwnerType;
  ownerName: string;
  ownerEmail: string;
  campusId: string;
  balance: number;
  totalCredited: number;
  totalDebited: number;
  status: WalletAccountStatus;
  lastActivityAt: string;
}

export type WalletTxnDirection = "credit" | "debit";
export type WalletTxnStatus = "completed" | "pending" | "failed";

export interface AdminWalletTxn {
  id: string;
  accountId: string;
  ownerName: string;
  ownerType: WalletOwnerType;
  direction: WalletTxnDirection;
  type:
    | "deposit"
    | "withdrawal"
    | "purchase"
    | "refund"
    | "vendor_payout"
    | "commission"
    | "adjustment";
  amount: number;
  balanceAfter: number;
  reference: string;
  status: WalletTxnStatus;
  createdAt: string;
}

// ------------------------------------------------------------
// WITHDRAWALS
// ------------------------------------------------------------

export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "approved"
  | "paid"
  | "rejected";

export interface WithdrawalRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  bankName: string;
  accountNumberMasked: string;
  accountName: string;
  amount: number;
  fee: number;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt: string | null;
  note: string | null;
}

// ------------------------------------------------------------
// PROMOTIONS
// ------------------------------------------------------------

export type PromotionType =
  | "discount"
  | "flash_sale"
  | "free_delivery"
  | "coupon";
export type PromotionScope = "platform" | "campus" | "vendor";
export type PromotionStatus = "scheduled" | "active" | "paused" | "ended";

export interface Promotion {
  id: string;
  title: string;
  type: PromotionType;
  scope: PromotionScope;
  code: string | null;
  discountValue: number | null; // percent or naira depending on type
  campusId: string | null;
  vendorName: string | null;
  usageCount: number;
  usageLimit: number | null;
  budget: number | null;
  spend: number;
  startsAt: string;
  endsAt: string;
  status: PromotionStatus;
}

// ------------------------------------------------------------
// CAMPUS CONTENT (feed moderation)
// ------------------------------------------------------------

export type CampusPostStatus = "published" | "flagged" | "removed" | "pending";
export type CampusPostType =
  | "discussion"
  | "question"
  | "event"
  | "marketplace"
  | "announcement"
  | "lost_found";

export interface CampusPost {
  id: string;
  authorId: string;
  authorName: string;
  campusId: string;
  type: CampusPostType;
  excerpt: string;
  status: CampusPostStatus;
  reportsCount: number;
  likes: number;
  comments: number;
  createdAt: string;
}

// ------------------------------------------------------------
// REPORTS (abuse/content reports)
// ------------------------------------------------------------

export type ReportTargetType = "post" | "product" | "user" | "review";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ReportPriority = "low" | "medium" | "high";

export interface ContentReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetPreview: string;
  reason: "spam" | "inappropriate" | "scam" | "harassment" | "counterfeit" | "other";
  detail: string;
  reporterName: string;
  reportedName: string;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: string;
}

// ------------------------------------------------------------
// REVIEWS
// ------------------------------------------------------------

export type AdminReviewStatus = "published" | "pending" | "flagged" | "removed";

export interface AdminReview {
  id: string;
  targetType: "product" | "vendor";
  targetName: string;
  customerId: string;
  customerName: string;
  vendorName: string;
  campusId: string;
  rating: number;
  comment: string;
  status: AdminReviewStatus;
  helpfulCount: number;
  createdAt: string;
}

// ------------------------------------------------------------
// DISPUTES
// ------------------------------------------------------------

export type DisputeStatus =
  | "open"
  | "under_review"
  | "awaiting_customer"
  | "resolved"
  | "closed";
export type DisputePriority = "low" | "medium" | "high" | "urgent";
export type DisputeCategory =
  | "item_not_received"
  | "item_not_as_described"
  | "damaged_item"
  | "late_delivery"
  | "refund_issue"
  | "other";

export interface Dispute {
  id: string;
  orderId: string;
  customerName: string;
  vendorName: string;
  subject: string;
  category: DisputeCategory;
  priority: DisputePriority;
  amountInDispute: number;
  status: DisputeStatus;
  messagesCount: number;
  openedAt: string;
  resolvedAt: string | null;
}

// ------------------------------------------------------------
// NOTIFICATIONS (broadcast console)
// ------------------------------------------------------------

export type BroadcastAudience =
  | "all"
  | "students"
  | "vendors"
  | "campus";
export type BroadcastStatus = "sent" | "scheduled" | "draft";

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  audience: BroadcastAudience;
  campusId: string | null;
  sentBy: string;
  sentAt: string;
  recipients: number;
  openRate: number;
  status: BroadcastStatus;
}

// ------------------------------------------------------------
// SETTINGS
// ------------------------------------------------------------

export type SettingValueType = "text" | "toggle" | "select" | "number";

export interface PlatformSetting {
  key: string;
  label: string;
  description?: string;
  group: "general" | "commerce" | "wallet" | "moderation";
  valueType: SettingValueType;
  value: string | boolean | number;
  options?: { label: string; value: string }[];
}

// ------------------------------------------------------------
// DASHBOARD ANALYTICS
// ------------------------------------------------------------

export interface DashboardStats {
  gmvToday: number;
  gmvDeltaPct: number;
  ordersToday: number;
  ordersDeltaPct: number;
  activeUsers: number;
  activeUsersDeltaPct: number;
  pendingWithdrawals: number;
  pendingWithdrawalsAmount: number;
  openDisputes: number;
  flaggedContent: number;
  commissionToday: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface TopVendorRow {
  vendorId: string;
  storeName: string;
  campusShortName: string;
  orders: number;
  revenue: number;
  rating: number;
}

export interface ActivityEvent {
  id: string;
  kind: "order" | "vendor" | "dispute" | "withdrawal" | "user" | "report";
  message: string;
  meta: string;
  at: string;
}

// ------------------------------------------------------------
// PLATFORM OVERVIEW (full /admin dashboard payload)
// ------------------------------------------------------------

export interface OverviewTotals {
  users: number;
  activeUsers: number;
  vendors: number;
  verifiedVendors: number;
  campuses: number;
  products: number;
  orders: number;
  revenue: number;
}

export interface FinancialMetrics {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  platformEarnings: number;
}

export interface MarketplaceMetrics {
  ordersToday: number;
  ordersThisWeek: number;
}

export interface OperationsQueue {
  pendingVendorVerification: number;
  pendingProductApproval: number;
  pendingWithdrawalRequests: number;
  reportedProducts: number;
  reportedUsers: number;
  openDisputes: number;
}

export interface PlatformOverview {
  totals: OverviewTotals;
  financial: FinancialMetrics;
  marketplace: MarketplaceMetrics;
  operations: OperationsQueue;
}

/** Generic labeled series point for charts. */
export interface SeriesPoint {
  label: string;
  value: number;
  secondary?: number;
}

/** Cumulative growth series (users/vendors) over weeks. */
export interface GrowthPoint {
  label: string;
  total: number;
  added: number;
}

export interface TopProductRow {
  productId: string;
  title: string;
  vendorName: string;
  campusShortName: string;
  unitsSold: number;
  revenue: number;
}

export interface CampusSalesRow {
  campusId: string;
  shortName: string;
  orders: number;
  revenue: number;
  sharePct: number;
}

export interface LowStockRow {
  productId: string;
  title: string;
  vendorName: string;
  stock: number;
  status: AdminProductStatus;
}

export type ActivityKind =
  | "order"
  | "registration"
  | "vendor_application"
  | "report";

export interface ActivityFeedItem {
  id: string;
  kind: ActivityKind;
  message: string;
  meta: string;
  at: string;
}

// ------------------------------------------------------------
// CATEGORY MANAGEMENT (/admin/categories)
// ------------------------------------------------------------

export type ManagedCategoryStatus = "active" | "inactive";

export interface ManagedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // lucide icon name key resolved in UI layer
  parentId: string | null;
  parentName: string | null;
  productCount: number; // products directly assigned to this category
  activeListings: number;
  subcategoryCount: number;
  totalProductCount: number; // includes descendants
  sortOrder: number; // position among siblings, 1-based
  status: ManagedCategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export type CategorySortField = "sortOrder" | "name" | "productCount";

export type CategoryReorderDirection = "up" | "down";

export interface CategoryListQuery extends ListQuery {
  search?: string;
  status?: ManagedCategoryStatus | "all";
  sortBy?: CategorySortField;
  sortDir?: SortDir;
}

export interface CategoryStatusCounts {
  total: number;
  active: number;
  inactive: number;
  productsCovered: number;
}

export interface CategoryParentOption {
  id: string;
  name: string;
}

export interface CategoryInput {
  name: string;
  description: string;
  icon: string;
  parentId: string | null;
}
