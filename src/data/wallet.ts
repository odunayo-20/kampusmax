import { Wallet, WalletTransaction } from "@/types";

export const walletTransactions: WalletTransaction[] = [
  {
    id: "wt1",
    walletId: "w1",
    type: "deposit",
    amount: 50000,
    status: "completed",
    description: "Bank transfer deposit",
    reference: "DEP-2025-001",
    createdAt: "2025-01-05T10:00:00Z",
    completedAt: "2025-01-05T10:02:00Z",
  },
  {
    id: "wt2",
    walletId: "w1",
    type: "payment",
    amount: 12000,
    status: "completed",
    description: "Payment for Casio Scientific Calculator",
    reference: "ORD-KMP-3847",
    createdAt: "2025-01-10T14:30:00Z",
    completedAt: "2025-01-10T14:30:01Z",
    orderId: "KMP-3847",
  },
  {
    id: "wt3",
    walletId: "w1",
    type: "payment",
    amount: 9500,
    status: "completed",
    description: "Payment for MEGA Power Bank",
    reference: "ORD-KMP-3847",
    createdAt: "2025-01-10T14:30:00Z",
    completedAt: "2025-01-10T14:30:01Z",
    orderId: "KMP-3847",
  },
  {
    id: "wt4",
    walletId: "w1",
    type: "deposit",
    amount: 100000,
    status: "completed",
    description: "Paystack deposit",
    reference: "DEP-2025-002",
    createdAt: "2025-01-12T09:00:00Z",
    completedAt: "2025-01-12T09:01:00Z",
  },
  {
    id: "wt5",
    walletId: "w1",
    type: "payment",
    amount: 35000,
    status: "completed",
    description: "Payment for Nike Air Max Sneakers",
    reference: "ORD-KMP-4102",
    createdAt: "2025-01-14T16:00:00Z",
    completedAt: "2025-01-14T16:00:01Z",
    orderId: "KMP-4102",
  },
  {
    id: "wt6",
    walletId: "w1",
    type: "withdrawal",
    amount: 20000,
    status: "completed",
    description: "Withdrawal to GTBank ending in 4567",
    reference: "WTH-2025-001",
    createdAt: "2025-01-13T11:00:00Z",
    completedAt: "2025-01-13T15:00:00Z",
  },
];

export const wallets: Wallet[] = [
  {
    id: "w1",
    userId: "u1",
    balance: 73500,
    currency: "NGN",
    isActive: true,
    createdAt: "2024-09-01T09:00:00Z",
    transactions: walletTransactions,
  },
];

export function getWalletByUser(userId: string): Wallet | undefined {
  return wallets.find((w) => w.userId === userId);
}

export function getWalletTransactions(walletId: string): WalletTransaction[] {
  return walletTransactions.filter((t) => t.walletId === walletId);
}
