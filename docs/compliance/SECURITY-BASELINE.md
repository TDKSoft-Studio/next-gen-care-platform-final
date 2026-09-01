# Security baseline — Phase 1–3

## Active controls

- restrictive default headers: CSP (incl. `worker-src 'self' blob:` for the admin editor), frame denial, MIME sniffing denial, no-referrer, permissions restrictions, same-origin opener policy, and production HSTS;
- React server rendering/output encoding; the localized public pages take no user input;
- exact dependency pins and lockfile, immutable GitHub Action commit pins, dependency audit (`pnpm audit --prod` clean), SBOM generation, CodeQL, secret scan, container scan configuration, Dependabot, and `pnpm` overrides pinning transitive advisories out (`dompurify`, `esbuild`);
- `robots` denial for the non-production foundation;
- CMS (Payload): role-based access on every collection, author/reviewer/publisher separation enforced in `Pages.beforeChange` (`approvedBy` ≠ `lastEditedBy`, `contentOwnerConfirmed`), account provisioning and the `roles` field restricted to `technical-admin`, draft preview gated by a constant-time secret comparison;
- appointment adapter: server-side only, HTTPS/localhost URL validation, request timeout, upstream response body neither logged nor forwarded, response restricted to the `202` / `PENDING_REVIEW` shape;
- readiness probe verifies the backing database when `DATABASE_URL` is configured.

## Surfaces now present (previously "none")

The Phase 1 baseline claimed no cookies, uploads, forms, appointment contract, or admin surface. Phases 2–3 added: the Payload admin at `/admin` with Postgres persistence and media uploads; a client-side cookie-consent banner (essential storage only); the home-care appointment **request** form (`PAY_ON_SITE`, human-review, never presented as a confirmed appointment); and a server-side adapter to the external Appointment API. The controls and debt below are scoped to those surfaces.

## Explicit debt and limits

The CSP still includes `'unsafe-inline'` for Next.js bootstrapping and styles. It constrains origins, objects, framing, forms, workers, and network connections, but it is not the target release CSP. A nonce/hash design must be tested against the approved rendering/deployment topology before release.

The `/api/home-care/*` mutation routes (`booking-holds`, `appointment-requests`) require an `Idempotency-Key` and validate their payloads, but perform **no `Origin`/`Sec-Fetch-Site` check and no abuse/rate limiting**. On a released surface that relays personal data to a third party these controls are required (threat-model T-16); they are not implemented.

The appointment request form collects personal data (name, e-mail, phone, address) with no in-context privacy notice or consent record at the point of collection. A GDPR notice and lawful-basis review are required before this surface is released.

The Payload draft-preview secret is passed as a URL query parameter (Payload's standard pattern). `Referrer-Policy: no-referrer` prevents referrer leakage and the landing redirect strips the secret from the browser-visible URL, but it can still appear in server access logs and browser history. A short-lived signed token should replace it before release.

The repository secret scanner intentionally detects only high-confidence credential formats and is complemented by CI/repository controls; it is not proof that secrets cannot exist. The container base tag is version-pinned but not yet digest-pinned because no production image promotion design is approved.

The public service/location endpoints of the Appointment API resolve "the first organization"; the portal must be deployed against a single-organization environment until explicit tenant binding exists (threat-model T-11).

MFA, login rate-limiting/lockout, CSRF on mutations, abuse/rate limits, immutable audit, external secret management/rotation, provider controls, vulnerability-response operations, and ASVS evidence are not claimed as implemented and become due as their surfaces/providers are approved.

No statement in this document is a legal, clinical, GDPR, or production-security compliance claim.
