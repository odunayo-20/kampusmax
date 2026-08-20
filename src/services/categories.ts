import { Category } from "@/types";
import { categories as mockCategories } from "@/data/categories";
import { getProductsByCategory } from "./products";

export function getCategories(): Category[] {
  return mockCategories.map((cat) => ({
    ...cat,
    productCount: getProductsByCategory(cat.id).length,
  }));
}

export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find((c) => c.id === id);
}
