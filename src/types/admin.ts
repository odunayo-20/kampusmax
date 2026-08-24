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
  | "rejected"
  | "failed"
  | "completed";

/** Admin-side lifecycle transitions shared by console + service layers. */
export type WithdrawalAction =
  | "approve"
  | "reject"
  | "start_processing"
  | "mark_completed"
  | "mark_failed";

export interface ManagedWithdrawalTimelineEvent {
  id: string;
  kind:
    | "requested"
    | "review"
    | "decision"
    | "completed"
    | "rejected"
    | "failed";
  label: string;
  detail?: string | null;
  at: string;
}

/** Everything the /admin/withdrawals/[id] screen renders. */
export interface ManagedWithdrawalDetail {
  request: WithdrawalRequest;
  /** Vendor's available wallet balance at inspection time. */
  vendorBalance: number | null;
  vendorWalletId: string | null;
  campusId: string | null;
  timeline: ManagedWithdrawalTimelineEvent[];
  /** This vendor's recent wallet activity. */
  history: ManagedFinanceTxn[];
  /** Same vendor's other payout requests, newest first. */
  previous: WithdrawalRequest[];
}

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

// ------------------------------------------------------------
// ORDER MANAGEMENT (/admin/orders)
// ------------------------------------------------------------

export type ManagedOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "disputed";

export type ManagedOrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface ManagedOrderItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  thumbnail?: string | null;
  variant?: string | null;
}

export interface ManagedOrderPayment {
  method: AdminOrder["paymentMethod"];
  status: ManagedOrderPaymentStatus;
  transactionId: string; // links to /admin/payments ledger
  paidAt: string | null;
  refundedAmount: number;
}

export interface ManagedOrderDeliveryInfo {
  method: AdminOrder["deliveryMethod"];
  address?: string | null;
  meetupSpot?: string | null;
  pickupPoint?: string | null;
  riderName?: string | null;
  riderPhone?: string | null;
}

export interface ManagedOrderTimelineEvent {
  id: string;
  kind:
    | "placed"
    | "payment"
    | "confirmation"
    | "preparation"
    | "ready"
    | "dispatch"
    | "delivery"
    | "cancellation"
    | "dispute";
  label: string;
  detail?: string | null;
  at: string;
}

export interface ManagedOrderNote {
  id: string;
  authorRole: "customer" | "vendor" | "admin";
  authorName: string;
  body: string;
  createdAt: string;
}

export interface ManagedOrder extends Omit<AdminOrder, "status" | "paymentStatus"> {
  status: ManagedOrderStatus;
  paymentStatus: ManagedOrderPaymentStatus;
}

export interface ManagedOrderDetail {
  order: ManagedOrder;
  items: ManagedOrderItem[];
  payment: ManagedOrderPayment;
  delivery: ManagedOrderDeliveryInfo;
  timeline: ManagedOrderTimelineEvent[];
  notes: ManagedOrderNote[];
}

export type OrderSortField = "orderNumber" | "createdAt" | "total";

export interface OrderListQuery extends ListQuery {
  search?: string;
  status?: ManagedOrderStatus | "all";
  paymentStatus?: ManagedOrderPaymentStatus | "all";
  fulfillment?: AdminOrder["deliveryMethod"] | "all";
  campusId?: string;
  vendorId?: string;
  sortBy?: OrderSortField;
  sortDir?: SortDir;
}

export interface OrderFacets {
  campuses: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
}

export interface OrderStatusCounts {
  all: number;
  byStatus: Record<ManagedOrderStatus, number>;
  paymentIssues: number; // pending + failed payments awaiting action
}

// ------------------------------------------------------------
// PAYMENT MANAGEMENT (/admin/payments)
// ------------------------------------------------------------

export type ManagedPaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "reversed"
  | "refunded"
  | "partially_refunded";

/** Grouped for the admin console; raw rails stay visible on records. */
export type ManagedPaymentMethod = "wallet" | "paystack" | "other";

