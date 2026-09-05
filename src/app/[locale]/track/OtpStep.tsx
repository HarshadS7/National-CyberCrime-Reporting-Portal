"use client";

import { useActionState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { StepIndicator } from "@/components/patterns/StepIndicator";
import { TextField } from "@/components/ui/Field";
import { CaptchaField } from "@/components/patterns/CaptchaField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { DemoCaptcha } from "@/lib/demo-captcha";
import type { ComplaintSummary, ComplaintStatus } from "@/lib/types";
import { verifyOtpAction, type TrackFormState } from "./actions";

const initialState: TrackFormState = {};

const STATUS_TONE: Record<ComplaintStatus, "info" | "warning" | "success"> = {
  submitted: "info",
  "under-review": "warning",
  "action-taken": "success",
  closed: "success",
};

export function OtpStep({
  steps,
  acknowledgementNumber,
  maskedMobile,
  initialCaptcha,
}: {
  steps: readonly string[];
  acknowledgementNumber: string;
  maskedMobile: string;
  initialCaptcha: DemoCaptcha;
}) {
  const t = useTranslations("track");
  const [state, formAction, pending] = useActionState(
    verifyOtpAction,
    initialState,
  );

  if (state.complaint) {
    return (
      <>
        <StepIndicator steps={steps} current={3} />
        <ResultPanel complaint={state.complaint} />
      </>
    );
  }

  return (
    <>
      <StepIndicator steps={steps} current={2} />

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <input
          type="hidden"
          name="acknowledgementNumber"
          value={acknowledgementNumber}
        />

        <p
          role="status"
          aria-live="polite"
          className="neu-inset-sm rounded-md px-4 py-3 text-sm text-ink-muted"
        >
          {t("otpSentStatus", { last4: maskedMobile })}
        </p>

        <TextField
          name="otp"
          label={t("otpLabel")}
          hint={t("otpHint")}
          error={state.fieldErrors?.otp ? t(state.fieldErrors.otp) : undefined}
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
        />

        <CaptchaField
          initial={initialCaptcha}
          error={
            state.fieldErrors?.captcha ? t(state.fieldErrors.captcha) : undefined
          }
        />

        {state.formError && (
          <Alert tone="danger" title={t(state.formError)} live />
        )}

        <Button type="submit" disabled={pending} size="lg">
          {t("submit")}
        </Button>
      </form>

      <p className="text-sm text-ink-muted">{t("demoNote")}</p>
    </>
  );
}

function ResultPanel({ complaint }: { complaint: ComplaintSummary }) {
  const t = useTranslations("track");
  const tCategories = useTranslations("report.categories");
  const format = useFormatter();

  const categoryKey =
    complaint.category === "financial-fraud"
      ? "financialFraud"
      : complaint.category === "women-children"
        ? "womenChildren"
        : "other";

  return (
    <div className="flex flex-col gap-4">
      <Alert
        tone={STATUS_TONE[complaint.status]}
        title={t("resultTitle")}
        live
      >
        <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-muted">{t("resultAckLabel")}</dt>
            <dd className="font-medium">{complaint.acknowledgementNumber}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">
              {t("resultCategoryLabel")}
            </dt>
            <dd className="font-medium">
              {tCategories(`${categoryKey}.title`)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{t("resultStatusLabel")}</dt>
            <dd className="font-medium">{t(`statuses.${complaint.status}`)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{t("resultFiledLabel")}</dt>
            <dd className="font-medium">
              {format.dateTime(new Date(complaint.filedAt), {
                dateStyle: "long",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">
              {t("resultUpdatedLabel")}
            </dt>
            <dd className="font-medium">
              {format.dateTime(new Date(complaint.lastUpdatedAt), {
                dateStyle: "long",
              })}
            </dd>
          </div>
        </dl>
      </Alert>

      <div className="flex flex-wrap gap-3">
        {complaint.stateSlug && (
          <Link
            href={{ pathname: "/help/contacts" }}
            className="neu-interactive inline-flex min-h-(--spacing-touch) items-center rounded-md px-5 font-semibold text-primary"
          >
            {t("escalationCta")}
          </Link>
        )}
        <Link
          href="/track"
          className="neu-interactive inline-flex min-h-(--spacing-touch) items-center rounded-md px-5 font-semibold text-primary"
        >
          {t("startOver")}
        </Link>
      </div>
    </div>
  );
}
