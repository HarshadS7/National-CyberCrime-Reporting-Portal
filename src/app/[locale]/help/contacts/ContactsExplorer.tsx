"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "@/components/ui/Field";
import { ContactCard } from "@/components/patterns/ContactCard";
import type { StateContact } from "@/lib/types";

/**
 * Plan P1-8 — replaces the 6-column, ~1,582px-wide table with a filterable,
 * mobile-first list. A dedicated desktop table view is a documented TODO
 * (see FRONTEND_PLAN.md §4.3) rather than built here, to keep one code path
 * that already works well at every width.
 */
export function ContactsExplorer({
  contacts,
}: {
  contacts: StateContact[];
}) {
  const t = useTranslations("contacts");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return contacts;
    return contacts.filter((c) => c.state.toLowerCase().includes(needle));
  }, [contacts, query]);

  return (
    <div className="flex flex-col gap-6">
      <TextField
        label={t("filterLabel")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />

      <p role="status" aria-live="polite" className="sr-only">
        {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <p className="neu-inset rounded-lg p-6 text-ink-muted">
          {t("noMatch")}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((contact) => (
            <li key={contact.slug}>
              <ContactCard contact={contact} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
