# National Cyber Crime Reporting Portal — Frontend Audit

**Reviewed:** 5 September 2026  
**Scope:** Public frontend only: desktop and mobile user journeys, navigation, content, visual hierarchy, responsiveness, and accessibility. No forms were submitted; backend logic, APIs, security, and data handling were not assessed.

## Executive summary

The portal has the necessary features, but its information architecture makes urgent actions compete with institutional content and secondary programmes. A distressed user has to interpret portal terminology before discovering the correct path.

The intended experience should be task-led:

```text
What do you need?
├─ I lost money / am a victim        → Report an incident · Call 1930
├─ I need to report harmful content  → Report anonymously / Report & track
├─ I want to check a person/site     → Check a suspect
├─ I already reported                → Track complaint
└─ I need help                       → FAQ · Contact my State/UT officer
```

## Pages reviewed

- Homepage: <https://cybercrime.gov.in/>
- Complaint entry: <https://cybercrime.gov.in/Webform/Index.aspx>
- Complaint introduction: <https://cybercrime.gov.in/Webform/Accept.aspx>
- Complaint tracking: <https://cybercrime.gov.in/Webform/chkackstatus.aspx>
- FAQ: <https://cybercrime.gov.in/Webform/FAQ.aspx>
- State/UT contacts: <https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx>
- Suspect identifier search: <https://cybercrime.gov.in/Webform/suspect_search_repository.aspx>
- Suspicious website/app search: <https://cybercrime.gov.in/Webform/suspect_search_websites.aspx>
- Report suspect: <https://cybercrime.gov.in/Webform/cyber_suspect.aspx>

## Prioritised findings

| Priority | Finding | User impact |
|---|---|---|
| P0 | JavaScript errors occur on core public pages. Repeated `$ is not defined`, `jQuery is not defined`, and video-rendering errors were observed. | Page enhancements may behave inconsistently; this needs stabilising before a broader redesign. |
| P0 | CAPTCHA workflows are inaccessible. Complaint tracking and suspect-search pages use image CAPTCHAs without an accessible alternative; CAPTCHA refresh controls are unlabeled. | Screen-reader users may be unable to complete important journeys. |
| P1 | Emergency/reporting paths are not obvious. The homepage carousel and campaign content take priority over reporting choices. | Users reporting financial fraud may take longer to reach the action and the 1930 helpline. |
| P1 | Navigation is organised by internal portal terminology rather than user intent. “Register a Complaint,” “Report & Check Suspect,” and “Cyber Volunteers” combine tasks of very different urgency. | Users must decode labels before choosing the right path. |
| P1 | Several key actions depend on `javascript:` postbacks or `#` links. | Navigation is fragile, less transparent, and has weaker progressive enhancement/accessibility. |
| P1 | Accessibility gaps are widespread. The homepage exposed 33 images without alt text; social-icon links have no accessible names; the mobile menu did not appear as a named accessible control. | Screen-reader and keyboard users lack equivalent access to navigation and meaning. |
| P1 | Complaint tracking has an unclear control sequence. “Get OTP” is visual but lacks an accessible name; OTP is disabled without explanatory status; CAPTCHA input has no persistent label. | Users may not understand the necessary next action; assistive-technology users cannot reliably operate the form. |
| P1 | The State/UT directory is not mobile-first. It is a 9-column, 38-row, 1,582px-wide table inside a 342px mobile content area. | Finding a local escalation contact requires difficult horizontal scrolling. |
| P2 | Contact and suspect-search inputs rely on placeholders instead of associated labels. | Purpose disappears after entry and is not reliably communicated to assistive technology. |
| P2 | The FAQ is a long text document with no search, task grouping, or concise answers. | Users must scan a large amount of content to resolve a simple question. |
| P2 | The report-suspect flow asks for State before helping users choose what they need to report. The “victim” guidance is plain text rather than a prominent route to report an incident. | The sequence does not match the user’s decision-making process. |
| P2 | Language support exposes only Hindi and English. | The national service is less usable for citizens who need another Indian language. |
| P3 | Visual and copy consistency need improvement: dated campaign imagery, multiple button styles, dense institutional copy, “Social Medias,” “State/UT’s,” inconsistent Cyber Crime/Cybercrime wording, and a legacy “Best viewed” footer. | Lowers confidence and makes the interface feel older and more difficult than necessary. |

## Detail by journey

### Homepage and reporting entry

- The main visual emphasis is a large rotating campaign banner rather than urgent reporting options.
- The three key choices are present but require scrolling on mobile after the banner.
- “Financial fraud” should visibly pair with **Call 1930 now** and an immediate reporting action.
- The reporting categories need short explanations and examples so that a user can choose confidently.
- Large campaign/political imagery does not help users decide where to report an incident.

### Complaint tracking

- The flow contains acknowledgement number, OTP, CAPTCHA, and submit controls but lacks a clear numbered sequence.
- The visual “Get OTP” control was not exposed with an accessible name in the accessibility tree.
- The OTP field starts disabled without a clear status message explaining why or what will enable it.
- CAPTCHA refresh is icon-only and unlabeled.
- Add concise help such as: “Enter your acknowledgement number, request an OTP, then enter the OTP and verification code.”

### Suspect checking and reporting

- “Report & Check Suspect” combines two separate goals: checking whether an identifier may be linked to fraud and reporting a suspicious identifier.
- Suspect search inputs and CAPTCHA inputs have placeholders but not persistent associated labels.
- CAPTCHA image and refresh control are inaccessible.
- The report-suspect page has many report types, but State selection precedes report-type selection.
- The “If you are a victim” escalation text should be a highly visible action linking to the appropriate reporting path and 1930.

### Help, FAQ, and contacts

- The FAQ should be searchable and grouped into tasks: reporting, evidence, OTP/account, tracking, withdrawal, and safety.
- State/UT contact details should become a State/UT-first lookup. On mobile, show a single contact card with tap-to-call and copy-email actions instead of a wide table.
- The contact-page search fields need visible labels that remain after typing.
- “Download PDF” can remain, but should not be the main way to access mobile contact information.

## Accessibility and semantic issues

- Add a visible-on-focus **Skip to main content** link and a `<main>` landmark to every page.
- Use one clear H1 per page and a sequential heading hierarchy. Do not expose hidden menu labels or descriptive paragraphs as headings.
- Give every meaningful image suitable alt text; use empty alt text only for genuinely decorative images.
- Give icon-only links/buttons accessible names, including social icons, CAPTCHA refresh, menu, carousel controls, and OTP controls.
- Use real URLs for navigation and real `<button>` elements for actions. Avoid `javascript:` URLs and placeholder `#` links.
- Provide persistent `<label>` elements, useful instructions, error text, and accessible validation/status messages for all fields.
- Ensure keyboard focus is clearly visible, menu state is announced, and controls work without pointer hover.
- Provide an accessible alternative to image-only CAPTCHA in consultation with the platform/security team.

## Recommended information architecture
