import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { StepIndicator } from "@/components/patterns/StepIndicator";
import { generateDemoCaptcha } from "@/lib/demo-captcha";
import { AckStepForm } from "./AckStepForm";
import { OtpStep } from "./OtpStep";

/**
 * Plan P1-7 / Phase 1.
 *
 * Step 1 -> 2 is a real navigation (ack/mobile travel via the URL query, set
 * by a redirect() in actions.ts) so the OTP step is refreshable and linkable.
 * Step 2 -> 3 (verify) renders inline once the server action returns a
 * result, since a "result" screen isn't a meaningfully distinct URL here.
 */
export default function TrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ step?: string; ack?: string; mobile?: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const { step, ack, mobile } = use(searchParams);

  const t = useTranslations("track");
  const steps = [t("steps.ack"), t("steps.otp"), t("steps.result")] as const;

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("intro")}</p>
      </div>

      {step === "otp" && ack ? (
        <OtpStep
          steps={steps}
          acknowledgementNumber={ack}
          maskedMobile={mobile ?? ""}
          initialCaptcha={generateDemoCaptcha()}
        />
      ) : (
        <>
          <StepIndicator steps={steps} current={1} />
          <AckStepForm />
          <p className="text-sm text-ink-muted">{t("demoNote")}</p>
        </>
      )}
    </div>
  );
}
