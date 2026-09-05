import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Plan P1-7 — the tracking flow needs an explicit, announced sequence.
 * Steps are URL-addressable, so this reflects state rather than owning it.
 */
export interface StepIndicatorProps {
  steps: readonly string[];
  /** 1-based. */
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  const t = useTranslations("track");

  return (
    <nav aria-label={t("title")}>
      <p className="sr-only">
        {t("stepLabel", { current, total: steps.length })}
      </p>
      <ol className="neu-inset flex flex-wrap gap-x-6 gap-y-3 rounded-lg p-4">
        {steps.map((step, index) => {
          const position = index + 1;
          const state =
            position < current
              ? "done"
              : position === current
                ? "current"
                : "upcoming";
          return (
            <li
              key={step}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 text-sm",
                state === "current" && "font-semibold text-ink",
                state === "done" && "text-success",
                state === "upcoming" && "text-ink-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  state === "current" &&
                    "bg-primary text-primary-contrast shadow-neu-sm",
                  state === "done" && "neu-sm text-success",
                  state === "upcoming" && "neu-inset-sm text-ink-subtle",
                )}
                aria-hidden="true"
              >
                {position}
              </span>
              {step}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
