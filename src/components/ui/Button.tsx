import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Plan P3-13 — one button hierarchy for the whole portal.
 * Do not write ad-hoc button classes in page files.
 *
 * Soft UI note: `primary` and `urgent` keep a solid, high-contrast fill and use
 * shadow only for extrusion. A shadow-only button on a matching background is
 * the classic neumorphism failure — the control becomes invisible to anyone
 * who does not perceive the soft edges. `secondary` is the shadow-only variant
 * and is therefore never the sole route through a task.
 *
 * `urgent` is reserved for the 1930 helpline and victim escalation paths.
 */
const button = cva(
  "inline-flex min-h-(--spacing-touch) items-center justify-center gap-2 " +
    "rounded-md px-5 py-2.5 font-semibold " +
    "transition-[box-shadow,background-color,transform] duration-200 " +
    "active:translate-y-px " +
    "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-contrast shadow-neu-sm hover:bg-primary-hover active:shadow-neu-inset-sm",
        secondary: "neu-interactive text-primary",
        tertiary:
          "text-primary hover:neu-sm active:shadow-neu-inset-sm rounded-md",
        urgent:
          "bg-urgent text-urgent-contrast shadow-neu-sm hover:bg-urgent-hover active:shadow-neu-inset-sm",
      },
      size: {
        md: "text-base",
        lg: "px-7 py-3.5 text-lg",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({
  className,
  variant,
  size,
  fullWidth,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      // Explicit type: an unspecified button inside a form submits it.
      type={type}
      className={cn(button({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}

export { button as buttonVariants };
