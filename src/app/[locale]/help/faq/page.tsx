"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { getFaqEntries } from "@/lib/data/faq";
import type { FaqEntry } from "@/lib/types";

const TOPIC_ORDER: FaqEntry["topic"][] = [
  "reporting",
  "evidence",
  "account",
  "tracking",
  "withdrawal",
  "safety",
];

/**
 * Plan P2-10 — searchable, task-grouped FAQ. Client-rendered: search is
 * genuinely interactive and the full entry set is small enough to ship
 * up front rather than round-trip to a server action per keystroke.
 */
export default function FaqPage() {
  const t = useTranslations("faq");
  const tTopics = useTranslations("faq.topics");
  const tPage = useTranslations("faqPage");
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const entries = useMemo(() => getFaqEntries(locale), [locale]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter(
      (entry) =>
        entry.question.toLowerCase().includes(needle) ||
        entry.answer.toLowerCase().includes(needle),
    );
  }, [entries, query]);

  const byTopic = useMemo(() => {
    const groups = new Map<FaqEntry["topic"], FaqEntry[]>();
    for (const entry of filtered) {
      const list = groups.get(entry.topic) ?? [];
      list.push(entry);
      groups.set(entry.topic, list);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("intro")}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <TextField
          label={t("searchLabel")}
          hint={t("searchHint")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1"
        />
        {query && (
          <Button variant="tertiary" onClick={() => setQuery("")}>
            {t("clearSearch")}
          </Button>
        )}
      </div>

      <p role="status" aria-live="polite" className="text-sm text-ink-muted">
        {t("resultCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="neu-inset rounded-lg p-6 text-ink-muted">
          {t("resultCount", { count: 0 })}
        </p>
      ) : (
        TOPIC_ORDER.filter((topic) => byTopic.has(topic)).map((topic) => (
          <section key={topic} aria-labelledby={`topic-${topic}`}>
            <h2 id={`topic-${topic}`} className="mb-3 text-lg font-semibold">
              {tTopics(topic)}
            </h2>
            <Accordion>
              {byTopic.get(topic)!.map((entry) => (
                <AccordionItem
                  key={entry.id}
                  value={entry.id}
                  id={entry.id}
                  title={entry.question}
                >
                  {entry.answer}
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))
      )}

      <p className="sr-only">{tPage("questionsHeading")}</p>
    </div>
  );
}
