import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const URL_PATTERN = /(https?:\/\/[^\s]+)/gi;
const MAX_LINK_DISPLAY = 64;

/**
 * Renders message text as safe plain text (never raw HTML — React escapes all
 * output). http(s) URLs become external links with `rel="noopener noreferrer"`
 * and `target="_blank"`. Freeform slash-paths are intentionally NOT autolinked
 * to avoid false positives in conversational text; deep links into the app are
 * delivered as structured message payloads by the backend, not text heuristics.
 */
export function MessageText({ text, className }: { text: string; className?: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  URL_PATTERN.lastIndex = 0;
  while ((match = URL_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    const href = match[0];
    const display = href.length > MAX_LINK_DISPLAY ? `${href.slice(0, MAX_LINK_DISPLAY)}…` : href;
    parts.push(
      <a
        key={key++}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-current underline-offset-2 hover:opacity-80"
      >
        {display}
      </a>
    );
    lastIndex = match.index + href.length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return (
    <p className={cn("whitespace-pre-wrap break-words select-text", className)}>{parts}</p>
  );
}