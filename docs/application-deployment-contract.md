# Application Deployment Contract — NEXT GEN CARE platform

This is the **authoritative, normalized application deployment contract** for the
`next-gen-care-platform` repository. The infrastructure repository
(`next-gen-care-infra`) consumes this file and translates it into the target
environment (Helm / GitOps / Argo CD). Infrastructure **may not invent** any
runtime value that is not stated here.

The root file [`../DEPLOYMENT_CONTRACT.md`](../DEPLOYMENT_CONTRACT.md) is a
pointer to this document.

## How to consume this contract

1. Read this file completely, then
   [`contracts/application-profile.example.yaml`](contracts/application-profile.example.yaml),
   then the repository instructions (`AGENTS.md` / `CLAUDE.md`) and
   `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`.
2. For every field: use the stated value, **or** honour the
   `UNKNOWN — REQUIRES DECISION` / `UNKNOWN — REQUIRES MEASUREMENT` marker and
   the named decider. Do not fill a marker with an assumption.
3. If this contract is missing, incomplete, ambiguous, obsolete, or
   contradictory for the task at hand, **stop** and request that this repository
   update the contract (per `docs/knowledge-base/README.md` → _Deployment
   handoff rule_).
4. Section 24 lists the open decisions and contradictions that currently block a
   production deployment. Section 23 lists how to validate the contract.

Every factual claim below is traceable to repository evidence at commit level
(file paths and line numbers are cited). Claims that cannot be evidenced from
this repository are marked as unknown, not guessed.

## 1. Contract metadata

| Field                           | Value                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Application                     | NEXT GEN CARE platform (public portal)                                                                                                |
| Application type                | Public Next.js web application with an embedded Payload CMS and a server-side home-care appointment facade                            |
| Contract version                | 1.1                                                                                                                                   |
| Application version             | `0.1.0` (`package.json`, `apps/web/package.json`)                                                                                     |
| Application versioning strategy | Semantic version in `package.json`, correlated with git history/tags; promoted runtime artifacts are pinned by immutable image digest |
| Repository                      | `next-gen-care-platform` (application monorepo, ADR-0011)                                                                             |
| Deployment controller           | `next-gen-care-infra` (separate repository; see `docs/architecture/DEPLOYMENT-CONTEXT.md`)                                            |
| Owner / authority               | Repository owner / Human Engineering Authority                                                                                        |
| Last updated                    | 2026-09-02                                                                                                                            |
| Status                          | ACTIVE — **not yet production-ready**; see Section 24                                                                                 |

## 2. Application runtime

Evidence: `Dockerfile`, `package.json`, `apps/web/package.json`, `.node-version`,
`.nvmrc`, `apps/web/next.config.ts`.

- Runtime: Node.js `24.20.0` (`.node-version`, `.nvmrc`, `package.json` `engines.node`).
- Package manager: pnpm `11.24.0` via Corepack (`package.json` `packageManager`).
- Framework: Next.js `16.3.3`, App Router, `output: "standalone"`
  (`apps/web/next.config.ts:11`).
- CMS: Payload `3.88.0` with `@payloadcms/db-postgres` `3.88.0`
  (`apps/web/package.json`), embedded in the same Next.js process
  (`withPayload(nextConfig)`, `apps/web/next.config.ts:30`).
- React `19.2.8`; image processing via `sharp` `0.35.4`.
- Build/runtime base image: `node:24.20.0-bookworm-slim` (`Dockerfile:2`, `:18`).
- Observed validation platform: Linux x86_64 / WSL2
  (`docs/reports/LOCAL-DEPLOYMENT-VALIDATION-REPORT-2026-09-01.md`).
- The runtime image runs as a dedicated non-root user (`Dockerfile:24`, `:36`).
- The runtime image only ever executes `node apps/web/server.js`; `npm`, `npx`,
  `corepack`, `pnpm`, `yarn` and the esbuild platform binary are deleted from
  the final stage (`Dockerfile:29-30`, `:35`).

| Item                              | Value                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Additional CPU architectures      | `UNKNOWN — REQUIRES DECISION` — only `linux/x86_64` observed; decider: infra + Human Engineering Authority |
| OS family beyond Debian slim Node | `UNKNOWN — REQUIRES DECISION` — decider: infra                                                             |

## 3. Container image

Evidence: `Dockerfile`, `.github/workflows/ci.yml`, `Taskfile.yml`.

- Image source: the repository root `Dockerfile` (multi-stage: `dependencies` →
  `builder` (`pnpm build`) → `runtime`).
- Local/CI build names observed:
  - CI container job: `next-gen-care-platform:ci` (`.github/workflows/ci.yml:100`).
  - Local task: `next-gen-care-platform:phase-1` (`Taskfile.yml:111`).
- **No image is published to any registry by this repository.** The CI
  `container` job builds `next-gen-care-platform:ci` on the runner, scans it with
  Trivy, and discards it; `.github/workflows/ci.yml` declares
  `permissions: contents: read` only (no `packages: write`), and there is no
  `docker push` / registry reference anywhere in the repository. See
  _Contradiction #1_ in Section 24.
- Image repository / registry: `UNKNOWN — REQUIRES DECISION` — decider: repo/org
  admin + Human Engineering Authority. A publish/release workflow (registry,
  `packages: write`, build provenance / attestation) does not exist yet.
