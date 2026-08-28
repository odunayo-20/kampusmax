import { ProductCondition } from "@/types";

export type FilterType = "checkbox" | "radio" | "range" | "select" | "multi-select";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  dependsOnCategory?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string | string[];
  removable: boolean;
}

export const CATEGORY_FILTER_DEFINITIONS: Record<string, FilterDefinition[]> = {
  cat2: [
    { key: "brand", label: "Brand", type: "checkbox", options: [
      { value: "apple", label: "Apple" },
      { value: "samsung", label: "Samsung" },
      { value: "hp", label: "HP" },
      { value: "dell", label: "Dell" },
      { value: "lenovo", label: "Lenovo" },
      { value: "jbl", label: "JBL" },
      { value: "sony", label: "Sony" },
      { value: "xiaomi", label: "Xiaomi" },
      { value: "tecno", label: "Tecno" },
      { value: "infinix", label: "Infinix" },
    ]},
    { key: "storage", label: "Storage", type: "checkbox", options: [
      { value: "64", label: "64GB" },
      { value: "128", label: "128GB" },
      { value: "256", label: "256GB" },
      { value: "512", label: "512GB" },
      { value: "1tb", label: "1TB+" },
    ]},
    { key: "ram", label: "RAM", type: "checkbox", options: [
      { value: "4", label: "4GB" },
      { value: "6", label: "6GB" },
      { value: "8", label: "8GB" },
      { value: "12", label: "12GB" },
      { value: "16", label: "16GB+" },
    ]},
    { key: "processor", label: "Processor", type: "checkbox", options: [
      { value: "intel-i3", label: "Intel Core i3" },
      { value: "intel-i5", label: "Intel Core i5" },
      { value: "intel-i7", label: "Intel Core i7" },
      { value: "intel-i9", label: "Intel Core i9" },
      { value: "amd-ryzen5", label: "AMD Ryzen 5" },
      { value: "amd-ryzen7", label: "AMD Ryzen 7" },
      { value: "apple-m1", label: "Apple M1" },
      { value: "apple-m2", label: "Apple M2" },
    ]},
    { key: "screenSize", label: "Screen Size", type: "checkbox", options: [
      { value: "11-12", label: "11-12 inches" },
      { value: "13-14", label: "13-14 inches" },
      { value: "15-16", label: "15-16 inches" },
      { value: "17+", label: "17+ inches" },
    ]},
  ],
  cat3: [
    { key: "size", label: "Size", type: "checkbox", options: [
      { value: "xs", label: "XS" },
      { value: "s", label: "S" },
      { value: "m", label: "M" },
      { value: "l", label: "L" },
      { value: "xl", label: "XL" },
      { value: "xxl", label: "XXL" },
    ]},
    { key: "color", label: "Color", type: "checkbox", options: [
      { value: "black", label: "Black" },
      { value: "white", label: "White" },
      { value: "blue", label: "Blue" },
      { value: "red", label: "Red" },
      { value: "grey", label: "Grey" },
      { value: "navy", label: "Navy" },
      { value: "green", label: "Green" },
      { value: "yellow", label: "Yellow" },
    ]},
    { key: "gender", label: "Gender", type: "radio", options: [
      { value: "men", label: "Men" },
      { value: "women", label: "Women" },
      { value: "unisex", label: "Unisex" },
    ]},
    { key: "material", label: "Material", type: "checkbox", options: [
      { value: "cotton", label: "Cotton" },
      { value: "polyester", label: "Polyester" },
      { value: "denim", label: "Denim" },
      { value: "wool", label: "Wool" },
      { value: "silk", label: "Silk" },
      { value: "leather", label: "Leather" },
    ]},
  ],
  cat1: [
    { key: "subject", label: "Subject", type: "checkbox", options: [
      { value: "mathematics", label: "Mathematics" },
      { value: "engineering", label: "Engineering" },
      { value: "computer-science", label: "Computer Science" },
      { value: "law", label: "Law" },
      { value: "medicine", label: "Medicine" },
      { value: "business", label: "Business" },
      { value: "chemistry", label: "Chemistry" },
      { value: "physics", label: "Physics" },
    ]},
    { key: "edition", label: "Edition", type: "checkbox", options: [
      { value: "latest", label: "Latest Edition" },
      { value: "recent", label: "Recent (1-2 years)" },
      { value: "any", label: "Any Edition" },
    ]},
    { key: "format", label: "Format", type: "radio", options: [
      { value: "physical", label: "Physical Book" },
      { value: "pdf", label: "PDF/Digital" },
    ]},
  ],
  cat4: [
    { key: "platform", label: "Platform", type: "checkbox", options: [
      { value: "ps5", label: "PlayStation 5" },
      { value: "ps4", label: "PlayStation 4" },
      { value: "xbox-series", label: "Xbox Series X/S" },
      { value: "xbox-one", label: "Xbox One" },
      { value: "nintendo-switch", label: "Nintendo Switch" },
      { value: "pc", label: "PC" },
    ]},
    { key: "genre", label: "Genre", type: "checkbox", options: [
      { value: "action", label: "Action" },
      { value: "adventure", label: "Adventure" },
      { value: "rpg", label: "RPG" },
      { value: "sports", label: "Sports" },
      { value: "fps", label: "FPS" },
      { value: "strategy", label: "Strategy" },
    ]},
  ],
  cat5: [
    { key: "roomType", label: "Room Type", type: "checkbox", options: [
      { value: "bedroom", label: "Bedroom" },
      { value: "kitchen", label: "Kitchen" },
      { value: "bathroom", label: "Bathroom" },
      { value: "living", label: "Living Room" },
      { value: "study", label: "Study" },
    ]},
    { key: "applianceType", label: "Appliance Type", type: "checkbox", options: [
      { value: "cooking", label: "Cooking" },
      { value: "cooling", label: "Cooling" },
      { value: "cleaning", label: "Cleaning" },
      { value: "storage", label: "Storage" },
    ]},
  ],
  cat6: [
    { key: "cuisine", label: "Cuisine", type: "checkbox", options: [
      { value: "nigerian", label: "Nigerian" },
      { value: "chinese", label: "Chinese" },
      { value: "indian", label: "Indian" },
      { value: "fast-food", label: "Fast Food" },
      { value: "healthy", label: "Healthy" },
      { value: "snacks", label: "Snacks" },
    ]},
    { key: "dietary", label: "Dietary", type: "checkbox", options: [
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "halal", label: "Halal" },
      { value: "gluten-free", label: "Gluten Free" },
    ]},
  ],
  cat7: [
    { key: "productType", label: "Product Type", type: "checkbox", options: [
      { value: "skincare", label: "Skincare" },
      { value: "haircare", label: "Haircare" },
      { value: "makeup", label: "Makeup" },
      { value: "fragrance", label: "Fragrance" },
      { value: "tools", label: "Tools & Accessories" },
    ]},
    { key: "skinType", label: "Skin Type", type: "checkbox", options: [
      { value: "oily", label: "Oily" },
      { value: "dry", label: "Dry" },
      { value: "combination", label: "Combination" },
      { value: "sensitive", label: "Sensitive" },
      { value: "normal", label: "Normal" },
    ]},
  ],
  cat8: [
    { key: "serviceType", label: "Service Type", type: "checkbox", options: [
      { value: "tutoring", label: "Tutoring" },
      { value: "repair", label: "Repair" },
      { value: "design", label: "Design" },
      { value: "writing", label: "Writing" },
      { value: "photography", label: "Photography" },
      { value: "delivery", label: "Delivery" },
      { value: "cleaning", label: "Cleaning" },
    ]},
  ],
};

