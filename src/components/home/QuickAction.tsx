import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  className?: string;
}

export function QuickAction({ href, icon, label, badge, className }: QuickActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 bg-white rounded-lg border border-kampmax-border",
        "hover:border-kampmax-blue/50 hover:shadow-sm transition-all duration-200",
        className
      )}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-kampmax-blue/10 flex items-center justify-center text-kampmax-blue">
          {icon}
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-kampmax-error text-white text-[9px] font-bold rounded-full px-1">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium text-kampmax-text text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}
