"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Plan P1-6, P1-7, P2-9.
 *
 * The audited portal fails accessibility because inputs were hand-rolled with
 * placeholders standing in for labels. This component removes that possibility:
 * `label` is a required prop, and the control can only be rendered through the
 * render prop, which hands back the wiring it must use.
 *
 * Do not render a bare <input> anywhere in this codebase.
 */

export interface FieldRenderProps {
  /** Apply to the control. Ties it to the <label>. */
  id: string;
  /** Apply as aria-describedby. Ties hint and error text to the control. */
  "aria-describedby": string | undefined;
  /** Apply as aria-invalid. */
  "aria-invalid": boolean | undefined;
  /** Apply as aria-required. */
  "aria-required": boolean | undefined;
}

export interface FieldProps {
  /** Visible, persistent label. Never a placeholder. */
  label: string;
  /** Guidance shown before the user types, and kept visible after. */
  hint?: string;
  /** Validation message. Announced assertively when it appears. */
  error?: string;
  /**
   * Status message that is not an error — for example, "OTP sent to the number
   * ending 4321". Announced politely.
   */
  status?: string;
  required?: boolean;
  className?: string;
  children: (props: FieldRenderProps) => ReactNode;
}

export function Field({
  label,
  hint,
  error,
  status,
  required,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const statusId = `${id}-status`;

  const describedBy =
    [hint && hintId, status && statusId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium text-ink">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })}

      {/*
        Status and error regions are always mounted so screen readers announce
        changes. An element that appears for the first time may not be announced.
      */}
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={cn("text-sm text-ink-muted", !status && "sr-only")}
      >
        {status ?? ""}
      </p>
      <p
        id={errorId}
        role="alert"
        className={cn("text-sm font-medium text-danger", !error && "sr-only")}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

/**
 * Shared control styling. Exported so Select and Textarea stay consistent.
 *
 * Soft UI: inputs are debossed (inset shadow) — the well the user types into.
 * The invalid state adds a solid danger ring rather than only tinting the
 * shadow, because a shadow colour shift is not a reliable error signal.
 */
export const controlClassName =
  "min-h-(--spacing-touch) w-full rounded-md neu-inset px-4 py-2.5 " +
  "text-ink placeholder:text-ink-subtle " +
  "transition-shadow duration-200 " +
  "aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger " +
  "disabled:cursor-not-allowed disabled:text-ink-subtle disabled:shadow-neu-inset-sm";

/**
 * Convenience wrapper for the common case. Prefer this over Field + input.
 */
export type TextFieldProps = Omit<FieldProps, "children"> &
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "id" | "required" | "className"
  >;

export function TextField({
  label,
  hint,
  error,
  status,
  required,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      status={status}
      required={required}
      className={className}
    >
      {(field) => (
        <input {...field} {...inputProps} className={controlClassName} />
      )}
    </Field>
  );
}
