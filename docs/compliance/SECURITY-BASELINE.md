# Security baseline — Phase 1

## Active controls

- restrictive default headers: CSP, frame denial, MIME sniffing denial, no-referrer, permissions restrictions, same-origin opener policy, and production HSTS;
- React server rendering/output encoding and no user input surface in the foundation page;
- exact dependency pins and lockfile, immutable GitHub Action commit pins, dependency audit, SBOM generation, CodeQL, secret scan, container scan configuration, and Dependabot;
- `robots` denial for the non-production foundation;
- no provider credentials, real patient data, analytics, cookies, uploads, forms, appointment contract, or admin surface.

## Explicit debt and limits

The Phase 1 CSP includes `'unsafe-inline'` for Next.js bootstrapping and styles. It still constrains origins, objects, framing, forms, and network connections, but it is not the target release CSP. A nonce/hash design must be tested against the approved rendering/deployment topology before release.

The repository secret scanner intentionally detects only high-confidence credential formats and is complemented by CI/repository controls; it is not proof that secrets cannot exist. The container base tag is version-pinned but not yet digest-pinned because the local Docker runtime is unavailable and no production image promotion design is approved.

Authentication, MFA, authorization, CSRF on mutations, abuse/rate limits, uploads, immutable audit, secret management, provider controls, vulnerability response operations, and ASVS evidence become applicable only when their corresponding surfaces/providers are approved. They are not claimed as implemented.

No statement in this document is a legal, clinical, GDPR, or production-security compliance claim.
