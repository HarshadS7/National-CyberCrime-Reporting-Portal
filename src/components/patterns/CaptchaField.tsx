"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Field, controlClassName } from "@/components/ui/Field";
import { generateDemoCaptcha, type DemoCaptcha } from "@/lib/demo-captcha";

/**
 * Plan P0-2 — the audited portal used an image-only CAPTCHA with an unlabelled
 * refresh control, which blocks screen-reader users from tracking a complaint.
 *
 * This component fixes the labelling but the challenge itself is DEMO MODE: it
 * renders a fake code and verifies nothing server-side (see lib/demo-captcha).
 * Phase 1 must replace it with a challenge agreed with the platform and
 * security teams before launch.
 *
 * `initial` must come from the server (a Server Component calling
 * generateDemoCaptcha() at request time) so the first paint matches between
 * server and client. Only the refresh button regenerates client-side.
 */
export interface CaptchaFieldProps {
  initial: DemoCaptcha;
  error?: string;
}

export function CaptchaField({ initial, error }: CaptchaFieldProps) {
  const t = useTranslations("track");
  const [captcha, setCaptcha] = useState(initial);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {/*
          alt is empty by design: the image content is the challenge itself and
          must not be exposed as text. The accessible path is the labelled
          input below — this demo has no audio alternative yet.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={captcha.imageDataUri}
          alt=""
          width={160}
          height={56}
          className="neu-inset-sm rounded-md"
        />

        <button
          type="button"
          onClick={() => setCaptcha(generateDemoCaptcha())}
          className="neu-interactive inline-flex min-h-(--spacing-touch) items-center rounded-md px-3 text-primary"
        >
          {/* Accessible name, not an icon alone (audit finding P0-2). */}
          {t("captchaRefresh")}
        </button>
      </div>

      <input type="hidden" name="challengeId" value={captcha.challengeId} />

      <Field
        label={t("captchaLabel")}
        hint={t("captchaHint")}
        error={error}
        required
      >
        {(field) => (
          <input
            {...field}
            name="captcha"
            autoComplete="off"
            inputMode="text"
            className={controlClassName}
          />
        )}
      </Field>
    </div>
  );
}
