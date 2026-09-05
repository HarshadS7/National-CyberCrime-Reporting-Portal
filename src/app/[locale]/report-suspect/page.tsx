import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { Alert } from "@/components/ui/Alert";
import { getStateContacts } from "@/lib/api/client";
import { ReportSuspectForm } from "./ReportSuspectForm";

export default function ReportSuspectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const states = use(getStateContacts());

  const t = useTranslations("reportSuspect");

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("intro")}</p>
      </div>

      {/* Plan P2-11 — a prominent action, not a line of plain text. */}
      <Alert tone="danger" title={t("victimTitle")}>
        <p>{t("victimBody")}</p>
        <p className="mt-3">
          <Link
            href="/report"
            className="inline-flex min-h-(--spacing-touch) items-center rounded-md bg-urgent px-5 font-semibold text-urgent-contrast shadow-neu-sm"
          >
            {t("victimAction")}
          </Link>
        </p>
      </Alert>

      <Alert tone="info" title={t("demoNote")} />

      <ReportSuspectForm states={states} />
    </div>
  );
}
