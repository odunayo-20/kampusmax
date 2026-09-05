import { Badge } from "@/components/ui";
import type { OpportunityStatus, ProposalStatus } from "@/types/opportunity";
import {
  OPPORTUNITY_STATUS_META,
  PROPOSAL_STATUS_META,
} from "@/config/opportunity";

export function OpportunityStatusBadge({
  status,
  className,
}: {
  status: OpportunityStatus;
  className?: string;
}) {
  const meta = OPPORTUNITY_STATUS_META[status];
  const label = meta?.label ?? status;
  const tone = (meta?.tone ?? "default") as
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline";
  return (
    <Badge variant={tone} className={className}>
      {label}
      <span className="sr-only">. {meta?.hint ?? status}</span>
    </Badge>
  );
}

export function ProposalStatusBadge({
  status,
  className,
}: {
  status: ProposalStatus;
  className?: string;
}) {
  const meta = PROPOSAL_STATUS_META[status];
  const label = meta?.label ?? status;
  const tone = (meta?.tone ?? "default") as
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline";
  return (
    <Badge variant={tone} className={className}>
      {label}
      <span className="sr-only">. {meta?.hint ?? status}</span>
    </Badge>
  );
}
