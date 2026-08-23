"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  breadcrumbLabel,
  isDetailSegment,
} from "@/lib/admin/navigation";

export function AdminBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, i) => ({
    label: breadcrumbLabel(segment, i),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
    isId: i > 1 && isDetailSegment(segment),
  }));

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1 text-xs">
        {crumbs.map((crumb, i) => (
          <Fragment key={crumb.href}>
            {i > 0 && (
              <ChevronRight aria-hidden className="h-3 w-3 shrink-0 text-kampmax-text-secondary/60" />
            )}
            <li className="min-w-0">
              {crumb.isLast ? (
                <span
                  aria-current="page"
                  className={cn(
                    "block max-w-[160px] truncate font-semibold text-kampmax-text sm:max-w-none",
                    crumb.isId && "font-mono normal-case"
                  )}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="block max-w-[120px] truncate text-kampmax-text-secondary transition-colors hover:text-kampmax-text sm:max-w-none hover:underline"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
