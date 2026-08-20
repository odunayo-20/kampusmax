import { Product } from "@/types";
import {
  products as mockProducts,
  getProductById as _getProductById,
  getProductsByCategory as _getProductsByCategory,
  getProductsByVendor as _getProductsByVendor,
  getFeaturedProducts as _getFeaturedProducts,
  getRecentProducts as _getRecentProducts,
} from "@/data/products";

export function getProducts(): Product[] {
  return mockProducts;
}

export function getProductById(id: string): Product | undefined {
  return _getProductById(id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return _getProductsByCategory(categoryId);
}

export function getProductsByVendor(vendorId: string): Product[] {
  return _getProductsByVendor(vendorId);
}

export function getFeaturedProducts(): Product[] {
  return _getFeaturedProducts();
}

export function getRecentProducts(): Product[] {
  return _getRecentProducts();
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return mockProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
  );
}

export function getProductsByCampus(campusId: string): Product[] {
  return mockProducts.filter((p) => p.campusId === campusId);
}
