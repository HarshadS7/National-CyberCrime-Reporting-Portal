# National Cyber Crime Reporting Portal — Consolidated Frontend Plan

**Date:** 5 September 2026
**Source:** Audit of <https://cybercrime.gov.in/> (homepage, complaint entry, tracking, FAQ, State/UT contacts, suspect search, report suspect)
**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS
**Scope:** Greenfield public-facing frontend — information architecture, UI, accessibility, responsiveness. Backend APIs, complaint processing, and security infrastructure are out of scope except where the frontend contract is defined.

The audit below is of the *existing* portal. Its findings are the requirements list for the new build, not a patch list for the old one.

---

## 1. Problem statement

The portal has every feature a citizen needs, but the information architecture makes urgent actions compete with institutional content. A distressed user — someone who has just lost money — must decode portal terminology before finding the right path. Layered on top are legacy WebForms issues: `__doPostBack` navigation, `javascript:void(0)` links, image-only CAPTCHAs with no accessible alternative, and JavaScript errors on core pages.

The target experience is task-led, not org-chart-led:

```text
What do you need?
├─ I lost money / am a victim        → Report an incident · Call 1930
├─ I need to report harmful content  → Report anonymously / Report & track
├─ I want to check a person/site     → Check a suspect
├─ I already reported                → Track complaint
└─ I need help                       → FAQ · Contact my State/UT officer
```

---

## 2. Findings and fixes

### P0 — Blocking

| # | Finding | Fix |
|---|---|---|
| 1 | JavaScript errors on core public pages: repeated `$ is not defined`, `jQuery is not defined`, video-rendering errors. | Resolve script load order and dependency bundling before any redesign work lands. Add a console-error budget to CI. |
| 2 | Image-only CAPTCHA on tracking and suspect-search pages. Refresh control is icon-only and unlabeled. | Replace with an accessible challenge (audio alternative at minimum; prefer a privacy-respecting invisible challenge). Label the refresh button. Requires platform/security sign-off. |

### P1 — High

| # | Finding | Fix |
|---|---|---|
| 3 | Emergency reporting paths are buried below a rotating campaign carousel. | Above-the-fold task chooser. Carousel demoted or removed. **Call 1930** persistent and always visible. |
| 4 | Navigation uses internal terminology ("Register a Complaint", "Report & Check Suspect", "Cyber Volunteers"), mixing tasks of wildly different urgency. | Restructure to intent-based nav (see §3). |
| 5 | Key actions depend on `javascript:` postbacks or `#` links. | Real `href` URLs for navigation, real `<button>` for actions. Every page reachable and shareable by URL. |
| 6 | 33 homepage images without alt text; social icons have no accessible names; mobile menu is not a named accessible control. | Alt text on every meaningful image, `alt=""` only for decorative. Accessible names on all icon-only controls. |
| 7 | Complaint tracking has an unclear control sequence: "Get OTP" lacks an accessible name, OTP field is disabled with no explanation, CAPTCHA input has no persistent label. | Numbered 3-step flow with visible labels and live status messages (see §4.2). |
| 8 | State/UT directory is a 6-column, 36-row table roughly 1,582px wide inside a 342px mobile viewport. Emails are obfuscated as `[at]`/`[dot]`. No search. | State-first lookup returning one contact card. Tap-to-call, mailto, copy-email. Table only at desktop widths (see §4.3). |

### P2 — Medium

| # | Finding | Fix |
|---|---|---|
| 9 | Contact and suspect-search inputs rely on placeholders instead of associated labels. | Persistent `<label>` on every field; placeholders only for format hints. |
| 10 | FAQ is one long text document — no search, no grouping, no concise answers. | Searchable, task-grouped accordion: reporting, evidence, OTP/account, tracking, withdrawal, safety. |
| 11 | Report-suspect flow asks for State before asking what the user wants to report. Victim guidance is plain text. | Reorder: report type first, then State. Promote victim guidance to a prominent action linking to reporting + 1930. |
| 12 | Language support is Hindi and English only. | Build i18n infrastructure now; ship additional scheduled languages incrementally. |

### P3 — Polish

| # | Finding | Fix |
|---|---|---|
| 13 | Dated campaign imagery, multiple button styles, dense institutional copy, "Social Medias", "State/UT's", inconsistent Cyber Crime/Cybercrime, legacy "Best viewed in..." footer. | Design system with one button hierarchy. Copy pass for plain language and consistent terminology. Remove the legacy footer note. |

---

## 3. Target information architecture

```text
/                          Task chooser + 1930 + security alert banner
/report                    What happened? → category → anonymous | report & track
  /report/financial-fraud  1930 first, then form
  /report/women-children   Anonymous option surfaced first
  /report/other
/track                     3-step: ack number → OTP → verify
/check-suspect             Search identifier / website / app
/report-suspect            Report type first, then State
/help
  /help/faq                Searchable, grouped
  /help/contacts           State-first lookup
  /learn                   Advisories, safety tips, training
/about                     Institutional content, campaigns, volunteers
```

