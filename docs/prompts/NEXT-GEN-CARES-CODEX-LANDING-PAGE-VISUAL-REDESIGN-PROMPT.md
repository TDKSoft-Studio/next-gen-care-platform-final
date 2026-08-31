# NEXT GEN CARES — CODEX LANDING PAGE VISUAL REDESIGN PROMPT

## CONTEXT

You are working on the NEXT GEN CARES web platform.

The legal entity is **Next Gen Cares SRL**. The approved public domain is
`nextgen-cares.org` and the approved public contact email is
`hello@nextgen-cares.org`.

The objective of this phase is to perform a **complete visual redesign of the public landing page**, based on the new NEXT GEN CARES brand identity and logo, while preserving the existing functional architecture, business logic, integrations, routes, APIs, CMS behavior, appointment scheduling, forms, internationalization, and backend/frontend contracts.

This is not a superficial color replacement task.

The expected result is a coherent, professional, maintainable, responsive, accessible and production-grade visual system suitable for a company combining:

- healthcare,
- home nursing,
- operating-room services,
- personal assistance,
- wellness,
- cultural and well-being travel,
- professional team building,
- Health-Tech.

The supplied NEXT GEN CARES logo is the primary visual reference and must become the source of truth for the new visual identity. The supplied Mindful Trip assets are the source of truth for the travel and wellness sub-brand.

---

# 1. PRIMARY OBJECTIVE

Redesign the NEXT GEN CARES public landing page so that the visual identity expresses a balanced combination of:

- healthcare,
- human care,
- trust,
- nature,
- well-being,
- premium service,
- professionalism,
- modern technology,
- Health-Tech.

The visual direction must avoid becoming:

- overly clinical,
- overly corporate,
- overly wellness/spa oriented,
- overly technological,
- generic SaaS,
- visually noisy,
- excessively decorative.

The intended positioning is:

> A modern, premium, human-centered healthcare and services brand combining care, well-being and technology.

---

# 2. BRAND SOURCE OF TRUTH

Use `public/brand/logo-mfr.39` as the supplied NEXT GEN CARES global-logo reference.

Use the following assets only for their explicitly assigned role:

| Asset                                                    | Assigned role                                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `public/brand/logo-mfr.39`                               | Global NEXT GEN CARES visual identity and logo reference.                                                        |
| `public/brand/logo-mindfultrip-historic-transparent.png` | Travel and well-being service sub-brand logo.                                                                    |
| `public/brand/mindfultrip-brand-board-v1.0.png`          | Visual reference board for the Mindful Trip sub-brand.                                                           |
| `public/brand/nextgen-care.jpeg`                         | Landing-page composition and visual-direction reference only. It is not a logo or a literal layout to reproduce. |

Do not use other files in `public/` as brand assets unless they are explicitly approved. Do not invent, approximate, redraw, or replace either logo.

Do not invent an unrelated palette.

Analyze the logo and identify:

- dominant green tones,
- secondary sage / natural greens,
- gold / ochre accents,
- neutral tones,
- background tones,
- visual hierarchy,
- relative importance of each color,
- relevant stylistic characteristics.

Extract the useful colors and normalize them into a formal design system.

Do not distribute arbitrary HEX, RGB, HSL or Tailwind colors throughout the source code.

---

## 2.1 APPROVED LANDING V2 DIRECTION

This direction has explicit Human Engineering Authority approval. It is a
visual and information-design brief, not authorization to change routes, forms,
business logic, legal claims, or backend contracts.

### Public identity and contact hierarchy

Use **NEXTGEN CARES SRL** as the public-facing wordmark. Present the following
approved public contact references in the contact strip, subject to responsive
and accessibility requirements:

- phone: `+32 460 96 02 94`;
- email: `hello@nextgen-cares.org`;
- domain: `nextgen-cares.org`.

### Visual character

The landing page must feel premium, editorial, and reassuring. It must balance
healthcare, well-being, and Health-Tech without becoming a hospital template,
a generic SaaS page, or a spa aesthetic.

Use warm ivory as the page base, deep green as the dominant functional color,
and gold as a restrained accent. The Mindful Trip blue and orange palette may
appear only in the endorsed travel and well-being sub-brand area.

