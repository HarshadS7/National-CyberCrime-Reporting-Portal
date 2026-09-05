/** Domain types shared across the frontend. Mirror the backend contract. */

export interface Officer {
  name: string;
  rank?: string;
  phone?: string;
  email?: string;
}

export interface StateContact {
  /** Stable slug used in URLs, e.g. "tamil-nadu". */
  slug: string;
  state: string;
  nodalOfficer: Officer;
  grievanceOfficer?: Officer;
}

export type ComplaintCategory =
  | "financial-fraud"
  | "women-children"
  | "other";

export type ComplaintStatus =
  | "submitted"
  | "under-review"
  | "action-taken"
  | "closed";

export interface ComplaintSummary {
  acknowledgementNumber: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  filedAt: string;
  lastUpdatedAt: string;
  /** Assigned State/UT, used to offer the escalation contact. */
  stateSlug?: string;
}

export type SuspectIdentifierKind =
  | "phone"
  | "email"
  | "website"
  | "social-handle"
  | "upi";

export interface SuspectSearchResult {
  identifier: string;
  kind: SuspectIdentifierKind;
  reportCount: number;
  firstReportedAt?: string;
}

export interface FaqEntry {
  /** Anchor slug — every question must be individually linkable. */
  id: string;
  topic:
    | "reporting"
    | "evidence"
    | "account"
    | "tracking"
    | "withdrawal"
    | "safety";
  question: string;
  /** First sentence must answer directly, before any detail. */
  answer: string;
}

/** Discriminated result type for Server Actions. */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors?: Record<string, string>; formError?: string };
