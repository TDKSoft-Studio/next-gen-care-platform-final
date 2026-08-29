# ADR-0002: CMS selection and content governance

**Status:** Proposed — human decision required  
**Date:** 2026-08-29

## Context

The MVP requires FR/NL structured content, preview, revision history, publication approval, rollback, localized metadata/slugs, accessible media metadata, and role separation. No CMS or hosting/provider is approved.

## Options considered

1. Mature self-hosted headless CMS candidates, screened through a real spike.
2. Mature managed headless CMS with approved EU contractual/operational posture.
3. Git-based editorial workflow.
4. Custom CMS, outside MVP unless separately authorized.

## Recommendation for review

Run one content-model/workflow spike across the strongest self-hosted and managed candidates. Do not select from feature lists alone. Exclude custom CMS from the MVP unless the spike proves no mature product meets mandatory needs.

## Required evidence before acceptance

FR/NL model and slug demo, author/reviewer/publisher permissions, preview and rollback, publication audit export, webhook/revalidation, media alt text, editor/accessibility review, backup/export/restore, patching model, DPA/subprocessors/EU residency, cost, and exit migration.

## Consequences and exit

The selected CMS owns content/media metadata only, never patient or medical form data. Content must be exportable in a documented format; adapter code isolates provider SDKs.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-02.
- `../DATA-FLOWS.md`.
- Master Contract sections 10 and 11.
