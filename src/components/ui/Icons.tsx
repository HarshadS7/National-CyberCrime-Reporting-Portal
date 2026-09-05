import type { SVGProps } from "react";

/**
 * Inline icons. No icon-font or CDN dependency (Plan §6.5 keeps the critical
 * path small, and the CSP forbids external assets).
 *
 * Every icon is aria-hidden: icons here are decorative reinforcement for a
 * visible text label. An icon that is the ONLY content of a control must be
 * given an accessible name by that control (audit finding P1-6).
 */
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Financial fraud — money leaving an account. */
export function IconFraud(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 9.5h19" />
      <path d="M7 14.5h3.5" />
      <path d="M7 12h5" />
      <path d="M12 12c0 1.6-1.1 2.5-2.6 2.5L12 17" />
    </Base>
  );
}

/** Harmful content / safeguarding. */
export function IconShieldAlert(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 2.75 4.5 6v6c0 4.5 3.1 7.6 7.5 9.25 4.4-1.65 7.5-4.75 7.5-9.25V6Z" />
      <path d="M12 8.5v4" />
      <path d="M12 16h.01" />
    </Base>
  );
}

/** Check a suspect identifier. */
export function IconSearch(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path d="m15.25 15.25 4.5 4.5" />
    </Base>
  );
}

/** Track an existing complaint. */
export function IconTrack(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8 4.5h8a1.5 1.5 0 0 1 1.5 1.5v13.5a1 1 0 0 1-1.5.87L12 17.5l-4 2.87A1 1 0 0 1 6.5 19.5V6A1.5 1.5 0 0 1 8 4.5Z" />
      <path d="M9.5 9h5" />
      <path d="M9.5 12.5h3" />
    </Base>
  );
}

/** Help and guidance. */
export function IconHelp(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.6.2-.95.75-.95 1.35v.5" />
      <path d="M12 16.5h.01" />
    </Base>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
    </Base>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.5 12h15" />
      <path d="m13 5.5 6.5 6.5-6.5 6.5" />
    </Base>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Base>
  );
}

/** Government emblem placeholder — replace with the official asset. */
export function IconEmblem(props: IconProps) {
  return (
    <Base strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 3.25v17.5M3.25 12h17.5" />
      <path d="M5.8 5.8l12.4 12.4M18.2 5.8 5.8 18.2" />
    </Base>
  );
}
