# ADR-0005: Administrator identity provider

**Status:** Proposed — human decision required  
**Date:** 2026-08-29

## Context

CMS and lead administration require strong authentication, MFA, least privilege, role lifecycle, publication separation, and audit. No existing corporate IdP was identified.

## Options considered

1. Reuse an approved organization IdP.
2. Managed identity provider with approved EU terms.
3. Self-hosted Keycloak-class IdP.
4. CMS-native accounts limited to CMS administration.

## Recommendation for review

Confirm whether an approved organization IdP exists before procurement. Do not build authentication. CMS-native identity alone is insufficient if lead administration or other privileged applications require shared lifecycle controls.

## Required evidence before acceptance

MFA and recovery, lifecycle/offboarding, group/role mapping, author/reviewer/publisher separation, session/revocation, break-glass, audit export, phishing resistance, admin accessibility/localization, DPA/residency/subprocessors, availability, incident support, cost, and export/exit.

## Links

- `../ARCHITECTURE-OPTIONS.md`, D-05.
- `../THREAT-MODEL.md`, T-03 and T-08.
- Master Contract sections 10 and 13.
