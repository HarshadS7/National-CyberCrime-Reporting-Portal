import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { IconPhone } from "@/components/ui/Icons";

/**
 * Plan P3-13 — no "Best viewed in..." notice. Social icons, when added, must
 * carry accessible names (audit finding P1-6).
 */
export function SiteFooter() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  const links = [
    { href: "/help/contacts", label: t("contacts") },
    { href: "/help/faq", label: t("faq") },
    { href: "/learn", label: t("learn") },
    { href: "/about", label: t("about") },
  ] as const;

  return (
    <footer className="px-4 pb-8 pt-4">
      <div className="neu-deep-inset mx-auto max-w-6xl rounded-xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="font-bold text-ink">{tc("siteName")}</p>
            <p className="mt-1 text-sm text-ink-muted">{tc("ministry")}</p>
            <a
              href="tel:1930"
              className="mt-4 inline-flex min-h-(--spacing-touch) items-center gap-2 rounded-md bg-urgent px-5 font-semibold text-urgent-contrast shadow-neu-sm"
            >
              <IconPhone className="size-4" />
              {tc("helplineLabel")}
            </a>
          </div>

          <nav aria-label={t("help")}>
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-(--spacing-touch) items-center text-primary underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