- Tag / digest strategy (target, per `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
  §19 and `docs/knowledge-base/environment-matrix.md`):
  - production and staging deploy **by immutable digest**, never by mutable tag;
  - `latest` must not be a release-promotion reference;
  - `release.sourceRevision` (the published commit or tag) must be recorded
    alongside the digest for provenance.
- Supported build architecture: `linux/x86_64` only (observed). Others:
  `UNKNOWN — REQUIRES DECISION`.

## 4. Startup contract

Evidence: `Dockerfile`, `scripts/check-production-http.mjs`,
`apps/web/next.config.ts`.

| Item                       | Value                                                                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point / command      | `node apps/web/server.js` (`Dockerfile:38`, `CMD ["node", "apps/web/server.js"]`)                                                                                                             |
| Working directory          | `/app` (`Dockerfile:23`)                                                                                                                                                                      |
| Standalone server location | `apps/web/.next/standalone/apps/web/server.js` inside the image (`outputFileTracingRoot`, `apps/web/next.config.ts:12`; `scripts/check-production-http.mjs:7`)                                |
| Baked runtime env          | `HOSTNAME=0.0.0.0`, `NODE_ENV=production`, `PORT=3000`, `NEXT_TELEMETRY_DISABLED=1` (`Dockerfile:19-22`)                                                                                      |
| Bind requirement           | must be able to bind TCP `3000` on `0.0.0.0`                                                                                                                                                  |
| Startup preconditions      | `.next/standalone` and `.next/static` already present in the image (copied at build, `Dockerfile:31-32`)                                                                                      |
| Approximate startup time   | `UNKNOWN — REQUIRES MEASUREMENT` — decider: infra (container run). The local HTTP gate allows up to 20 s to first successful `/health/ready` (`scripts/check-production-http.mjs:31`).        |
| Startup failure conditions | missing standalone output; inability to bind `3000`; unhandled error on a health route; `DATABASE_URL` set but the database unreachable only degrades readiness, it does not stop the process |

## 5. Network contract

Evidence: `Dockerfile:37`, `apps/web/src/app/**`, `apps/web/payload.config.ts`,
`docs/reports/LOCAL-DEPLOYMENT-VALIDATION-REPORT-2026-09-01.md`.

- Listen port: `3000` (`EXPOSE 3000`, `ENV PORT=3000`).
- Protocol: HTTP (plaintext). TLS is terminated by infrastructure, not the app.
- Bind interface: `0.0.0.0` (`ENV HOSTNAME=0.0.0.0`).
- No `HEALTHCHECK` instruction in the `Dockerfile`; probes are HTTP (Section 7).
- No WebSocket contract observed. No middleware file exists
  (`apps/web/src/middleware.ts` absent), so no proxy path needs special-casing
  for locale rewrites.

Observed HTTP surface (from the production build route list,
`docs/reports/LOCAL-DEPLOYMENT-VALIDATION-REPORT-2026-09-01.md:103-114`, and the
route tree under `apps/web/src/app/`):

| Path                                                                                                                                                           | Purpose                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/`                                                                                                                                                            | locale negotiation — HTTP `307` to `/fr` or `/nl` (`scripts/check-production-http.mjs:47-55`) |
| `/fr`, `/nl`                                                                                                                                                   | localized public portal home                                                                  |
| `/fr/home-care`, `/fr/operating-room`, `/fr/well-being`, `/fr/travel-team-building`, `/fr/health-tech`, `/fr/legal`, `/fr/content/*` (and `/nl/*` equivalents) | five domain presentations, legal pages, CMS content pages                                     |
| `/admin`                                                                                                                                                       | Payload CMS admin UI (`apps/web/payload.config.ts:50`)                                        |
| `/api/*`                                                                                                                                                       | Payload CMS API (`apps/web/payload.config.ts:51`)                                             |
| `/api/home-care/catalog`, `/api/home-care/availability`, `/api/home-care/booking-holds`, `/api/home-care/appointment-requests`                                 | server-side appointment facade (Section 10)                                                   |
| `/api/preview`                                                                                                                                                 | CMS draft preview entry (`PREVIEW_SECRET`; returns `404` when the secret is unset)            |
| `/health/live`, `/health/ready`                                                                                                                                | liveness / readiness (Section 7) — **not** locale-prefixed                                    |

The actual public route slugs are English-style (`/fr/home-care`), not the
French slugs sketched in the Master Contract (`/fr/soins-a-domicile`). The
observed slugs are authoritative for routing.

## 6. Health contract

Evidence: `apps/web/src/app/health/live/route.ts`,
`apps/web/src/app/health/ready/route.ts`, `scripts/check-production-http.mjs`
(the canonical `pnpm exec task test:http`, part of `pnpm exec task ci`).

Both endpoints **exist in application code** and are exercised by the canonical
local/CI HTTP gate. See _Contradiction #3_ in Section 24.

### Liveness

| Item          | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| Method / path | `GET /health/live`                                              |
| Success       | HTTP `200`                                                      |
| Body          | `{"status":"ok"}`                                               |
| Headers       | `Cache-Control: no-store`                                       |
| Semantics     | process is up and the HTTP server responds; no dependency check |
| Failure       | route unavailable, process down, unhandled error on the route   |

### Readiness

| Item             | Value                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method / path    | `GET /health/ready`                                                                                                                                             |
| Success          | HTTP `200` with `status: "ok"` when the app is up **and** the database is `ready` or `not-configured`                                                           |
| Degraded         | HTTP `503` with `status: "degraded"` when `DATABASE_URL` is set but the database is unreachable                                                                 |
| Body shape       | `{ "checks": { "application": "ready", "database": "ready" \| "not-configured" \| "unreachable" }, "status": "ok" \| "degraded" }`                              |
| Headers          | `Cache-Control: no-store`                                                                                                                                       |
| Dependency probe | short-lived PostgreSQL connection, `connectionTimeoutMillis: 2000` (`apps/web/src/app/health/ready/route.ts:17`); skipped entirely when `DATABASE_URL` is unset |
| Runtime          | `runtime = "nodejs"`, `dynamic = "force-dynamic"`                                                                                                               |

### Startup probe

No dedicated startup endpoint. Startup readiness is inferred from container
start plus the first `200` on `/health/ready`.

### Probe guidance for infrastructure

- Liveness probe → `GET /health/live`; a non-200 or timeout should restart the pod.
- Readiness probe → `GET /health/ready`; treat `503` as "remove from rotation",
  not "restart". In a DB-less deployment (`DATABASE_URL` unset) readiness is
  always `200`/`ok` with `database: "not-configured"`.
- Probe timing (initial delay, period, failure threshold):
  `UNKNOWN — REQUIRES DECISION` — decider: infra, informed by the measured
  startup time (Section 4).

## 7. Environment variables

Evidence: `apps/web/.env.example`, `apps/web/next.config.ts`,
`apps/web/src/appointment/appointment-client.ts`,
`apps/web/src/app/api/preview/route.ts`, `apps/web/payload.config.ts`,
`apps/web/src/security/headers.ts`.

| Variable                  | Prod required?                           | Secret | Default (image) | Purpose / behaviour                                                                                                                                                                                                                                                                                                                |
| ------------------------- | ---------------------------------------- | ------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`            | Conditional — required for CMS/admin     | YES    | none            | PostgreSQL connection string for Payload. The process boots without it; CMS/admin is then unusable and readiness reports `database: "not-configured"`.                                                                                                                                                                             |
| `PAYLOAD_SECRET`          | Required when the CMS/admin is enabled   | YES    | none            | Payload signing secret (`apps/web/payload.config.ts:53`). Without it the admin/CMS runtime is not usable.                                                                                                                                                                                                                          |
| `PREVIEW_SECRET`          | `UNKNOWN — REQUIRES DECISION`            | YES    | none            | Guards `/api/preview`. If unset, `/api/preview` returns `404` for everyone (fail-closed). Required **only if** CMS content preview is a capability of that environment. See _Contradiction #2_.                                                                                                                                    |
| `NEXT_PUBLIC_SERVER_URL`  | Required only if preview links are used  | NO     | none            | Base URL Payload uses to build preview links. Local dev uses `http://localhost:3000`.                                                                                                                                                                                                                                              |
| `NEXT_PUBLIC_SITE_URL`    | Required when public indexing is enabled | NO     | empty           | Canonical public HTTPS site URL. Used for canonical URLs / sitemap emission only when indexing is enabled.                                                                                                                                                                                                                         |
| `PUBLIC_SEO_ENABLED`      | NO                                       | NO     | `false`         | Feature flag. Public indexing is emitted only when this is `true` **and** `NEXT_PUBLIC_SITE_URL` is a valid HTTPS URL (fail-closed otherwise).                                                                                                                                                                                     |
| `APPOINTMENT_API_URL`     | Required for home-care features          | NO     | none            | Server-only base URL of the existing appointment API. The adapter accepts the value **only if** its scheme is `https:` **or** its hostname is exactly `localhost` (`apps/web/src/appointment/appointment-client.ts:37`); any other value is treated as "not configured" and home-care routes return `503`. See _Contradiction #5_. |
| `NODE_ENV`                | NO (baked)                               | NO     | `production`    | Standard runtime mode; also switches on HSTS + `upgrade-insecure-requests` (`apps/web/src/security/headers.ts:23`, `:37`).                                                                                                                                                                                                         |
| `HOSTNAME`                | NO (baked)                               | NO     | `0.0.0.0`       | Bind address.                                                                                                                                                                                                                                                                                                                      |
| `PORT`                    | NO (baked)                               | NO     | `3000`          | Listen port.                                                                                                                                                                                                                                                                                                                       |
| `NEXT_TELEMETRY_DISABLED` | NO (baked)                               | NO     | `1`             | Disables Next.js telemetry.                                                                                                                                                                                                                                                                                                        |

Per-environment values for dev / staging / production are
`UNKNOWN — REQUIRES DECISION` except the local defaults shown in
`apps/web/.env.example`. Decider: Human Engineering Authority (site URL, SEO
flag, preview) + infra (wiring). No secret values are committed.

## 8. Secrets contract

| Logical secret   | Key(s)                              | Prod required?                | Behaviour if absent                                                  | Rotation    |
| ---------------- | ----------------------------------- | ----------------------------- | -------------------------------------------------------------------- | ----------- |
| `DATABASE_URL`   | connection string (may embed creds) | Conditional (CMS/admin)       | CMS/database-backed features unavailable; readiness `not-configured` | Recommended |
| `PAYLOAD_SECRET` | opaque string                       | Yes when CMS/admin enabled    | admin/CMS runtime unusable                                           | Recommended |
| `PREVIEW_SECRET` | opaque string                       | `UNKNOWN — REQUIRES DECISION` | `/api/preview` returns `404` for all callers                         | Recommended |

- Target Kubernetes Secret name assumed by infra:
  `next-gen-care-platform-runtime` — **not asserted by this repository**;
  infra owns the Secret name/shape. This contract only fixes the logical names
  and keys above.
- No other secret names are evidenced in this repository.
- Secrets must be injected as environment variables; none may be baked into the
  image or committed to Git (`NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md` §12).

## 9. External dependencies

| Dependency               | Required for                                                                    | Protocol        | Endpoint                           | Startup dependency                              | Failure impact                                                                   |
| ------------------------ | ------------------------------------------------------------------------------- | --------------- | ---------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| PostgreSQL               | CMS/admin content, versioned content state, media metadata                      | PostgreSQL wire | `DATABASE_URL` (default port 5432) | Only when `DATABASE_URL` is set                 | admin/CMS unavailable; readiness `503`/`degraded` if configured-but-unreachable  |
| Existing appointment API | `/api/home-care/*` (catalog, availability, booking holds, appointment requests) | HTTP(S)         | `APPOINTMENT_API_URL`              | No for public pages; yes for home-care features | home-care routes return `503`/`502` with a `{status,code,detail}` body; no crash |

Upstream calls made by the facade (server-side only; the browser never calls the
appointment API directly):

- `GET {APPOINTMENT_API_URL}/api/v1/services` and `/api/v1/locations` — catalog
  (`apps/web/src/app/api/home-care/catalog/route.ts`), 8 s timeout each.
- `GET {APPOINTMENT_API_URL}/api/v1/availability` — availability
  (`apps/web/src/app/api/home-care/availability/route.ts`), 8 s timeout.
- hold creation — `apps/web/src/app/api/home-care/booking-holds/route.ts`.
- `POST {APPOINTMENT_API_URL}/api/v1/appointment-requests` — expects `202` and a
  `{ requestId, status: "PENDING_REVIEW", reviewExpiresAt }` body; 8 s timeout;
  sends an `Idempotency-Key` header
  (`apps/web/src/appointment/appointment-client.ts:45-89`).

Not selected in this repository (each `UNKNOWN — REQUIRES DECISION`, decider:
Human Engineering Authority via ADR): SMTP / transactional email, external
identity provider, object storage / CDN for media, message broker, analytics
backend, metrics/tracing/alerting backend.

## 10. Persistence contract

Evidence: `apps/web/payload.config.ts`,
`apps/web/src/cms/collections/media.ts`, `apps/web/src/cms/collections/pages.ts`.

- **PostgreSQL** is required for any environment that must retain CMS/admin
  content (collections `users`, `pages`, `media` and versioned content state).
- **Uploaded media**: the `media` collection uses filesystem storage,
  `upload.staticDir: "media"` (`apps/web/src/cms/collections/media.ts:27`),
  which resolves to `/app/media` in the runtime image. Accepted types:
  `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `application/pdf`. A
  `thumbnail` derivative (480×320) is generated on upload → additional writes to
  the same directory.
  - If CMS media uploads are used, `/app/media` must be a **durable, writable**
    volume; an empty volume means uploaded assets are lost for that environment.
  - If the CMS is disabled (no `DATABASE_URL`), no media writes occur and no
    volume is needed.
- No object-storage adapter is configured; externalizing media to object storage
  is `UNKNOWN — REQUIRES DECISION` (ADR-0006 media storage).

| Item                         | Value                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Media volume size            | `UNKNOWN — REQUIRES DECISION` — decider: infra + content owner                                                                        |
| Media volume access mode     | `ReadWriteOnce` is sufficient for a single replica; multi-replica with filesystem media needs `ReadWriteMany` or externalized storage |
| StorageClass                 | not imposed by the application; `UNKNOWN — REQUIRES DECISION` — infra                                                                 |
| Minimum PostgreSQL volume    | `UNKNOWN — REQUIRES MEASUREMENT`                                                                                                      |
| Backup frequency / retention | `UNKNOWN — REQUIRES DECISION` — decider: infra (ADR-0010)                                                                             |

## 11. Database / migration contract

Evidence: `apps/web/payload.config.ts:25-29`, repository search (no migration
directory).

- Engine: PostgreSQL, via `@payloadcms/db-postgres` `3.88.0`.
- Minimum PostgreSQL major version: `UNKNOWN — REQUIRES DECISION` — decider:
  infra. Local `docker-compose.dev.yml` is the only version reference in-repo.
- Schema management: handled by Payload's PostgreSQL adapter. **No explicit
  migration files exist in this repository.** Whether production uses Payload
  auto-schema-push or a generated migration set is
  `UNKNOWN — REQUIRES DECISION` — decider: Human Engineering Authority + infra.
- Startup order: the app can start before the database is reachable; if
  `DATABASE_URL` is set, the database must become reachable for readiness to pass
  and for admin/CMS to function.
- Backward/forward compatibility and destructive-migration policy: **not defined
  in this repository** → a schema change that is not backward-compatible may
  require restoring the database from backup rather than only rolling back the
  image (Section 20).

## 12. Resource requirements

Explicit CPU/memory sizing is **not present** in this repository.

| Item                   | Value                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| CPU request / limit    | `UNKNOWN — REQUIRES MEASUREMENT` — decider: infra load test                                                                               |
| Memory request / limit | `UNKNOWN — REQUIRES MEASUREMENT` — decider: infra load test                                                                               |
| Startup burst          | `UNKNOWN — REQUIRES MEASUREMENT`                                                                                                          |
| Ephemeral disk         | space for the standalone image + static assets; plus the media volume when CMS media is used; exact size `UNKNOWN — REQUIRES MEASUREMENT` |
| GPU                    | not required                                                                                                                              |

The infra profile's working guess (requests `250m` / `512Mi`, limits `1000m` /
`1Gi`) is a starting point only and is **not validated by this repository**.

## 13. Scaling contract

- Functional model: the web tier is a **stateless HTTP server**. All durable
  state is external (PostgreSQL + the media volume). `/health/ready` is
  `force-dynamic`; there is no in-process session store, no leader election, no
  background worker, no cron.
- Multiple replicas: feasible **iff** all replicas share the same database and
  the same media persistence. With filesystem media (`staticDir: "media"`),
  multi-replica requires `ReadWriteMany` or externalized media; otherwise pin to
  a single replica.
- Session affinity: not required.
- Replica min/max, deployment strategy (`Recreate` vs `RollingUpdate`), PDB, HPA
  and autoscaling signals/thresholds: `UNKNOWN — REQUIRES DECISION` — decider:
  infra + Human Engineering Authority. The infra profile currently assumes
  `replicas: 1`, `Recreate`, PDB/HPA disabled — consistent with filesystem media
  on `ReadWriteOnce`, but not asserted by this repository.

## 14. Security contract

Evidence: `Dockerfile`, `apps/web/src/security/headers.ts`,
`apps/web/next.config.ts`, `apps/web/src/appointment/appointment-client.ts`,
`apps/web/src/cms/access.ts`.

### Container / pod security

| Control                           | Repository evidence                                                                                                                                                                                                          | Notes for infra                                                                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runAsNonRoot: true`              | image adds user `nextjs` uid `1001`, group `nodejs` gid `1001`, `USER nextjs` (`Dockerfile:24`, `:36`)                                                                                                                       | consistent — enforce uid/gid `1001`                                                                                                                                              |
| `allowPrivilegeEscalation: false` | no `setuid`/privileged step in the image                                                                                                                                                                                     | consistent — safe to enforce                                                                                                                                                     |
| drop all capabilities             | no Linux capability is used by observed code                                                                                                                                                                                 | safe to drop `ALL`                                                                                                                                                               |
| `readOnlyRootFilesystem: true`    | **`UNKNOWN — REQUIRES VALIDATION`** — no evidence the app needs a writable root, but Next.js standalone may write `/app/.next/cache`, the process may use `/tmp`, and Payload media writes `/app/media` when the CMS is used | recommend RO root + `emptyDir` for `/app/.next/cache` and `/tmp`, plus the media volume at `/app/media` when CMS media is enabled; confirm with a container run. Decider: infra. |
| seccomp / AppArmor                | not specified by the app                                                                                                                                                                                                     | `RuntimeDefault` seccomp is safe                                                                                                                                                 |

### Application-layer security

Always-on HTTP response headers (`apps/web/src/security/headers.ts`, applied to
`/(.*)` via `apps/web/next.config.ts:20-27`):

- `Content-Security-Policy`: `default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: blob:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:` (plus `upgrade-insecure-requests` when `NODE_ENV=production`).
- `Cross-Origin-Opener-Policy: same-origin`
- `Permissions-Policy: camera=(), geolocation=(), microphone=()`
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- Production only: `Strict-Transport-Security: max-age=63072000; includeSubDomains`
- `X-Powered-By` is disabled (`poweredByHeader: false`).

Other application controls:

- CMS admin access is role-based: roles `technical-admin`, `medical-approver`,
  `editor`; user provisioning is `technical-admin` only; a field-level guard
  blocks self role-escalation (`apps/web/src/cms/access.ts`,
  `apps/web/src/cms/collections/users.ts`). Strong admin authentication / MFA is
  an identity-provider decision (ADR-0005), `UNKNOWN — REQUIRES DECISION`.
- The appointment API is called **server-side only**; the adapter rejects any
  `APPOINTMENT_API_URL` that is not `https:` or `localhost`
  (`apps/web/src/appointment/appointment-client.ts:37`).
- Known accepted debt: the `/api/preview` secret arrives as a query parameter and
  can land in server access logs (tracked in
  `docs/compliance/SECURITY-BASELINE.md`).
- No external IdP, MFA provider, WAF, or zero-trust gateway is selected here.

## 15. Ingress / external exposure contract

Evidence: `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md` §5.1, §17.1;
`apps/web/.env.example`; `scripts/check-production-http.mjs`.

- External exposure: **required** (this is a public portal).
- External protocol: HTTPS, terminated by infrastructure. Internal protocol:
  HTTP on `3000`.
- **Approved DNS zone: `nextgen-cares.org`** (Master Contract §5.1). The Master
  Contract uses the apex host with locale-prefixed paths
  (`https://nextgen-cares.org/fr/…`) and reserves `admin.`, `booking.`, `api.`
  subdomains for separate boundaries. `www.nextgen-cares.org` is **not** named in
  the Master Contract.
  - Canonical production host (apex vs `www`, and the redirect between them):
    `UNKNOWN — REQUIRES DECISION` — decider: Human Engineering Authority. See
    _Contradiction #4_.
- Path requirements at the edge: serve all of `/`, `/fr`, `/nl`, `/fr/*`,
  `/nl/*`, `/admin`, `/api/*`, `/health/live`, `/health/ready` to the container.
  Root `/` returns a `307` locale redirect from the app itself — the edge must
  not shadow it.
- TLS: external TLS material and issuer are an infra decision (cert-manager per
  Master Contract §19); the app requires no client certificates.
- Max request body size: `UNKNOWN — REQUIRES DECISION` — decider: infra; must be
  large enough for CMS media uploads (jpeg/png/webp/avif/pdf) when the admin is
  exposed.
- WebSocket: not required.
- Public indexing stays fail-closed until both `PUBLIC_SEO_ENABLED=true` and a
  valid HTTPS `NEXT_PUBLIC_SITE_URL` are set.

## 16. Configuration contract

| Group                   | Members                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Immutable (image build) | application version, base image, `output: "standalone"`, baked `HOSTNAME`/`PORT`/`NODE_ENV`/`NEXT_TELEMETRY_DISABLED`            |
| Environment (plain)     | `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_SITE_URL`, `PUBLIC_SEO_ENABLED`, `APPOINTMENT_API_URL`, `DATABASE_URL` (non-secret parts) |
| Secret                  | `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `DATABASE_URL` when it embeds credentials                                                    |
| Feature flags           | `PUBLIC_SEO_ENABLED`                                                                                                             |
| Mounted paths           | `/app/media` (CMS media, when enabled); no other runtime config file is required                                                 |

## 17. Observability contract

Evidence: `packages/observability`, `apps/web/src/app/health/*`,
`docs/operations/OBSERVABILITY.md`.

- Structured telemetry is implemented in `packages/observability` (safe log
  schema; trace IDs are 32 lowercase hex characters; personal/health data is
  excluded).
- Health exposure: `GET /health/live`, `GET /health/ready` (Section 6).
- Metrics endpoint, tracing backend, alerting backend: **not selected / not
  exposed** — each `UNKNOWN — REQUIRES DECISION`, decider: infra + Human
  Engineering Authority.

## 18. Deployment success criteria

A deployment is successful only if **all** hold:

1. the container starts and stays up (no crash loop);
2. `GET /health/live` → `200`, body `{"status":"ok"}`, `Cache-Control: no-store`;
3. `GET /health/ready` → `200` with `status: "ok"` in the intended mode
   (`database: "ready"` when `DATABASE_URL` is set, `"not-configured"` when it is
   deliberately absent);
4. the process is listening on `3000`;
5. `GET /` → `307` to `/fr` or `/nl` (locale-negotiated);
6. `GET /fr` → `200` and the body contains `<html lang="fr">`;
7. security headers present on `/fr`: CSP with `frame-ancestors 'none'`,
   `Referrer-Policy: no-referrer`, and (production) `Strict-Transport-Security`
   with `max-age=63072000`;
8. configured critical dependencies reachable: PostgreSQL when `DATABASE_URL` is
   set; the appointment API when `APPOINTMENT_API_URL` is set;
9. when the CMS is enabled: `GET /admin` serves the Payload login;
10. `GET /api/home-care/catalog` returns either `200` or a clean
    `{status,code,detail}` `502`/`503` (a controlled degraded response, never a
    stack trace), matching whether `APPOINTMENT_API_URL` is configured.

Smoke tests 2–7 mirror `scripts/check-production-http.mjs`
(`pnpm exec task test:http`).

## 19. Rollback contract

Roll back when any of the following occurs and the deployment is implicated:

- container start fails or crash-loops;
- `/health/live` fails;
- `/health/ready` stays `503`/`degraded` from an unexpected dependency outage;
- a smoke test (Section 18) fails;
- a schema/migration change is incompatible with the running version;
- an abnormal error rate correlates with the release.

Constraints:

- image rollback is by **previous digest**;
- database and media changes may not be automatically reversible — an
  incompatible Payload/PostgreSQL schema change may require a database restore
  from backup, not just an image rollback (Section 11);
- the infrastructure repository owns the rollback mechanism; this contract only
  defines the triggers and the data-rollback limits.

## 20. Deployment order / dependencies

```text
PostgreSQL (when DATABASE_URL is set)
    ↓
Next.js + Payload runtime (node apps/web/server.js, :3000)
    ↓
Public pages · /admin · /api · /health/*
    ↓
/api/home-care/* once APPOINTMENT_API_URL is configured and reachable
```

Omitting `DATABASE_URL` yields a **reduced-capability** deployment (public pages

- health only; no CMS/admin). That mode must be chosen intentionally.

## 21. Environment matrix

See also `docs/knowledge-base/environment-matrix.md`.

| Property                 | Local                                            | Dev                           | Staging                                               | Production                                                      |
| ------------------------ | ------------------------------------------------ | ----------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| Image reference          | local build (`:phase-1` / `:ci`)                 | `UNKNOWN — REQUIRES DECISION` | digest                                                | digest (Section 3)                                              |
| `DATABASE_URL`           | optional (DB-less boot) / local Postgres for CMS | `UNKNOWN — REQUIRES DECISION` | `UNKNOWN — REQUIRES DECISION`                         | required for CMS-backed production                              |
| `PAYLOAD_SECRET`         | required for CMS use                             | `UNKNOWN — REQUIRES DECISION` | `UNKNOWN — REQUIRES DECISION`                         | required                                                        |
| `PREVIEW_SECRET`         | required for the preview route                   | `UNKNOWN — REQUIRES DECISION` | `UNKNOWN — REQUIRES DECISION`                         | `UNKNOWN — REQUIRES DECISION` (Contradiction #2)                |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000`                          | `UNKNOWN — REQUIRES DECISION` | `UNKNOWN — REQUIRES DECISION`                         | required if preview links are used                              |
| `NEXT_PUBLIC_SITE_URL`   | empty unless testing SEO                         | `UNKNOWN — REQUIRES DECISION` | `UNKNOWN — REQUIRES DECISION`                         | required HTTPS URL when indexing is enabled                     |
| `PUBLIC_SEO_ENABLED`     | `false`                                          | `UNKNOWN — REQUIRES DECISION` | `UNKNOWN — REQUIRES DECISION`                         | explicit decision required                                      |
| `APPOINTMENT_API_URL`    | `http://localhost:8080` or approved test URL     | `UNKNOWN — REQUIRES DECISION` | `UNKNOWN — REQUIRES DECISION`                         | required HTTPS URL for home-care (Contradiction #5)             |
| Data rule                | synthetic only                                   | synthetic only                | synthetic / approved anonymized; no real patient data | approved real data only under the accepted privacy architecture |

Only the local column is directly evidenced in the repository.

## 22. Supply-chain pointers

Evidence: `.github/workflows/ci.yml`, `Taskfile.yml`, `package.json`,
`scripts/generate-sbom.mjs`, `docs/operations/QUALITY-GATES.md`.

- CI: `.github/workflows/ci.yml` — jobs `quality` (`pnpm exec task ci`),
  `browser` (`task test:e2e`), `supply-chain` (dependency audit + SBOM,
  artifact `sbom-cyclonedx` → `.artifacts/sbom.cdx.json`), `container`
  (`docker build next-gen-care-platform:ci` + Trivy `HIGH,CRITICAL`,
  `ignore-unfixed: true`, `exit-code: 1`).
- SBOM: CycloneDX **1.6** JSON, generated by `scripts/generate-sbom.mjs`
  (`@cyclonedx/cdxgen` `12.8.4`), validated for `specVersion === "1.6"`.
- Container scan: Trivy HIGH/CRITICAL fixed-vulnerability gate, in CI and via
  `pnpm exec task container:scan`.
- Dependency audit: `pnpm audit --prod --audit-level high`.
- Secret scan + SAST (`eslint-plugin-security`) run in the primary CI gate.
- **Not present:** image publication, image signing / SLSA provenance /
  attestation, CodeQL and PR dependency-review (removed pending a GitHub
  Advanced Security decision — `docs/operations/QUALITY-GATES.md`).

## 23. Contract validation

The contract can be validated with:

- `pnpm exec task ci` — the provider-independent gate (format, lint, typecheck,
  unit, integration, contract-gate, a11y, secret scan, SAST, `pnpm build`,
  `task test:http`, performance budget);
- `pnpm exec task ci:extended` — adds dependency audit, SBOM, browser E2E;
- `pnpm build` then `pnpm exec task test:http` — builds the standalone server and
  asserts the locale redirect, the FR document, the security headers, and both
  health probes (`scripts/check-production-http.mjs`);
- `pnpm exec task container:build` then `pnpm exec task container:scan` — image
  build + Trivy;
- a container run of `node apps/web/server.js` to measure startup time and to
  validate `readOnlyRootFilesystem` with `emptyDir` mounts.

Record the exact command and result in the phase report. A green command is
evidence only for that command and environment.

## 24. Open decisions and contradictions register

These block a production deployment until resolved. Each names the decider.

| #   | Item                                        | Repository evidence                                                                                                                                                                                                         | Required decision                                                                                                                                                                                                                                                    | Decider                                                     |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | Published image + digest                    | No registry/push anywhere in-repo; CI `container` job builds `next-gen-care-platform:ci` and discards it; `permissions: contents: read`                                                                                     | Choose a registry; add a publish/release workflow with `packages: write` + build provenance; then the authoritative digest and its `sourceRevision` can be recorded here. The infra profile's `sha256:f13b8325…` is not produced or verifiable from this repository. | repo/org admin + Human Engineering Authority                |
| 2   | `PREVIEW_SECRET` in production              | `/api/preview` returns `404` for everyone when the secret is unset (`apps/web/src/app/api/preview/route.ts:25`)                                                                                                             | Decide whether CMS content preview is a production capability at launch. Yes → `PREVIEW_SECRET` required in prod; No → omit it (route stays `404`).                                                                                                                  | Human Engineering Authority + content governance owner      |
| 3   | Health endpoints                            | **Resolved.** `apps/web/src/app/health/live/route.ts` and `.../ready/route.ts` exist and are covered by `scripts/check-production-http.mjs` (in `task ci`). Paths, methods, statuses and bodies are in Section 6.           | Infra to configure probes per Section 6; the "not found in application code" finding is stale as of commit `f9122cd`.                                                                                                                                                | infra (configuration only)                                  |
| 4   | Production hostname                         | Master Contract §5.1 approves the zone `nextgen-cares.org` (apex + locale paths); `www.nextgen-cares.org` is not named anywhere                                                                                             | Confirm the canonical production host (apex or `www`) and the redirect between them; set `NEXT_PUBLIC_SITE_URL` accordingly. Do not invent a host.                                                                                                                   | Human Engineering Authority                                 |
| 5   | In-cluster transport to the appointment API | Adapter accepts `APPOINTMENT_API_URL` only when scheme is `https:` or hostname is exactly `localhost` (`apps/web/src/appointment/appointment-client.ts:37`); a ClusterIP `http://…svc` is rejected → home-care routes `503` | Either (a) infra provides an internal **HTTPS** URL, or (b) authorize an application change to allow a named in-cluster HTTP host, or (c) terminate TLS via a sidecar/mesh. Option (b) is an application code change, out of scope for this documentation phase.     | Human Engineering Authority + infra + appointment API owner |
| 6   | `readOnlyRootFilesystem`                    | No evidence of required root writes; Next.js standalone may write `/app/.next/cache`; Payload media writes `/app/media` when CMS media is used                                                                              | Validate a container run with RO root + `emptyDir` at `/app/.next/cache` and `/tmp` (+ media volume at `/app/media` when CMS media is on).                                                                                                                           | infra                                                       |
| 7   | Resource sizing                             | No CPU/memory declaration in-repo                                                                                                                                                                                           | Measure under representative load; record requests/limits.                                                                                                                                                                                                           | infra                                                       |
| 8   | Replica count / strategy / PDB / HPA        | Stateless web tier; filesystem media couples replica count to volume access mode                                                                                                                                            | Decide `replicas` min/max, `Recreate` vs `RollingUpdate`, PDB, HPA + signals.                                                                                                                                                                                        | infra + Human Engineering Authority                         |
| 9   | Migration mechanism                         | No migration files; Payload PostgreSQL adapter present                                                                                                                                                                      | Decide auto-schema-push vs generated migrations; define destructive-migration + DB-rollback policy.                                                                                                                                                                  | Human Engineering Authority + infra                         |
| 10  | Provider ADRs still open                    | ADR-0002/0005/0006/0007/0008/0009/0010 candidates                                                                                                                                                                           | Email, admin identity/MFA, media/object storage, analytics/consent, secrets manager + rotation, backup/DR.                                                                                                                                                           | Human Engineering Authority (per ADR)                       |

## 25. Infrastructure handoff

### The application repository provides

- a runtime image built from the root `Dockerfile` (once a registry + publish
  workflow exist — Contradiction #1);
- the startup contract: `node apps/web/server.js`, workdir `/app`, port `3000`,
  bind `0.0.0.0` (Section 4);
- health endpoints `/health/live` and `/health/ready` with the exact contracts in
  Section 6;
- the environment-variable and secret contracts (Sections 7–8);
- external-dependency contracts (Section 9), including the appointment-API URL
  scheme constraint;
- persistence requirements (Section 10) — PostgreSQL, and a `/app/media` volume
  when CMS media is used;
- the security posture the image already satisfies (non-root uid/gid `1001`,
  no capabilities used) and the always-on HTTP security headers (Section 14);
- deployment success criteria (Section 18) and rollback triggers (Section 19);
- supply-chain artefacts (Section 22).

### Infrastructure decides

- cluster, namespace, deployment mechanism (Helm / Kustomize / manifests);
- registry and image-promotion pipeline; probe timing; resource requests/limits;
- ingress / gateway, DNS, hostname, TLS issuer, max body size;
- StorageClass, media volume size and access mode;
- secret backend, secret name/shape, rotation;
- replica strategy, PDB, HPA;
- observability platform;
- GitOps / Argo CD ownership and reconciliation.

## 26. Known limitations

- No image is published; deployment-by-digest cannot be satisfied yet
  (Contradiction #1).
- Resource sizing, startup time, and `readOnlyRootFilesystem` are unmeasured.
- Namespace, ingress, DNS, StorageClass, GitOps, autoscaling, and every external
  provider (email, IdP, object storage, observability, secrets manager) are
  infra / ADR decisions.
- Database migration mechanics and destructive-migration policy are undefined.
- Production RPO/RTO, SLOs, and backup strategy are undefined here.
- `docs/operations/QUALITY-GATES.md` and
  `docs/architecture/DEPLOYMENT-CONTEXT.md` still contain wording implying the
  infrastructure repository is uninitialized; DEPLOYMENT-CONTEXT.md is corrected
  by this deliverable, QUALITY-GATES.md is flagged for a follow-up edit.

## 27. Changelog

- **1.1 — 2026-09-02** — Promoted to the authoritative normalized contract under
  `docs/`. Confirmed the health endpoints exist and are CI-covered (was flagged
  missing). Added the exact security-header set, the appointment-facade upstream
  paths, the `APPOINTMENT_API_URL` scheme constraint, the Payload media volume
  requirement, the observed route list, and the standalone server path. Added
  Section 24 (open decisions / contradictions register) with named deciders and
  Section 22 (supply-chain pointers). Corrected the
  `docs/application-deployment-contract.md` role from "pointer" to "the
  contract".
- **1.0 — 2026-09-01** — Initial application deployment contract extracted from
  repository evidence (previously `DEPLOYMENT_CONTRACT.md`).
- Future incompatible changes increment the major version; compatible additions
  the minor; documentation-only corrections the patch.
