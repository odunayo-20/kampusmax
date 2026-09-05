"use client";

import { ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/lib/app-context";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { createQueryClient } from "@/lib/query-client";
import { NotificationSyncBridge } from "@/components/notifications/NotificationSyncBridge";
import { MessageSyncBridge } from "@/components/messages/MessageSyncBridge";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationSyncBridge />
        <MessageSyncBridge />
        <AppProvider>
          <CartProvider>{children}</CartProvider>
        </AppProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
