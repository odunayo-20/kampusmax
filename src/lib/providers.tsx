"use client";

import { ReactNode } from "react";
import { AppProvider } from "@/lib/app-context";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>{children}</CartProvider>
      </AppProvider>
    </AuthProvider>
  );
}
