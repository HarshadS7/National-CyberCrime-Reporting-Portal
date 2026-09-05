import { z } from "zod";

/**
 * Plan §6.1 — one schema, validated on the server and reused on the client.
 * Messages are translation keys, resolved at render time.
 */

export const acknowledgementSchema = z.object({
  acknowledgementNumber: z
    .string()
    .trim()
    .min(1, "errors.ackRequired")
    .regex(/^\d{14}$/, "errors.ackFormat"),
});

export const otpVerifySchema = acknowledgementSchema.extend({
  otp: z
    .string()
    .trim()
    .min(1, "errors.otpRequired")
    .regex(/^\d{6}$/, "errors.otpFormat"),
  challengeId: z.string().min(1),
  captcha: z.string().trim().min(1, "errors.captchaRequired"),
});

export type AcknowledgementInput = z.infer<typeof acknowledgementSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
