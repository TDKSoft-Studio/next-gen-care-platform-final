# ADR-0009: Secrets management

**Status:** Proposed — blocked by infrastructure discovery and human decision  
**Date:** 2026-08-29

## Context

The dedicated infrastructure repository is empty. The appointment quick-start uses manually populated Kubernetes Secrets, but this does not establish NEXT GEN CARE production conventions.

## Options considered

1. Manually populated Kubernetes Secrets.
2. SOPS/age-encrypted GitOps secrets.
3. External Secrets with an approved secret manager.
4. Sealed Secrets.

## Recommendation for review

Do not select before the actual cluster/hosting conventions and operational owner are known. Favor the option that provides least privilege, auditable access, rotation, revocation, GitOps compatibility, and recoverable key ownership without plaintext in Git/CI/images/client bundles.

## Required evidence before acceptance

Threat model, RBAC/service accounts, encryption/key custody, bootstrap, rotation/revocation drill, audit, break-glass, backup/recovery, environment isolation, secret scanning, incident runbook, cost, portability, and provider/cluster exit.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-09.
- `../DEPLOYMENT-CONTEXT.md`.
- Master Contract sections 12, 13, and 19.
