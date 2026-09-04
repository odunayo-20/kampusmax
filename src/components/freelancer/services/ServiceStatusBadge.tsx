import { cn } from "@/lib/utils";
import {
  FREELANCER_SERVICE_STATUS,
  type FreelancerServiceStatus,
} from "@/types/freelancer-services";
import { FREELANCER_SERVICE_STATUS_META } from "@/config/freelancer-services";

const toneStyles: Record<string, string> = {
  default: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  success: "bg-success-50 text-success-700 border border-success-100",
  warning: "bg-accent-50 text-accent-700 border border-accent-100",
  error: "bg-error-50 text-error-700 border border-error-100",
  info: "bg-info-50 text-info-700 border border-info-100",
  outline: "bg-white text-neutral-600 border border-neutral-300",
};

export function ServiceStatusBadge({
  status,
  withIcon = false,
  className,
}: {
  status: FreelancerServiceStatus;
  withIcon?: boolean;
  className?: string;
}) {
  const meta = FREELANCER_SERVICE_STATUS_META[status];

  let dot: string;
  switch (status) {
    case FREELANCER_SERVICE_STATUS.PUBLISHED:
      dot = "bg-success-500";
      break;
    case FREELANCER_SERVICE_STATUS.PAUSED:
    case FREELANCER_SERVICE_STATUS.UNDER_REVIEW:
      dot = "bg-accent-500";
      break;
    case FREELANCER_SERVICE_STATUS.REJECTED:
      dot = "bg-error-500";
      break;
    case FREELANCER_SERVICE_STATUS.ARCHIVED:
      dot = "bg-neutral-400";
      break;
    default:
      dot = "bg-neutral-400";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneStyles[meta.tone],
        className
      )}
    >
      {withIcon && <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      {meta.label}
    </span>
  );
}
