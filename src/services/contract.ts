// ============================================================
// FREELANCE CONTRACTS SERVICE  (Module 24)
// ============================================================
// Maps 1:1 to future backend endpoints (see types/contract.ts).
//
// SECURITY: ownership is ALWAYS derived from the authenticated identity
// (getCurrentUser().id). We never trust a freelancerId or contractId supplied by
// the client — the data store scopes every read/write to the authenticated user,
// protecting against IDOR/BOLA. All state transitions (accept/cancel/complete/
// submit/resubmit) go through backend-authoritative mutations that return a
// discriminated success/failure result. The UI never sets status directly.

import { getCurrentUser } from "@/services/users";
import {
  getContractsForFreelancer,
  getContractForFreelancer,
  acceptContract,
  cancelContract,
  completeContract,
  submitDeliverable,
  resubmitDeliverable,
  type ActionResult,
} from "@/data/contracts";
import type { Contract } from "@/types/contract";

// ── Owner context ───────────────────────────────────────────

function currentUserId(): string | null {
  const user = getCurrentUser();
  return user?.id ?? null;
}

// ── Reads ───────────────────────────────────────────────────

export function getFreelancerContracts(): Contract[] {
  const uid = currentUserId();
  if (!uid) return [];
  return getContractsForFreelancer(uid);
}

export function getFreelancerContract(contractId: string): Contract | null {
  const uid = currentUserId();
  if (!uid) return null;
  return getContractForFreelancer(uid, contractId);
}

// ── Mutations (backend-authoritative) ───────────────────────

export function acceptFreelancerContract(contractId: string): ActionResult {
  const uid = currentUserId();
  if (!uid) {
    return { ok: false, code: "UNAUTHORIZED", message: "Authentication required." };
  }
  return acceptContract(uid, contractId);
}

export function cancelFreelancerContract(contractId: string, reason: string): ActionResult {
  const uid = currentUserId();
  if (!uid) {
    return { ok: false, code: "UNAUTHORIZED", message: "Authentication required." };
  }
  return cancelContract(uid, contractId, reason);
}

export function completeFreelancerContract(contractId: string): ActionResult {
  const uid = currentUserId();
  if (!uid) {
    return { ok: false, code: "UNAUTHORIZED", message: "Authentication required." };
  }
  return completeContract(uid, contractId);
}

export function submitFreelancerDeliverable(
  contractId: string,
  milestoneId: string,
  payload: { title: string; description: string; message?: string; links?: string[] }
): ActionResult {
  const uid = currentUserId();
  if (!uid) {
    return { ok: false, code: "UNAUTHORIZED", message: "Authentication required." };
  }
  return submitDeliverable(uid, contractId, milestoneId, payload);
}

export function resubmitFreelancerDeliverable(
  contractId: string,
  deliverableId: string,
  payload: { message: string; links?: string[] }
): ActionResult {
  const uid = currentUserId();
  if (!uid) {
    return { ok: false, code: "UNAUTHORIZED", message: "Authentication required." };
  }
  return resubmitDeliverable(uid, contractId, deliverableId, payload);
}
