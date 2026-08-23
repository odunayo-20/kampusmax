"use client";

// ============================================================
// ADMIN SESSION (MOCK)
//
// No real authentication yet. This provider simulates a signed-in
// operator and supports switching between seeded admin accounts so
// role-aware UI can be exercised. When real auth lands, replace the
// state here with session fetch + refresh flow against the API -
// consumers keep reading `useAdminSession()`.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AdminProfile } from "@/types/admin";
import { mockAdmins } from "@/data/admin/people";

interface AdminSessionValue {
  admin: AdminProfile;
  admins: AdminProfile[];
  switchAccount: (adminId: string) => void;
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [currentId, setCurrentId] = useState<string>(mockAdmins[0].id);

  const admin = useMemo(
    () => mockAdmins.find((a) => a.id === currentId) ?? mockAdmins[0],
    [currentId]
  );

  const switchAccount = useCallback((adminId: string) => {
    setCurrentId(adminId);
  }, []);

  const value = useMemo(
    () => ({ admin, admins: mockAdmins, switchAccount }),
    [admin, switchAccount]
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSessionValue {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return ctx;
}
