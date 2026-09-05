"use client";

import { useActionState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CaptchaField } from "@/components/patterns/CaptchaField";
import type { DemoCaptcha } from "@/lib/demo-captcha";
import { checkSuspectAction, type CheckSuspectState } from "./actions";

const initialState: CheckSuspectState = {};

export function CheckSuspectForm({
  initialCaptcha,
}: {
  initialCaptcha: DemoCaptcha;
}) {
  const t = useTranslations("checkSuspect");
  const format = useFormatter();
  const [state, formAction, pending] = useActionState(
    checkSuspectAction,
    initialState,
  );

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <TextField
          name="identifier"
          label={t("identifierLabel")}
          hint={t("identifierHint")}
          error={
            state.fieldErrors?.identifier
              ? t(state.fieldErrors.identifier)
              : undefined
          }
          required
          autoComplete="off"
        />

        <CaptchaField
          initial={initialCaptcha}
          error={
            state.fieldErrors?.captcha ? t(state.fieldErrors.captcha) : undefined
          }
        />

        <Button type="submit" disabled={pending} size="lg">
          {t("submit")}
        </Button>
      </form>

      {state.searched && (
        <Alert
          tone={state.result ? "warning" : "info"}
          title={state.result ? t("foundTitle") : t("notFoundTitle")}
          live
        >
          {state.result ? (
            <p>
              {t("foundBody", {
                count: state.result.reportCount,
                date: state.result.firstReportedAt
                  ? format.dateTime(new Date(state.result.firstReportedAt), {
                      dateStyle: "long",
                    })
                  : "—",
              })}
            </p>
          ) : (
            <p>{t("disclaimer")}</p>
          )}
        </Alert>
      )}
    </div>
  );
}
