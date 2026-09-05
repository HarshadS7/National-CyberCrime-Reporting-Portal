import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("error");
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("notFoundTitle")}</h1>
      <p className="text-ink-muted">{t("notFoundBody")}</p>
      <p>
        <Link href="/" className="text-primary underline underline-offset-4">
          {t("goHome")}
        </Link>
      </p>
    </div>
  );
}
