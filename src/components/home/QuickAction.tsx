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
      aria-label={label}
      className={cn(
        "group flex flex-col items-center gap-2 p-3.5 bg-white rounded-xl border border-kampmax-border",
        "hover:border-kampmax-blue/30 hover:shadow-sm hover:bg-kampmax-muted/30",
        "active:scale-[0.98] active:shadow-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kampmax-blue focus-visible:ring-offset-1",
        "transition-all duration-200",
        className
      )}
    >
      <div className="relative">
        <div className="w-11 h-11 rounded-xl bg-kampmax-blue/10 flex items-center justify-center text-kampmax-blue transition-colors group-hover:bg-kampmax-blue group-hover:text-white">
          {icon}
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-kampmax-error text-white text-[10px] font-bold rounded-full px-1 ring-2 ring-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-kampmax-text text-center leading-none">
        {label}
      </span>
    </Link>
  );
}
