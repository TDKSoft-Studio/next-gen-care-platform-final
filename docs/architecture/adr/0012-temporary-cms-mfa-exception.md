# ADR-0012: Temporary CMS MFA exception

**Status:** Accepted by Human Engineering Authority  
**Date:** 2026-08-29

## Context

The security baseline requires MFA for privileged users. The Human Engineering Authority explicitly
directed that CMS MFA be deferred until application version `0.1.2`. Payload CMS will initially have
two named users: the technical administrator and the medical content approver.

Password-only administrator access materially increases account-takeover risk. This ADR records the
exception instead of allowing it to become an undocumented default.

## Decision

Permit password-only authentication only for the Payload CMS administration surface in versions
`0.1.0` and `0.1.1`, subject to Master Contract section 13.1.

Mandatory compensating controls are:

- no shared accounts and at most two named users;
- generated passwords of at least 20 characters;
- TLS-only access, secure same-site cookies, login-attempt lockout, and short sessions;
- `/admin` excluded from search indexing and locale redirects;
- security-event logging without content, credentials, or personal data;
- documented immediate revocation and password-rotation procedure;
- MFA implementation and validation as a blocking requirement for version `0.1.2`.

## Consequences

The Human Engineering Authority accepts the residual risk only for the stated versions. A production
readiness report must list the exception prominently. Version `0.1.2` is `NO-GO` while CMS MFA is not
implemented and evidenced. The exception does not cover GitHub, Kubernetes, database, backup, VPS, or
appointment-system identities.

## Alternatives rejected

- Immediate TOTP: recommended by engineering but explicitly deferred by human decision.
- IP allowlisting or VPN-only access: not selected by human decision for the initial CMS.
- Shared administrator credentials: prohibited.

## Rollback and exit

If suspicious authentication activity occurs, disable the affected account and the public `/admin`
route until credentials are rotated. Exit the exception by enabling and testing MFA for every CMS
administrator before `0.1.2` release approval.
