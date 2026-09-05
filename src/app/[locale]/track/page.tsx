import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { StepIndicator } from "@/components/patterns/StepIndicator";
import { AckStepForm } from "./AckStepForm";

/**
 * Plan P1-7 / Phase 1.
 *
 * Steps are addressable via ?step= so a refresh does not destroy progress and
 * a step is linkable. State lives in the URL, not in client memory.
 */
export default function TrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const { step } = use(searchParams);

  const t = useTranslations("track");
  const steps = [t("steps.ack"), t("steps.otp"), t("steps.result")] as const;
  const current = step === "otp" ? 2 : step === "result" ? 3 : 1;

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("intro")}</p>
      </div>

      <StepIndicator steps={steps} current={current} />

      {/* TODO(phase-1): render OtpStepForm and ResultPanel for steps 2 and 3. */}
      {current === 1 && <AckStepForm />}
    </div>
  );
}
