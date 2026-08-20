import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "p1",
    title: "Engineering Mathematics Textbook",
    description:
      "Advanced Engineering Mathematics by Erwin Kreyszig, 10th Edition. Slightly used with minor highlighting. Covers differential equations, linear algebra, complex analysis. Essential for Engineering and Science students.",
    price: 8500,
    originalPrice: 15000,
    categoryId: "cat1",
    vendorId: "v1",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "Used",
    status: "available",
    createdAt: "2025-01-10",
    location: "Engineering Block",
    tags: ["textbook", "mathematics", "engineering"],
  },
  {
    id: "p2",
    title: "HP Laptop i5 8GB RAM",
    description:
      "HP ProBook 440 G8, Intel Core i5 11th Gen, 8GB RAM, 256GB SSD. Perfect for programming, design, and school work. Comes with charger. Battery lasts 4+ hours.",
    price: 185000,
    categoryId: "cat2",
    vendorId: "v1",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "Used",
    status: "available",
    createdAt: "2025-01-08",
    location: "Computer Lab Area",
    tags: ["laptop", "hp", "computer"],
  },
  {
    id: "p3",
    title: "Casio Scientific Calculator",
    description:
      "Casio FX-991ES Plus. Essential for engineering and science courses. Fully functional with manual. Limited stock available.",
    price: 12000,
    categoryId: "cat2",
    vendorId: "v1",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "New",
    status: "available",
    createdAt: "2025-01-12",
    location: "Main Gate",
    tags: ["calculator", "casio", "scientific"],
  },
  {
    id: "p4",
    title: "ND2 Past Questions Pack",
    description:
      "Complete past questions for ND2 Computer Science courses: CST201, CST202, CST203, MAT201, GST201. Includes answers and solutions from 2019-2024.",
    price: 3000,
    categoryId: "cat1",
    vendorId: "v2",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "New",
    status: "available",
    createdAt: "2025-01-11",
    location: "Library",
    tags: ["past questions", "ND2", "computer science"],
  },
  {
    id: "p5",
    title: "Nike Air Max Sneakers",
    description:
      "Authentic Nike Air Max 270, size 42. Worn twice, almost new condition. Black/White colorway. Original box included.",
    price: 35000,
    originalPrice: 65000,
    categoryId: "cat3",
    vendorId: "v2",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "Used",
    status: "available",
    createdAt: "2025-01-09",
    location: "Student Union Building",
    tags: ["nike", "sneakers", "shoes"],
  },
  {
    id: "p6",
    title: "JBL Flip 6 Speaker",
    description:
      "JBL Flip 6 Bluetooth speaker. Powerful bass, waterproof, 12-hour battery life. Great for hostel parties and study sessions. Includes original packaging.",
    price: 45000,
    originalPrice: 75000,
    categoryId: "cat2",
    vendorId: "v1",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "Used",
    status: "available",
    createdAt: "2025-01-07",
    location: "Engineering Block",
    tags: ["speaker", "jbl", "bluetooth"],
  },
  {
    id: "p7",
    title: "Python Programming for Beginners",
    description:
      "Python Crash Course by Eric Matthes, 3rd Edition. Perfect for CS students starting with Python. Covers basics, data visualization, and web apps.",
    price: 5500,
    originalPrice: 9000,
    categoryId: "cat1",
    vendorId: "v1",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "New",
    status: "available",
    createdAt: "2025-01-13",
    location: "Computer Lab Area",
    tags: ["python", "programming", "textbook"],
  },
  {
    id: "p8",
    title: "RUGIPO Campus Hoodie",
    description:
      "Premium cotton hoodie with RUGIPO branding. Available in Navy Blue and Grey. Sizes: M, L, XL. Soft, warm, and perfect for early morning lectures.",
    price: 7500,
    categoryId: "cat3",
    vendorId: "v2",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "New",
    status: "available",
    createdAt: "2025-01-14",
    location: "Student Union Building",
    tags: ["hoodie", "campus", "fashion"],
  },
  {
    id: "p9",
    title: "Mini Gas Cooker + Cylinder",
    description:
      "Portable 2-burner gas cooker with small cylinder. Perfect for hostel cooking. Cylinder is half-full and will be refilled before delivery. Includes lighter.",
    price: 18000,
    categoryId: "cat5",
    vendorId: "v3",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "New",
    status: "available",
    createdAt: "2025-01-06",
    location: "Main Gate",
    tags: ["cooker", "gas", "hostel"],
  },
  {
    id: "p10",
    title: "MEGA Power Bank 20000mAh",
    description:
      "High-capacity 20000mAh power bank with dual USB output. Charges phone 4-5 times. LED battery indicator. Fast charging supported.",
    price: 9500,
    originalPrice: 14000,
    categoryId: "cat2",
    vendorId: "v1",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "New",
    status: "available",
    createdAt: "2025-01-12",
    location: "Main Gate",
    tags: ["power bank", "charger", "accessories"],
  },
  {
    id: "p11",
    title: "Jollof Rice + Chicken (CampusBites)",
    description:
      "Delicious jollof rice with fried chicken, coleslaw, and plantain. Prepared fresh daily. Delivery to any location on RUGIPO campus within 30 minutes.",
    price: 2500,
    categoryId: "cat6",
    vendorId: "v3",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "New",
    status: "available",
    createdAt: "2025-01-15",
    location: "Cafeteria",
    tags: ["food", "jollof", "meal"],
  },
  {
    id: "p12",
    title: "HP Printer Scanner",
    description:
      "HP DeskJet 2810e all-in-one printer, scanner, and copier. WiFi enabled. Great for project submissions and assignments. Comes with ink cartridges.",
    price: 55000,
    originalPrice: 85000,
    categoryId: "cat2",
    vendorId: "v1",
    campusId: "rugipo",
    images: ["/placeholder-product.svg"],
    condition: "Used",
    status: "available",
    createdAt: "2025-01-05",
    location: "Computer Lab Area",
    tags: ["printer", "scanner", "hp"],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getProductsByVendor(vendorId: string): Product[] {
  return products.filter((p) => p.vendorId === vendorId);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );
}

export function getRecentProducts(): Product[] {
  return [...products].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
