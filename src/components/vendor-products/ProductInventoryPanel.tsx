"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  PackageOpen,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { cn, formatNaira, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Product } from "@/types";
import type { InventoryMovement } from "@/types/vendor-products";
import { getStockStatus, productStockStatusVariant } from "@/types/vendor-products";
import { ProductStockBadge } from "./product-meta";
import { StatusBadge } from "@/components/admin/StatusBadge";

type AdjustmentActionType = "add" | "subtract" | "set";

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-xs font-medium text-kampmax-text-secondary mb-1.5", className)} {...props}>{children}</label>;
}

interface ProductInventoryPanelProps {
  product: Product;
  onAdjustInventory: (input: { type: AdjustmentActionType; quantity: number; reason: string; expectedStock?: number }) => Promise<void>;
  onSetThreshold: (threshold: number) => Promise<void>;
  movements: InventoryMovement[];
  isLoading?: boolean;
}

const REASON_OPTIONS = [
  { value: "restock", label: "Restock / New inventory received" },
  { value: "sale", label: "Sale / Order fulfilled" },
  { value: "return", label: "Customer return" },
  { value: "damage", label: "Damaged / Written off" },
  { value: "transfer", label: "Transfer to another location" },
  { value: "adjustment", label: "Manual adjustment / Count correction" },
  { value: "other", label: "Other" },
] as const;

const ADJUSTMENT_TYPES: { value: AdjustmentActionType; label: string; icon: React.ElementType }[] = [
  { value: "add", label: "Add Stock", icon: Plus },
  { value: "subtract", label: "Remove Stock", icon: Minus },
  { value: "set", label: "Set Exact Quantity", icon: PackageOpen },
];

