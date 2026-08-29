"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { VENDOR_PROMOTION_STATUS_LABELS } from "@/types/vendor-promotions";
import type { VendorPromotionStatus } from "@/types/vendor-promotions";
import { promotionStatusVariant } from "./promotions-meta";

export function PromotionStatusBadge({ status }: { status: VendorPromotionStatus }) {
  return <StatusBadge variant={promotionStatusVariant(status)} label={VENDOR_PROMOTION_STATUS_LABELS[status]} />;
}