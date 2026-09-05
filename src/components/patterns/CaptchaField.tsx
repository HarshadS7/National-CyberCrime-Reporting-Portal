"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Field, controlClassName } from "@/components/ui/Field";

/**
 * Plan P0-2 — the audited portal used an image-only CAPTCHA with an unlabelled
 * refresh control, which blocks screen-reader users from tracking a complaint.
 *
 * This component fixes the labelling and provides an audio alternative, but the
 * image challenge itself is a placeholder. Phase 1 must replace it with a
 * challenge agreed with the platform and security teams.
 *
 * TODO(phase-1): swap the image challenge. Options to evaluate:
 *   - an invisible/risk-based challenge with an accessible fallback
 *   - a server-issued audio + image pair (implemented here as the interim)
 * Do not ship the image-only path.
 */
export interface CaptchaFieldProps {
  /** Server-issued challenge id, submitted alongside the answer. */
  challengeId: string;
  imageUrl: string;
  audioUrl?: string;
  error?: string;
  onRefresh?: () => void;
}

export function CaptchaField({
  challengeId,
  imageUrl,
  audioUrl,
  error,
  onRefresh,
}: CaptchaFieldProps) {
  const t = useTranslations("track");
  const [cacheBust, setCacheBust] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {/*
          alt is empty by design: the image content is the challenge itself and
          must not be exposed as text. The accessible path is the audio
          alternative and the labelled input below.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${imageUrl}?v=${cacheBust}`}
          alt=""
          width={160}
          height={56}
          className="rounded-md border border-border"
        />

        <button
          type="button"
          onClick={() => {
            setCacheBust((value) => value + 1);
            onRefresh?.();
          }}
          className="inline-flex min-h-(--spacing-touch) items-center rounded-md border border-border px-3 text-primary"
        >
          {/* Accessible name, not an icon alone (audit finding P0-2). */}
          {t("captchaRefresh")}
        </button>

        {audioUrl && (
          <a
            href={audioUrl}
            className="inline-flex min-h-(--spacing-touch) items-center text-primary underline underline-offset-4"
          >
            {t("captchaAudio")}
          </a>
        )}
      </div>

      <input type="hidden" name="challengeId" value={challengeId} />

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
