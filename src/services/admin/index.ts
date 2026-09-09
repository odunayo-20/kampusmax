// ============================================================
// ADMIN SERVICE CONTAINER
//
// SINGLE SWAP POINT for the future NestJS backend.
//
// Every admin page/component consumes services through this
// module. When the real API lands:
//   1. Implement each `Admin*Service` interface in
//      `<resource>.http.ts` files (fetch/axios against NestJS).
//   2. Replace the factory calls below with the HTTP variants.
//   3. Delete `src/data/admin/*` mock modules.
// No component or page code changes required.
// ============================================================

import { mockActivityItems, mockDailyMetrics, mockGrowthSeries, mockNotifications, mockSettings, mockTopProducts, mockCampusSales, mockLowStock } from "@/data/admin/system";
import { mockCampuses } from "@/data/admin/campuses";
import { mockUsers, mockVendors } from "@/data/admin/people";
import { mockCategories, mockProducts } from "@/data/admin/catalog";
import {
  mockOrders,
  mockPayments,
  mockWalletAccounts,
  mockWalletTxns,
  mockWithdrawals,
} from "@/data/admin/commerce";
import { mockPromotions } from "@/data/admin/growth";
import { mockDisputes, mockPosts, mockReports, mockReviews } from "@/data/admin/content";
import { DashboardService, createMockDashboardService } from "./dashboard.service";

export type { ChartRange } from "./dashboard.service";
import { AdminAuthService, createMockAdminAuthService } from "./auth.service";

export type {
  AdminAuthFailCode,
  AdminAuthResult,
  AdminLoginInput,
} from "./auth.service";

/** POST/GET admin auth session (Module 34 authorization boundary). */
export const adminAuthService: AdminAuthService =
  createMockAdminAuthService();
import { AdminUserService, createMockUserService } from "./users.service";
import {
  AdminUserManagementService,
  createUserManagementService,
} from "./user-management.service";
import {
  AdminCampusManagementService,
  createCampusManagementService,
} from "./campus-management.service";
import { AdminCampusService, createMockCampusService } from "./campuses.service";
import { AdminVendorService, createMockVendorService } from "./vendors.service";
import {
  AdminVendorManagementService,
  createVendorManagementService,
} from "./vendor-management.service";
import {
  AdminProductManagementService,
  createProductManagementService,
} from "./product-management.service";
import {
  AdminCategoryService,
  AdminProductService,
  createMockCategoryService,
  createMockProductService,
} from "./catalog.service";
import { AdminOrderService, createMockOrderService } from "./orders.service";
import { AdminPaymentService, createMockPaymentService } from "./payments.service";
import { AdminWalletService, createMockWalletService } from "./wallet.service";
import {
  AdminWithdrawalService,
  createMockWithdrawalService,
} from "./withdrawals.service";
import {
  AdminPromotionService,
  createMockPromotionService,
} from "./promotions.service";
import {
  AdminContentService,
  AdminDisputeService,
  AdminReportService,
  AdminReviewService,
  createMockDisputeService,
  createMockPostService,
  createMockReportService,
  createMockReviewService,
} from "./content.service";
import {
  AdminNotificationService,
  createMockNotificationService,
} from "./notifications.service";
import { AdminSettingService, createMockSettingService } from "./settings.service";

export const dashboardService: DashboardService =
  createMockDashboardService({
    users: mockUsers,
    vendors: mockVendors,
    products: mockProducts,
    orders: mockOrders,
    payments: mockPayments,
    withdrawals: mockWithdrawals,
    disputes: mockDisputes,
    reviews: mockReviews,
    reports: mockReports,
    campuses: mockCampuses,
    dailyMetrics: mockDailyMetrics,
    growthSeries: mockGrowthSeries,
    campusSales: mockCampusSales,
    topProducts: mockTopProducts,
    lowStock: mockLowStock,
    recentOrders: mockOrders.slice(0, 12),
    activity: mockActivityItems,
  });

export const userService: AdminUserService = createMockUserService(mockUsers);

/** /admin/users console (full directory incl. staff accounts). */
export const userManagementService: AdminUserManagementService =
  createUserManagementService();

export type { ManagedUserSortField } from "./user-management.service";
export type {
  AdminActingContext,
  ManagedUserListQuery,
  ManagedUserDetailResult,
  UserActivityResult,
  UserCommandFailure,
  UserCommandFailureCode,
  UserCommandResult,
  UserActionPolicy,
  UserActionPolicyTarget,
  UserManageLevel,
} from "./user-management.service";
export { getUserActionPolicy } from "./user-management.service";

/** /admin/campuses console (campus lifecycle + admin assignments). */
export const campusManagementService: AdminCampusManagementService =
  createCampusManagementService();

export type { ManagedCampusSortField } from "./campus-management.service";

export const campusService: AdminCampusService =
  createMockCampusService(mockCampuses);

export const vendorService: AdminVendorService =
  createMockVendorService(mockVendors);

/** /admin/vendors console (verification + store lifecycle). */
export const vendorManagementService: AdminVendorManagementService =
  createVendorManagementService();

export type { ManagedVendorSortField } from "./vendor-management.service";

/** /admin/products console (moderation + listing lifecycle). */
export const productManagementService: AdminProductManagementService =
  createProductManagementService();

export type {
  ManagedProductSortField,
  ProductStockFilter,
} from "./product-management.service";

import {
  AdminCategoryManagementService,
  createCategoryManagementService,
} from "./category-management.service";

