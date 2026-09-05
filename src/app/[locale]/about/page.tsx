import { setRequestLocale } from "next-intl/server";
import { use } from "react";

/**
 * TODO(phase-5): About this portal. Plan §3 — institutional content (campaigns,
 * Cyber Volunteers, press, statistics) moves here, out of the primary nav.
 */
export default function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <h1 className="text-2xl font-bold">About this portal</h1>;
}
