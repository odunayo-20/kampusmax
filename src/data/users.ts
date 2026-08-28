import { User, Vendor } from "@/types";

export const users: User[] = [
  {
    id: "u1",
    name: "Adebayo Oluwaseun",
    email: "adebayo@rugipo.edu.ng",
    phone: "+234 812 345 6789",
    campusId: "rugipo",
    role: "student",
    avatar: "",
    bio: "ND2 Computer Science student at RUGIPO. Love tech and coding.",
    joinedDate: "2024-09-01",
    department: "Computer Science",
    level: "ND2",
    isVerified: true,
  },
  {
    id: "u2",
    name: "Chioma Nwosu",
    email: "chioma@rugipo.edu.ng",
    phone: "+234 813 456 7890",
    campusId: "rugipo",
    role: "vendor",
    avatar: "",
    bio: "Fashion lover and campus stylist. Shop my latest collections!",
    joinedDate: "2024-06-15",
    department: "Business Administration",
    level: "HND1",
    isVerified: true,
  },
  {
    id: "u3",
    name: "Ibrahim Musa",
    email: "ibrahim@rugipo.edu.ng",
    phone: "+234 814 567 8901",
    campusId: "rugipo",
    role: "vendor",
    avatar: "",
    bio: "Your go-to guy for gadgets and electronics on campus.",
    joinedDate: "2024-03-10",
    department: "Electrical Engineering",
    level: "ND2",
    isVerified: true,
  },
  {
    id: "u4",
    name: "Folashade Adeyemi",
    email: "folashade@rugipo.edu.ng",
    phone: "+234 815 678 9012",
    campusId: "rugipo",
    role: "student",
    avatar: "",
    bio: "Accounting student. Always looking for textbooks and deals.",
    joinedDate: "2024-08-20",
    department: "Accounting",
    level: "HND2",
  },
  {
    id: "u5",
    name: "Emeka Obi",
    email: "emeka@rugipo.edu.ng",
    phone: "+234 816 789 0123",
    campusId: "rugipo",
    role: "vendor",
    avatar: "",
    bio: "Food vendor. Campus meals delivered to your hostel!",
    joinedDate: "2024-05-01",
    department: "Mass Communication",
    level: "ND1",
    isVerified: true,
  },
];

export const currentUser = users[0]; // Adebayo - the default student

export const vendors: Vendor[] = [
  {
    id: "v1",
    userId: "u3",
    slug: "techhub-owo",
    storeName: "TechHub Owo",
    description:
      "Your one-stop shop for electronics and gadgets on campus. We sell phones, laptops, chargers, speakers, and more. All products tested and verified.",
    rating: 4.8,
    totalSales: 45,
    verified: true,
    campusId: "rugipo",
    specialties: ["Electronics", "Gadgets", "Accessories"],
  },
  {
    id: "v2",
    userId: "u2",
    slug: "stylebychi",
    storeName: "StyleByChi",
    description:
      "Trendy fashion items for the modern campus student. Sneakers, hoodies, t-shirts, and accessories at student-friendly prices.",
    rating: 4.6,
    totalSales: 32,
    verified: true,
    campusId: "rugipo",
    specialties: ["Fashion", "Sneakers", "Accessories"],
  },
  {
    id: "v3",
    userId: "u5",
    slug: "campusbites",
    storeName: "CampusBites",
    description:
      "Fresh, affordable meals delivered to your hostel or lecture hall. Rice, noodles, suya, and more. Fast delivery, great taste!",
    rating: 4.9,
    totalSales: 120,
    verified: true,
    campusId: "rugipo",
    specialties: ["Food", "Snacks", "Drinks"],
  },
  {
    id: "v4",
    userId: "u6",
    slug: "ife-bookstore",
    storeName: "IfeBookStore",
    description:
      "Textbooks and academic materials for all departments at OAU. New and used books at fair prices.",
    rating: 4.5,
    totalSales: 28,
    verified: true,
    campusId: "oau",
    specialties: ["Textbooks", "Academic", "Stationery"],
  },
  {
    id: "v5",
    userId: "u7",
    slug: "oau-merch",
    storeName: "OAU Merch Shop",
    description:
      "Official and custom OAU merchandise. T-shirts, hoodies, caps, and more. Show your purple pride!",
    rating: 4.3,
    totalSales: 18,
    verified: false,
    campusId: "oau",
    specialties: ["Fashion", "Merchandise", "Accessories"],
  },
  {
    id: "v6",
    userId: "u8",
    slug: "ui-gadgets",
    storeName: "UI Gadgets",
    description:
      "Quality gadgets and electronics for UI students. Phones, laptops, accessories. Trade-in available.",
    rating: 4.7,
    totalSales: 35,
    verified: true,
    campusId: "ui",
    specialties: ["Electronics", "Phones", "Accessories"],
  },
  {
    id: "v7",
    userId: "u9",
    slug: "lagos-campus-mall",
    storeName: "Lagos Campus Mall",
    description:
      "One-stop shop for UNILAG students. Electronics, fashion, food, and academic materials.",
    rating: 4.4,
    totalSales: 22,
    verified: true,
    campusId: "unilag",
    specialties: ["Electronics", "Fashion", "Food"],
  },
  {
    // Owner of the default seller dashboard demo (u1 = Adebayo, approved vendor)
    id: "v8",
    userId: "u1",
    slug: "adebayo-gadgets",
    storeName: "Adebayo's Gadgets",
    description:
      "Gadgets, electronics and campus essentials from a fellow student. Affordable, tested, and delivered with a smile.",
    rating: 4.7,
    totalSales: 45,
    verified: true,
    campusId: "rugipo",
    specialties: ["Electronics", "Gadgets", "Accessories"],
    coverImage: "",
    responseTime: "Within 30 minutes",
    joinDate: "2025-02-01T09:00:00Z",
  },
];

export function getVendorByUserId(userId: string): Vendor | undefined {
  return vendors.find((v) => v.userId === userId);
}

export function getVendorById(vendorId: string): Vendor | undefined {
  return vendors.find((v) => v.id === vendorId);
}

export function getVendorBySlug(slug: string): Vendor | undefined {
  return vendors.find((v) => v.slug === slug);
}

export function getUserById(userId: string): User | undefined {
  return users.find((u) => u.id === userId);
}