/** /admin/categories console (taxonomy + display order). */
export const categoryManagementService: AdminCategoryManagementService =
  createCategoryManagementService();

import {
  AdminOrderManagementService,
  createOrderManagementService,
} from "./order-management.service";

/** /admin/orders console (lifecycle inspection). */
export const orderManagementService: AdminOrderManagementService =
  createOrderManagementService();

import {
  AdminPaymentManagementService,
  createPaymentManagementService,
} from "./payment-management.service";

/** /admin/payments console (ledger + settlement inspection). */
export const paymentManagementService: AdminPaymentManagementService =
  createPaymentManagementService();

import {
  AdminFinanceManagementService,
  createFinanceManagementService,
} from "./wallet-management.service";

/** /admin/wallet + /admin/withdrawals console (funds overview, ledger, payouts). */
export const financeManagementService: AdminFinanceManagementService =
  createFinanceManagementService();

import {
  AdminPromotionManagementService,
  createPromotionManagementService,
} from "./promotion-management.service";

import {
  AdminFreelancerManagementService,
  createFreelancerManagementService,
} from "./freelancer-management.service";

/** /admin/promotions console (campaigns, codes, featured placements). */
export const promotionManagementService: AdminPromotionManagementService =
  createPromotionManagementService();

export const productService: AdminProductService =
  createMockProductService(mockProducts);

export const categoryService: AdminCategoryService =
  createMockCategoryService(mockCategories);

export const orderService: AdminOrderService = createMockOrderService(mockOrders);

export const paymentService: AdminPaymentService =
  createMockPaymentService(mockPayments);

export const walletService: AdminWalletService = createMockWalletService(
  mockWalletAccounts,
  mockWalletTxns
);

export const withdrawalService: AdminWithdrawalService =
  createMockWithdrawalService(mockWithdrawals);

export const promotionService: AdminPromotionService =
  createMockPromotionService(mockPromotions);

export const postService: AdminContentService = createMockPostService(mockPosts);
export const reportService: AdminReportService = createMockReportService(mockReports);
export const reviewService: AdminReviewService = createMockReviewService(mockReviews);
export const disputeService: AdminDisputeService =
  createMockDisputeService(mockDisputes);

import {
  AdminCommunityService,
  createMockCommunityService,
} from "./community.service";

/** /admin/campus console (posts, comments, events, announcements, reports, polls). */
export const communityService: AdminCommunityService =
  createMockCommunityService();

export type { CommunityAnnouncementCreateInput } from "./community.service";

import {
  AdminReviewManagementService,
  createReviewManagementService,
} from "./review-management.service";

/** /admin/reviews console (review moderation + report triage). */
export const reviewManagementService: AdminReviewManagementService =
  createReviewManagementService();

import {
  AdminDisputeManagementService,
  createMockDisputeManagementService,
} from "./dispute-management.service";

/** /admin/disputes console (case resolution + refund placeholders). */
export const disputeManagementService: AdminDisputeManagementService =
  createMockDisputeManagementService();

/** /admin/freelancers console (freelancer lifecycle + marketplace services). */
export const freelancerManagementService: AdminFreelancerManagementService =
  createFreelancerManagementService();

export type { ManagedFreelancerSortField } from "./freelancer-management.service";

import {
  AdminEmployerManagementService,
  createEmployerManagementService,
} from "./employer-management.service";

/** /admin/employers console (employer lifecycle + hiring activity). */
export const employerManagementService: AdminEmployerManagementService =
  createEmployerManagementService();

export type { ManagedEmployerSortField } from "./employer-management.service";

import {
  AdminMarketplaceManagementService,
  createMarketplaceManagementService,
} from "./marketplace-management.service";

/** /admin/marketplace console (listing lifecycle oversight - derived from the real product store, read-only). */
export const marketplaceManagementService: AdminMarketplaceManagementService =
  createMarketplaceManagementService();

export type { MarketplaceSortField } from "./marketplace-management.service";

import {
  AdminJobManagementService,
  createJobManagementService,
} from "./job-management.service";

/** /admin/jobs console (jobs & hiring oversight - derived from the real opportunity store, read-only). */
export const jobManagementService: AdminJobManagementService =
  createJobManagementService();

export type { ManagedJobSortField } from "./job-management.service";

import {
  AdminAnalyticsService,
  createMockAnalyticsService,
} from "./analytics.service";

/** /admin/reports console (platform analytics). */
export const analyticsService: AdminAnalyticsService =
  createMockAnalyticsService();

import {
  AdminNotificationManagementService,
  createMockNotificationManagementService,
} from "./notification-management.service";

/** /admin/notifications console (broadcast composer + history). */
export const notificationManagementService: AdminNotificationManagementService =
  createMockNotificationManagementService();

import {
  AdminSettingsConfigService,
  createMockSettingsConfigService,
} from "./settings-config.service";

/** /admin/settings console (sectioned config, in-memory persistence). */
export const settingsConfigService: AdminSettingsConfigService =
  createMockSettingsConfigService();

import {
  AdminRbacService,
  createMockRbacService,
} from "./rbac.service";

/** /admin/permissions console (role matrices, in-memory persistence). */
export const rbacService: AdminRbacService = createMockRbacService();

import {
  AuditLogService,
  createMockAuditLogService,
} from "./audit-logs.service";

/** /admin/audit-logs console (read-only audit trail). */
export const auditLogService: AuditLogService =
  createMockAuditLogService();

export const notificationService: AdminNotificationService =
  createMockNotificationService(mockNotifications);

export const settingService: AdminSettingService =
  createMockSettingService(mockSettings);
