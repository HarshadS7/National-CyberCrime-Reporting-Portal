"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import type { ReactNode } from "react";

/**
 * Wraps Radix's Accordion primitive rather than hand-rolling one — Radix
 * ships correct keyboard handling (arrow keys, Home/End) and ARIA wiring for
 * expanded state out of the box. Hand-rolled disclosure widgets are exactly
 * what produced the audit's accessibility findings.
 */
export function Accordion({
  children,
  type = "multiple",
}: {
  children: ReactNode;
  type?: "single" | "multiple";
}) {
  if (type === "single") {
    return (
      <RadixAccordion.Root type="single" collapsible className="flex flex-col gap-3">
        {children}
      </RadixAccordion.Root>
    );
  }
  return (
    <RadixAccordion.Root type="multiple" className="flex flex-col gap-3">
      {children}
    </RadixAccordion.Root>
  );
}

export function AccordionItem({
  value,
  id,
  title,
  children,
}: {
  value: string;
  /** Anchor id — every FAQ entry must be individually linkable (plan §4.5). */
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <RadixAccordion.Item value={value} id={id} className="neu overflow-hidden rounded-lg">
      <RadixAccordion.Header>
        <RadixAccordion.Trigger className="group flex min-h-(--spacing-touch) w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-ink">
          {title}
          <span
            aria-hidden="true"
            className="shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180"
          >
            ▾
          </span>
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="overflow-hidden px-5 pb-4 text-sm leading-relaxed text-ink-muted data-[state=closed]:animate-none">
        {children}
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
}
