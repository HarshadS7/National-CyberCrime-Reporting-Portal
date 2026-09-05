import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SkipLink } from "@/components/patterns/SkipLink";
import { EmergencyStrip } from "@/components/patterns/EmergencyStrip";
import { SiteHeader } from "@/components/patterns/SiteHeader";
import { SiteFooter } from "@/components/patterns/SiteFooter";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: { default: t("siteName"), template: `%s — ${t("siteName")}` },
    description: t("ministry"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          {/* Plan §5 — skip link is the first focusable element. */}
          <SkipLink />
          <EmergencyStrip />
          <SiteHeader />

          {/* Exactly one <main> landmark per page. */}
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-4">
            {children}
          </main>

          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
