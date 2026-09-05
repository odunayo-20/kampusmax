import { cn } from "@/lib/utils";

/** Shimmering rows for the conversation list (matches the shared skeleton style). */
export function ConversationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-kampmax-border" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
          <span className="w-12 h-12 rounded-full bg-kampmax-muted flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="h-3.5 w-28 rounded bg-kampmax-muted" />
              <span className="h-2.5 w-8 rounded bg-kampmax-muted/60 flex-shrink-0" />
            </div>
            <span className="block h-2.5 rounded bg-kampmax-muted/70 max-w-[75%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shimmer impression of the message thread while it loads. */
export function MessageThreadSkeleton({ count = 6 }: { count?: number }) {
  const rows = Array.from({ length: count }).map((_, i) => ({
    mine: i % 3 === 1,
    width: [220, 300, 180, 260, 140, 240][i % 6],
  }));

  return (
    <div className="px-4 py-4 space-y-3" aria-hidden="true">
      {rows.map((row, i) => (
        <div key={i} className={cn("flex", row.mine ? "justify-end" : "justify-start")}>
          <span
            className={cn(
              "h-9 rounded-2xl bg-kampmax-muted animate-pulse",
              row.mine ? "rounded-br-sm" : "rounded-bl-sm"
            )}
            style={{ width: row.width }}
          />
        </div>
      ))}
    </div>
  );
}