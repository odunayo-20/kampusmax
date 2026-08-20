import { Wallet, WalletTransaction } from "@/types";
import {
  wallets as mockWallets,
  walletTransactions as mockTransactions,
  getWalletByUser as _getWalletByUser,
  getWalletTransactions as _getWalletTransactions,
} from "@/data/wallet";

export function getWallet(userId: string): Wallet | undefined {
  return _getWalletByUser(userId);
}

export function getWalletTransactions(walletId: string): WalletTransaction[] {
  return _getWalletTransactions(walletId).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getWalletBalance(userId: string): number {
  const wallet = _getWalletByUser(userId);
  return wallet?.balance ?? 0;
}

export function depositToWallet(
  userId: string,
  amount: number,
  description: string
): WalletTransaction | undefined {
  const wallet = _getWalletByUser(userId);
  if (!wallet) return undefined;

  const tx: WalletTransaction = {
    id: `wt${mockTransactions.length + 1}`,
    walletId: wallet.id,
    type: "deposit",
    amount,
    status: "completed",
    description,
    reference: `DEP-${Date.now()}`,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  mockTransactions.push(tx);
  wallet.balance += amount;
  return tx;
}

export function payFromWallet(
  userId: string,
  amount: number,
  description: string,
  orderId?: string
): WalletTransaction | undefined {
  const wallet = _getWalletByUser(userId);
  if (!wallet || wallet.balance < amount) return undefined;

  const tx: WalletTransaction = {
    id: `wt${mockTransactions.length + 1}`,
    walletId: wallet.id,
    type: "payment",
    amount,
    status: "completed",
    description,
    reference: orderId ? `ORD-${orderId}` : `PAY-${Date.now()}`,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    orderId,
  };
  mockTransactions.push(tx);
  wallet.balance -= amount;
  return tx;
}