Everything institutional — campaigns, Cyber Volunteers, press, statistics — moves out of the primary nav into `/about`. Primary nav carries only citizen tasks.

---

## 4. Screen-level specifications

### 4.1 Homepage

- **Emergency strip** (sticky): `Lost money to fraud? Call 1930` — tel: link, visible at every breakpoint.
- **Task chooser**: five cards matching the decision tree above. Each card carries a one-line plain-language description and a concrete example ("someone withdrew money from my account", "a fake profile is using my photos").
- **Security alert**: the existing fake-mail warning, styled as a dismissible-but-persistent notice, not buried in body copy.
- Carousel removed. Campaign imagery moves to `/about`.
- Mobile: the task chooser must be fully visible without scrolling on a 360×640 viewport.

### 4.2 Complaint tracking

Explicit numbered sequence, one step visible at a time:

1. **Enter acknowledgement number** — persistent label, format hint, inline validation.
2. **Request OTP** — real `<button>` with accessible name. On success, an `aria-live` region announces "OTP sent to the mobile number ending 4321."
3. **Enter OTP and verification code** — OTP field enabled only after step 2, with visible helper text explaining why it is disabled beforehand. Accessible CAPTCHA with a labeled refresh control.

Errors announced via `role="alert"`, associated to fields with `aria-describedby`.

### 4.3 State/UT contacts

- **Mobile-first**: a single State/UT selector. Selecting one renders a contact card — officer name and rank, phone as a `tel:` link, email as a `mailto:` link with a copy button, grievance officer details.
- Drop the `[at]`/`[dot]` obfuscation in favour of real `mailto:` links; apply server-side scraping mitigation instead if obfuscation is a hard requirement.
- The full table renders only at ≥1024px, and even then inside an `overflow-x: auto` container with a caption and scope-annotated headers.
- Client-side filter by State/UT name.
- PDF download retained as a secondary convenience, never the primary mobile path.

### 4.4 Suspect check and report

- Split the two goals into distinct entry points: **check an identifier** and **report an identifier**.
- Persistent labels on all search and CAPTCHA inputs.
- Report-suspect flow: report type → details → State (State last, and prefilled from any available location signal).
- "If you are a victim" becomes a prominent action block linking to `/report` and 1930, not a paragraph.

### 4.5 FAQ

- Search box filtering across question and answer text.
- Grouped accordions by task. Each answer opens with a one-sentence direct answer before any detail.
- Every question is individually linkable by anchor.

---

## 5. Cross-cutting accessibility requirements

Target: **WCAG 2.1 AA**, aligned with GIGW (Guidelines for Indian Government Websites).

- Visible-on-focus **Skip to main content** link and a `<main>` landmark on every page.
- Exactly one `<h1>` per page; sequential heading hierarchy. Hidden menu labels and descriptive paragraphs must not be marked up as headings.
- Alt text on every meaningful image; `alt=""` only when genuinely decorative.
- Accessible names on all icon-only controls: social icons, CAPTCHA refresh, menu toggle, carousel controls, OTP controls.
- Real URLs for navigation, real `<button>` elements for actions. No `javascript:` hrefs, no placeholder `#` links.
- Persistent `<label>` on every field, plus instructions, error text, and `aria-live` status messages.
- Clearly visible keyboard focus. Menu expanded/collapsed state announced. No hover-only interactions.
- Accessible CAPTCHA alternative, agreed with the platform/security team.
- Colour contrast ≥ 4.5:1 for text; retain and fix the existing high-contrast toggle.
- Full journeys operable by keyboard alone and by screen reader (NVDA and TalkBack as the test baseline).

---

## 6. Technical approach

### 6.1 Stack decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js, App Router** | Server Components keep client JS off the critical path; Server Actions give forms that work without JS. |
| Language | **TypeScript, strict** | Complaint and contact data shapes are the core domain; type them once. |
| Styling | **Tailwind CSS v4** | Design tokens as CSS variables in `@theme`; no runtime CSS-in-JS cost. |
| Components | **Radix UI primitives** | Accordion, Select, Dialog, Tabs ship with correct ARIA and keyboard handling. Do not hand-roll these — the P1 findings are exactly what hand-rolling produces. |
| Forms | **Server Actions + `useActionState`**, Zod for schemas | Same validation schema runs on server and client. |
| i18n | **next-intl** with `/[locale]` segment routing | Locale in the URL, so pages stay shareable and cacheable. |
| Testing | Vitest, Playwright, `@axe-core/playwright` | Accessibility assertions run in CI, not as a manual afterthought. |

### 6.2 Progressive enhancement — non-negotiable

This is a public-safety service used on unreliable networks and low-end devices. Report, track, and check must complete with JavaScript disabled or failed.

- Every form is a real `<form action={serverAction}>`. It posts and works without hydration; JS only upgrades it with inline validation and live status.
- Every navigation is a real `<Link href>` resolving to a real URL. No `javascript:` hrefs, no `#` placeholders — the P1-5 finding is a hard lint rule.
- Client Components only where interaction genuinely requires them: FAQ search, State/UT filter, OTP timer, CAPTCHA refresh. Default to Server Components everywhere else.
- Multi-step flows (`/track`, `/report`) use URL-addressable steps, not client-only state, so a step is linkable and survives a refresh.

