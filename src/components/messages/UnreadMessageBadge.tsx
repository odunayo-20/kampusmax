import { cn } from "@/lib/utils";

interface UnreadMessageBadgeProps {
  count: number;
  className?: string;
  /** Overrides the default "X unread messages" screen-reader text. */
  ariaLabel?: string;
}

export function UnreadMessageBadge({ count, className, ariaLabel }: UnreadMessageBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary-600 text-white text-[10px] font-bold px-1 leading-none",
        className
      )}
      aria-label={ariaLabel ?? `${count} unread message${count > 1 ? "s" : ""}`}
    >
      <span aria-hidden>{count > 9 ? "9+" : count}</span>
    </span>
  );
}