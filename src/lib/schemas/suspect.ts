import { z } from "zod";

export const suspectSearchSchema = z.object({
  identifier: z.string().trim().min(3, "errors.identifierTooShort"),
  challengeId: z.string().min(1),
  captcha: z.string().trim().min(1, "errors.captchaRequired"),
});

/**
 * Plan P2-11 — report type is collected before State, matching the order in
 * which a person actually decides what they are reporting.
 */
export const suspectReportSchema = z.object({
  kind: z.enum(["phone", "email", "website", "social-handle", "upi"]),
  identifier: z.string().trim().min(3, "errors.identifierTooShort"),
  description: z.string().trim().max(2000).optional(),
  stateSlug: z.string().min(1, "errors.stateRequired"),
});

export type SuspectSearchInput = z.infer<typeof suspectSearchSchema>;
export type SuspectReportInput = z.infer<typeof suspectReportSchema>;
