# Application Deployment Contract

## 1. Contract Metadata

| Field                           | Value                                                                                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application                     | NEXT GEN CARE platform                                                                                                                               |
| Application type                | Public Next.js web application with Payload CMS and server-side home-care appointment facade                                                         |
| Contract version                | 1.0                                                                                                                                                  |
| Application version             | 0.1.0                                                                                                                                                |
| Application versioning strategy | Semantic versioning in `package.json`, correlated with git history and release tags; promoted runtime artifacts should use an immutable image digest |
| Repository                      | `next-gen-care-platform`                                                                                                                             |
| Owner / team                    | Repository owner / Human Engineering Authority                                                                                                       |
| Last updated                    | 2026-09-01                                                                                                                                           |
| Status                          | ACTIVE                                                                                                                                               |

## 2. Application Runtime

- Runtime technology: Next.js 16.3.3 on Node.js 24.20.0.
- Package manager: pnpm 11.24.0 through Corepack.
- CMS/runtime library: Payload 3.88.0.
- React runtime: React 19.2.8.
- Observed build/runtime base image: `node:24.20.0-bookworm-slim`.
- Observed validation platform: Linux x86_64 / WSL2.
- Runtime assumptions:
  - the production image runs as a non-root user;
  - the application is built as a standalone Next.js server artifact;
  - the application expects HTTP reverse-proxying from the infrastructure layer.

Unknown or not explicitly constrained:

- additional CPU architectures: `UNKNOWN — REQUIRES DECISION`
- OS family beyond the observed Debian-based Node image: `UNKNOWN — REQUIRES DECISION`

## 3. Container Image

- Image source: the repository root `Dockerfile`.
- Runtime image convention observed locally:
  - CI build tag: `next-gen-care-platform:ci`
  - phase build tag: `next-gen-care-platform:phase-1`
- Image repository / registry: `UNKNOWN — REQUIRES DECISION`
- Image name for promotion: `next-gen-care-platform` is the observed local build name; the registry path is an infrastructure decision.
- Versioning strategy:
  - release tags should reflect application version and git commit lineage;
  - promoted environments should prefer immutable digests over mutable tags;
  - `latest` must not be used as a release-promotion reference.
- Tag strategy:
  - mutable tags are acceptable only for local/dev build convenience;
  - release promotion should be tracked by version tag plus digest.
- Digest strategy:
  - preferred for reproducible deployment and rollback.
- Supported architectures:
  - `linux/x86_64` is the only architecture directly observed in this workspace;
  - others are `UNKNOWN — REQUIRES DECISION`.

## 4. Startup Contract

- Entry point: `node apps/web/server.js`
- Working directory: `/app` in the runtime image.
- Container command: `CMD ["node", "apps/web/server.js"]`
- Runtime environment expected by the image:
  - `HOSTNAME=0.0.0.0`
  - `PORT=3000`
  - `NODE_ENV=production`
  - `NEXT_TELEMETRY_DISABLED=1`
- Startup preconditions:
  - standalone build artifacts must already exist in the image;
  - the runtime layer expects `.next/standalone` and `.next/static` to have been copied during image build;
  - the process must be able to bind to port 3000.
- Approximate startup time: `UNKNOWN — REQUIRES MEASUREMENT`
- Startup failure conditions:
  - missing standalone build output;
  - missing runtime dependencies in the image;
  - inability to bind port 3000;
  - missing mandatory secrets or dependencies when the application path requires them.

## 5. Network Contract

- Container listen port: `3000`
- Protocol: HTTP
- Interface: `0.0.0.0`
- TLS termination: performed outside the application by the infrastructure layer.
- Important HTTP paths:
  - `/fr`
  - `/nl`
  - `/admin`
  - `/api`
  - `/api/home-care/*`
  - `/health/live`
  - `/health/ready`
  - `/robots.txt`
  - `/sitemap.xml`
- Reverse-proxy behavior:
  - the application is intended to sit behind a reverse proxy / ingress;
  - no application-specific ingress controller is required by the repository;
  - no special websocket contract was observed.
- Path-based locale routing is part of the public contract.
- External hostname / DNS names are not imposed by the application and remain an infrastructure decision.

## 6. Health Contract

### Liveness

