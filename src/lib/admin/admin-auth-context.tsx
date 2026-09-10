"use client";

// ============================================================
// ADMIN SESSION (Module 34)
//
// Session layer for the operations console. Unlike the previous
// auto-signed-in mock, an operator must authenticate through the
// admin auth service (the authorization boundary); the session token
// persists in localStorage and is revalidated on every app load.
// Frontend status is UX only — the backend (service layer) remains the
// security boundary. Consumers keep reading `useAdminSession()`, but
// `admin` may be `null` while status is "loading" or "unauthenticated".
// Route rendering is gated by the AuthBoundary in AdminShell; components
// should treat `admin === null` as "definitely not signed in".
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AdminProfile } from "@/types/admin";
import { adminAuthService } from "@/services/admin";
import { adminKeys } from "@/lib/query-keys";

export const ADMIN_SESSION_STORAGE_KEY = "kampmax_admin_token";

export type AdminAuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AdminSessionActionResult =
  | { success: true }
  | { success: false; message: string };

export interface AdminSessionValue {
  admin: AdminProfile | null;
  admins: AdminProfile[];
  status: AdminAuthStatus;
  token: string | null;
  /** The identity the operator originally signed in as (session scope). */
  baseAdmin: AdminProfile | null;
  /** True while the current `admin` differs from the original sign-in. */
  isSwitchedAccount: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<AdminSessionActionResult>;
  logout: () => Promise<void>;
  switchAccount: (
    adminId: string
  ) => Promise<AdminSessionActionResult>;
  /** Switch back to the original sign-in identity (impersonation exit). */
  switchBackToBase: () => Promise<AdminSessionActionResult>;
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
}

function persistToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, token);
}

function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [status, setStatus] = useState<AdminAuthStatus>("loading");
  const [baseAdminId, setBaseAdminId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const stored = getStoredToken();
      if (!stored) {
        setStatus("unauthenticated");
        return;
      }
      const result = await adminAuthService.getCurrentSession(stored);
      if (cancelled) return;
      if (result) {
        setToken(stored);
        setAdmin(result.admin);
        setBaseAdminId(result.admin.id);
        setAdmins(await adminAuthService.listActiveAdmins());
        setStatus("authenticated");
      } else {
        clearStoredToken();
        setStatus("unauthenticated");
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AdminSessionActionResult> => {
      const result = await adminAuthService.login({ email, password });
      if (!result.success) {
        return { success: false, message: result.message };
      }
      persistToken(result.token);
      setToken(result.token);
      setAdmin(result.admin);
      setBaseAdminId(result.admin.id);
      setAdmins(await adminAuthService.listActiveAdmins());
      setStatus("authenticated");
      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    const current = token;
    setStatus("loading");
    if (current) {
      await adminAuthService.logout(current);
    }
    clearStoredToken();
    setToken(null);
    setAdmin(null);
    setBaseAdminId(null);
    setStatus("unauthenticated");
    queryClient.removeQueries({ queryKey: adminKeys.all });
  }, [token, queryClient]);

  const switchAccount = useCallback(
    async (adminId: string): Promise<AdminSessionActionResult> => {
      if (!token) {
        return { success: false, message: "No active session." };
      }
      const result = await adminAuthService.switchAccount(token, adminId);
      if (!result.success) {
        return { success: false, message: result.message };
      }
      persistToken(result.token);
      setToken(result.token);
      setAdmin(result.admin);
      setStatus("authenticated");
      // Role/campus scope changed - drop any cached admin data.
      queryClient.removeQueries({ queryKey: adminKeys.all });
      return { success: true };
    },
    [token, queryClient]
  );

  const switchBackToBase = useCallback(async () => {
    if (!baseAdminId || !admin || baseAdminId === admin.id) {
      return { success: false, message: "No switched account to return from." };
    }
    return switchAccount(baseAdminId);
  }, [baseAdminId, admin, switchAccount]);

  const baseAdmin = useMemo(
    () => admins.find((a) => a.id === baseAdminId) ?? null,
    [admins, baseAdminId]
  );
  const isSwitchedAccount =
    baseAdminId !== null && admin !== null && baseAdminId !== admin.id;

  const value = useMemo(
    () => ({
      admin,
      admins,
      status,
      token,
      baseAdmin,
      isSwitchedAccount,
      login,
      logout,
      switchAccount,
      switchBackToBase,
    }),
    [
      admin,
      admins,
      status,
      token,
      baseAdmin,
      isSwitchedAccount,
      login,
      logout,
      switchAccount,
      switchBackToBase,
    ]
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
    throw new Error(
      "useAdminSession must be used within AdminSessionProvider"
    );
  }
  return ctx;
}