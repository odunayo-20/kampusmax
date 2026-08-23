"use client";

// ============================================================
// ADMIN UI STATE
// Sidebar collapse (persisted), mobile drawer and command-palette
// open state shared between AdminSidebar/AdminHeader/pages.
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

interface AdminUIValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

const STORAGE_KEY = "kampmax.admin.sidebarCollapsed";

const AdminUIContext = createContext<AdminUIValue | null>(null);

export function AdminUIProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Restore preference after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed, mobileNavOpen, setMobileNavOpen }),
    [collapsed, toggleCollapsed, mobileNavOpen]
  );

  return (
    <AdminUIContext.Provider value={value}>
      {children}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI(): AdminUIValue {
  const ctx = useContext(AdminUIContext);
  if (!ctx) throw new Error("useAdminUI must be used within AdminUIProvider");
  return ctx;
}