export interface ManagedPayment {
  id: string;
  type: PaymentType;
  orderId: string | null; // set for order-linked flows
  customerId: string;
  customerName: string;
  vendorId: string | null;
  vendorName: string | null;
  campusId: string;
  amount: number;
  platformFee: number;
  vendorAmount: number; // what lands on the vendor's ledger
  method: ManagedPaymentMethod;
  status: ManagedPaymentStatus;
  reference: string; // internal reference
  gatewayRef: string; // provider-side reference (mock)
  refundedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedPaymentTimelineEvent {
  id: string;
  kind:
    | "initiated"
    | "processing"
    | "settled"
    | "failure"
    | "refund"
    | "partial_refund"
    | "reversal";
  label: string;
  detail?: string | null;
  at: string;
}

export interface ManagedPaymentDetail {
  payment: ManagedPayment;
  order: Pick<
    ManagedOrder,
    "id" | "customerName" | "vendorName" | "total" | "status" | "createdAt"
  > | null;
  timeline: ManagedPaymentTimelineEvent[];
}

export type PaymentSortField = "createdAt" | "amount";

export interface PaymentListQuery extends ListQuery {
  search?: string;
  status?: ManagedPaymentStatus | "all";
  method?: ManagedPaymentMethod | "all";
  campusId?: string;
  vendorId?: string;
  sortBy?: PaymentSortField;
  sortDir?: SortDir;
}

export interface PaymentFacets {
  campuses: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
}

export interface PaymentStatusCounts {
  all: number;
  byStatus: Record<ManagedPaymentStatus, number>;
  totalVolume: number;
  settlementPending: number; // naira awaiting clearance
}

// ------------------------------------------------------------
// WALLET & FINANCE (/admin/wallet, /admin/withdrawals)
// ------------------------------------------------------------

export type ManagedFinanceTxnType =
  | "purchase"
  | "refund"
  | "vendor_payout"
  | "wallet_funding"
  | "withdrawal"
  | "platform_fee"
  | "loyalty_reward";

/** Which books a transaction touches - kept explicit so the console
 *  can always separate platform float from vendor and customer money.
 *  Reconciliation on the backend keys off this field. */
export type FinanceFundPool = "platform" | "vendor" | "customer";

export interface ManagedFinanceTxn {
  id: string;
  type: ManagedFinanceTxnType;
  pool: FinanceFundPool;
  ownerName: string;
  ownerType: WalletOwnerType;
  direction: WalletTxnDirection; // relative to the owning wallet
  amount: number;
  status: WalletTxnStatus;
  reference: string;
  balanceAfter: number;
  orderId: string | null;
  createdAt: string;
}

export interface FinanceTxnQuery extends ListQuery {
  search?: string;
  type?: ManagedFinanceTxnType | "all";
  status?: WalletTxnStatus | "all";
  pool?: FinanceFundPool | "all";
  sortBy?: "createdAt" | "amount";
  sortDir?: SortDir;
}

export interface FinanceOverview {
  /** Kampmax operating float - money the platform itself holds. */
  platform: {
    balance: number; // available + pending
    available: number; // settled, spendable
    pending: number; // in-flight transactions
    earnings: number; // commissions + platform fees collected
  };
  /** Money that belongs to vendors but sits on platform rails. */
  vendor: {
    payable: number; // owed to vendors incl. approved-but-unpaid withdrawals
    walletHeld: number; // aggregate vendor wallet balances
  };
  /** Money customers keep inside Kampmax wallets - a liability. */
  customer: {
    liability: number; // aggregate user wallet balances
    accounts: number;
  };
  revenue: {
    gross: number; // successful order payments
    refunds: number; // refunded back to customers
    net: number; // gross - refunds
  };
  withdrawals: {
    completedAmount: number;
    pendingCount: number;
    pendingAmount: number;
  };
}

export interface WithdrawalStatusCounts {
  all: number;
  byStatus: Record<WithdrawalStatus, number>;
  pendingAmount: number;
  completedAmount: number;
}

// ------------------------------------------------------------
// PROMOTION MANAGEMENT (/admin/promotions)
// Discounts, deals, promo codes, featured placements and
// campus campaigns. Mock only - no order-level discount
// calculation is wired to the checkout yet.
// ------------------------------------------------------------

export type ManagedPromotionType =
  | "percentage_discount"
  | "fixed_discount"
  | "promo_code"
  | "featured_product"
  | "featured_vendor"
  | "campus_promotion";

export type ManagedPromotionStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "ended";

/** Where Kampmax surfaces the promotion in the storefront. */
export type PromotionPlacement =
  | "homepage_banner"
  | "deals_page"
  | "category_strip"
  | "search_boost"
  | "none";

/**
 * Audience + catalogue scoping. An empty array means "no restriction"
 * (e.g. all campuses) except where a type requires an explicit target.
 */
export interface PromotionTargeting {
  campusIds: string[];
  vendorIds: string[];
  productIds: string[];
  categoryIds: string[];
}

export interface ManagedPromotion {
  id: string; // prm-###
  name: string;
  description: string;
  type: ManagedPromotionType;
  status: ManagedPromotionStatus;
  /** Redeemable code - promo_code type only. */
  code: string | null;
  /** Percent (percentage_discount) or naira (fixed_discount / promo_code). */
  discountValue: number | null;
  minSpend: number | null;
  placement: PromotionPlacement;
  targeting: PromotionTargeting;
  usageCount: number;
  usageLimit: number | null;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Editable payload for create/update. */
export interface PromotionInput {
  name: string;
  description: string;
  type: ManagedPromotionType;
  code: string | null;
  discountValue: number | null;
  minSpend: number | null;
  placement: PromotionPlacement;
  targeting: PromotionTargeting;
  usageLimit: number | null;
  startsAt: string;
  endsAt: string;
}

export interface PromotionListQuery extends ListQuery {
  search?: string;
  type?: ManagedPromotionType | "all";
  status?: ManagedPromotionStatus | "all";
  campusId?: string | "all";
  sortBy?: "name" | "startsAt" | "endsAt" | "usageCount";
  sortDir?: SortDir;
}

export interface PromotionStatusCounts {
  all: number;
  byStatus: Record<ManagedPromotionStatus, number>;
  /** Active right now by calendar window. */
  liveNow: number;
}

export interface PromotionTargetingOptions {
  campuses: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

// ------------------------------------------------------------
// COMMUNITY MANAGEMENT (/admin/campus)
// ------------------------------------------------------------

export type CommunityPostStatus =
  | "published"
  | "hidden"
  | "reported"
  | "removed"
  | "under_review";

export interface CommunityAuthor {
  /** PlatformUser id (usr-###) so the author profile deep-links. */
  id: string;
  name: string;
}

export interface CommunityPost {
  id: string;
  author: CommunityAuthor;
  campusId: string;
  type: CampusPostType;
  content: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  reportsCount: number;
  status: CommunityPostStatus;
  createdAt: string;
}

export type CommunityCommentStatus = "published" | "hidden" | "removed";

export interface CommunityComment {
  id: string;
  postId: string;
  postExcerpt: string;
  author: CommunityAuthor;
  content: string;
  campusId: string;
  likeCount: number;
  status: CommunityCommentStatus;
  createdAt: string;
}

export type CommunityEventStatus =
  | "draft"
  | "upcoming"
  | "live"
  | "completed"
  | "cancelled";

export interface CommunityEvent {
  id: string;
  title: string;
  organizer: CommunityAuthor;
  campusId: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  attendeeCount: number;
  capacity: number;
  status: CommunityEventStatus;
  createdAt: string;
}

export type AnnouncementStatus = "draft" | "scheduled" | "published" | "archived";
export type AnnouncementPlacement = "feed_top" | "feed_banner" | "push" | "email";

export interface ManagedAnnouncement {
  id: string;
  title: string;
  body: string;
  placement: AnnouncementPlacement;
  /** Empty array = all campuses. */
  campusIds: string[];
  publishAt: string | null;
  createdBy: string;
  status: AnnouncementStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  placement: AnnouncementPlacement;
  campusIds: string[];
  /** Required when scheduling. */
  publishAt?: string | null;
}

export type CommunityReportTargetType = "post" | "comment" | "event" | "poll";
export type CommunityReportReason =
  | "spam"
  | "harassment"
  | "misinformation"
  | "scam"
  | "inappropriate"
  | "other";
export type CommunityReportStatus = "open" | "reviewing" | "actioned" | "dismissed";

export interface CommunityReport {
  id: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  targetPreview: string;
  reason: CommunityReportReason;
  detail: string;
  reporterName: string;
  priority: "low" | "medium" | "high";
  status: CommunityReportStatus;
  createdAt: string;
}

export interface ManagedPollOption {
  label: string;
  votes: number;
}

export type ManagedPollStatus = "active" | "closed";

export interface ManagedPoll {
  id: string;
  question: string;
  options: ManagedPollOption[];
  campusId: string;
  totalVotes: number;
  endsAt: string;
  status: ManagedPollStatus;
  createdAt: string;
}

export interface CommunityPostDetail {
  post: CommunityPost;
  comments: CommunityComment[];
  reports: CommunityReport[];
}

export interface PostListQuery extends ListQuery {
  search?: string;
  status?: CommunityPostStatus | "all";
  type?: CampusPostType | "all";
  campusId?: string | "all";
}

export interface CommentListQuery extends ListQuery {
  search?: string;
  status?: CommunityCommentStatus | "all";
  campusId?: string | "all";
}

export interface EventListQuery extends ListQuery {
  search?: string;
  status?: CommunityEventStatus | "all";
  campusId?: string | "all";
}

export interface AnnouncementListQuery extends ListQuery {
  search?: string;
  status?: AnnouncementStatus | "all";
}

export interface ReportListQuery extends ListQuery {
  status?: CommunityReportStatus | "all";
  targetType?: CommunityReportTargetType | "all";
}

export interface PollListQuery extends ListQuery {
  search?: string;
  status?: ManagedPollStatus | "all";
  campusId?: string | "all";
}

/** `{ all, byStatus }` shape shared by every community section. */
export interface CommunitySectionCounts<S extends string> {
  all: number;
  byStatus: Record<S, number>;
}

// ------------------------------------------------------------
// REVIEW MANAGEMENT (/admin/reviews)
// ------------------------------------------------------------

export type ManagedReviewStatus =
  | "published"
  | "reported"
  | "hidden"
  | "removed"
  | "under_review";

export type ManagedReviewTargetType = "product" | "vendor";

export interface ManagedReview {
  id: string;
  reviewer: CommunityAuthor;
  targetType: ManagedReviewTargetType;
  /** Product title (or vendor store name when rating the store). */
  targetTitle: string;
  productId: string | null;
  vendorId: string;
  vendorName: string;
  campusId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  helpfulCount: number;
  /** True when tied to a completed Kampmax order. */
  verifiedPurchase: boolean;
  orderRef: string | null;
  reportsCount: number;
  status: ManagedReviewStatus;
  createdAt: string;
}

export type ReviewReportReason =
  | "fake_review"
  | "offensive"
  | "unfair"
  | "spam"
  | "irrelevant"
  | "other";

export type ReviewReportStatus = "open" | "reviewing" | "actioned" | "dismissed";

export interface ReviewReport {
  id: string;
  reviewId: string;
  reason: ReviewReportReason;
  detail: string;
  reporterName: string;
  priority: "low" | "medium" | "high";
  status: ReviewReportStatus;
  createdAt: string;
}

export interface ManagedReviewDetail {
  review: ManagedReview;
  reports: ReviewReport[];
}

export interface ReviewListQuery extends ListQuery {
  search?: string;
  status?: ManagedReviewStatus | "all";
  /** Exact star filter; "all" disables it. */
  rating?: 1 | 2 | 3 | 4 | 5 | "all";
  vendorId?: string | "all";
  campusId?: string | "all";
  purchase?: "all" | "verified" | "unverified";
  /** Only rows with at least one report, regardless of status. */
  reportedOnly?: boolean;
}

// ------------------------------------------------------------
// DISPUTE MANAGEMENT (/admin/disputes)
// ------------------------------------------------------------

export type ManagedDisputeStatus =
  | "open"
  | "under_review"
  | "awaiting_customer"
  | "awaiting_vendor"
  | "resolved"
  | "rejected"
  | "escalated";

export type ManagedDisputeReason =
  | "payment_issue"
  | "missing_order"
  | "wrong_product"
  | "damaged_product"
  | "delivery_issue"
  | "refund_request"
  | "unauthorized_transaction";

/** Who is on each side of the dispute. */
export type DisputeParty = "customer_vs_vendor" | "customer_vs_platform";

export interface ManagedDispute {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  campusId: string;
  parties: DisputeParty;
  reason: ManagedDisputeReason;
  subject: string;
  amount: number;
  priority: "low" | "medium" | "high";
  status: ManagedDisputeStatus;
  messagesCount: number;
  evidenceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeMessage {
  id: string;
  authorRole: "customer" | "vendor" | "support";
  authorName: string;
  body: string;
  at: string;
}

export interface DisputeEvidenceItem {
  id: string;
  kind: "photo" | "document" | "chat_log";
  name: string;
  note: string;
  uploadedBy: "customer" | "vendor";
  at: string;
}

export interface DisputePaymentSummary {
  method: string;
  reference: string;
  paidAt: string | null;
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
}

export interface DisputeTimelineEvent {
  id: string;
  label: string;
  detail?: string;
  actor: "customer" | "vendor" | "support" | "system";
  at: string;
}

export interface DisputeResolution {
  outcome: Extract<ManagedDisputeStatus, "resolved" | "rejected">;
  note: string;
  decidedBy: string;
  decidedAt: string;
  /**
   * PLACEHOLDER ONLY - records that a refund was agreed for this
   * dispute. No money movement happens in the prototype; the real
   * refund will be executed by the payments service.
   */
  refundPlaceholder?: { amount: number; method: string; recordedBy: string };
}

export interface ManagedDisputeDetail {
  dispute: ManagedDispute;
  order: {
    id: string;
    itemsSummary: string;
    itemsCount: number;
    total: number;
    placedAt: string;
    deliveryMethod: string;
    orderStatus: string;
  } | null;
  payment: DisputePaymentSummary;
  messages: DisputeMessage[];
  evidence: DisputeEvidenceItem[];
  timeline: DisputeTimelineEvent[];
  resolution: DisputeResolution | null;
}

export interface DisputeListQuery extends ListQuery {
  search?: string;
  status?: ManagedDisputeStatus | "all";
  campusId?: string | "all";
  reason?: ManagedDisputeReason | "all";
}

export interface DisputeRequestInfoInput {
  party: "customer" | "vendor";
  note: string;
}

export interface DisputeResolutionInput {
  note: string;
}
