export type VariantOption = {
  id: string;
  label: string;
  value: string;
  available: boolean;
  priceModifier?: number;
  stock?: number;
};

export type VariantGroup = {
  id: string;
  name: string;
  options: VariantOption[];
};

export type PersonalizationField = {
  id: string;
  label: string;
  type: "text" | "select" | "file" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type SpecItem = {
  label: string;
  value: string;
};

export type DeliveryOption = {
  label: string;
  price: number;
  eta: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function getVariantGroups(productId: string, categoryId: string): VariantGroup[] {
  const seed = hashSeed(productId);
  if (categoryId === "cat3") {
    return [
      {
        id: "color",
        name: "Color",
        options: [
          { id: "black", label: "Black", value: "Black", available: true },
          { id: "white", label: "White", value: "White", available: true },
          { id: "navy", label: "Navy", value: "Navy", available: seed % 3 !== 0 },
          { id: "olive", label: "Olive", value: "Olive", available: seed % 5 !== 0 },
        ],
      },
      {
        id: "size",
        name: "Size",
        options: [
          { id: "s", label: "S", value: "S", available: true },
          { id: "m", label: "M", value: "M", available: true },
          { id: "l", label: "L", value: "L", available: true },
          { id: "xl", label: "XL", value: "XL", available: seed % 2 === 0 },
        ],
      },
    ];
  }
  if (categoryId === "cat2") {
    return [
      {
        id: "storage",
        name: "Storage",
        options: [
          { id: "128", label: "128GB", value: "128GB", available: true, priceModifier: 0 },
          { id: "256", label: "256GB", value: "256GB", available: true, priceModifier: 15000 },
          { id: "512", label: "512GB", value: "512GB", available: seed % 4 !== 0, priceModifier: 35000 },
        ],
      },
      {
        id: "color",
        name: "Color",
        options: [
          { id: "space-gray", label: "Space Gray", value: "Space Gray", available: true },
          { id: "silver", label: "Silver", value: "Silver", available: true },
          { id: "midnight", label: "Midnight", value: "Midnight", available: seed % 3 !== 1 },
        ],
      },
    ];
  }
  if (categoryId === "cat1") {
    return [
      {
        id: "condition-variant",
        name: "Condition",
        options: [
          { id: "new", label: "New", value: "New", available: true, priceModifier: 2000 },
          { id: "used-good", label: "Used - Good", value: "Used - Good", available: true, priceModifier: 0 },
          { id: "used-fair", label: "Used - Fair", value: "Used - Fair", available: seed % 3 !== 0, priceModifier: -1500 },
        ],
      },
    ];
  }
  if (categoryId === "cat4") {
    return [
      {
        id: "platform",
        name: "Platform",
        options: [
          { id: "ps5", label: "PS5", value: "PS5", available: true },
          { id: "xbox", label: "Xbox", value: "Xbox", available: seed % 2 === 0 },
          { id: "pc", label: "PC", value: "PC", available: true },
        ],
      },
    ];
  }
  return [];
}

export function getPersonalizationFields(productId: string, categoryId: string): PersonalizationField[] | null {
  const seed = hashSeed(productId);
  if (categoryId === "cat3" && seed % 2 === 0) {
    return [
      { id: "print-name", label: "Name to print", type: "text", placeholder: "e.g. David", required: false },
      { id: "print-color", label: "Print color", type: "select", options: ["Black", "White", "Gold"], required: false },
    ];
  }
  if (categoryId === "cat6" && seed % 3 === 0) {
    return null;
  }
  if (seed % 5 === 0) {
    return [
      { id: "instructions", label: "Special instructions", type: "textarea", placeholder: "Any notes for the seller..." },
    ];
  }
  return null;
}

export function getSpecs(productId: string, categoryId: string): SpecItem[] {
  const base: SpecItem[] = [
    { label: "Brand", value: categoryId === "cat2" ? "HP / JBL / Casio" : "Kampmax Verified" },
    { label: "Condition", value: "See variant" },
    { label: "Campus", value: "RUGIPO" },
  ];
  if (categoryId === "cat2") base.push({ label: "Warranty", value: "6 months" }, { label: "Connection", value: "Wireless / USB-C" });
  if (categoryId === "cat3") base.push({ label: "Material", value: "Cotton / Poly blend" }, { label: "Fit", value: "Unisex" });
  if (categoryId === "cat1") base.push({ label: "Edition", value: "Latest" }, { label: "Pages", value: "320+" });
  return base;
}

export function getStockForSelection(productId: string, selected: Record<string, string>): number {
  const seed = hashSeed(productId + JSON.stringify(selected));
  const v = seed % 7;
  if (Object.values(selected).some((v) => v === "olive" || v === "512")) return seed % 3 === 0 ? 0 : 3;
  return v === 0 ? 1 : v === 1 ? 0 : v;
}

export function calculateVariantPriceModifier(variantGroups: VariantGroup[], selectedVariants: Record<string, string>): number {
  let mod = 0;
  variantGroups.forEach((g) => {
    const sel = selectedVariants[g.id];
    const opt = g.options.find((o) => o.id === sel);
    if (opt?.priceModifier) mod += opt.priceModifier;
  });
  return mod;
}

export function areAllVariantsSelected(variantGroups: VariantGroup[], selectedVariants: Record<string, string>): boolean {
  return variantGroups.every((g) => selectedVariants[g.id]);
}

export function isPersonalizationValid(personalizationFields: PersonalizationField[] | null, personalization: Record<string, string>): boolean {
  if (!personalizationFields) return true;
  return personalizationFields.every((f) => !f.required || (personalization[f.id] && personalization[f.id].trim().length > 0));
}