- Endpoint: `GET /health/live`
- Expected response: HTTP 200
- Body: `{"status":"ok"}`
- Cache behavior: `Cache-Control: no-store`
- Failure conditions:
  - route unavailable;
  - process not running;
  - unhandled runtime failure on the health route.

### Readiness

- Endpoint: `GET /health/ready`
- Expected response:
  - HTTP 200 with `status: "ok"` when the application is ready and the configured database is reachable or intentionally absent;
  - HTTP 503 with `status: "degraded"` when a configured database is unreachable.
- Response body shape:
  - `checks.application = "ready"`
  - `checks.database = "ready" | "not-configured" | "unreachable"`
- Cache behavior: `Cache-Control: no-store`
- Dependencies considered by readiness:
  - PostgreSQL when `DATABASE_URL` is configured.

### Startup

- No dedicated startup probe endpoint is defined in the repository.
- Startup readiness is therefore inferred through container start plus readiness success.

## 7. Environment Variables

| Variable                  | Required                   | Secret | Default      | Description                                                                                                                                                                                                   |
| ------------------------- | -------------------------- | ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`            | Conditional                | YES    | none         | PostgreSQL connection string for Payload CMS and CMS-backed runtime behavior. The application can boot without it, but CMS/database-backed features are not available and readiness reports `not-configured`. |
| `PAYLOAD_SECRET`          | YES for CMS use            | YES    | none         | Secret used by Payload CMS. Without it, the CMS/admin runtime is not usable.                                                                                                                                  |
| `PREVIEW_SECRET`          | YES for preview support    | YES    | none         | Secret used by the preview route (`/api/preview`). Absent secret means preview is unavailable.                                                                                                                |
| `NEXT_PUBLIC_SERVER_URL`  | YES for preview links      | NO     | none         | Server URL used to generate CMS preview links.                                                                                                                                                                |
| `NEXT_PUBLIC_SITE_URL`    | Conditional                | NO     | empty        | Canonical public HTTPS site URL. Required for canonical URLs and sitemap emission when public indexing is enabled.                                                                                            |
| `PUBLIC_SEO_ENABLED`      | NO                         | NO     | `false`      | Feature flag that enables public indexing only when paired with a valid HTTPS `NEXT_PUBLIC_SITE_URL`.                                                                                                         |
| `APPOINTMENT_API_URL`     | YES for home-care features | NO     | none         | Server-side URL of the existing Appointment API used by home-care catalog, availability, hold, and appointment-request routes. Only HTTPS or localhost is accepted by the current validator.                  |
| `HOSTNAME`                | NO                         | NO     | `0.0.0.0`    | Runtime bind address in the container image.                                                                                                                                                                  |
| `PORT`                    | NO                         | NO     | `3000`       | Runtime listen port in the container image.                                                                                                                                                                   |
| `NODE_ENV`                | NO                         | NO     | `production` | Standard runtime mode for the production image.                                                                                                                                                               |
| `NEXT_TELEMETRY_DISABLED` | NO                         | NO     | `1`          | Disables Next.js telemetry in this workspace.                                                                                                                                                                 |

Notes:

- Environment-specific values for staging / production are `UNKNOWN — REQUIRES DECISION` except where the repository already proves the need.
- No secret values are committed in the repository.

## 8. External Dependencies

| Dependency               | Required                                                                     | Protocol   | Endpoint / Port                      | Startup Dependency                                    | Failure Impact                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- | ---------- | ------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| PostgreSQL               | YES for CMS / admin-backed deployment                                        | PostgreSQL | Default port 5432                    | YES when `DATABASE_URL` is set                        | CMS/admin persistence unavailable; readiness degrades if the configured database is unreachable |
| Existing Appointment API | YES for home-care catalog / availability / hold / appointment-request routes | HTTP(S)    | Configured via `APPOINTMENT_API_URL` | NO for basic public pages, YES for home-care features | Home-care routes return 503 / upstream errors                                                   |

Not selected in this repository:

- SMTP / transactional email provider: `UNKNOWN — REQUIRES DECISION`
- external identity provider: `UNKNOWN — REQUIRES DECISION`
- object storage / CDN for uploaded media: `UNKNOWN — REQUIRES DECISION`
- message broker: not observed
- analytics provider: not selected

## 9. Persistence Contract

Persistent data observed in the repository:

- PostgreSQL-backed CMS data for Payload collections (`pages`, `media`, `users`) and versioned content state.
- Uploaded media for the CMS, configured with `staticDir: "media"` in the Payload collection definition.

Persistence requirements:

- PostgreSQL persistence is required for any deployment that must preserve CMS/admin content.
- Media uploads require durable storage for the `media/` directory or an equivalent externalized storage strategy chosen by infrastructure.
- If the `media/` volume is empty, uploaded assets are lost for that environment.
- If the database is empty, the CMS starts without content; that is acceptable only for an empty or bootstrap environment.

Unknown / not explicitly defined:

- minimum persistent volume size: `UNKNOWN — REQUIRES MEASUREMENT`
- exact backup frequency / retention: `UNKNOWN — REQUIRES DECISION`
- explicit application-managed migration files: none observed in this repository; migration mechanism is `UNKNOWN — REQUIRES DECISION`

The application contract does not impose a Kubernetes StorageClass.

## 10. Secrets Contract

| Secret           | Required                | Usage                        | Rotation    | Behavior if absent                                   |
| ---------------- | ----------------------- | ---------------------------- | ----------- | ---------------------------------------------------- |
| `DATABASE_URL`   | Conditional             | PostgreSQL connection string | Recommended | CMS/database-backed runtime cannot operate correctly |
| `PAYLOAD_SECRET` | YES for CMS use         | Payload CMS secret           | Recommended | CMS/admin runtime is not usable                      |
| `PREVIEW_SECRET` | YES for preview support | Protects preview access      | Recommended | Preview route returns not authorized / unavailable   |

No other secret names are explicitly evidenced in this repository.

## 11. Resource Requirements

Explicit resource sizing is not specified in the repository.

- Minimum CPU: `UNKNOWN — REQUIRES MEASUREMENT`
- Minimum memory: `UNKNOWN — REQUIRES MEASUREMENT`
- Recommended CPU: `UNKNOWN — REQUIRES MEASUREMENT`
- Recommended memory: `UNKNOWN — REQUIRES MEASUREMENT`
- Startup burst / temporary requirements: `UNKNOWN — REQUIRES MEASUREMENT`
- Disk requirements: at least enough space for the standalone Next.js runtime image, static assets, and persistent CMS/media storage; exact sizing is `UNKNOWN — REQUIRES MEASUREMENT`
- GPU requirements: not observed

## 12. Scaling Contract

- Functional model: the web runtime is designed as a stateless HTTP server for public requests, with state persisted externally in PostgreSQL and media storage.
- Multiple replicas:
  - likely possible for the web runtime if all replicas share the same external database and the chosen media persistence;
  - not explicitly tested in this repository.
- Session affinity: not required by evidence.
- Singleton requirement: not observed.
- Leader election: not observed.
- Background workers: not observed.
- Shared filesystem requirement:
  - only for CMS media persistence if the deployment uses filesystem storage for uploaded media.

Unknown:

- autoscaling thresholds: `UNKNOWN — REQUIRES DECISION`
- replica minimum / maximum: `UNKNOWN — REQUIRES DECISION`

## 13. Security Contract

- Runtime container runs as a non-root user (`nextjs`) in the observed Dockerfile.
- The application sets restrictive security headers at the HTTP layer:
  - Content Security Policy
  - frame denial
  - referrer policy
  - MIME sniffing denial
  - COOP
  - permissions policy
  - production HSTS
- CMS access is role-based in application code.
- Public appointment routes are server-side only; the browser is not intended to call the Appointment API directly.
- The app validates the `APPOINTMENT_API_URL` scheme and only accepts HTTPS or localhost.
- No external IdP, MFA provider, or zero-trust gateway is selected in this repository.
- Read-only filesystem mode is not mandated by application evidence.
- Additional Linux capabilities are not required by observed code.

## 14. Ingress / External Exposure Contract

- External exposure required: YES
- Protocol externally: HTTPS recommended / expected by infrastructure
- Protocol internally: HTTP on port 3000
- Hostname pattern: not imposed by the application; a valid HTTPS site URL is required for canonical URLs and indexing if enabled.
- Path requirements:
  - locale-prefixed public pages (`/fr`, `/nl`, and locale-prefixed domain pages)
  - admin surface (`/admin`)
  - API routes (`/api/*`)
  - health endpoints (`/health/live`, `/health/ready`)
- WebSocket requirement: not observed
- Maximum request size: `UNKNOWN — REQUIRES DECISION`
- TLS requirement: external TLS is expected to be terminated by infrastructure
- Redirect requirements:
  - root traffic negotiates locale;
  - public indexing remains fail-closed until `NEXT_PUBLIC_SITE_URL` and `PUBLIC_SEO_ENABLED` are set appropriately.

## 15. Configuration Contract

Configuration groups observed in the repository:

- Immutable configuration:
  - application version
  - Dockerfile base image
  - standalone Next.js output mode
- Environment configuration:
  - `PORT`
  - `HOSTNAME`
  - `NODE_ENV`
  - `NEXT_TELEMETRY_DISABLED`
  - `NEXT_PUBLIC_SERVER_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `PUBLIC_SEO_ENABLED`
  - `APPOINTMENT_API_URL`
  - `DATABASE_URL`
- Secret configuration:
  - `PAYLOAD_SECRET`
  - `PREVIEW_SECRET`
  - `DATABASE_URL` when it embeds credentials
- Feature flags:
  - `PUBLIC_SEO_ENABLED`

Mounted files / external config:

- `media/` is the observed CMS upload directory.
- No extra mounted runtime config file is explicitly required by evidence.

## 16. Database / Migration Contract

- Database engine: PostgreSQL
- Version minimum: `UNKNOWN — REQUIRES DECISION`
- Version observed in local compose: PostgreSQL 17
- Migration tool: `UNKNOWN — REQUIRES DECISION`
- Migration files in this repository: none observed
- Order of startup:
  - the application can start without `DATABASE_URL`, but CMS/admin functionality is then unavailable;
  - if `DATABASE_URL` is configured, the database must be reachable for readiness to succeed.
- Backward / forward compatibility: `UNKNOWN — REQUIRES DECISION`
- Rollback behavior:
  - if a future schema change is incompatible, rollback may require restoring the previous application image and, if needed, restoring the database from backup;
  - destructive migration policy is not defined in this repository.

## 17. Observability Contract

Structured telemetry is implemented in `packages/observability`.

Observed safe log schema:

- events:
  - `application.started`
  - `http.request.completed`
  - `dependency.request.completed`
- levels:
  - `info`
  - `warn`
  - `error`
- allowed attributes:
  - `component`
  - `durationMs`
  - `httpStatus`
  - `locale`
  - `operation`
  - `outcome`
  - `traceId`
- trace ID format: exactly 32 lowercase hexadecimal characters

Observed health exposure:

- `GET /health/live`
- `GET /health/ready`

Not selected / not observed:

- metrics backend: `UNKNOWN — REQUIRES DECISION`
- tracing backend: `UNKNOWN — REQUIRES DECISION`
- alerting backend: `UNKNOWN — REQUIRES DECISION`

## 18. Deployment Success Criteria

A deployment of this application is successful only if all of the following are true:

- the container image starts successfully;
- `GET /health/live` returns HTTP 200;
- `GET /health/ready` returns HTTP 200 in the intended operating mode;
- the application binds to port 3000;
- configured critical dependencies are reachable:
  - PostgreSQL when `DATABASE_URL` is provided;
  - the Appointment API for home-care features when `APPOINTMENT_API_URL` is provided;
- a smoke test succeeds for at least:
  - locale route delivery (`/fr` and/or `/nl`)
  - health endpoints
  - CMS/admin access when the CMS is enabled

Additional app-specific success criteria:

- public pages render in French and Dutch;
- indexing behavior matches the configured `NEXT_PUBLIC_SITE_URL` and `PUBLIC_SEO_ENABLED` values;
- home-care routes return expected success or degraded responses rather than silent failure.

## 19. Rollback Contract

Rollback is required when any of the following occurs:

- container startup fails;
- readiness remains failing or degraded due to an unexpected dependency outage;
- liveness fails;
- a migration or schema change is incompatible with the deployed version;
- a critical smoke test fails;
- a critical dependency becomes incompatible with the deployed image;
- the observed error rate becomes abnormal and the deployment is implicated.

Rollback constraints:

- database and media changes may not be automatically reversible;
- if a future migration is destructive, a rollback may require database restoration rather than only image rollback;
- the infrastructure repository decides the rollback mechanism;
- this contract only defines when rollback is necessary.

## 20. Deployment Order / Dependencies

Observed application dependency order:

```text
PostgreSQL (when enabled)
    ↓
Next.js / Payload runtime
    ↓
Public pages, CMS/admin, health endpoints
    ↓
Appointment-backed home-care routes when APPOINTMENT_API_URL is configured
```

If the deployment disables CMS/database-backed functionality by omitting `DATABASE_URL`, the application can still boot, but that is a reduced-capability mode and must be accepted intentionally.

## 21. Environment Matrix

| Property                 | Local                                                        | Dev                         | Staging                     | Production                                             |
| ------------------------ | ------------------------------------------------------------ | --------------------------- | --------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`           | Optional for DB-less boot; required for CMS validation       | UNKNOWN — REQUIRES DECISION | UNKNOWN — REQUIRES DECISION | Required for CMS-backed production use                 |
| `PAYLOAD_SECRET`         | Required for CMS/admin use                                   | UNKNOWN — REQUIRES DECISION | UNKNOWN — REQUIRES DECISION | Required                                               |
| `PREVIEW_SECRET`         | Required for preview route                                   | UNKNOWN — REQUIRES DECISION | UNKNOWN — REQUIRES DECISION | Required if preview is enabled                         |
| `NEXT_PUBLIC_SERVER_URL` | Usually `http://localhost:3000` in local development         | UNKNOWN — REQUIRES DECISION | UNKNOWN — REQUIRES DECISION | Required if preview links are used                     |
| `NEXT_PUBLIC_SITE_URL`   | Usually blank unless public indexing is intentionally tested | UNKNOWN — REQUIRES DECISION | UNKNOWN — REQUIRES DECISION | Required as a named HTTPS URL when indexing is enabled |
| `PUBLIC_SEO_ENABLED`     | Usually `false`                                              | UNKNOWN — REQUIRES DECISION | UNKNOWN — REQUIRES DECISION | Must be explicitly decided                             |
| `APPOINTMENT_API_URL`    | Local or approved test endpoint                              | UNKNOWN — REQUIRES DECISION | UNKNOWN — REQUIRES DECISION | Required for home-care functionality                   |

Only the local defaults are directly evidenced in the repository.

## 22. Contract Validation

The contract can be validated using the following checks:

- Docker image inspection from the repository `Dockerfile`
- container startup of the standalone runtime
- liveness and readiness probes
- environment validation against `.env.example`
- dependency connectivity to PostgreSQL and the Appointment API
- smoke tests against locale routes, health endpoints, and CMS/admin routes
- application CI / local parity gates:
  - `pnpm exec task ci`
  - `pnpm build`
  - `pnpm exec task test:http`

Validation note:

- any value not demonstrable from repository evidence is marked `UNKNOWN — REQUIRES DECISION`.

## 23. Known Limitations

- Image repository / registry is not selected in this repository.
- Resource sizing is not measured in this repository.
- Kubernetes namespace, ingress, DNS, storage class, GitOps, and autoscaling are infrastructure decisions.
- SMTP, external identity provider, object storage, and observability backend are not selected here.
- Database migration mechanics are not explicitly defined in this repository.
- Production RPO/RTO, SLOs, and backup strategy are not defined here.

## 24. Infrastructure Handoff

### Application provides

- runtime image built from the repository Dockerfile
- startup contract (`node apps/web/server.js`)
- container port `3000`
- health endpoints `/health/live` and `/health/ready`
- required configuration listed in section 7
- required secrets listed in section 10
- external dependencies listed in section 8
- persistence requirements listed in section 9
- resource requirements currently unknown and marked for measurement
- scaling constraints listed in section 12
- exposure requirements listed in section 14
- success criteria listed in section 18
- rollback conditions listed in section 19

### Infrastructure decides

- cluster
- namespace
- deployment mechanism
- Helm / Kustomize / manifests
- ingress / gateway
- DNS
- TLS implementation
- storage class
- secret backend
- scheduling
- autoscaling
- observability platform
- GitOps strategy

## 25. Contract Changelog

- `1.0` - initial application deployment contract extracted from repository evidence on 2026-09-01.
- Future incompatible changes must increment the major version.
- Future compatible additions should increment the minor version.
- Documentation-only corrections without contract impact should increment the patch version.
