# ADR-0004: Qualified form storage and delivery

**Status:** Proposed — human decision required  
**Date:** 2026-08-29

## Context

Six non-medical qualified journeys need reliable acknowledgement and authorized follow-up. Recipients, workflows, retention, administration needs, and provider constraints are unknown.

## Options considered

1. Email-only delivery.
2. Minimal portal-owned PostgreSQL records plus transactional outbox/delivery.
3. Managed form/CRM service behind a provider-neutral port.

## Recommendation for review

First decide whether durable status, assignment, retry, audit, and reporting are MVP requirements. Prefer a minimal durable store plus outbox when any are required. Email-only must explicitly accept loss/retry/audit limitations. Generic forms must never receive home-care health data.

## Required evidence before acceptance

Per-form field allow-lists, purposes/lawful-basis review, recipients and roles, retention/deletion/export, anti-abuse, delivery failure recovery, acknowledgement semantics, FR/NL content, accessibility, DPA/subprocessors/EU residency, encryption/backups, and data migration/exit.

## Consequences and exit

Each domain owns a typed lead model; no catch-all form table or CMS medical form. Provider adapters remain replaceable, and export/delete procedures must be tested.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-04.
- `../DATA-FLOWS.md`.
- Master Contract sections 3, 4, and 12.
