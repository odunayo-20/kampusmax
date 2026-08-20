import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <Link
        href="/home"
        className="text-kampmax-text-secondary hover:text-kampmax-blue transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-kampmax-text-secondary/50" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-kampmax-text-secondary hover:text-kampmax-blue transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-kampmax-text font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
