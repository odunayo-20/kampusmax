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
    storeName: "CampusBites",
    description:
      "Fresh, affordable meals delivered to your hostel or lecture hall. Rice, noodles, suya, and more. Fast delivery, great taste!",
    rating: 4.9,
    totalSales: 120,
    verified: true,
    campusId: "rugipo",
    specialties: ["Food", "Snacks", "Drinks"],
  },
];

export function getVendorByUserId(userId: string): Vendor | undefined {
  return vendors.find((v) => v.userId === userId);
}

export function getVendorById(vendorId: string): Vendor | undefined {
  return vendors.find((v) => v.id === vendorId);
}

export function getUserById(userId: string): User | undefined {
  return users.find((u) => u.id === userId);
}
