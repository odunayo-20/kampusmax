import { User, Vendor } from "@/types";
import {
  users as mockUsers,
  currentUser as mockCurrentUser,
  vendors as mockVendors,
  getVendorByUserId as _getVendorByUserId,
  getVendorById as _getVendorById,
  getVendorBySlug as _getVendorBySlug,
  getUserById as _getUserById,
} from "@/data/users";

export function getCurrentUser(): User {
  return mockCurrentUser;
}

export function getUserById(id: string): User | undefined {
  return _getUserById(id);
}

export function getUsers(): User[] {
  return mockUsers;
}

export function getVendors(): Vendor[] {
  return mockVendors;
}

export function getVendorById(id: string): Vendor | undefined {
  return _getVendorById(id);
}

export function getVendorBySlug(slug: string): Vendor | undefined {
  return _getVendorBySlug(slug);
}

export function getVendorByUserId(userId: string): Vendor | undefined {
  return _getVendorByUserId(userId);
}

export function getTopVendors(): Vendor[] {
  return [...mockVendors].sort((a, b) => b.rating - a.rating);
}

export function getVendorsByCampus(campusId: string): Vendor[] {
  return mockVendors.filter((v) => v.campusId === campusId);
}

export function getTopVendorsByCampus(campusId: string): Vendor[] {
  return mockVendors
    .filter((v) => v.campusId === campusId)
    .sort((a, b) => b.rating - a.rating);
}