### 6.3 Project structure

```text
app/
  [locale]/
    layout.tsx                 Skip link, <main>, header, emergency 1930 strip
    page.tsx                   Task chooser
    report/                    page.tsx + [category]/
    track/                     step-addressable: ?step=ack|otp|verify
    check-suspect/
    report-suspect/
    help/faq/  help/contacts/  learn/
    about/
components/
  ui/                          Button, Field, Select, Alert — the design system
  patterns/                    TaskCard, ContactCard, StepIndicator, CaptchaField
lib/
  schemas/                     Zod schemas shared client/server
  api/                         Backend client, typed
messages/                      en.json, hi.json, …
```

### 6.4 Design system

**Visual language: neumorphism (soft UI).** Surfaces share one base colour and are separated by paired shadows — light from the top-left, shade to the bottom-right — rather than by borders or contrasting fills. Soft UI is normally an accessibility liability, so three rules are binding on this codebase:

1. Text contrast is never traded for softness — ink on base stays AA.
2. Safety-critical controls (1930, submit, destructive) keep a solid high-contrast fill. They are never shadow-only. `Button`'s shadow-only `secondary` variant is therefore never the sole route through a task.
3. `[data-contrast="high"]` flattens every soft shadow to a real border and pure-white surfaces. Verified: the whole page renders as flat bordered boxes.

- **Tokens** in `@theme`: colour, type scale, spacing, radii, and the neumorphic shadow set (`--shadow-neu`, `-inset`, `-sm`, `-lg`). High-contrast mode is a token override on a `data-contrast="high"` root attribute, not a separate stylesheet.
- **One button hierarchy**: primary / secondary / tertiary / destructive. A `Button` component with variants — no ad-hoc Tailwind button classes in pages.
- **One `Field` component** carrying label, hint, error, and `aria-describedby` wiring by construction. It must be *impossible* to render an unlabelled input through it. This structurally eliminates P1-6, P1-7, and P2-9.
- Tailwind is for layout and composition in pages; recurring visual decisions live in components, not repeated utility strings.

### 6.5 Performance

- Budget: **LCP < 2.5s on throttled 3G**, **< 150KB gzipped JS** on the critical path. Enforced in CI via Lighthouse.
- `next/image` for all imagery, with explicit dimensions. Campaign media is below-fold and lazy — it never competes with the task chooser for LCP.
- `next/font` with `display: swap` for Latin and Devanagari subsets.

---

## 7. Delivery sequence

| Phase | Work | Exit criteria |
|---|---|---|
| **0 — Foundations** | Next.js + TS + Tailwind scaffold. Tokens, `Button`, `Field`, `Alert`. Root layout with skip link, `<main>`, 1930 strip. next-intl wiring with `en` + `hi`. CI: typecheck, lint, axe, Lighthouse. | `Field` cannot render without a label. Axe and Lighthouse gates fail the build when breached. |
| **1 — Track journey** | `/track` with URL-addressable 3-step flow. Accessible CAPTCHA (P0-2). Server Action + Zod validation. | Completable by keyboard and screen reader, and with JS disabled. |
| **2 — Contacts** | `/help/contacts` — State-first lookup, mobile contact card, real `mailto:`/`tel:` links (P1-8). | No horizontal scroll at 360px; contact reachable in ≤3 taps. |
| **3 — Homepage + IA** | Task chooser, security alert, nav restructure (P1-3, P1-4). | Task chooser fully visible above the fold at 360×640. |
| **4 — Report + suspect** | `/report` category flows; split check/report suspect; report type before State (P1-7, P2-9, P2-11). | All fields labelled; report type precedes State; forms post without JS. |
| **5 — Help + polish** | Searchable FAQ, `/learn`, `/about`, copy pass, additional locales (P2-10, P2-12, P3-13). | FAQ searchable and anchor-linkable; one button hierarchy across all pages. |

Each phase ships independently. No phase depends on a later one. Phase 0 is the only prerequisite — the design system is what makes the accessibility findings unrepeatable rather than repeatedly fixed.

### Backend dependency

The frontend needs a typed contract for: complaint submission, tracking lookup + OTP issue/verify, suspect search, suspect report, and the State/UT directory. Phases 1–4 each block on their endpoint. Agree these contracts during Phase 0 and stub them with MSW so frontend work proceeds in parallel.

---

## 8. Acceptance criteria

A build is done when:

1. Zero JavaScript console errors and zero hydration mismatches on all public pages.
2. Automated accessibility scan (axe) passes with no critical or serious violations.
3. Manual screen-reader walkthrough of report, track, and check journeys completes without a blocker.
4. Every journey is completable using keyboard only.
5. No page scrolls horizontally at a 360px viewport width.
6. Core journeys degrade gracefully with JavaScript disabled.
7. LCP < 2.5s on a throttled 3G connection.
8. Every page is reachable by a real, shareable URL.
