# ADR-0002: CMS selection and content governance

**Status:** Accepted — human approval recorded  
**Date:** 2026-08-29
**Evidence refreshed:** 2026-08-30

## Decision

On 2026-08-30, the Human Engineering Authority explicitly approved Payload as
the CMS candidate for the MVP. This decision selects the product only; it does
not approve production hosting, deployment, an administrator identity provider,
media storage, email, secrets management, backup/disaster recovery, legal or
privacy acceptance, or any processing of health data in the CMS.

Payload may own public corporate-content and media metadata only. Appointment
and form data, including any health data, remain outside its boundary. The
conditions and open evidence listed in this ADR remain release gates.

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

## Comparative decision evidence — 2026-08-30

This comparison is a technical/procurement screening, not provider selection,
legal advice, an assurance report, or a statement of contract acceptance. Product
documentation can establish advertised or documented capabilities only. Plan
entitlements, price, current contractual terms, EU residency, subprocessors,
support, security assurances, export completeness, and recovery commitments
require human procurement/privacy/security review before acceptance.

### Candidates and evidence boundary

| Candidate                    | Model                                               | Evidence obtained                                                                                                                                     | Evidence not obtained                                                                                                                 |
| ---------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Payload 3.88.0               | Self-hosted, Next.js/PostgreSQL                     | Local operational spike: FR/NL, RBAC, drafts, preview, versions/restore, scheduled publish job, JSON-like data export through PostgreSQL dump/restore | Production hosting, MFA, media, TLS, backup/failure-domain, DPA, support, patching, accessibility expert review                       |
| Storyblok                    | Managed headless CMS, EU space candidate            | Official documentation for European spaces, configurable roles, review/publish workflow, scheduling, webhooks and backup/export facilities            | Tenant trial, exact plan, signed DPA, chosen region/asset flow, security configuration, export/restore exercise, accessibility review |
| Contentful EU data residency | Managed headless CMS, EU residency add-on candidate | Official documentation for EU data residency, workflow roles, localized preview, scheduling, webhooks and CLI export/import                           | Quote/plan, signed DPA, tenant trial, exact feature eligibility, complete recovery exercise, accessibility review                     |

### Requirement matrix

`Verified` means executed in the local spike. `Documented` means present in an
official supplier document but not tested in a NEXT GEN CARE tenant. `Unknown`
means no claim is made.

