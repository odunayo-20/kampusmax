import { Wallet, WalletTransaction, WalletTransactionType, WalletTransactionStatus } from "@/types";
import {
  wallets as mockWallets,
  walletTransactions as mockTransactions,
  getWalletByUser as _getWalletByUser,
  getWalletTransactions as _getWalletTransactions,
} from "@/data/wallet";

export function getWallet(userId: string): Wallet | undefined {
  return _getWalletByUser(userId);
}

export function getWalletBalance(userId: string): number {
  const wallet = _getWalletByUser(userId);
  return wallet?.balance ?? 0;
}

export function getPendingAmount(userId: string): number {
  const wallet = _getWalletByUser(userId);
  return wallet?.pendingAmount ?? 0;
}

export function getWalletTransactions(walletId: string): WalletTransaction[] {
  return _getWalletTransactions(walletId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTransactionById(txId: string): WalletTransaction | undefined {
  return mockTransactions.find((t) => t.id === txId);
}

export function getTransactionsByType(
  walletId: string,
  type: WalletTransactionType
): WalletTransaction[] {
  return _getWalletTransactions(walletId)
    .filter((t) => t.type === type)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTransactionsByStatus(
  walletId: string,
  status: WalletTransactionStatus
): WalletTransaction[] {
  return _getWalletTransactions(walletId)
    .filter((t) => t.status === status)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getCreditedTotal(walletId: string): number {
  return _getWalletTransactions(walletId)
    .filter((t) => t.direction === "credit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getDebitedTotal(walletId: string): number {
  return _getWalletTransactions(walletId)
    .filter((t) => t.direction === "debit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
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
    direction: "credit",
    amount,
    status: "completed",
    description,
    reference: `DEP-${Date.now()}`,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  mockTransactions.push(tx);
  wallet.transactions.push(tx);
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
    type: "purchase",
    direction: "debit",
    amount,
    status: "completed",
    description,
    reference: orderId ? `ORD-${orderId}` : `PAY-${Date.now()}`,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    orderId,
  };
  mockTransactions.push(tx);
  wallet.transactions.push(tx);
  wallet.balance -= amount;
  return tx;
}

export function withdrawFromWallet(
  userId: string,
  amount: number,
  bankName: string,
  bankAccount: string
): WalletTransaction | undefined {
  const wallet = _getWalletByUser(userId);
  if (!wallet || wallet.balance < amount) return undefined;

  const tx: WalletTransaction = {
    id: `wt${mockTransactions.length + 1}`,
    walletId: wallet.id,
    type: "withdrawal",
    direction: "debit",
    amount,
    status: "processing",
    description: `Withdrawal to ${bankName} ending in ${bankAccount.slice(-4)}`,
    reference: `WTH-${Date.now()}`,
    createdAt: new Date().toISOString(),
    bankName,
    bankAccount,
  };
  mockTransactions.push(tx);
  wallet.transactions.push(tx);
  wallet.balance -= amount;
  wallet.pendingAmount += amount;
  return tx;
}
