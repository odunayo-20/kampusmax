import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function SectionHeader({ title, subtitle, icon, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-kampmax-text truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-kampmax-text-secondary mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-0.5 text-xs font-medium text-kampmax-blue hover:text-kampmax-blue-dark transition-colors flex-shrink-0 ml-2"
        >
          {action.label}
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
