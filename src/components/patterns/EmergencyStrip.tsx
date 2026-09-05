import { useTranslations } from "next-intl";
import { IconPhone } from "@/components/ui/Icons";

/**
 * Plan P1-3 — the 1930 helpline is visible at every breakpoint, on every page.
 * A real tel: link, so it dials on mobile and is announced as a phone number.
 *
 * Deliberately NOT neumorphic: this is the one element that must never blend
 * into the surface it sits on.
 */
export function EmergencyStrip() {
  const t = useTranslations("common");
  return (
    <div className="bg-urgent text-urgent-contrast">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-2">
        <a
          href="tel:1930"
          className="inline-flex min-h-(--spacing-touch) items-center gap-2 rounded-md px-3 text-center font-semibold underline underline-offset-4 decoration-2"
        >
          <IconPhone className="size-4 shrink-0" />
          {t("helplineLabel")}
        </a>
      </div>
    </div>
  );
}
