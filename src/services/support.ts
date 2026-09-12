/**
 * Customer support portal service — the CUSTOMER side of Module 56.
 *
 * This is deliberately NOT a second support system: it is a thin consumer
 * adapter over the same singleton support store that backs `/admin/support`.
 * Letters from the customer currently appear in the admin console because
 * `supportManagementService` (the combined store) is shared at runtime.
 *
 * Swap note: when the NestJS backend lands, this adapter becomes the
 * customer-facing HTTP client (`GET/POST /support/tickets`, ownership checks
 * server-side) while the admin adapter talks to `/admin/support/tickets` —
 * still one database, one record, one lifecycle.
 */
import type {
  AdminSupportManagementService,
} from "@/services/admin/support-management.service";
import { supportManagementService } from "@/services/admin";
import type { SupportCustomerService } from "@/types/admin";

/** Combined surface: customer operations + read-only admin reads (the
 *  customer list/detail traverse the same store). The customer UI only
 *  uses the customer-scoped methods. */
export const supportService: SupportCustomerService &
  AdminSupportManagementService = supportManagementService;

export type {
  SupportCustomerService,
  SupportTicketDetail,
  SupportTicket,
  SupportMessage,
  SupportAttachment,
} from "@/types/admin";