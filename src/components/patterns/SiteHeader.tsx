import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { IconEmblem } from "@/components/ui/Icons";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ContrastToggle } from "./ContrastToggle";

/**
 * Plan P1-4 — primary navigation carries citizen tasks only.
 * Institutional content (campaigns, volunteers, press) lives under /about.
 *
 * TODO(phase-3): mobile disclosure menu using Radix Dialog, with an accessible
 * name and announced expanded state (audit finding P1-6). Until then the nav
 * wraps rather than collapsing, which is usable but not ideal on small screens.
 */
export function SiteHeader() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  const links = [
    { href: "/report", label: t("report") },
    { href: "/track", label: t("track") },
    { href: "/check-suspect", label: t("checkSuspect") },
    { href: "/help/faq", label: t("help") },
  ] as const;

  return (
    <header className="bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:py-4">
        <Link
          href="/"
          className="mr-auto flex items-center gap-3 rounded-md py-1"
        >
          <span className="neu-sm flex size-9 shrink-0 items-center justify-center rounded-full text-primary md:size-11">
            <IconEmblem className="size-5 md:size-6" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-ink md:text-base">
              {tc("siteName")}
            </span>
            <span className="hidden text-xs text-ink-muted sm:block">
              {tc("ministry")}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ContrastToggle />
          <LocaleSwitcher />
        </div>
      </div>

      {/*
        Single row that scrolls horizontally on small screens rather than
        wrapping — a wrapped nav consumed the entire 360x640 viewport and
        pushed the task chooser below the fold.
      */}
      <nav aria-label={t("home")} className="px-4 pb-3 md:pb-4">
        <ul className="neu mx-auto flex max-w-6xl gap-1 overflow-x-auto rounded-lg p-2 [scrollbar-width:none] md:flex-wrap md:overflow-visible">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className="inline-flex min-h-(--spacing-touch) items-center whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium text-ink transition-shadow duration-200 hover:shadow-neu-inset-sm md:px-4 md:text-base"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
