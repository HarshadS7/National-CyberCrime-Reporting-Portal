import type { ComponentType, SVGProps } from "react";
import { Link } from "@/i18n/routing";
import { IconArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Plan P1-3, P1-4 — the homepage task chooser.
 *
 * The whole card is a target, but the accessible name comes from the heading
 * link alone. The ::after overlay makes the card clickable without folding the
 * description into the link text.
 *
 * Soft UI: cards are extruded from the same base colour and lift on hover.
 * The urgent card additionally carries a solid accent bar — extrusion alone is
 * not enough to mark the emergency path.
 */
export interface TaskCardProps {
  href: string;
  title: string;
  description: string;
  action: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  urgent?: boolean;
}

export function TaskCard({
  href,
  title,
  description,
  action,
  icon: Icon,
  urgent,
}: TaskCardProps) {
  return (
    <li
      className={cn(
        "group neu-interactive relative flex flex-col gap-4 overflow-hidden rounded-lg p-7",
        "hover:-translate-y-1",
        "focus-within:outline focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-focus",
      )}
    >
      {urgent && (
        <span
          className="absolute inset-x-0 top-0 h-1.5 bg-urgent"
          aria-hidden="true"
        />
      )}

      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-lg",
          urgent
            ? "bg-urgent text-urgent-contrast shadow-neu-sm"
            : "neu-inset-sm text-primary",
        )}
      >
        <Icon className="size-7" />
      </span>

      <h3 className="text-lg font-semibold">
        <Link
          href={href}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {title}
        </Link>
      </h3>

      <p className="text-sm leading-relaxed text-ink-muted">{description}</p>

      <p
        className={cn(
          "mt-auto flex items-center gap-1.5 pt-1 text-sm font-semibold",
          urgent ? "text-urgent" : "text-primary",
        )}
        aria-hidden="true"
      >
        {action}
        <IconArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </p>
    </li>
  );
}
