# ADR-0003: Appointment API integration pattern

**Status:** Proposed — blocked by contract remediation and human decision  
**Date:** 2026-08-29

## Context

The appointment API is separately owned. Its current export and behavior conflict with required human-validation semantics and contain hold-expiry/OpenAPI defects documented in the inventory.

## Options considered

1. Direct browser-to-appointment API.
2. Server-only anti-corruption adapter within the initial web deployable.
3. Separate NestJS BFF/API deployable.

## Recommendation for review

Reject direct browser integration. After the external contract is corrected and accepted, start with a server-only adapter in the web deployable. Extract a dedicated BFF only when an independent scaling, ownership, release, availability, or isolation driver is evidenced.

## Required evidence before acceptance

Tracked/pinned OpenAPI, pending-review lifecycle, expired-hold fix/test, unique schemas, documented auth/status/errors/idempotency, organization binding, timeouts/retries, correlation/redaction, capability-token handling, consumer compatibility tests, privacy/DPIA acceptance, and dependency-failure E2E tests.

## Consequences and exit

The portal owns normalized commands/status language but never appointment/patient truth. Generated code stays behind the adapter. A provider/service replacement changes the adapter, not UI/domain modules.

## Links

- `../../discovery/APPOINTMENT_API_INVENTORY.md`.
- `../ARCHITECTURE-OPTIONS.md`, D-03.
- Master Contract sections 4.1 and 9.
