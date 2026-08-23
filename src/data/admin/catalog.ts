import { AdminCategory, AdminProduct } from "@/types/admin";
import { mockVendors } from "./people";
import { daysAgoIso, intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// CATEGORIES
// ------------------------------------------------------------

export const mockCategories: AdminCategory[] = [
  { id: "cat-electronics", name: "Electronics", slug: "electronics", icon: "smartphone", parentId: null, productCount: 412, activeListings: 386, sortOrder: 1, status: "active" },
  { id: "cat-phones", name: "Phones & Tablets", slug: "phones-tablets", icon: "tablet-smartphone", parentId: "cat-electronics", productCount: 187, activeListings: 171, sortOrder: 2, status: "active" },
  { id: "cat-audio", name: "Audio & Accessories", slug: "audio-accessories", icon: "headphones", parentId: "cat-electronics", productCount: 143, activeListings: 138, sortOrder: 3, status: "active" },
  { id: "cat-books", name: "Books & Academic", slug: "books-academic", icon: "book-open", parentId: null, productCount: 356, activeListings: 341, sortOrder: 4, status: "active" },
  { id: "cat-textbooks", name: "Textbooks", slug: "textbooks", icon: "graduation-cap", parentId: "cat-books", productCount: 268, activeListings: 259, sortOrder: 5, status: "active" },
  { id: "cat-fashion", name: "Fashion", slug: "fashion", icon: "shirt", parentId: null, productCount: 298, activeListings: 277, sortOrder: 6, status: "active" },
  { id: "cat-groceries", name: "Groceries & Food", slug: "groceries-food", icon: "shopping-basket", parentId: null, productCount: 164, activeListings: 152, sortOrder: 7, status: "active" },
  { id: "cat-beauty", name: "Beauty & Personal Care", slug: "beauty", icon: "sparkles", parentId: null, productCount: 121, activeListings: 114, sortOrder: 8, status: "active" },
  { id: "cat-home", name: "Home & Living", slug: "home-living", icon: "lamp", parentId: null, productCount: 143, activeListings: 131, sortOrder: 9, status: "active" },
  { id: "cat-services", name: "Printing & Services", slug: "services", icon: "printer", parentId: null, productCount: 87, activeListings: 82, sortOrder: 10, status: "active" },
  { id: "cat-sports", name: "Sports & Fitness", slug: "sports", icon: "dumbbell", parentId: null, productCount: 54, activeListings: 47, sortOrder: 11, status: "archived" },
];

// ------------------------------------------------------------
// PRODUCTS
// ------------------------------------------------------------

const PRODUCT_TITLES: Record<string, readonly string[]> = {
  "Electronics": ["HP EliteBook 840 G5", "Dell Latitude 7490", "Wireless Mouse Combo", "Extension Board 4-Way", "Rechargeable Table Fan", "LED Desk Lamp"],
  "Phones & Tablets": ["iPhone 11 128GB", "Samsung A54", "Tecno Spark 20", "Redmi 13C", "iPad 9th Gen", "Infinix Hot 40i"],
  "Audio & Accessories": ["Oraimo FreePods 4", "JBL Go 4 Speaker", "Anker Soundcore Life", "Type-C Fast Charger 33W", "Power Bank 20000mAh", "Bluetooth Earpiece H12"],
  "Books & Academic": ["MTH 101 Past Questions Pack", "Organic Chemistry (Clayden)", "Engineering Mathematics Vol 1", "GST Handbook 2026 Edition", "Python for Everybody", "Circuit Analysis Guide"],
  "Textbooks": ["Streeter Fluid Mechanics", "Gray's Anatomy for Students", "Law of Contract in Nigeria", "Macroeconomics Mankiw", "Biology Campbell 12th Ed", "Surveying & Levelling"],
  "Fashion": ["Vintage Denim Jacket", "Native Senator Set", "Adidas Campus Sneakers", "Handbags Collection", "Corporate Shirt Bundle", "Hoodie - Oversized Fit"],
  "Groceries & Food": ["Garri Ijebu 5kg", "Indomie Pack (24)", "Palm Oil 5 Litres", "Semo & Wheat Combo", "Frozen Chicken 2kg", "Provision Hamper Box"],
  "Beauty & Personal Care": ["Shea Butter Cream 500g", "Hair Dryer Pro", "Perfume Oil Set", "Skincare Combo Kit", "Barbing Clipper Wahl", "Body Splash Bundle"],
  "Home & Living": ["Foam Mattress 6x3", "Standing Wardrobe", "Curtains & Rods Set", "Study Table & Chair", "Rug 5x8ft", "Bucket & Pail Set"],
  "Printing & Services": ["Project Binding Service", "Photocopy 100 Sheets", "Lamination Pack", "CV Design + Print", "Banner Printing per sqm", "JAMB Registration Help"],
  "Sports & Fitness": ["Yoga Mat 6mm", "Dumbbells Pair 5kg", "Jersey Set Custom", "Skipping Rope Speed", "Football Boots NG42", "Gym Gloves Pro"],
};

const CONDITIONS = ["New", "Used", "Fair"] as const;
const PRODUCT_STATUSES = ["available", "pending_review", "flagged", "sold", "removed"] as const;

export function buildMockProducts(count = 44): AdminProduct[] {
  const rand = seededRandom(99);
  const products: AdminProduct[] = [];
  const approved = mockVendors.filter((v) => v.status === "approved");

  for (let i = 0; i < count; i++) {
    const vendor = pick(rand, approved);
    const categoryName =
      vendor.category === "Electronics"
        ? pick(rand, ["Electronics", "Phones & Tablets", "Audio & Accessories"])
        : vendor.category === "Fashion"
          ? "Fashion"
          : vendor.category === "Groceries"
            ? "Groceries & Food"
            : vendor.category === "Beauty & Personal Care"
              ? "Beauty & Personal Care"
              : vendor.category === "Home & Living"
                ? "Home & Living"
                : vendor.category === "Printing Services"
                  ? "Printing & Services"
                  : pick(rand, ["Books & Academic", "Textbooks"]);

    const poolKey =
      Object.keys(PRODUCT_TITLES).find((k) => k === categoryName) ??
      (categoryName.startsWith("Text") ? "Textbooks" : "Books & Academic");
    if (!poolKey) continue;

    const title = pick(rand, PRODUCT_TITLES[poolKey]);
    const price = intBetween(rand, 15, 3200) * 250;
    const hasDiscount = rand() > 0.65;
    const statusRoll = rand();
    const status = statusRoll > 0.93 ? "flagged" : statusRoll > 0.88 ? "pending_review" : statusRoll > 0.82 ? "sold" : statusRoll > 0.79 ? "removed" : "available";

    products.push({
      id: `prd-${String(i + 1).padStart(3, "0")}`,
      title,
      vendorId: vendor.id,
      vendorName: vendor.storeName,
      categoryId: `cat-${categoryName.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-+$/, "")}`,
      categoryName,
      campusId: vendor.campusId,
      price,
      originalPrice: hasDiscount ? Math.round(price * (1.15 + rand() * 0.35)) : null,
      condition:
        categoryName.startsWith("Text") || categoryName.includes("Books")
          ? pick(rand, CONDITIONS)
          : rand() > 0.75
            ? "Used"
            : "New",
      status,
      stock: status === "sold" ? 0 : intBetween(rand, 1, 40),
      views: intBetween(rand, 12, 2400),
      saves: intBetween(rand, 0, 180),
      reportsCount: status === "flagged" ? intBetween(rand, 2, 9) : rand() > 0.94 ? 1 : 0,
      createdAt: daysAgoIso(rand, intBetween(rand, 1, 300)),
    });
    void PRODUCT_STATUSES; // keep literal union referenced for type safety
  }
  return products;
}

export const mockProducts: AdminProduct[] = buildMockProducts();
