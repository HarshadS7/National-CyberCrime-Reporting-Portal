import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SkipLink } from "@/components/patterns/SkipLink";
import { EmergencyStrip } from "@/components/patterns/EmergencyStrip";
import { SiteHeader } from "@/components/patterns/SiteHeader";
import { SiteFooter } from "@/components/patterns/SiteFooter";
import ShrinkingFooter from "@/components/patterns/ShrinkingFooter";
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
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* Plan §5 — skip link is the first focusable element. */}
          <SkipLink />

          <ShrinkingFooter>
            <div className="flex min-h-screen flex-col">
              <EmergencyStrip />
              <SiteHeader />

              {/* Exactly one <main> landmark per page. */}
              <main
                id="main"
                className="mx-auto w-full max-w-6xl flex-1 px-4 py-4"
              >
                {children}
              </main>
            </div>
          </ShrinkingFooter>

          {/*
            Spacer that gives the reveal something to scroll into; without it
            the effect has nowhere to play on short pages.
          */}
          <div aria-hidden="true" className="h-64" />

          {/*
            Rendered AFTER the content so keyboard and screen-reader order stays
            header -> main -> footer. z-0 against the content's z-10 is what
            puts it visually behind; DOM order must not be used for that.
          */}
          <div className="fixed inset-x-0 bottom-0 z-0">
            <SiteFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
