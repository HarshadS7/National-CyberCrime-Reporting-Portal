# National Cyber Crime Reporting Portal — Frontend

Rebuild of the public frontend of <https://cybercrime.gov.in/>.
Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · next-intl.

See [FRONTEND_PLAN.md](./FRONTEND_PLAN.md) for the audit, information
architecture, screen specifications, and phased delivery plan. Code comments
reference plan findings by id (`P0-2`, `P1-8`, …).

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /en
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, including the a11y and no-`javascript:`-URL rules |
| `npm run test:e2e` | Playwright, desktop + 360px mobile |
| `npm run test:a11y` | Accessibility gate only (axe + layout assertions) |

## Non-negotiable conventions

These exist because they are the audit findings the rebuild is meant to fix.

1. **Never render a bare `<input>`.** Use `TextField`, or `Field` with its render
   prop. `label` is a required prop, so an unlabelled control cannot be built.
   Fixes findings P1-6, P1-7, P2-9 structurally rather than case by case.
2. **Never write a `javascript:` or `#` href.** Navigation uses `<Link>` with a
   real route; actions use `<button>`. Enforced by lint (P1-5).
3. **Forms must work without JavaScript.** Every form is
   `<form action={serverAction}>`; `useActionState` only adds pending state and
   inline errors. Multi-step flows keep state in the URL, never in client memory.
4. **Default to Server Components.** Add `"use client"` only for genuine
   interaction — FAQ search, State/UT filter, contrast toggle, CAPTCHA refresh.
5. **No ad-hoc colours or button classes.** Tokens live in
   `src/app/globals.css`; the button hierarchy lives in `Button`. The `urgent`
   variant is reserved for the 1930 helpline and victim escalation paths.
6. **Soft UI has hard limits.** The visual language is neumorphism — surfaces
   share one base colour and are separated by paired shadows (`neu`,
   `neu-inset`, `neu-interactive`). Because soft UI is normally an
   accessibility liability: text contrast is never softened; safety-critical
   controls (1930, submit, destructive) always keep a solid high-contrast fill
   and are never shadow-only; and `[data-contrast="high"]` flattens every soft
   shadow to a real border.
7. **Every image needs `alt`.** Empty `alt=""` only when genuinely decorative.

## Layout

```text
src/
  app/[locale]/          Routes. One <main>, one <h1> per page.
  components/ui/         Design system: Button, Field, Alert
  components/patterns/   TaskCard, ContactCard, StepIndicator, CaptchaField, …
  i18n/                  Locale routing and request config
  lib/schemas/           Zod schemas, shared by client and server
  lib/api/client.ts      Backend contract (stubbed)
  lib/data/              Checked-in reference data
messages/                en.json, hi.json — keys must stay in parity
e2e/                     Playwright, incl. the axe gate
```

## Known gaps

- **Backend is stubbed.** `src/lib/api/client.ts` throws `NotImplementedError`
  until `API_BASE_URL` is set and the bodies are implemented. Signatures are the
  agreed contract — replace implementations, not signatures. See plan §7.
- **CAPTCHA is a placeholder.** `CaptchaField` fixes the labelling and adds an
  audio alternative, but the image challenge itself must be replaced in Phase 1
  with something agreed with the platform and security teams (finding P0-2).
  Do not ship the image-only path.
- **State/UT officer details are empty.** `src/lib/data/state-contacts.ts` has
  all 36 States and UTs, but names, phones, and emails are deliberately blank —
  they must be transcribed from the official directory or served by the API.
  These are real public officials; do not invent values.
- **Hindi translations need review** by a fluent speaker before release.
- **Mobile navigation menu** is not built yet (Phase 3). The nav is currently a
  single horizontally-scrolling row on small screens; a wrapped nav consumed the
  whole 360×640 viewport.
- **The emblem is a placeholder** (`IconEmblem`). Replace with the official asset.

## Troubleshooting

**The page renders completely unstyled.** A `next start` process from an earlier
build is still holding the port and serving HTML that references a CSS file the
rebuild deleted. Confirm by comparing the hash in the page's
`<link rel="stylesheet">` against `ls .next/static/css/` — if they differ, kill
the stale listener and restart:

```bash
netstat -ano | grep ":3000" | grep LISTENING   # find the PID
taskkill //F //PID <pid>                       # Windows / Git Bash
npm run build && npm run start
```

**`PageNotFoundError: Cannot find module for page`** during `next build` is a
known Windows static-generation worker race. Re-run the build; it is not a code
error.
