import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { TaskCard } from "@/components/patterns/TaskCard";
import { IconFraud, IconShieldAlert, IconSearch } from "@/components/ui/Icons";

const categories = [
  { key: "financialFraud", href: "/report/financial-fraud", icon: IconFraud, urgent: true },
  { key: "womenChildren", href: "/report/women-children", icon: IconShieldAlert },
  { key: "other", href: "/report/other", icon: IconSearch },
] as const;

export default function ReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("report");
  const tPage = useTranslations("reportPage");

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("intro")}</p>
      </div>

      <h2 className="sr-only">{tPage("chooseCategory")}</h2>
      <ul className="grid gap-5 sm:grid-cols-3">
        {categories.map((category) => (
          <TaskCard
            key={category.key}
            href={category.href}
            icon={category.icon}
            urgent={"urgent" in category ? category.urgent : undefined}
            title={t(`categories.${category.key}.title`)}
            description={t(`categories.${category.key}.description`)}
            action={t("anonymous")}
          />
        ))}
      </ul>
    </div>
  );
}
