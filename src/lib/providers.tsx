"use client";

import { ReactNode } from "react";
import { AppProvider } from "@/lib/app-context";
import { CartProvider } from "@/lib/cart-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <CartProvider>{children}</CartProvider>
    </AppProvider>
  );
}
