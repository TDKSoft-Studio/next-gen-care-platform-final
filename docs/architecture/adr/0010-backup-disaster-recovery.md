# ADR-0010: Backup and disaster recovery

**Status:** Proposed — human RPO/RTO and provider decisions required  
**Date:** 2026-08-29

## Context

The platform has no approved data store or topology. The appointment quick-start demonstrates same-cluster logical dumps and a restore runbook but explicitly cannot provide point-in-time recovery from those dumps and has no recorded restore drill.

## Options considered

1. Same-cluster logical dumps as a non-production/minimum mechanism.
2. PostgreSQL operator plus pgBackRest/WAL-class tooling and off-failure-domain storage.
3. Managed PostgreSQL PITR with approved cross-failure-domain backup.

## Recommendation for review

Reject same-cluster dumps as the sole production strategy. Select an operator/tooling or managed path only after hosting, data classification, RPO/RTO, operating team, cost, and provider constraints are approved.

## Required evidence before acceptance

Per-store backup scope, encryption/key access, immutable/off-domain copies, schedules/retention, RPO/RTO, restore automation, quarterly drill and recorded output, corruption/ransomware scenario, migration compatibility, monitoring/alerts, provider exit, and deletion propagation.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-10.
- `../DEPLOYMENT-CONTEXT.md`.
- Master Contract sections 16 and 19.