export function ProductInventoryPanel({
  product,
  onAdjustInventory,
  onSetThreshold,
  movements,
  isLoading,
}: ProductInventoryPanelProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentActionType>("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [threshold, setThreshold] = useState(product.lowStockThreshold ?? 5);
  const [showHistory, setShowHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentStock = product.stock ?? 0;
  const reservedStock = product.reservedStock ?? 0;
  const availableStock = currentStock - reservedStock;
  const stockStatus = getStockStatus(currentStock, product.lowStockThreshold ?? 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (adjustmentType === "subtract" && qty > availableStock) {
      setError(`Cannot remove more than available stock (${availableStock})`);
      return;
    }

    if (!reason.trim()) {
      setError("Please select a reason");
      return;
    }

    const finalReason = reason === "other" ? customReason.trim() : reason;
    if (!finalReason) {
      setError("Please provide a reason");
      return;
    }

    try {
      await onAdjustInventory({
        type: adjustmentType,
        quantity: qty,
        reason: finalReason,
        expectedStock: currentStock,
      });
      setSuccess(`Stock ${adjustmentType === "add" ? "increased" : adjustmentType === "subtract" ? "decreased" : "set"} successfully`);
      setQuantity("");
      setReason("");
      setCustomReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adjust inventory");
    }
  };

  const handleThresholdChange = async () => {
    if (threshold < 1) return;
    try {
      await onSetThreshold(threshold);
      setSuccess("Low stock threshold updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update threshold");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StockCard
          label="Total Stock"
          value={currentStock.toLocaleString("en-NG")}
          icon={PackageOpen}
          variant="primary"
        />
        <StockCard
          label="Reserved"
          value={reservedStock.toLocaleString("en-NG")}
          icon={AlertTriangle}
          variant="warning"
        />
        <StockCard
          label="Available"
          value={availableStock.toLocaleString("en-NG")}
          icon={TrendingUp}
          variant={availableStock > 0 ? "success" : "error"}
        />
        <StockCard
          label="Status"
          value={<ProductStockBadge status={stockStatus} />}
          icon={AlertTriangle}
          variant={productStockStatusVariant(stockStatus) as any}
        />
      </div>

      {/* Low Stock Threshold */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-sm font-semibold text-kampmax-text mb-3">Low Stock Threshold</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="threshold" className="text-sm text-kampmax-text-secondary">
              Alert when stock ≤
            </label>
            <Input
              id="threshold"
              type="number"
              min="1"
              max="1000"
              value={threshold.toString()}
              onChange={(e) => setThreshold(Number(e.target.value) || 1)}
              className="w-24 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleThresholdChange} disabled={isLoading}>
            Save
          </Button>
          <p className="text-xs text-kampmax-text-secondary ml-auto">
            Current: {currentStock} · Threshold: {threshold}
          </p>
        </div>
      </div>

      {/* Adjust Inventory */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-sm font-semibold text-kampmax-text mb-4">Adjust Inventory</h3>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-kampmax-error/10 border border-kampmax-error/20 text-sm text-kampmax-error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-kampmax-success/10 border border-kampmax-success/20 text-sm text-kampmax-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Adjustment Type</Label>
              <div className="flex gap-2 mt-1">
                {ADJUSTMENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAdjustmentType(type.value)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-colors",
                      adjustmentType === type.value
                        ? "bg-kampmax-navy text-white border-kampmax-navy"
                        : "bg-white text-kampmax-text border-kampmax-border hover:bg-kampmax-muted"
                    )}
                  >
                    <type.icon className="h-3.5 w-3.5" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Select reason"
                className="mt-1"
                disabled={isLoading}
              >
                {REASON_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {reason === "other" && (
            <div>
              <Label htmlFor="customReason">Custom Reason</Label>
              <Input
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Processing..." : "Apply Adjustment"}
          </Button>
        </form>
      </div>

      {/* Inventory History */}
      <div className="bg-white rounded-xl border border-kampmax-border">
        <div className="flex items-center justify-between p-4 border-b border-kampmax-border">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-kampmax-blue" />
            <h3 className="text-sm font-semibold text-kampmax-text">Inventory History</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-kampmax-blue hover:underline"
          >
            {showHistory ? "Hide" : "Show"} history ({movements.length})
          </button>
        </div>

        {showHistory && (
          <div className="divide-y divide-kampmax-border/50">
            {movements.length === 0 ? (
              <div className="p-8 text-center text-kampmax-text-secondary">
                <History className="h-10 w-10 mx-auto mb-2 text-kampmax-text-secondary/50" />
                <p>No inventory movements recorded yet</p>
              </div>
            ) : (
              movements.map((movement) => (
                <MovementRow key={movement.id} movement={movement} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StockCard({
  label,
  value,
  icon: Icon,
  variant,
}: {
  label: string;
  value: string | React.ReactNode;
  icon: React.ElementType;
  variant: "primary" | "success" | "warning" | "error";
}) {
  const variantStyles = {
    primary: "bg-kampmax-blue/10 text-kampmax-blue border-kampmax-blue/20",
    success: "bg-kampmax-success/10 text-kampmax-success border-kampmax-success/20",
    warning: "bg-kampmax-warning/10 text-kampmax-warning border-kampmax-warning/20",
    error: "bg-kampmax-error/10 text-kampmax-error border-kampmax-error/20",
  }[variant];

  return (
    <div className={cn("rounded-xl border p-4", variantStyles)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-kampmax-text-secondary uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="h-8 w-8 opacity-50" />
      </div>
    </div>
  );
}

function MovementRow({ movement }: { movement: InventoryMovement }) {
  const isAdd = movement.type === "add";
  const isSubtract = movement.type === "subtract";
  const isSet = movement.type === "set";

  return (
    <div className="p-4 hover:bg-kampmax-muted/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              isAdd && "bg-kampmax-success/10 text-kampmax-success",
              isSubtract && "bg-kampmax-error/10 text-kampmax-error",
              isSet && "bg-kampmax-info/10 text-kampmax-info"
            )}
          >
            {isAdd && <ArrowUpRight className="h-4 w-4" />}
            {isSubtract && <ArrowDownLeft className="h-4 w-4" />}
            {isSet && <PackageOpen className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-medium text-kampmax-text capitalize">{movement.type.replace("_", " ")}</p>
            <p className="text-xs text-kampmax-text-secondary">{movement.reason}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-bold", isAdd ? "text-kampmax-success" : isSubtract ? "text-kampmax-error" : "text-kampmax-info")}>
            {isAdd ? "+" : isSubtract ? "−" : "="}{movement.quantity.toLocaleString("en-NG")}
          </p>
          <p className="text-xs text-kampmax-text-secondary">{timeAgo(movement.createdAt)}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-kampmax-text-secondary">
        <span>Previous: {movement.previousStock.toLocaleString("en-NG")}</span>
        <span>New: {movement.resultingStock.toLocaleString("en-NG")}</span>
        <span>By: {movement.actorId}</span>
      </div>
    </div>
  );
}