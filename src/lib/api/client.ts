import type {
  ComplaintCategory,
  ComplaintSummary,
  StateContact,
  SuspectSearchResult,
} from "@/lib/types";

/**
 * DEMO MODE.
 *
 * These are fake, in-memory implementations standing in for the real backend
 * described in FRONTEND_PLAN.md §7 ("Backend dependency"). They let every
 * page function end-to-end for review before that backend exists.
 *
 * Signatures are the agreed contract — when the real API is ready, replace
 * these bodies, not the signatures, and delete the DEMO_* fixtures below.
 * Nothing here is real user data.
 */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Two acknowledgement numbers "exist" in the demo, so the tracking journey
// can show both a found and a not-found path. Use these to try it:
//   12345678901234 — under review
//   98765432109876 — action taken
const DEMO_COMPLAINTS: Record<string, ComplaintSummary> = {
  "12345678901234": {
    acknowledgementNumber: "12345678901234",
    category: "financial-fraud",
    status: "under-review",
    filedAt: "2026-08-20T09:15:00.000Z",
    lastUpdatedAt: "2026-08-30T11:40:00.000Z",
    stateSlug: "maharashtra",
  },
  "98765432109876": {
    acknowledgementNumber: "98765432109876",
    category: "women-children",
    status: "action-taken",
    filedAt: "2026-07-02T14:00:00.000Z",
    lastUpdatedAt: "2026-08-15T10:00:00.000Z",
    stateSlug: "karnataka",
  },
};

export async function requestTrackingOtp(
  acknowledgementNumber: string,
): Promise<{ maskedMobile: string }> {
  await delay(400);
  // OTP "sends" for any well-formed number, whether or not it exists — a real
  // backend must do the same, so this step never reveals existence.
  void acknowledgementNumber;
  return { maskedMobile: "4321" };
}

export async function verifyTrackingOtp(input: {
  acknowledgementNumber: string;
  otp: string;
  challengeId: string;
  captcha: string;
}): Promise<ComplaintSummary | null> {
  await delay(500);
  // Demo OTP is fixed at 123456; a real backend issues and checks one
  // server-side per acknowledgement number.
  if (input.otp !== "123456") return null;
  return DEMO_COMPLAINTS[input.acknowledgementNumber] ?? null;
}

const DEMO_SUSPECTS: SuspectSearchResult[] = [
  {
    identifier: "9876543210",
    kind: "phone",
    reportCount: 14,
    firstReportedAt: "2026-05-11T00:00:00.000Z",
  },
  {
    identifier: "scam-support@example.com",
    kind: "email",
    reportCount: 6,
    firstReportedAt: "2026-06-02T00:00:00.000Z",
  },
  {
    identifier: "quick-loan-app.example",
    kind: "website",
    reportCount: 31,
    firstReportedAt: "2026-03-19T00:00:00.000Z",
  },
];

/** Try "9876543210", "scam-support@example.com" or "quick-loan-app.example". */
export async function searchSuspect(
  identifier: string,
): Promise<SuspectSearchResult | null> {
  await delay(400);
  const needle = identifier.trim().toLowerCase();
  return (
    DEMO_SUSPECTS.find((s) => s.identifier.toLowerCase() === needle) ?? null
  );
}

export async function reportSuspect(input: {
  kind: string;
  identifier: string;
  description?: string;
  stateSlug: string;
}): Promise<{ referenceId: string }> {
  await delay(500);
  void input;
  return { referenceId: `SR${Date.now().toString().slice(-9)}` };
}

export async function submitComplaint(input: {
  category: ComplaintCategory;
  anonymous: boolean;
}): Promise<{ acknowledgementNumber: string }> {
  await delay(600);
  void input;
  // Schema requires exactly 14 digits (see lib/schemas/track.ts).
  return { acknowledgementNumber: `20${Date.now().toString().slice(-12)}` };
}

/**
 * Phase 2 can ship from a checked-in JSON snapshot of the 36 State/UT rows
 * before this endpoint exists — the directory changes rarely.
 */
export async function getStateContacts(): Promise<StateContact[]> {
  const { stateContacts } = await import("@/lib/data/state-contacts");
  return stateContacts;
}
