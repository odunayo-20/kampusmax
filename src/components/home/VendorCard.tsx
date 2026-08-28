import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { Vendor } from "@/types";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  vendor: Vendor;
  className?: string;
}

export function VendorCard({ vendor, className }: VendorCardProps) {
  return (
    <Link
      href={vendor.slug ? `/store/${vendor.slug}` : `/marketplace?vendor=${vendor.id}`}
      className={cn(
        "flex-shrink-0 w-[200px] bg-white rounded-lg border border-kampmax-border p-3",
        "hover:border-kampmax-blue/50 hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <Avatar name={vendor.storeName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-kampmax-text truncate">
              {vendor.storeName}
            </span>
            {vendor.verified && (
              <ShieldCheck className="h-3.5 w-3.5 text-kampmax-blue flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-kampmax-text-secondary">
            <Star className="h-3 w-3 fill-kampmax-gold text-kampmax-gold" />
            <span>{vendor.rating}</span>
            <span>·</span>
            <span>{vendor.totalSales} sales</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {vendor.specialties.slice(0, 2).map((s) => (
          <span
            key={s}
            className="text-[10px] px-1.5 py-0.5 bg-kampmax-muted text-kampmax-text-secondary rounded"
          >
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}
