import type {
  ComplaintSummary,
  StateContact,
  SuspectSearchResult,
} from "@/lib/types";

/**
 * Backend contract. Plan §7 "Backend dependency": these signatures are the
 * agreement with the API team. Every implementation is a stub until the
 * corresponding endpoint exists — replace the bodies, not the signatures.
 *
 * Runs server-side only. Never expose API credentials to the client.
 */

const API_BASE = process.env.API_BASE_URL;

class NotImplementedError extends Error {
  constructor(endpoint: string) {
    super(
      `${endpoint} is not implemented. Set API_BASE_URL and replace this stub.`,
    );
    this.name = "NotImplementedError";
  }
}

export async function requestTrackingOtp(
  _acknowledgementNumber: string,
): Promise<{ maskedMobile: string }> {
  if (!API_BASE) throw new NotImplementedError("requestTrackingOtp");
  throw new NotImplementedError("requestTrackingOtp");
}

export async function verifyTrackingOtp(_input: {
  acknowledgementNumber: string;
  otp: string;
  challengeId: string;
  captcha: string;
}): Promise<ComplaintSummary | null> {
  if (!API_BASE) throw new NotImplementedError("verifyTrackingOtp");
  throw new NotImplementedError("verifyTrackingOtp");
}

export async function searchSuspect(
  _identifier: string,
): Promise<SuspectSearchResult | null> {
  if (!API_BASE) throw new NotImplementedError("searchSuspect");
  throw new NotImplementedError("searchSuspect");
}

/**
 * Phase 2 can ship from a checked-in JSON snapshot of the 36 State/UT rows
 * before this endpoint exists — the directory changes rarely.
 */
export async function getStateContacts(): Promise<StateContact[]> {
  const { stateContacts } = await import("@/lib/data/state-contacts");
  return stateContacts;
}
