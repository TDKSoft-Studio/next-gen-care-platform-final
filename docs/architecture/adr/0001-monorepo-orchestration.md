# ADR-0001: Monorepo orchestration

**Status:** Accepted  
**Date:** 2026-08-29

## Context

The public platform repository contains no application code or package graph. The Master Contract proposes a pnpm monorepo and requires an orchestrator choice based on actual needs.

## Decision drivers

Reproducible CI/local parity, task caching, dependency graph enforcement, low bootstrap complexity, TypeScript/Next.js fit, portability, team competence, and safe release speed.

## Options considered

1. pnpm workspaces and repository scripts only.
2. pnpm plus Turborepo.
3. pnpm plus Nx.

## Decision

The Human Engineering Authority approved pnpm workspaces and repository scripts without an additional monorepo orchestrator for the Phase 1 foundation on 2026-08-29. Package scripts are the stable automation interface and Taskfile is the local/CI entry point.

## Consequences and exit

Scripts-only minimizes initial surface but may duplicate orchestration and provides no remote cache. Turborepo and Nx remain unapproved. Revisit this ADR only when measured CI duration, affected-task selection, or package graph governance demonstrates a material need; rollback remains removal of an approved orchestrator because package scripts stay authoritative.

## Acceptance evidence

- Human decision in the Phase 1 gate conversation on 2026-08-29.
- Initial graph: one deployable application plus config, localization, observability, and UI packages.
- Package-boundary fitness function implemented in `scripts/check-package-boundaries.mjs`.

Cold/warm CI timings do not yet exist. That missing evidence is a trigger for later review, not evidence that an orchestrator is currently required.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-01.
- Master Contract sections 7, 8, and 18.