The PDF references `public/brand/Next_Gen_Care_Landing01.pdf` and
`public/brand/Next_Gen_Care_Landing02.pdf` define the intended compositional
language: generous editorial whitespace, monumental serif display typography,
compact contact/navigation hierarchy, and clear green-and-gold dividers. They
are inspiration, not literal layouts to copy.

### Approved landing composition

Implement the following hierarchy after implementation approval:

1. A compact contact strip with the approved phone, email, and domain.
2. A localized primary header with the global logo, domain navigation, language
   selector, and prominent contact CTA.
3. A generous hero combining human photography with restrained brand forms.
   Its message must foreground the alliance of care, well-being, and
   Health-Tech.
4. Two hero CTAs: a primary action to discover the domains and a secondary
   action to the platform commitments. Replace the generic “Notre approche
   éditoriale” action with the commitments action.
5. Five rich editorial service sections, each combining a visual, explanatory
   content, a controlled service nuance, and a CTA to its existing domain route.
6. A visible Mindful Healing Trips sub-brand section, endorsed by NEXTGEN CARES
   SRL and using only its supplied logo and brand assets.
7. A concise trust/commitments section based only on approved existing content,
   followed by a contact-oriented closing CTA and footer.

Do not create a new form, route, contact workflow, clinical promise, price,
service availability statement, or qualification claim as part of this visual
work.

### Photography and illustration policy

Source external photos only after a Human Engineering Authority has approved
the exact asset list. Each accepted asset must have a recorded source URL,
author where available, license evidence, local filename, accessible alt text,
and intended placement before it is downloaded.

Use locally stored and framework-optimized images in production; do not render
external image URLs at runtime. Select imagery according to these rules:

- Home care: human accompaniment or professional care without depicting an
  identifiable person as ill, vulnerable, or in treatment.
- Operating room: professional preparation or teamwork, with no exposed
  patient or procedure.
- Well-being: non-medical movement, nature, or human connection.
- Travel: aspirational destination or group imagery, paired with the real
  Mindful Healing Trips sub-brand.
- Health-Tech: a credible professional/digital-health setting or a restrained
  technology detail, not generic neon technology art.

Do not imply medical endorsement, diagnosis, clinical outcome, or commercial
endorsement by a depicted person or organization.

---

# 3. DESIGN SYSTEM REQUIREMENT

Create or update a centralized design-token system.

Respect the architecture already present in the repository.

Prefer the existing project conventions where possible.

Possible mechanisms include:

- CSS custom properties,
- Tailwind theme extensions,
- semantic design tokens,
- reusable component variants,
- theme primitives.

At minimum, distinguish between:

## Primitive tokens

Examples:

- green scale,
- sage scale,
- gold / ochre scale,
- warm neutral scale,
- semantic state colors.

## Semantic tokens

Examples:

- `background-primary`
- `background-secondary`
- `surface`
- `surface-elevated`
- `text-primary`
- `text-secondary`
- `text-muted`
- `brand-primary`
- `brand-secondary`
- `accent`
- `border`
- `focus`
- `cta-primary`
- `cta-secondary`

The design system must allow future brand evolution without requiring color changes inside individual components.

---

# 4. COLOR DIRECTION

Use the following visual direction:

- green as the dominant brand family;
- gold / ochre as a premium accent;
- warm white / ivory as the primary page background;
- very light green for selected secondary surfaces;
- controlled use of darker green where necessary;
- gold must remain an accent, not the main interface color.

Avoid:

- excessive saturated gold,
- pastel text with poor contrast,
- large dark-green surfaces without justification,
- unrelated colors not derived from the brand system.

---

# 5. LANDING PAGE REDESIGN SCOPE

This phase authorizes a **complete visual redesign of the landing page**.

You may redesign:

- overall composition,
- section layout,
- spacing,
- hierarchy,
- Hero section,
- typography,
- CTA hierarchy,
- cards,
- backgrounds,
- section separators,
- icon treatment,
- service presentation,
- badges,
- borders,
- hover states,
- focus states,
- header,
- navigation,
- footer,
- imagery treatment,
- decorative patterns,
- responsive layouts,
- restrained micro-animations.

The functional meaning and business content must remain intact.

Do not remove important content arbitrarily.

---

# 6. HEADER AND NAVIGATION

Preferred direction:

- compact approved contact strip above the header;
- visually lightweight header on a warm ivory background;
- highly readable localized navigation;
- a clear “Nous contacter” CTA, without inventing its destination or workflow;
- equally polished mobile navigation.

Avoid excessive glassmorphism.

---

# 7. HERO SECTION

The Hero section may be fully reconsidered.

You are authorized to redesign:

- layout,
- text hierarchy,
- typography,
- supporting copy presentation,
- CTAs,
- imagery,
- decorative elements,
- badges,
- background treatment,
- spacing,
- responsive behavior.

The Hero must rapidly communicate:

1. trust,
2. healthcare,
3. human care,
4. professionalism,
5. modernity,
6. the alliance of care, well-being, and Health-Tech.

Use a human photographic direction and restrained brand forms. The two hero
actions must prioritize domain discovery and the platform commitments.

It must not look like a generic SaaS landing page.

It must not look like a generic hospital website.

---

# 8. FIVE BUSINESS SERVICES

The landing page must continue to represent the five business areas:

1. Home nursing care
2. Operating-room healthcare services
3. Personal assistance and well-being
4. Cultural / wellness travel and professional team building
5. Health-Tech

Each service must receive its own **secondary visual nuance**, while remaining clearly part of the NEXT GEN CARES design system.

Do not create five disconnected brand systems.

Create controlled service-level extensions of the master palette.

Suggested directions:

## Home nursing care

Calm, reassuring, warm and human.

## Operating-room healthcare services

Precise, professional, controlled, clinical but premium.

## Personal assistance and well-being

Organic, softer, warmer and comforting.

## Travel / wellness / team building

More experiential, lively and aspirational, while remaining elegant.

Use the supplied Mindful Trip logo and brand board for this visible, endorsed
sub-brand area only. Preserve clear NEXTGEN CARES SRL endorsement, controlled
logo sizing, responsive display, and accessible alternative text.

## Health-Tech

Remain inside the master NEXT GEN CARES visual identity, but allow subtle technological language such as:

- restrained gradients,
- structured grid patterns,
- data-line motifs,
- refined digital surfaces,
- subtle motion.

Do not introduce neon cyberpunk or unrelated technology visuals.

---

# 9. MINDFUL TRIP SUB-BRAND INTEGRATION

The Mindful Trip logo and brand board are supplied assets. Integrate them only in the travel and wellness section, without turning the entire public portal into a separate brand.

The architecture must allow:

- clear sub-brand placement,
- controlled logo sizing,
- master-brand endorsement,
- responsive display,
- accessible alternative text,
- visual consistency.

Do not invent or approximate the Mindful Trip logo. Use the supplied logo asset and the supplied brand board only as defined in Section 2.

---

# 10. TYPOGRAPHY

You may propose a new typography system.

Do not automatically preserve the existing fonts.

The typography should communicate:

- professionalism,
- warmth,
- trust,
- readability,
- premium healthcare,
- modernity.

Prefer:

- one highly legible interface/body font;
- optionally one more expressive display font for selected headings.

Avoid:

- overly decorative fonts,
- medical clichés,
- inaccessible type styles,
- unnecessary font dependencies.

Document:

- selected fonts,
- role of each font,
- fallback stack,
- typography scale.

---

# 11. LIGHT THEME ONLY

This phase targets a **light theme only**.

Do not implement a complete dark mode.

If the current architecture already has dark-mode support, do not break it, but do not spend this phase redesigning it.

---

# 12. ACCESSIBILITY

Target:

> WCAG 2.2 AA

Explicitly verify:

- text contrast,
- CTA contrast,
- link contrast,
- focus visibility,
- keyboard navigation,
- semantic HTML,
- heading hierarchy,
- accessible labels,
- touch target sizes,
- disabled states,
- interactive states,
- color independence,
- mobile readability.

Do not use pale gold or pale green for body text if contrast is insufficient.

Color must never be the only carrier of meaning.

---

# 13. MOTION

Use only restrained and purposeful animation.

Animations must be:

- subtle,
- premium,
- smooth,
- non-distracting,
- performance-conscious.

Respect:

```css
prefers-reduced-motion
```

Avoid unnecessary:

- parallax,
- large motion effects,
- heavy animation dependencies,
- decorative animations that reduce clarity.

---

# 14. RESPONSIVE REQUIREMENTS

The redesign is not considered complete until explicitly validated on:

- mobile,
- tablet,
- desktop.

