# ADR-0008: Analytics and consent tooling

**Status:** Proposed — human decision required  
**Date:** 2026-08-29

## Context

No product analytics requirement, cookie inventory, consent model, or provider is approved. Operational telemetry remains necessary but is a separate purpose.

## Options considered

1. No non-essential analytics at launch.
2. Self-hosted privacy-oriented analytics after legal review.
3. Managed analytics plus consent-management tooling.

## Recommendation for review

Launch without non-essential analytics unless a concrete measurement need and lawful consent design are approved. Do not send booking, lead, appointment, capability-token, or health data to analytics.

## Required evidence before acceptance

Purpose/event allow-list, data/cookie inventory, legal/consent review, before-consent blocking, withdrawal, FR/NL accessible consent UX, DPA/residency/subprocessors/transfers, retention/IP handling, deletion/export, security, performance, cost, and disable/exit test.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-08.
- `../DATA-FLOWS.md`.
- Master Contract sections 12 and 17.
