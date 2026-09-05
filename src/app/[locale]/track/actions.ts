"use server";

import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { acknowledgementSchema } from "@/lib/schemas/track";
import { requestTrackingOtp } from "@/lib/api/client";

export interface TrackFormState {
  fieldErrors?: Record<string, string>;
  formError?: string;
  /** Masked mobile, e.g. "4321", for the OTP-sent status message. */
  maskedMobile?: string;
}

/**
 * Plan §6.1 — the same Zod schema validates here and on the client.
 * Error values are translation keys; the client resolves them.
 */
export async function requestOtpAction(
  _prev: TrackFormState,
  formData: FormData,
): Promise<TrackFormState> {
  const parsed = acknowledgementSchema.safeParse({
    acknowledgementNumber: formData.get("acknowledgementNumber"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  // TODO(phase-1): unblocked once the tracking endpoint exists.
  const { maskedMobile } = await requestTrackingOtp(
    parsed.data.acknowledgementNumber,
  );

  const locale = await getLocale();
  redirect({ href: { pathname: "/track", query: { step: "otp" } }, locale });

  return { maskedMobile };
}
