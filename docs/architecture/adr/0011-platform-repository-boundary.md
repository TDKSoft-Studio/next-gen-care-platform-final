# ADR-0011: Platform repository boundary

**Status:** Accepted  
**Date:** 2026-08-29

## Context

Phase 0 observed that the platform directory contained the engineering contract and discovery artifacts but no functional Git metadata. The appointment API is an existing, separately owned repository, while the proposed infrastructure repository is separate and currently empty.

## Decision

Following explicit approval from the Human Engineering Authority on 2026-08-29:

- `next-gen-care-platform` is initialized as the application monorepo;
- application code, application packages, platform documentation, and application CI live here;
- `nurse-appointment-scheduling-api` remains separately owned and unchanged;
- infrastructure definitions remain outside this repository and may not be created until separately authorized.

## Consequences

The application now has an independent history and review boundary. Appointment and infrastructure changes cannot be bundled into platform pull requests. Cross-repository contract versions must later be explicit and reproducible.

## Rollback

No repository move is required to reverse a package-level choice. Reversing the repository boundary itself would be a consequential repository operation and therefore requires a new accepted ADR and explicit human authorization.

## Evidence

- Human Phase 1 approval conversation, 2026-08-29.
- Phase 0 repository inventory in `../../discovery/REPOSITORY_INVENTORY.md`.
- Target boundary proposal in `../MODULE-BOUNDARIES.md`.
