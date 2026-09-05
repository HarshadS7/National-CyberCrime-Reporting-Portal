"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { requestOtpAction, type TrackFormState } from "./actions";

const initialState: TrackFormState = {};

/**
 * Plan §6.2 — a real <form action={...}>. It posts and works with JavaScript
 * disabled; useActionState only adds pending state and inline errors.
 */
export function AckStepForm() {
  const t = useTranslations("track");
  const [state, formAction, pending] = useActionState(
    requestOtpAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <TextField
        name="acknowledgementNumber"
        label={t("ackLabel")}
        hint={t("ackHint")}
        error={
          state.fieldErrors?.acknowledgementNumber
            ? t(state.fieldErrors.acknowledgementNumber)
            : undefined
        }
        required
        inputMode="numeric"
        autoComplete="off"
        maxLength={14}
      />

      <Button type="submit" disabled={pending} size="lg">
        {t("requestOtp")}
      </Button>
    </form>
  );
}
