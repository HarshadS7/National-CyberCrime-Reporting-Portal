import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Alert } from "@/components/ui/Alert";
import { generateDemoCaptcha } from "@/lib/demo-captcha";
import { CheckSuspectForm } from "./CheckSuspectForm";

export default function CheckSuspectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("checkSuspect");
  const captcha = generateDemoCaptcha();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("intro")}</p>
      </div>

      <Alert tone="info" title={t("demoNote")} />

      <CheckSuspectForm initialCaptcha={captcha} />
    </div>
  );
}
