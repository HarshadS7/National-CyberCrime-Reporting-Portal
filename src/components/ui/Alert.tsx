import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "info" | "warning" | "danger" | "success";

/**
 * Soft UI note: tone is carried by an accent bar and a tinted icon chip, not by
 * a low-contrast background wash alone — a wash on a matching base is not
 * reliably perceivable.
 */
const toneStyles: Record<Tone, { bar: string; chip: string }> = {
  info: { bar: "bg-info", chip: "bg-info-soft text-info" },
  warning: { bar: "bg-warning", chip: "bg-warning-soft text-warning" },
  danger: { bar: "bg-danger", chip: "bg-danger-soft text-danger" },
  success: { bar: "bg-success", chip: "bg-success-soft text-success" },
};

export interface AlertProps {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  /**
   * Announce this alert when it appears. Use for validation summaries and
   * action results — not for content present on first paint.
   */
  live?: boolean;
  className?: string;
}

export function Alert({
  tone = "info",
  title,
  children,
  live,
  className,
}: AlertProps) {
  const styles = toneStyles[tone];

  return (
    <div
      role={live ? "alert" : undefined}
      className={cn(
        "neu relative overflow-hidden rounded-lg p-6 pl-7",
        className,
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-1.5", styles.bar)}
        aria-hidden="true"
      />
      {/*
        A heading, not a styled div: the alert must appear in the document
        outline so screen-reader users can navigate to it.
      */}
      <h2 className="font-semibold text-ink">{title}</h2>
      {children && (
        <div className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          {children}
        </div>
      )}
    </div>
  );
}
