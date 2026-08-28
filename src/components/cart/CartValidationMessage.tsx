"use client";

import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import type { CartLineItem } from "@/types/cart";
import { cn } from "@/lib/utils";

export type ValidationTone = "warning" | "error" | "success";

const TONE_STYLES: Record<
  ValidationTone,
  { wrapper: string; icon: typeof Info; iconClass: string }
> = {
  warning: {
    wrapper: "bg-accent-50 border-accent-200 text-accent-700",
    icon: AlertTriangle,
    iconClass: "text-accent-600",
  },
  error: {
    wrapper: "bg-error-50 border-error-200 text-error-700",
    icon: AlertTriangle,
    iconClass: "text-error-600",
  },
  success: {
    wrapper: "bg-success-50 border-success-200 text-success-700",
    icon: CheckCircle2,
    iconClass: "text-success-600",
  },
};

interface CartValidationMessageProps {
  line: CartLineItem;
  onRemove?: (productId: string) => void;
  onUpdateToNewPrice?: (productId: string) => void;
  className?: string;
}

/**
 * Surfaces a validation message for a single cart line (price changed, out of
 * stock, unavailable, quantity adjusted...). Backend responses are expected to
 * drive the underlying `status`/`message`; this component only renders them.
 */
export function CartValidationMessage({
  line,
  onRemove,
  onUpdateToNewPrice,
  className,
}: CartValidationMessageProps) {
  const status = line.validationStatus;
  if (!status || status === "valid") return null;

  const tone: ValidationTone =
    status === "price_changed"
      ? "warning"
      : status === "quantity_adjusted"
      ? "success"
      : "error";

  const style = TONE_STYLES[tone];
  const Icon = style.icon;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 px-3 py-2 rounded-lg border text-xs",
        style.wrapper,
        className
      )}
    >
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", style.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{line.message || defaultMessage(status)}</p>
        {status === "price_changed" && onUpdateToNewPrice && (
          <button
            type="button"
            onClick={() => onUpdateToNewPrice(line.productId)}
            className="mt-1 text-xs font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Accept new price
          </button>
        )}
        {status !== "price_changed" && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(line.productId)}
            className="mt-1 text-xs font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Remove item
          </button>
        )}
      </div>
    </div>
  );
}

function defaultMessage(status: NonNullable<CartLineItem["validationStatus"]>) {
  switch (status) {
    case "price_changed":
      return "This item's price changed since you added it to your cart.";
    case "out_of_stock":
      return "Sorry, this item is out of stock.";
    case "unavailable":
    case "vendor_unavailable":
      return "This item is no longer available.";
    case "quantity_adjusted":
      return "Quantity adjusted to the available limit.";
    default:
      return "There's an issue with this item.";
  }
}
