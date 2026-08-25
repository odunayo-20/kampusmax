import {
  AuditActionType,
  AuditLog,
  AuditResource,
  AuditResult,
} from "@/types/admin";
import { mockAdmins } from "./people";
import { intBetween, pick, seededRandom } from "@/lib/admin/api";

// ------------------------------------------------------------
// MOCK DATASET FOR THE /admin/audit-logs MODULE
//
// Read-only audit trail covering the example actions from the
// module brief (approved vendor, suspended user, changed platform
// setting, removed campus post, resolved dispute, ...).
// Deterministic (seeded PRNG): identical output every reload.
// ------------------------------------------------------------

interface AuditSeed {
  action: AuditActionType;
  resource: AuditResource;
  resourceId: string;
  description: string;
}

const SEEDS: AuditSeed[] = [
  { action: "approve", resource: "vendor", resourceId: "vnd-014", description: "Approved vendor “TextbookXpress NG” after document review." },
  { action: "suspend", resource: "user", resourceId: "usr-118", description: "Suspended user for repeated scam reports in campus feed." },
  { action: "approve", resource: "product", resourceId: "prd-231", description: "Approved listing “HP Pavilion 8GB/512GB” for marketplace." },
  { action: "update", resource: "category", resourceId: "cat-books", description: "Updated category display order and renamed slug to books-academic." },
  { action: "approve", resource: "withdrawal", resourceId: "wdr-092", description: "Approved withdrawal of ₦85,000 to GTBank ••4471." },
  { action: "update", resource: "platform_setting", resourceId: "commission_rate", description: "Changed platform commission rate from 10% to 8%." },
  { action: "delete", resource: "campus_post", resourceId: "pst-009", description: "Removed campus post for policy violation (harassment in replies)." },
  { action: "resolve", resource: "dispute", resourceId: "dsp-004", description: "Resolved dispute as refund agreed with buyer; evidence reviewed." },
  { action: "reject", resource: "withdrawal", resourceId: "wdr-087", description: "Rejected withdrawal - BVN verification missing on vendor account." },
  { action: "suspend", resource: "product", resourceId: "prd-118", description: "Suspended listing flagged as suspected counterfeit (3 reports)." },
  { action: "restore", resource: "campus_post", resourceId: "cmt-004", description: "Restored hidden post after successful author appeal." },
  { action: "publish", resource: "announcement", resourceId: "cmn-001", description: "Published announcement “Mid-Semester Sale Week is Live” to all campuses." },
  { action: "send", resource: "announcement", resourceId: "mnt-003", description: "Broadcast scheduled notification delivered to campus admins." },
  { action: "create", resource: "promotion", resourceId: "prm-016", description: "Created promo code FRESHER15 for new-student cohort." },
  { action: "update", resource: "role_permissions", resourceId: "CAMPUS_ADMIN", description: "Granted campus admins the notifications.create permission." },
  { action: "approve", resource: "vendor", resourceId: "vnd-032", description: "Approved vendor “FreshMart Express” after BVN check." },
  { action: "delete", resource: "review", resourceId: "mrv-007", description: "Removed review for fake-review report with vendor statement attached." },
  { action: "update", resource: "order", resourceId: "KMP-2417", description: "Marked lost order as delivered after rider manifest reconciliation." },
  { action: "resolve", resource: "dispute", resourceId: "dsp-013", description: "Resolved damaged-product dispute; vendor issued replacement." },
  { action: "update", resource: "platform_setting", resourceId: "withdrawal_minimum", description: "Raised withdrawal minimum from ₦1,000 to ₦2,000." },
  { action: "approve", resource: "product", resourceId: "prd-305", description: "Approved listing “Lab coat white M/L” bundle of 12 units." },
  { action: "suspend", resource: "user", resourceId: "usr-204", description: "Suspended vendor account pending re-verification documents." },
  { action: "create", resource: "category", resourceId: "cat-services", description: "Created category “Printing & Services” with icon printer." },
  { action: "delete", resource: "campus_post", resourceId: "cmt-017", description: "Removed duplicate spam post advertising off-platform sales." },
  { action: "reject", resource: "product", resourceId: "prd-289", description: "Rejected listing for prohibited item (prescription medication)." },
  { action: "restore", resource: "user", resourceId: "usr-056", description: "Reactivated suspended account after appeal review." },
  { action: "export", resource: "reports", resourceId: "rpt-gmv-q3", description: "Exported GMV analytics summary for Q3 (CSV placeholder)." },
  { action: "update", resource: "platform_setting", resourceId: "payout_schedule", description: "Switched payout schedule from daily to twice daily." },
  { action: "approve", resource: "dispute", resourceId: "dsp-018", description: "Closed unauthorised-transaction case as resolved with full refund recorded." },
  { action: "publish", resource: "announcement", resourceId: "cmn-006", description: "Sent push broadcast “Wallet cashback promo returns”." },
  { action: "delete", resource: "review", resourceId: "mrv-021", description: "Removed review containing offensive language toward vendor." },
  { action: "create", resource: "order", resourceId: "KMP-2444", description: "Manually created support order for failed Paystack checkout recovery." },
  { action: "suspend", resource: "vendor", resourceId: "vnd-041", description: "Paused store trading until expired food-handling permit is renewed." },
  { action: "update", resource: "category", resourceId: "cat-audio", description: "Merged duplicate audio accessories categories and remapped 34 listings." },
  { action: "approve", resource: "withdrawal", resourceId: "wdr-101", description: "Approved batch payout totalling ₦412,500 across 6 vendors." },
  { action: "reject", resource: "dispute", resourceId: "dsp-009", description: "Rejected missing-order claim; pickup station sign-off evidence attached." },
  { action: "send", resource: "announcement", resourceId: "mnt-010", description: "Sent security advisory broadcast to all admin accounts." },
  { action: "update", resource: "role_permissions", resourceId: "ADMIN", description: "Revoked campuses.delete permission from platform admins." },
  { action: "create", resource: "vendor", resourceId: "vnd-055", description: "Onboarded vendor “GadgetHub Store” via admin console." },
  { action: "delete", resource: "promotion", resourceId: "prm-009", description: "Deleted expired flash-sale promo code DETTY40." },
  { action: "approve", resource: "product", resourceId: "prd-340", description: "Approved thrift fashion bundle listings for market day." },
  { action: "suspend", resource: "campus_post", resourceId: "cmt-029", description: " Hid event post pending organiser verification documents." },
  { action: "resolve", resource: "dispute", resourceId: "dsp-002", description: "Resolved wrong-product dispute in buyer's favour with partial refund." },
  { action: "update", resource: "platform_setting", resourceId: "support_email", description: "Updated support contact email to help@kampmax.ng." },
];

