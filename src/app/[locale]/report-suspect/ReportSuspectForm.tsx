"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { TextField, Field, controlClassName } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { StateContact } from "@/lib/types";
import { reportSuspectAction, type ReportSuspectState } from "./actions";

const initialState: ReportSuspectState = {};

const KINDS = ["phone", "email", "website", "social-handle", "upi"] as const;

/**
 * Plan P2-11 — report type is asked before State, matching the order a person
 * actually decides in: what happened, then where they are.
 */
export function ReportSuspectForm({
  states,
}: {
  states: Pick<StateContact, "slug" | "state">[];
}) {
  const t = useTranslations("reportSuspect");
  const tTypes = useTranslations("reportSuspect.types");
  const [state, formAction, pending] = useActionState(
    reportSuspectAction,
    initialState,
  );

  if (state.referenceId) {
    return (
      <Alert tone="success" title={t("submittedTitle")} live>
        <p>{t("submittedBody", { referenceId: state.referenceId })}</p>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field
        label={t("typeLabel")}
        hint={t("typeHint")}
        error={state.fieldErrors?.kind ? t(state.fieldErrors.kind) : undefined}
        required
      >
        {(field) => (
          <select {...field} name="kind" defaultValue="" className={controlClassName}>
            <option value="" disabled>
              {t("typeLabel")}
            </option>
            {KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {tTypes(kind)}
              </option>
            ))}
          </select>
        )}
      </Field>

      <TextField
        name="identifier"
        label={t("identifierLabel")}
        hint={t("identifierHint")}
        error={
          state.fieldErrors?.identifier
            ? t(state.fieldErrors.identifier)
            : undefined
        }
        required
        autoComplete="off"
      />

      <Field label={t("descriptionLabel")} hint={t("descriptionHint")}>
        {(field) => (
          <textarea
            {...field}
            name="description"
            rows={4}
            className={controlClassName}
          />
        )}
      </Field>

      <Field
        label={t("stateLabel")}
        hint={t("stateHint")}
        error={
          state.fieldErrors?.stateSlug
            ? t(state.fieldErrors.stateSlug)
            : undefined
        }
        required
      >
        {(field) => (
          <select
            {...field}
            name="stateSlug"
            defaultValue=""
            className={controlClassName}
          >
            <option value="" disabled>
              {t("stateLabel")}
            </option>
            {states.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.state}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Button type="submit" disabled={pending} size="lg">
        {t("submit")}
      </Button>
    </form>
  );
}
