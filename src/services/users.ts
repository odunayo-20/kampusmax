import { User, Vendor } from "@/types";
import {
  users as mockUsers,
  currentUser as mockCurrentUser,
  vendors as mockVendors,
  getVendorByUserId as _getVendorByUserId,
  getVendorById as _getVendorById,
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

export function getVendorByUserId(userId: string): Vendor | undefined {
  return _getVendorByUserId(userId);
}

export function getTopVendors(): Vendor[] {
  return [...mockVendors].sort((a, b) => b.rating - a.rating);
}