Pay special attention to:

- header,
- navigation,
- Hero,
- service cards,
- CTA layouts,
- typography scaling,
- images,
- section spacing,
- footer,
- interactive elements.

Do not treat mobile as a secondary adaptation.

---

# 15. INTERNATIONALIZATION

The redesigned landing page must work immediately in:

- French,
- Dutch.

The structure must remain compatible with future:

- English,
- German.

Do not hard-code business copy into components if the project already uses an i18n system.

Do not break existing translation keys.

Test for variable label and text lengths.

---

# 16. STRICT FUNCTIONAL NON-REGRESSION BOUNDARY

This is a visual redesign phase.

Do NOT change, unless strictly required for safe rendering:

- routes,
- API contracts,
- backend services,
- business logic,
- CMS behavior,
- appointment scheduling logic,
- forms behavior,
- authentication,
- authorization,
- persistence,
- database models,
- domain models,
- frontend/backend contracts,
- i18n architecture,
- payment architecture,
- deployment architecture.

If an existing architecture issue blocks the redesign, report it explicitly instead of silently expanding the implementation scope.

---

# 17. ENGINEERING QUALITY

Respect all existing repository engineering conventions.

Prefer:

- reusable components,
- composition,
- semantic variants,
- centralized tokens,
- focused components,
- clean Tailwind usage,
- separation of layout and content,
- low duplication,
- clear responsive behavior.

Avoid:

- magic values,
- scattered raw colors,
- duplicated styling,
- inline styling without justification,
- unnecessary new libraries,
- parallel architecture patterns.

---

# 18. PERFORMANCE REQUIREMENTS

The redesign must not significantly degrade:

- Core Web Vitals,
- bundle size,
- initial render performance,
- hydration behavior,
- image loading,
- font loading.

Prefer:

- framework-native image optimization,
- responsive images,
- lazy-loading where appropriate,
- efficient font loading,
- CSS-native visual effects.

Do not introduce heavy dependencies without clear justification.

---

# 19. VALIDATION AND QUALITY GATES

Before implementation is declared complete, execute the repository-native validation workflow.

Use the existing Taskfile or canonical project task runner when present.

Validate, where available:

- environment/setup,
- dependencies,
- lint,
- typecheck,
- unit tests,
- integration tests,
- production build,
- Playwright tests,
- visual regression tests,
- responsive rendering.

Do not bypass existing repository workflows without documented justification.

If the repository contains a local workflow intended to reproduce CI, prefer it.

---

# 20. CODEX OPERATING MODE

## IMPORTANT

Do not start modifying code immediately.

The first action is a complete repository audit.

Inspect the repository and determine:

1. frontend framework and version;
2. CSS/Tailwind architecture;
3. shared UI components;
4. existing design-token system;
5. landing page entry points;
6. current Hero structure;
7. current header/navigation implementation;
8. current footer implementation;
9. logo asset handling;
10. i18n architecture;
11. testing architecture;
12. Taskfile / task-runner structure;
13. CI-equivalent local commands;
14. existing visual testing capabilities;
15. technical risks;
16. potential regression surfaces.

Use the repository as the source of truth.

Do not make assumptions when the code can be inspected.

---

# 21. REQUIRED PRE-IMPLEMENTATION REPORT

Before changing any source file, provide a structured audit report containing the following sections.

## A. Repository current state

Describe the relevant architecture and current landing-page implementation.

## B. Current visual architecture

Document:

- colors,
- typography,
- spacing,
- components,
- tokens,
- layout system,
- visual conventions.

## C. Branding conflicts

Identify where the current landing page conflicts with the new NEXT GEN CARES identity.

## D. Proposed normalized palette

Analyze the supplied logo and propose the brand design tokens.

For each important color, provide:

- semantic or primitive token name,
- HEX/HSL value,
- intended usage,
- accessibility considerations.

## E. Typography proposal

Provide the proposed typography system and explain why it fits the brand.

## F. Five-service color system

Describe the secondary visual nuance proposed for each of the five services.

## G. Component impact map

List the exact files, components or modules likely to change.

Do not modify them yet.

## H. Functional non-regression boundary

List the systems that will remain untouched.

## I. Accessibility strategy

Explain how WCAG 2.2 AA will be validated.

## J. Responsive strategy

