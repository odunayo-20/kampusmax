import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 text-center", className)}>
      {icon && (
        <div className="w-14 h-14 rounded-full bg-kampmax-muted flex items-center justify-center mb-3 text-kampmax-text-secondary">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-kampmax-text mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-kampmax-text-secondary max-w-[240px]">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
