// ============================================================
// CORE SCALAR TYPES
// ============================================================

export type UserRole = "student" | "vendor" | "admin";

export type ProductCondition = "New" | "Used" | "Fair";

export type ProductStatus = "available" | "sold" | "removed";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type DeliveryMethod = "campus_pickup" | "meetup" | "delivery";

export type PaymentMethod = "paystack" | "bank_transfer" | "wallet" | "cod";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type NotificationType =
  | "order_update"
  | "message"
  | "promotion"
  | "community"
  | "system";

export type PostType = "discussion" | "question" | "event" | "marketplace";

export type ReviewTarget = "vendor" | "product";

export type WalletTransactionType =
  | "deposit"
  | "withdrawal"
  | "payment"
  | "refund"
  | "transfer";

export type WalletTransactionStatus = "pending" | "completed" | "failed";

export type ConversationType = "direct" | "vendor_chat";

// ============================================================
// AUTH
// ============================================================

export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

export type VerificationMethod = "email" | "sms";

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  campusId: string;
  role: UserRole;
  department?: string;
  level?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  campusId: string;
  role: UserRole;
  avatar: string;
  isVerified: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpData {
  email: string;
  code: string;
}

// ============================================================
// CAMPUS
// ============================================================

export interface Campus {
  id: string;
  name: string;
  abbreviation: string;
  location: string;
  departments: string[];
  imageUrl?: string;
}

// ============================================================
// USER & VENDOR
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  campusId: string;
  role: UserRole;
  avatar: string;
  bio: string;
  joinedDate: string;
  department?: string;
  level?: string;
  isVerified?: boolean;
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  description: string;
  rating: number;
  totalSales: number;
  verified: boolean;
  campusId: string;
  specialties: string[];
  coverImage?: string;
  responseTime?: string;
  joinDate?: string;
}

// ============================================================
// PRODUCT & CATEGORY
// ============================================================

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  vendorId: string;
  campusId: string;
  images: string[];
  condition: ProductCondition;
  status: ProductStatus;
  createdAt: string;
  location?: string;
  tags?: string[];
  viewCount?: number;
  saveCount?: number;
  rating?: number;
  ratingCount?: number;
}

// ============================================================
// CART
// ============================================================

export interface CartItem {
  product: Product;
  quantity: number;
  savedForLater?: boolean;
}

// ============================================================
// ORDER & ORDER ITEM
// ============================================================

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  buyerId: string;
  vendorId: string;
  items: CartItem[];
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  notes?: string;
  timeline: OrderTimelineEntry[];
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string;
  message: string;
}

// ============================================================
// PAYMENT
// ============================================================

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  createdAt: string;
  completedAt?: string;
}

// ============================================================
// NOTIFICATION
// ============================================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  imageUrl?: string;
}

// ============================================================
// CONVERSATION & MESSAGE
// ============================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  productId?: string;
  vendorId?: string;
}

// ============================================================
// CAMPUS POST & COMMENT
// ============================================================

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface CampusPost {
  id: string;
  userId: string;
  campusId: string;
  type: PostType;
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  likes: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
  productId?: string;
  eventId?: string;
}

// ============================================================
// EVENT
// ============================================================

export interface CampusEvent {
  id: string;
  campusId: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  organizerId: string;
  imageUrl?: string;
  attendees: string[];
  maxAttendees?: number;
  isVirtual: boolean;
  meetingLink?: string;
  tags?: string[];
  createdAt: string;
}

// ============================================================
// REVIEW
// ============================================================

export interface Review {
  id: string;
  targetId: string;
  target: ReviewTarget;
  userId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  vendorId?: string;
  productId?: string;
}

// ============================================================
// WALLET & WALLET TRANSACTION
// ============================================================

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  status: WalletTransactionStatus;
  description: string;
  reference?: string;
  createdAt: string;
  completedAt?: string;
  orderId?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  transactions: WalletTransaction[];
}

// ============================================================
// RE-EXPORT OF INLINE TYPES (backward compat aliases)
// ============================================================

// These match the original inline types so existing code doesn't break.
// PaymentStatus is now exported as a named type above.

// ============================================================
// MARKETPLACE FILTERS
// ============================================================

export type SortOption = "recent" | "price_low" | "price_high" | "popular" | "rating";

export interface MarketplaceFilters {
  search: string;
  categoryId: string;
  campusId: string;
  vendorId: string;
  condition: ProductCondition | "";
  minPrice: string;
  maxPrice: string;
  sort: SortOption;
}

// ============================================================
// PROMO CODE
// ============================================================

export interface PromoCode {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  description: string;
  expiresAt: string;
}

// ============================================================
// LOYALTY
// ============================================================

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface LoyaltyProgram {
  points: number;
  tier: LoyaltyTier;
  pointsToNairaRate: number; // e.g. 1 point = ₦1
  lifetimePoints: number;
}

// ============================================================
// CHECKOUT
// ============================================================

export type PickupLocation =
  | "main_gate"
  | "library"
  | "student_union"
  | "engineering_block"
  | "science_block";

export const PICKUP_LOCATION_LABELS: Record<PickupLocation, string> = {
  main_gate: "Main Gate",
  library: "University Library",
  student_union: "Student Union Building",
  engineering_block: "Engineering Block",
  science_block: "Science Block",
};

export interface CheckoutFormData {
  deliveryMethod: DeliveryMethod;
  pickupLocation: PickupLocation;
  deliveryAddress: string;
  campusId: string;
  paymentMethod: PaymentMethod;
  promoCode: string;
  loyaltyPointsToUse: number;
  notes: string;
}

export interface CheckoutValidation {
  deliveryAddress?: string;
  pickupLocation?: string;
  promoCode?: string;
  loyaltyPoints?: string;
  paymentMethod?: string;
}

export interface CheckoutSummary {
  itemsSubtotal: number;
  platformFee: number;
  deliveryFee: number;
  discountAmount: number;
  loyaltyDiscount: number;
  finalTotal: number;
  itemCount: number;
  appliedPromo: PromoCode | null;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
}

// ============================================================
// PROFILE & SETTINGS
// ============================================================

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  campusId: string;
  isDefault: boolean;
  contactName: string;
  contactPhone: string;
  notes?: string;
}

export interface SavedPaymentMethod {
  id: string;
  type: "card" | "bank_account" | "wallet";
  label: string;
  last4: string;
  brand?: string;
  bankName?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  messages: boolean;
  promotions: boolean;
  community: boolean;
  system: boolean;
  emailDigest: boolean;
  pushEnabled: boolean;
}

export interface PrivacySettings {
  showProfileToStudents: boolean;
  showPhoneToVendors: boolean;
  showEmailToVendors: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  showOrderHistory: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: "sms" | "email";
  lastPasswordChange: string;
  activeSessions: number;
  loginNotifications: boolean;
}
