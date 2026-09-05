"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { ComplaintCategory } from "@/lib/types";
import { submitComplaintAction } from "./actions";

/**
 * Two independent forms (anonymous / tracked) rather than one form with a
 * hidden mode field: each is a real <form action> that posts and works
 * without JavaScript, and neither depends on client state to know which path
 * was chosen.
 */
export function ReportForm({ category }: { category: ComplaintCategory }) {
  const t = useTranslations("report");
  const tPage = useTranslations("reportPage");

  const trackedAction = submitComplaintAction.bind(null, category, false);
  const anonymousAction = submitComplaintAction.bind(null, category, true);

  const [trackedState, trackedFormAction, trackedPending] = useActionState(
    trackedAction,
    {},
  );
  const [anonState, anonFormAction, anonPending] = useActionState(
    anonymousAction,
    {},
  );

  if (trackedState.acknowledgementNumber) {
    return (
      <Alert tone="success" title={tPage("submittedTitle")} live>
        <p>
          {tPage("submittedBody", { ack: trackedState.acknowledgementNumber })}
        </p>
        <p className="mt-3">
          <Link
            href={{
              pathname: "/track",
              query: { step: "otp", ack: trackedState.acknowledgementNumber, mobile: "4321" },
            }}
            className="neu-interactive inline-flex min-h-(--spacing-touch) items-center rounded-md px-5 font-semibold text-primary"
          >
            {tPage("trackNow")}
          </Link>
        </p>
      </Alert>
    );
  }

  if (anonState.acknowledgementNumber) {
    return (
      <Alert tone="success" title={tPage("submittedTitle")} live>
        <p>{tPage("anonSubmittedBody")}</p>
      </Alert>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <form action={trackedFormAction}>
        <Button type="submit" size="lg" disabled={trackedPending}>
          {t("tracked")}
        </Button>
      </form>
      <form action={anonFormAction}>
        <Button type="submit" size="lg" variant="secondary" disabled={anonPending}>
          {t("anonymous")}
        </Button>
      </form>
    </div>
  );
}
