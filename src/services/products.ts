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

export function getFeaturedProductsByCampus(campusId: string): Product[] {
  return mockProducts.filter(
    (p) => p.campusId === campusId && p.originalPrice && p.originalPrice > p.price
  );
}

export function getPopularProductsByCampus(campusId: string): Product[] {
  return mockProducts
    .filter((p) => p.campusId === campusId)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
}

export function getRecentProductsByCampus(campusId: string): Product[] {
  return mockProducts
    .filter((p) => p.campusId === campusId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getRecommendedProductsByCampus(campusId: string): Product[] {
  const campusProducts = mockProducts.filter((p) => p.campusId === campusId);
  return campusProducts
    .sort((a, b) => (b.saveCount || 0) - (a.saveCount || 0));
}
