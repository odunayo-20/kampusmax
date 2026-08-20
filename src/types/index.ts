export type UserRole = "student" | "vendor" | "admin";

export type ProductCondition = "New" | "Used" | "Fair";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type DeliveryMethod = "campus_pickup" | "meetup" | "delivery";

export type PaymentMethod = "paystack" | "bank_transfer";

export interface Campus {
  id: string;
  name: string;
  abbreviation: string;
  location: string;
  departments: string[];
  imageUrl?: string;
}

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
}

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
  status: "available" | "sold" | "removed";
  createdAt: string;
  location?: string;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  vendorId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  estimatedDelivery?: string;
}
