// Shared form-value shapes for the proposal creation flow.

import type {
  ProposalAttachment,
  ProposalDeliveryUnit,
} from "@/types/opportunity";

export interface ProposalFormValues {
  coverLetter: string;
  proposedAmount: string; // raw string; parsed before submit
  deliveryValue: string; // raw string
  deliveryUnit: ProposalDeliveryUnit;
  screeningAnswers: Record<string, string>;
  attachments: ProposalAttachment[];
}

export function emptyProposalFormValues(): ProposalFormValues {
  return {
    coverLetter: "",
    proposedAmount: "",
    deliveryValue: "",
    deliveryUnit: "days",
    screeningAnswers: {},
    attachments: [],
  };
}
