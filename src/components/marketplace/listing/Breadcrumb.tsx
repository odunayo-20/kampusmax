"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link href="/home" className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors">
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0" aria-hidden="true" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-neutral-900 font-medium truncate max-w-[150px]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}