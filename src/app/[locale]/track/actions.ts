"use server";

import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { acknowledgementSchema, otpVerifySchema } from "@/lib/schemas/track";
import { requestTrackingOtp, verifyTrackingOtp } from "@/lib/api/client";
import type { ComplaintSummary } from "@/lib/types";

export interface TrackFormState {
  fieldErrors?: Record<string, string>;
  formError?: string;
  complaint?: ComplaintSummary;
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

  const { maskedMobile } = await requestTrackingOtp(
    parsed.data.acknowledgementNumber,
  );

  // ack/mobile travel via the URL so the OTP step is a real, refreshable,
  // linkable page rather than client-only state (plan §6.2).
  const locale = await getLocale();
  redirect({
    href: {
      pathname: "/track",
      query: {
        step: "otp",
        ack: parsed.data.acknowledgementNumber,
        mobile: maskedMobile,
      },
    },
    locale,
  });
  // redirect() throws; this satisfies TypeScript's control-flow analysis,
  // which does not know the wrapped redirect's return type is `never`.
  return {};
}

export async function verifyOtpAction(
  _prev: TrackFormState,
  formData: FormData,
): Promise<TrackFormState> {
  const parsed = otpVerifySchema.safeParse({
    acknowledgementNumber: formData.get("acknowledgementNumber"),
    otp: formData.get("otp"),
    challengeId: formData.get("challengeId"),
    captcha: formData.get("captcha"),
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

  const complaint = await verifyTrackingOtp(parsed.data);
  if (!complaint) {
    return { formError: "errors.notFound" };
  }
  return { complaint };
}
