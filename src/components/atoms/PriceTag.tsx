import { cn, formatNaira } from "@/lib/utils";

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function PriceTag({ price, originalPrice, size = "md", className }: PriceTagProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-bold text-kampmax-navy", sizeStyles[size])}>
        {formatNaira(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span className="text-xs text-kampmax-text-secondary line-through">
          {formatNaira(originalPrice)}
        </span>
      )}
    </div>
  );
}
