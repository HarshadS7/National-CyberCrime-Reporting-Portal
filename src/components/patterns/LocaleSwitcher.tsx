"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { controlClassName } from "@/components/ui/Field";

const localeNames: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
};

/**
 * Plan P2-12. A <select> that submits on change, wrapped so it still has a
 * real label. Locale lives in the URL, so the choice is shareable.
 */
export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("languageToggle")}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(() => {
            router.replace(
              // @ts-expect-error -- pathname is a known route at runtime
              { pathname, params },
              { locale: next },
            );
          });
        }}
        className={`${controlClassName} w-auto py-1`}
      >
        {routing.locales.map((value) => (
          <option key={value} value={value}>
            {localeNames[value] ?? value}
          </option>
        ))}
      </select>
    </label>
  );
}