export const GLOBAL_FILTER_DEFINITIONS: FilterDefinition[] = [
  { key: "condition", label: "Condition", type: "radio", options: [
    { value: "New", label: "New" },
    { value: "Used", label: "Used" },
  ]},
  { key: "minPrice", label: "Min Price", type: "range", min: 0, max: 500000, step: 1000, unit: "₦" },
  { key: "maxPrice", label: "Max Price", type: "range", min: 0, max: 500000, step: 1000, unit: "₦" },
  { key: "rating", label: "Rating", type: "radio", options: [
    { value: "4.5", label: "⭐ 4.5+" },
    { value: "4", label: "⭐ 4.0+" },
    { value: "3", label: "⭐ 3.0+" },
  ]},
  { key: "vendorVerified", label: "Verified Vendors Only", type: "checkbox", options: [
    { value: "true", label: "Verified Vendors Only" },
  ]},
  { key: "inStock", label: "In Stock", type: "checkbox", options: [
    { value: "true", label: "In Stock Only" },
  ]},
  { key: "onSale", label: "On Sale", type: "checkbox", options: [
    { value: "true", label: "On Sale Only" },
  ]},
];

export function getFilterDefinitionsForCategory(categoryId: string): FilterDefinition[] {
  const categoryFilters = CATEGORY_FILTER_DEFINITIONS[categoryId] || [];
  return [...GLOBAL_FILTER_DEFINITIONS, ...categoryFilters];
}

export function parseFilterValue(definition: FilterDefinition, value: string): string | string[] | number {
  if (definition.type === "range") {
    return parseFloat(value) || 0;
  }
  if (definition.type === "multi-select" || definition.type === "checkbox") {
    return value.split(",").filter(Boolean);
  }
  return value;
}

export function serializeFilterValue(definition: FilterDefinition, value: string | string[] | number): string {
  if (Array.isArray(value)) {
    return value.join(",");
  }
  return String(value);
}

export function buildActiveFilters(filters: Record<string, string>, categoryId: string): ActiveFilter[] {
  const definitions = getFilterDefinitionsForCategory(categoryId);
  const active: ActiveFilter[] = [];

  for (const def of definitions) {
    const value = filters[def.key];
    if (!value) continue;

    const parsed = parseFilterValue(def, value);
    
    if (def.type === "range") {
      if (def.key === "minPrice" && filters.maxPrice) {
        active.push({
          key: "priceRange",
          label: `₦${Number(filters.minPrice).toLocaleString()} – ₦${Number(filters.maxPrice).toLocaleString()}`,
          value: `${filters.minPrice}-${filters.maxPrice}`,
          removable: true,
        });
      } else if (def.key === "maxPrice" && !filters.minPrice) {
        active.push({
          key: "maxPrice",
          label: `Max: ₦${Number(value).toLocaleString()}`,
          value: String(value),
          removable: true,
        });
      } else if (def.key === "minPrice" && !filters.maxPrice) {
        active.push({
          key: "minPrice",
          label: `Min: ₦${Number(value).toLocaleString()}`,
          value: String(value),
          removable: true,
        });
      }
    } else if (def.type === "checkbox" && Array.isArray(parsed)) {
      for (const v of parsed) {
        const opt = def.options?.find(o => o.value === v);
        active.push({
          key: `${def.key}:${v}`,
          label: opt?.label || v,
          value: v,
          removable: true,
        });
      }
    } else {
      const opt = def.options?.find(o => o.value === parsed);
      active.push({
        key: def.key,
        label: opt?.label || def.label,
        value: String(parsed),
        removable: true,
      });
    }
  }

  return active;
}