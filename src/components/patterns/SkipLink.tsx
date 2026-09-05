import { useTranslations } from "next-intl";

/** Plan §5 — visible-on-focus skip link, first focusable element on the page. */
export function SkipLink() {
  const t = useTranslations("common");
  return (
    <a
      href="#main"
      className="sr-only-focusable z-50 m-2 inline-block rounded-md bg-primary px-4 py-2 font-medium text-primary-contrast"
    >
      {t("skipToContent")}
    </a>
  );
}