| Required dimension                       | Payload self-hosted                                                                                                             | Storyblok managed EU candidate                                                                                                                                                                | Contentful EU-residency candidate                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR/NL and independent locale publication | **Verified** in local PostgreSQL spike; localized status remains documented as experimental by Payload                          | **Documented**: roles/workflows and language-based workflow documentation; tenant configuration untested                                                                                      | **Documented**: locale-aware preview and API; tenant configuration untested                                                                                                 |
| Author/reviewer/publisher separation     | **Verified** with synthetic editor/approver/admin accounts                                                                      | **Documented**: custom roles and review workflow stages                                                                                                                                       | **Documented**: workflow-step and space role permissions                                                                                                                    |
| Draft, preview, versions, rollback       | **Verified** for draft invisibility, protected preview, version restore                                                         | **Documented** workflow and scheduling; rollback/version exercise pending                                                                                                                     | **Documented** preview and scheduling; rollback/version exercise pending                                                                                                    |
| Scheduling and revalidation              | **Verified** locally only after invoking the local jobs worker; recurring production worker/alert design absent                 | **Documented** single-story and release scheduling; webhooks documented                                                                                                                       | **Documented** scheduling and webhooks; plan/limits must be checked                                                                                                         |
| Media alt text and upload protection     | Field exists in spike only; scanning, object storage, durable backup and admin UX unverified                                    | **Unknown** until tenant/content-model trial                                                                                                                                                  | **Unknown** until tenant/content-model trial                                                                                                                                |
| Export and recovery                      | **Verified** PostgreSQL dump/restore of synthetic test data; not a production recovery exercise                                 | **Documented** backups/export, with stated exclusions including actual assets and story versions from backups                                                                                 | **Documented** CLI export/import; workflows, schedules and membership are explicitly not migrated by the documented CLI flow                                                |
| EU residency and processor terms         | Hosting-dependent; **Unknown** until infrastructure and DPA decisions                                                           | EU space is documented; DPA/subprocessor/transfer review still mandatory. Its DPA prohibits special-category personal data in the service, consistent with keeping health data out of the CMS | EU region is documented as Ireland primary/Frankfurt backup, but documentation states EU storage does not guarantee EU-only processing/access; Premium plan/add-on required |
| Administrator security and MFA           | CMS roles verified only; MFA/SSO/lifecycle/audit are **Unknown**                                                                | **Unknown** until plan and identity configuration are assessed                                                                                                                                | **Unknown** until plan and identity configuration are assessed                                                                                                              |
| Operations and patching                  | Highest local operating burden; upgrade, image, database, backup and incident ownership remain with NEXT GEN CARE               | Managed-service burden likely lower, but support/SLA/patch model are **Unknown** pending contract                                                                                             | Managed-service burden likely lower, but support/SLA/patch model are **Unknown** pending contract                                                                           |
| Cost and procurement                     | Infrastructure and staffing cost **Unknown**                                                                                    | Plan-dependent features are documented; price/procurement **Unknown**                                                                                                                         | EU residency is documented as a Premium-plan add-on; price/procurement **Unknown**                                                                                          |
| Portability / lock-in                    | Strongest preliminary fit: data is held in PostgreSQL and configuration is in application code; migration design still required | Moderate: documented story export and backup facilities, but feature/asset/version exclusions require a tested exit plan                                                                      | Moderate: CLI export exists, but documented non-migration of workflows/schedules/memberships/webhook credentials requires a tested exit plan                                |
| Accessibility                            | Public rendering is owned by the portal. CMS-admin accessibility remains **Unknown** beyond automated component checks          | **Unknown** pending editor trial with representative users                                                                                                                                    | **Unknown** pending editor trial with representative users                                                                                                                  |
| Time to safe release                     | Not demonstrated: platform/security work remains substantial                                                                    | Potentially favorable only after plan, DPA and operational evidence                                                                                                                           | Potentially favorable only after Premium/DPA/feature evidence and budget approval                                                                                           |

### Official sources consulted

- Payload: [drafts and publication controls](https://payloadcms.com/docs/versions/drafts), [localization](https://payloadcms.com/docs/configuration/localization), [versions/restore](https://payloadcms.com/docs/versions/overview), [access control](https://payloadcms.com/docs/access-control/overview), [import/export plugin](https://payloadcms.com/docs/plugins/import-export), and [preview](https://payloadcms.com/docs/admin/preview).
- Storyblok: [spaces and server locations](https://www.storyblok.com/docs/manuals/spaces), [roles](https://www.storyblok.com/docs/manuals/roles), [workflows](https://www.storyblok.com/docs/manuals/workflows), [webhooks](https://www.storyblok.com/docs/concepts/webhooks), [backups and exclusions](https://www.storyblok.com/docs/concepts/backups), and its [DPA](https://www.storyblok.com/legal/dpa).
- Contentful: [EU data residency](https://www.contentful.com/developers/docs/platform/eu-data-residency/), [workflow permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-roles-and-permissions/), [localized preview](https://www.contentful.com/developers/docs/tutorials/preview/content-preview/), [scheduled publishing](https://www.contentful.com/help/scheduled-publishing/), [webhooks](https://www.contentful.com/developers/docs/extensibility/webhooks/overview/), and [CLI import/export limitations](https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/).

### Human decision gate

No candidate is accepted. The next authorized activity is one time-boxed,
non-production managed-CMS proof of concept only if the Human Engineering
Authority separately approves a tenant, plan, DPA review path, and synthetic
content scope. It must test the rows marked `Documented` or `Unknown`, including
author/reviewer/publisher workflow, FR/NL localized slugs without fallback,
preview, rollback, webhook verification/revalidation, accessible media workflow,
export and restore, administrator accessibility, MFA/SSO feasibility, audit
export, and exact plan entitlement.

Payload may be selected only after the separate infrastructure, identity, media,
secrets, backup/recovery and production-browser validation gates are accepted.
Neither its local spike nor the supplier documentation above authorizes a
production deployment.
