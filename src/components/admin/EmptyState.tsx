import { LucideIcon, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon | ((props: LucideProps) => React.ReactNode);
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-kampmax-border bg-white text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
        className
      )}
    >
      {Icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-kampmax-muted">
          <Icon className="h-5 w-5 text-kampmax-text-secondary" />
        </div>
      )}
      <p className={cn("font-semibold text-kampmax-text", compact ? "text-sm" : "text-base")}>
        {title}
      </p>
      {message && (
        <p className="mx-auto mt-1 max-w-sm text-xs text-kampmax-text-secondary sm:text-sm">
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