Explain how mobile, tablet and desktop will be checked.

## K. Internationalization strategy

Explain how FR/NL will be validated and how EN/DE compatibility will be preserved.

## L. Test strategy

List the exact repository-native commands/tasks that should be executed after implementation.

## M. Technical risks

Identify any technical or architectural risks.

## N. Proposed implementation sequence

Break the implementation into small, auditable steps.

---

# 22. MANDATORY HUMAN APPROVAL GATE

After producing the audit and implementation proposal:

> STOP.

Do not modify source code.

Do not generate commits.

Do not apply changes.

Do not treat this prompt as implementation authorization.

Wait for explicit human approval.

---

# 23. IMPLEMENTATION AFTER APPROVAL

Only after explicit approval, implement the redesign in controlled steps.

Recommended order:

1. design tokens;
2. typography;
3. global visual primitives;
4. header/navigation;
5. Hero;
6. five-service system;
7. service cards;
8. future Mindful Trip integration point;
9. remaining landing sections;
10. footer;
11. responsive adaptations;
12. accessibility fixes;
13. restrained animations;
14. tests;
15. build verification;
16. regression validation.

Do not broaden the scope without explicit approval.

---

# 24. FINAL ENGINEERING REPORT

After implementation, provide a complete report containing:

## Executive summary

Explain what changed and why.

## Final brand system

Document:

- color tokens,
- semantic tokens,
- typography,
- service-specific nuances.

## Files changed

For each important file provide:

- path,
- purpose,
- modification,
- reason.

## Functional non-regression assessment

Confirm which functional areas remained untouched.

## Accessibility verification

Report WCAG-related validation results.

## Responsive verification

Report validation for:

- mobile,
- tablet,
- desktop.

## Internationalization verification

Report:

- FR,
- NL,
- EN/DE readiness.

## Tests executed

List exact commands and actual results.

Never state that a test passed unless it was executed.

## Remaining risks

List unresolved technical or UX issues.

## Visual debt

List any improvements intentionally deferred.

## Proposed next phase

Recommend the next logical phase.

Do not begin it automatically.

---

# 25. SOURCE CONTROL POLICY

Unless separately authorized:

- do not merge;
- do not tag;
- do not create a release;
- do not force push;
- do not rewrite history;
- do not perform destructive Git operations;
- do not commit automatically.

The current authorization is:

> Update this redesign prompt with explicitly supplied brand-asset roles, then audit and proposal only.

Implementation requires explicit human approval.

Source-control actions require separate explicit authorization.

---

# 26. CODEX BEHAVIOR REQUIREMENTS

When inspecting or modifying the repository:

- always use the actual repository state as evidence;
- do not fabricate file names or architecture;
- do not claim commands were executed if they were not;
- distinguish observed facts from recommendations;
- preserve existing conventions unless there is a strong engineering reason not to;
- document deviations;
- keep changes minimal outside the visual redesign scope;
- do not perform unrelated refactoring;
- do not “clean up” unrelated code during this phase;
- do not silently change functionality.

If you discover unrelated problems, report them separately.

---

# 27. DEFINITION OF DONE

The redesign is complete only when:

- `public/brand/logo-mfr.39` is properly integrated as the global logo;
- the new palette is centralized;
- raw brand colors are not scattered through the UI;
- the Hero has been intentionally redesigned;
- all five services are visually differentiated but remain coherent;
- the landing page feels like one brand;
- `public/brand/logo-mindfultrip-historic-transparent.png` is properly integrated for travel and well-being, with the supplied brand board applied only to that sub-brand;
- WCAG 2.2 AA requirements are addressed;
- FR and NL are validated;
- future EN/DE remain structurally supported;
- mobile, tablet and desktop are validated;
- repository-native quality gates pass;
- no unauthorized functional changes were introduced;
- the final engineering report is produced.

---

# 28. ENGINEERING PRINCIPLE

Treat the visual identity as a maintainable engineering system, not a set of CSS edits.

The result must be:

- coherent,
- reusable,
- accessible,
- responsive,
- maintainable,
- auditable,
- brand-consistent,
- compatible with future service pages,
- compatible with future sub-brands.

The landing page must look intentionally designed for NEXT GEN CARES and must not resemble a generic template.

Begin now with the repository audit and the pre-implementation report only.

Do not modify any source file before explicit human approval.
