"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("error");
  return (
    <div className="flex max-w-xl flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-ink-muted">{t("body")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
