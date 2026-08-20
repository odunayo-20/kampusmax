import {
  VendorProduct,
  VendorOrder,
  VendorEarningsSummary,
  VendorDailyEarning,
  VendorCustomer,
  StoreProfile,
  StoreSettings,
} from "@/types";
import {
  vendorProducts as mockProducts,
  vendorOrders as mockOrders,
  vendorEarningsSummary,
  vendorDailyEarnings,
  vendorCustomers,
  storeProfile as mockStoreProfile,
  storeSettings as mockStoreSettings,
} from "@/data/vendor";

let products = [...mockProducts];
let orders = [...mockOrders];
let store = { ...mockStoreProfile };
let settings = { ...mockStoreSettings };

// ── Products ──

export function getVendorProducts(): VendorProduct[] {
  return products;
}

export function getVendorProductById(id: string): VendorProduct | undefined {
  return products.find((p) => p.id === id);
}

export function addVendorProduct(
  data: Omit<VendorProduct, "id" | "createdAt" | "updatedAt" | "soldCount" | "viewCount" | "saveCount" | "rating" | "ratingCount">
): VendorProduct {
  const now = new Date().toISOString();
  const product: VendorProduct = {
    ...data,
    id: `vp${Date.now()}`,
    soldCount: 0,
    viewCount: 0,
    saveCount: 0,
    rating: 0,
    ratingCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  products = [product, ...products];
  return product;
}

export function updateVendorProduct(
  id: string,
  data: Partial<VendorProduct>
): VendorProduct | undefined {
  products = products.map((p) =>
    p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
  );
  return products.find((p) => p.id === id);
}

export function deleteVendorProduct(id: string): void {
  products = products.filter((p) => p.id !== id);
}

// ── Orders ──

export function getVendorOrders(): VendorOrder[] {
  return orders;
}

export function getVendorOrderById(id: string): VendorOrder | undefined {
  return orders.find((o) => o.id === id);
}

export function updateVendorOrderStatus(
  id: string,
  status: VendorOrder["status"]
): VendorOrder | undefined {
  orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
  return orders.find((o) => o.id === id);
}

// ── Earnings ──

export function getEarningsSummary(): VendorEarningsSummary {
  return vendorEarningsSummary;
}

export function getDailyEarnings(): VendorDailyEarning[] {
  return vendorDailyEarnings;
}

// ── Customers ──

export function getVendorCustomers(): VendorCustomer[] {
  return vendorCustomers;
}

// ── Store ──

export function getStoreProfile(): StoreProfile {
  return store;
}

export function updateStoreProfile(data: Partial<StoreProfile>): StoreProfile {
  store = { ...store, ...data };
  return store;
}

export function getStoreSettings(): StoreSettings {
  return settings;
}

export function updateStoreSettings(data: Partial<StoreSettings>): StoreSettings {
  settings = { ...settings, ...data };
  return settings;
}
