"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { StateContact } from "@/lib/types";

/**
 * Plan P1-8 — replaces the 6-column, ~1,582px-wide table on mobile.
 *
 * Emails are real mailto: links. The audited portal obfuscated them as
 * "[at]"/"[dot]", which defeats assistive technology and tap-to-email for a
 * scraping defence that server-side rate limiting should handle instead.
 */
export function ContactCard({ contact }: { contact: StateContact }) {
  const t = useTranslations("contacts");
  const [copied, setCopied] = useState(false);

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard can be blocked. The mailto: link is still available.
    }
  }

  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">{contact.state}</h2>

      <dl className="mt-4 flex flex-col gap-4">
        <div>
          <dt className="text-sm text-ink-muted">{t("nodalOfficer")}</dt>
          <dd className="font-medium">{contact.nodalOfficer.name}</dd>
          {contact.nodalOfficer.rank && (
            <dd className="text-sm text-ink-muted">
              {contact.nodalOfficer.rank}
            </dd>
          )}
          {contact.nodalOfficer.phone && (
            <dd>
              <a
                href={`tel:${contact.nodalOfficer.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-(--spacing-touch) items-center text-primary underline underline-offset-4"
              >
                {contact.nodalOfficer.phone}
              </a>
            </dd>
          )}
          {contact.nodalOfficer.email && (
            <dd className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${contact.nodalOfficer.email}`}
                className="inline-flex min-h-(--spacing-touch) items-center break-all text-primary underline underline-offset-4"
              >
                {contact.nodalOfficer.email}
              </a>
              <Button
                variant="tertiary"
                className="text-sm"
                onClick={() => copyEmail(contact.nodalOfficer.email!)}
              >
                {t("copyEmail")}
              </Button>
            </dd>
          )}
        </div>

        {contact.grievanceOfficer && (
          <div>
            <dt className="text-sm text-ink-muted">{t("grievanceOfficer")}</dt>
            <dd className="font-medium">{contact.grievanceOfficer.name}</dd>
            {contact.grievanceOfficer.email && (
              <dd>
                <a
                  href={`mailto:${contact.grievanceOfficer.email}`}
                  className="inline-flex min-h-(--spacing-touch) items-center break-all text-primary underline underline-offset-4"
                >
                  {contact.grievanceOfficer.email}
                </a>
              </dd>
            )}
          </div>
        )}
      </dl>

      {/* Always mounted so the copy confirmation is announced. */}
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? t("emailCopied") : ""}
      </p>
    </article>
  );
}
