import { communityDataset, communityCampusOptions } from "@/data/admin/community";

// ------------------------------------------------------------
// Shared helpers for the /admin/campus section components
// ------------------------------------------------------------

const CAMPUS_LABELS = new Map(
  communityCampusOptions().map((c) => [c.id, c.shortName])
);

/** "futa" -> "FUTA"; falls back to the raw id for unknown campuses. */
export function communityCampusName(campusId: string): string {
  return CAMPUS_LABELS.get(campusId) ?? campusId;
}

/** First N chars of post/comment content with ellipsis. */
export function previewText(content: string, max = 90): string {
  if (content.length <= max) return content;
  return `${content.slice(0, max).trimEnd()}…`;
}

/** Dataset snapshot (read-only) for dialogs needing cross-section context. */
export function communitySnapshot() {
  return communityDataset;
}
