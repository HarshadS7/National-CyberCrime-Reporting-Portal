import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Plan P2-12: locales are URL segments so every page stays shareable and
 * cacheable. Additional scheduled languages are added here — the app code
 * never hardcodes a locale list.
 */
export const routing = defineRouting({
  locales: ["en", "hi"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
