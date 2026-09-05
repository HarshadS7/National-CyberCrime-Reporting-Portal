import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

/** TODO(phase-5): see FRONTEND_PLAN.md §4 for the specification. */
export default function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("faq");

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-ink-muted">{t("intro")}</p>
    </div>
  );
}
