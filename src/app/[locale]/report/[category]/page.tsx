import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { use } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { ComplaintCategory } from "@/lib/types";

const categories = [
  "financial-fraud",
  "women-children",
  "other",
] as const satisfies readonly ComplaintCategory[];

const messageKey: Record<ComplaintCategory, string> = {
  "financial-fraud": "financialFraud",
  "women-children": "womenChildren",
  other: "other",
};

export function generateStaticParams() {
  return categories.map((category) => ({ category }));
}

/** TODO(phase-4): the reporting form itself. Plan §4.4. */
export default function ReportCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = use(params);
  setRequestLocale(locale);

  if (!categories.includes(category as ComplaintCategory)) notFound();
  const key = messageKey[category as ComplaintCategory];

  const t = useTranslations("report");

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t(`categories.${key}.title`)}</h1>
        <p className="mt-2 text-ink-muted">
          {t(`categories.${key}.description`)}
        </p>
      </div>

      {/* Plan P1-3 — financial fraud pairs the form with the 1930 helpline. */}
      {category === "financial-fraud" && (
        <Alert tone="danger" title={t("urgentTitle")}>
          <p>{t("urgentBody")}</p>
          <p className="mt-3">
            <a
              href="tel:1930"
              className="inline-flex min-h-(--spacing-touch) items-center rounded-md bg-urgent px-4 font-semibold text-urgent-contrast"
            >
              1930
            </a>
          </p>
        </Alert>
      )}

      <div className="flex flex-wrap gap-3">
        <Button size="lg">{t("tracked")}</Button>
        <Button size="lg" variant="secondary">
          {t("anonymous")}
        </Button>
      </div>
    </div>
  );
}
