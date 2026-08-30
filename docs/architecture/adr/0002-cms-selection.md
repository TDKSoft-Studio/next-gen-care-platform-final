# ADR-0002: CMS selection and content governance

**Status:** Accepted  
**Date:** 2026-08-29

## Context

The MVP requires FR/NL structured content, preview, revision history, publication approval, rollback,
localized metadata/slugs, accessible media metadata, and role separation. The approved operating model
is self-hosting on the existing VPS platform; no managed CMS service is selected.

## Decision

Use Payload CMS 3.x, pinned to an exact version in the application lockfile and self-hosted with the
existing Next.js application. The administration panel is mounted at `/admin`; the public site and
CMS share the approved origin while retaining separate route groups, authorization, indexing rules,
and security behavior.

Use the PostgreSQL adapter with a dedicated CMS database. Use Payload localization for French and
Dutch content, with automatic fallback disabled at public read boundaries. Use versions, drafts,
scheduled publication, preview, and role-aware publication controls. Payload owns public content and
media metadata only; it never owns appointment requests, patient information, or medical form data.

The Human Engineering Authority approved Payload, PostgreSQL, self-hosting on the existing Kubernetes
VPS platform in Germany, and the `/admin` route on 29 August 2026. Infrastructure implementation and
deployment remain outside Phase 2.

## Options considered

1. Payload CMS: selected for its Next.js/TypeScript alignment, self-hosting model, versioning, preview,
   scheduled publication, access controls, localization, and exportable PostgreSQL data.
2. Directus: viable alternative with granular data permissions and content versioning, but it adds a
   separate application integration surface for this repository.
3. Strapi: viable, but mandatory workflow/history capabilities can introduce additional commercial
   licensing and operational decisions.
4. Git-based editing: rejected because the approved editors require a non-technical French interface,
   preview, scheduling, and media management.
5. Custom CMS: rejected for the MVP.

## Required implementation evidence

FR/NL model and slug demo, author/reviewer/publisher permissions, preview and rollback, publication
audit export, webhook/revalidation, media alt text, editor/accessibility review, backup/export/restore,
patching model, EU hosting evidence, and exit migration. These are delivery gates, not facts inferred
from product documentation.

## Consequences and exit

The selected CMS owns content/media metadata only, never patient or medical form data. Content must be
exportable in a documented format; adapter code isolates Payload APIs. The initial decision avoids a
managed CMS processor, but the VPS, backup, database, and future media processors still require
approved privacy and operational evidence.

The temporary CMS MFA exception is governed by ADR 0012 and Master Contract section 13.1. It is not a
general relaxation of privileged-access controls.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-02.
- `../DATA-FLOWS.md`.
- Master Contract sections 10 and 11.
