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

import { mockActivityItems, mockDailyMetrics, mockGrowthSeries, mockNotifications, mockSettings, mockTopProducts, mockTopVendors, mockCampusSales, mockLowStock } from "@/data/admin/system";
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
    stats: {
      gmvToday: 4_812_500,
      ordersToday: 214,
      activeUsers: 18_942,
      pendingWithdrawals: 7,
      pendingWithdrawalsAmount: 1_240_000,
      openDisputes: 11,
      flaggedContent: 23,
      commissionToday: 385_000,
    },
    dailyMetrics: mockDailyMetrics,
    growthSeries: mockGrowthSeries,
    campusSales: mockCampusSales,
    topProducts: mockTopProducts,
    lowStock: mockLowStock,
    topVendors: mockTopVendors,
    recentOrders: mockOrders.slice(0, 12),
    activity: mockActivityItems,
  });

export const userService: AdminUserService = createMockUserService(mockUsers);

/** /admin/users console (full directory incl. staff accounts). */
export const userManagementService: AdminUserManagementService =
  createUserManagementService();

export type { ManagedUserSortField } from "./user-management.service";

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

import {
  AdminAnalyticsService,
  createMockAnalyticsService,
} from "./analytics.service";

/** /admin/reports console (platform analytics). */
export const analyticsService: AdminAnalyticsService =
  createMockAnalyticsService();

export const notificationService: AdminNotificationService =
  createMockNotificationService(mockNotifications);

export const settingService: AdminSettingService =
  createMockSettingService(mockSettings);
