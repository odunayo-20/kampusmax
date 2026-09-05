export function getSafeInternalTarget(
  url: string | undefined | null
): string | null {
  if (!url) return null;
  if (url.length > 2048) return null;
  if (!url.startsWith("/")) return null;
  if (url.startsWith("//")) return null;
  // Backslashes and control characters are not valid internal paths.
  if (/[\\\x00-\x1F]/.test(url)) return null;
  // Reject internal paths whose first segment contains a colon (scheme
  // smuggling like "/javascript:..." or "///evil").
  if (/^\/[^/]*:/.test(url)) return null;
  return url;
}