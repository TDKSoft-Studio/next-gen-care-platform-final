# Accessibility baseline — Phase 1

## Implemented foundation

- semantic header/main/section/aside structure and one page heading;
- keyboard-visible focus styles, a first-focus skip link, and 44px-equivalent language targets;
- current language conveyed with `aria-current`, not color alone;
- document `lang` synchronized with exact FR/NL catalog selection;
- reusable error-summary primitive linking messages to fields;
- reduced-motion and forced-colors adaptations;
- automated axe checks in jsdom and a real Chromium journey;
- keyboard E2E coverage for the skip link.

## Evidence boundaries

Automated tools detect only a subset of WCAG issues. Phase 1 does not contain a critical clinical/business journey or real form, so screen-reader journey validation, cognitive review, error prevention/recovery, zoom/reflow assessment, mobile assistive testing, and accessibility-expert acceptance remain mandatory before release.

FR/NL foundation copy is technical placeholder copy. It has not been accepted as medical, legal, safety, or public launch content and cannot be reused as evidence that release content is reviewed.