const DEVICES = [
  "Chrome 126 · Windows 11",
  "Chrome 125 · macOS Sonoma",
  "Safari 17 · iPad Air",
  "Edge 126 · Windows 11",
  "Firefox 127 · Ubuntu 24.04",
  "Kampmax Admin App · Android 14",
  "Safari · iPhone 14 Pro",
];

const FAILURE_NOTES: Record<string, string> = {
  approve: "Approval failed - upstream verification service timed out.",
  suspend: "Action denied: insufficient permissions for this resource.",
  update: "Save rejected by validation (value out of allowed range).",
  delete: "Delete blocked - resource is referenced by open orders.",
};

function nigerianIp(rand: () => number): string {
  return `102.${intBetween(rand, 89, 176)}.${intBetween(rand, 0, 255)}.${intBetween(rand, 2, 254)}`;
}

function minutesAgoIso(rand: () => number, minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export interface AuditLogsDataset {
  logs: AuditLog[];
}

export function buildAuditLogsDataset(): AuditLogsDataset {
  const rand = seededRandom(9021);
  // Newest first: spread across the last ~14 days.
  const logs: AuditLog[] = SEEDS.map((seed, i) => {
    const admin = pick(rand, mockAdmins);
    const minutesAgo = i === 0 ? intBetween(rand, 20, 180) : i * intBetween(rand, 240, 480);
    const roll = rand();
    let result: AuditResult = "success";
    if (roll > 0.94) result = "denied";
    else if (roll > 0.88) result = "failed";

    let description = seed.description;
    if (result !== "success") {
      description = `${seed.description} — ${
        result === "failed"
          ? FAILURE_NOTES[seed.action] ?? "Operation failed."
          : "Permission denied for this role."
      }`;
    }

    return {
      id: `aud-${String(i + 1).padStart(4, "0")}`,
      at: minutesAgoIso(rand, minutesAgo),
      adminId: admin.id,
      adminName: admin.name,
      adminRole: admin.role,
      action: seed.action,
      resource: seed.resource,
      resourceId: seed.resourceId,
      description,
      ip: nigerianIp(rand),
      device: pick(rand, DEVICES),
      result,
    };
  }).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return { logs };
}

export const auditLogsDataset: AuditLogsDataset = buildAuditLogsDataset();
