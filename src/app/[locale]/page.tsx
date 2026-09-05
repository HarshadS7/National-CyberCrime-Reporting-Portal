import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/routing";
import { Alert } from "@/components/ui/Alert";
import { TaskCard } from "@/components/patterns/TaskCard";
import {
  IconArrowRight,
  IconCheck,
  IconFraud,
  IconHelp,
  IconPhone,
  IconSearch,
  IconShieldAlert,
  IconTrack,
} from "@/components/ui/Icons";

/**
 * Plan P1-3, P1-4 — the task chooser is the homepage.
 *
 * No carousel: campaign imagery lives under /about. The hero states what the
 * service does, pairs the 1930 helpline with the financial-fraud path, and the
 * task grid must be reachable without hunting (acceptance criterion: cards
 * visible above the fold at 360x640 after the hero).
 */
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("home");

  const tasks = [
    {
      key: "victim",
      href: "/report/financial-fraud",
      icon: IconFraud,
      urgent: true,
    },
    {
      key: "harmfulContent",
      href: "/report/women-children",
      icon: IconShieldAlert,
    },
    { key: "check", href: "/check-suspect", icon: IconSearch },
    { key: "track", href: "/track", icon: IconTrack },
    { key: "help", href: "/help/faq", icon: IconHelp },
  ] as const;

  const steps = ["step1", "step2", "step3"] as const;

  return (
    <div className="flex flex-col">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="pb-8 pt-4 md:py-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <p className="neu-inset-sm hidden rounded-full px-4 py-1.5 text-sm font-medium text-ink-muted sm:inline-block">
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-3xl font-bold sm:mt-5 md:text-4xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
              {t("hero.subtitle")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 md:mt-8 md:gap-4">
              <Link
                href="/report"
                className="inline-flex min-h-(--spacing-touch) items-center gap-2 rounded-md bg-primary px-7 py-3.5 font-semibold text-primary-contrast shadow-neu-sm transition-colors hover:bg-primary-hover"
              >
                {t("hero.primaryCta")}
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                href="/track"
                className="neu-interactive inline-flex min-h-(--spacing-touch) items-center rounded-md px-7 py-3.5 font-semibold text-primary"
              >
                {t("hero.secondaryCta")}
              </Link>
            </div>
          </div>

          {/*
            Plan P1-3 — the 1930 helpline is paired with the reporting action
            rather than left as a line of body copy.
          */}
          <aside className="neu relative overflow-hidden rounded-xl p-7">
            <span
              className="absolute inset-x-0 top-0 h-1.5 bg-urgent"
              aria-hidden="true"
            />
            <p className="flex items-center gap-2 font-semibold text-urgent">
              <IconPhone className="size-5" />
              {t("hero.helplineTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {t("hero.helplineBody")}
            </p>
            <a
              href="tel:1930"
              className="mt-5 inline-flex min-h-(--spacing-touch) w-full items-center justify-center gap-2 rounded-md bg-urgent px-5 py-3.5 text-lg font-bold text-urgent-contrast shadow-neu-sm transition-colors hover:bg-urgent-hover"
            >
              <IconPhone className="size-5" />
              {t("hero.helplineCta")}
            </a>
          </aside>
        </div>
      </section>

      {/* --------------------------------------------------------- Task chooser */}
      <section className="pb-12 pt-4 md:pb-16 md:pt-6" aria-labelledby="tasks-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="tasks-heading" className="text-2xl font-bold">
            {t("tasksTitle")}
          </h2>
          <p className="mt-2 text-ink-muted">{t("tasksIntro")}</p>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.key}
                href={task.href}
                icon={task.icon}
                urgent={"urgent" in task ? task.urgent : undefined}
                title={t(`tasks.${task.key}.title`)}
                description={t(`tasks.${task.key}.description`)}
                action={t(`tasks.${task.key}.action`)}
              />
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------- What happens next */}
      <section
        className="neu-inset rounded-2xl px-6 py-12 md:px-10 md:py-16"
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="how-heading" className="text-2xl font-bold">
            {t("howTitle")}
          </h2>

          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="flex flex-col gap-2">
                <span className="neu-sm flex size-11 items-center justify-center rounded-full font-bold text-success">
                  {index + 1}
                </span>
                <h3 className="font-semibold">{t(`how.${step}Title`)}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {t(`how.${step}Body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------- Help + alert */}
      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="neu rounded-lg p-7">
            <h2 className="text-xl font-semibold">{t("helpTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {t("helpBody")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/help/faq"
                className="neu-interactive inline-flex min-h-(--spacing-touch) items-center gap-1.5 rounded-md px-5 py-2.5 font-medium text-primary"
              >
                <IconCheck className="size-4" />
                {t("helpFaqCta")}
              </Link>
              <Link
                href="/help/contacts"
                className="neu-interactive inline-flex min-h-(--spacing-touch) items-center gap-1.5 rounded-md px-5 py-2.5 font-medium text-primary"
              >
                {t("helpContactsCta")}
              </Link>
            </div>
          </div>

          {/* This warning is live on the current portal, but buried in body copy. */}
          <Alert tone="warning" title={t("alertTitle")}>
            {t("alertBody")}
          </Alert>
        </div>
      </section>
    </div>
  );
}
