"use client";

interface QuantitySelectorProps {
  quantity: number;
  maxQty: number;
  onChange: (qty: number) => void;
}

export function QuantitySelector({ quantity, maxQty, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-neutral-900">Quantity</span>
      <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white shadow-sm">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="h-9 w-9 flex items-center justify-center rounded-l-full hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
        <span className="w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">{quantity}</span>
        <button
          onClick={() => onChange(Math.min(maxQty, quantity + 1))}
          disabled={quantity >= maxQty}
          aria-label="Increase quantity"
          className="h-9 w-9 flex items-center justify-center rounded-r-full hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      <span className="text-xs text-neutral-500">Max {maxQty}</span>
    </div>
  );
}