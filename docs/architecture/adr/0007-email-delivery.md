# ADR-0007: Transactional email delivery

**Status:** Proposed — human decision required  
**Date:** 2026-08-29

## Context

Qualified forms and status communications need approved sender domains, recipient routing, accessible FR/NL templates, delivery evidence, and privacy controls. Existing appointment email choices do not authorize portal reuse.

## Options considered

1. Existing approved organizational SMTP relay.
2. Managed transactional email API/SMTP provider behind a port.
3. Self-hosted MTA.

## Recommendation for review

Prefer an already approved organizational relay if it meets evidence requirements; otherwise evaluate managed providers. Avoid self-hosted deliverability operations unless a capable owning team is identified.

## Required evidence before acceptance

Sender/return-path domains, SPF/DKIM/DMARC ownership, DPA/EU/subprocessors, retention/log content, bounce/complaint/suppression handling, webhook authenticity/idempotency, outbox/retry/dead-letter, template accessibility/localization, recipient routing, rate/cost, incident support, and provider exit.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-07.
- Master Contract sections 5.2, 7, 12, and 16.
