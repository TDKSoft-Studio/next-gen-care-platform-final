# Appointment API Inventory

**Required by:** Master Engineering Contract section 9.2  
**Evidence snapshot:** 2026-08-29, Europe/Brussels  
**Repository:** `/home/hkengne/projects/nurse-appointment-scheduling-api`  
**Inspection mode:** read-only; the appointment repository was not modified

## Executive finding

The repository contains a substantial appointment platform, but its current public booking semantics and its exported OpenAPI document are not safe to consume as the NEXT GEN CARE booking contract without remediation and explicit human acceptance.

Four integration blockers are evidenced:

1. The implementation creates `CONFIRMED` appointments directly; it has no `REQUESTED` or `PENDING_REVIEW` state and no human-validation transition required by the NEXT GEN CARE contract.
2. Expired holds are ignored by application queries but remain `ACTIVE` in PostgreSQL. The exclusion constraint applies to every `ACTIVE` row and no expiry transition/cleanup mechanism was found, so an expired hold can continue preventing a later overlapping insert.
3. The untracked OpenAPI export omits administrative bearer authentication, non-200 responses, problem schemas, and actual `201`/`202`/`204` outcomes.
4. Two distinct Java DTOs share the schema name `PatientAddress`; the exported confirmation request points to the latitude/longitude shape although the implementation expects address line, city, postal code, and country.

These findings are based on static repository and contract inspection. No runtime test was executed in Phase 0.

## Repository state and contract identity

| Item             | Observed evidence                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Git              | `main...origin/main`; working tree already had modified `CLAUDE.md` and untracked `nurse-appointment-api.json`                             |
| Recent history   | Latest observed commit: `e7894e7` dated 2026-08-28                                                                                         |
| OpenAPI source   | Generated at runtime at `/v3/api-docs` by springdoc; no tracked OpenAPI JSON/YAML contract was found                                       |
| Inspected export | `nurse-appointment-api.json`, untracked, mode `755`, modified 2026-08-29 02:57:26 +0200                                                    |
| Export digest    | SHA-256 `afb40204376bf5fe520abb2065401c27db3539389731f8ef73f3d2b77e6d3a4a`                                                                 |
| Export metadata  | OpenAPI 3.1.0; title `Nurse Appointment Scheduling API`; version `v1`; server `http://localhost:8080`; 42 paths; 58 operations; 46 schemas |

The digest is discovery evidence only. It is not a version pin because the file is not tracked or accepted by a human.

## Runtime

| Area                     | Observed implementation                                                                | Evidence                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Backend language/runtime | Java 21                                                                                | `backend/pom.xml`, backend Dockerfile, backend CI                                     |
| Framework                | Spring Boot parent 4.1.1; Spring MVC, Validation, Security, Data JPA, Flyway, Actuator | `backend/pom.xml`                                                                     |
| API documentation        | springdoc 3.1.0                                                                        | `backend/pom.xml`, `OpenApiConfig.java`, `application.yml`                            |
| Build/package manager    | Maven wrapper 3.3.4 downloading Maven 3.9.9                                            | `backend/.mvn/wrapper/maven-wrapper.properties`                                       |
| Admin frontend           | Next.js 16.3.3, React/React DOM 19.2.8, TypeScript 5, npm lockfile                     | `admin-frontend/package.json`, `package-lock.json`                                    |
| Node image               | Node 22 Alpine for build and runtime                                                   | `admin-frontend/Dockerfile`                                                           |
| Persistence              | PostgreSQL; tests/local Compose use 17, Kubernetes manifest uses 16                    | `AbstractIntegrationTest.java`, `docker-compose.yml`, `k8s/postgres-statefulset.yaml` |
| Non-authoritative store  | Redis 7 for rate limiting                                                              | `pom.xml`, `docker-compose.yml`, `k8s/redis-deployment.yaml`, rate-limit source       |

The PostgreSQL major-version difference is not proven incompatible, but it is an environment-drift risk that requires an explicit compatibility policy.

## Contract

### Public operations relevant to the portal

| Operation                                                  | Purpose                                                       | Implementation security                          | Idempotency                    |
| ---------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------ | ------------------------------ |
| `GET /api/v1/services`                                     | Active service catalog                                        | Public                                           | n/a                            |
| `GET /api/v1/locations`                                    | Locations/service areas                                       | Public                                           | n/a                            |
| `GET /api/v1/availability`                                 | Dynamic candidate starts                                      | Public                                           | n/a                            |
| `POST /api/v1/booking-holds`                               | Create temporary capacity hold                                | Public                                           | Required `Idempotency-Key`     |
| `POST /api/v1/appointments/confirm`                        | Convert hold to confirmed appointment or start online payment | Public                                           | Required `Idempotency-Key`     |
| `GET /api/v1/appointments/{secureAccessToken}`             | Token-capability appointment view                             | Token in path                                    | n/a                            |
| `POST /api/v1/appointments/{secureAccessToken}/cancel`     | Patient cancellation                                          | Token in path                                    | Required `Idempotency-Key`     |
| `POST /api/v1/appointments/{secureAccessToken}/reschedule` | Patient reschedule                                            | Token in path                                    | Required `Idempotency-Key`     |
| `POST /api/v1/payments/webhook`                            | Payment-provider callback                                     | Public; implementation re-fetches provider state | Status guards, not request key |

### Administrative surface

The generated export contains authentication, dashboard, calendar, appointments, patients, organizations, nurses, locations, services, schedules, exceptions, blocked periods, holidays, settings, payments, notifications, and audit operations under `/api/v1/admin`. Source controllers apply `@PreAuthorize` role checks, but the export declares no `securitySchemes` and no operation-level security.

### Error and response contract

The implementation uses Spring `ProblemDetail` with stable `code` and correlation `traceId` properties. Examples evidenced in source include `SLOT_UNAVAILABLE`, `HOLD_EXPIRED`, `APPOINTMENT_ALREADY_CANCELLED`, `APPOINTMENT_NOT_CANCELLABLE`, `RATE_LIMIT_EXCEEDED`, and `CONCURRENT_MODIFICATION`.

The export documents only a `200` response for all 58 operations. This disagrees with source behavior, including:

- `201` for fresh hold creation;
- `201` for on-site appointment confirmation;
- `202` for online-payment initiation;
- `204` for logout and deletes;
- `400`, `401`, `403`, `404`, `409`, `422`, `429`, and `500` problem responses.

No reusable problem-details schema is present in the export.

## Domain

### Implemented bounded modules

The backend is a modular monolith with packages for identity/access, organization, service catalog, scheduling, booking, appointment, patient, payment, notification, audit, settings, and cross-cutting platform concerns. Architecture fitness tests enforce some package rules.

### Scheduling and availability

- Candidate starts are computed dynamically from service duration, granularity, working periods, date-specific exceptions, public holidays, blocked periods, confirmed appointments, unexpired active holds, location, mode, and a travel-time abstraction.
- Times are represented with `Instant`; location time zones are used to resolve local dates and working periods.
- The currently wired travel adapter is a configurable fixed buffer, not route optimization.
- Home mode requires coordinates at hold creation and checks a configured circular service area.

### Hold and concurrency semantics

- PostgreSQL is the intended consistency authority.
- Creation acquires deterministic PostgreSQL advisory transaction locks by nurse/day, rechecks availability, then inserts.
- `booking_holds` and `appointments` use generated `tstzrange` values and GiST exclusion constraints to prevent overlapping `ACTIVE` holds and overlapping `CONFIRMED` appointments per nurse.
- The hold TTL defaults to 10 minutes and is configurable per organization.
- Idempotency responses are stored for 24 hours in `idempotency_keys`.

**Critical static finding:** `findActiveOverlapping` filters `expires_at > now`, but the database constraint is `WHERE (status = 'ACTIVE')`. No source path was found that changes an elapsed hold to `EXPIRED` or `RELEASED`, and no purge/expiry job was found. Therefore the query may report the slot free while PostgreSQL still rejects a new overlapping `ACTIVE` row. Existing concurrency tests cover simultaneous inserts, not reuse after TTL expiry.

### Appointment semantics

- Implemented statuses: `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`.
- Hold statuses: `ACTIVE`, `CONSUMED`, `EXPIRED`, `RELEASED`, but only `ACTIVE` and `CONSUMED` transitions were found in production code.
- On-site payment confirmation creates a patient, a payment row, and a `CONFIRMED` appointment in the request transaction.
- Online payment initiates a provider payment and later creates a `CONFIRMED` appointment after a successful callback if the hold is still active.
- Patient view/cancel/reschedule uses an opaque random capability token; only its SHA-256 hash is persisted.
- Patient cancellation/rescheduling has a configurable default 24-hour cutoff.
- Audit/outbox records are written for appointment lifecycle events.

**NEXT GEN CARE incompatibility:** no request/pending-review/human-validation state or transition is implemented. The portal must not label the existing direct-confirm flow as a human-validated request.

### Notifications

- Transactional outbox processing schedules email and optional WhatsApp confirmation/reminders.
- Email uses an SMTP port; WhatsApp has a provider adapter with a stub fallback when credentials are absent.
- Delivery rows contain the recipient address/phone, status, attempts, error, and schedule.
- Retry/backoff and terminal dead-letter handling exist in source.

Provider choices already embedded in this separate appointment repository do not authorize reusing those providers for the NEXT GEN CARE portal.

## Security

### Observed controls

- Stateless bearer JWT for administrative API; role checks for `ADMIN`, `NURSE`, and `STAFF`.
- HMAC-SHA256 secret length validation; access-token expiry; opaque single-use hashed refresh tokens.
- BCrypt password hashing.
- Token-capability patient access with plaintext tokens not persisted.
- Server-side authorization and recent organization-scoping checks on principal admin reads/writes.
- Per-IP Redis rate limits on availability/catalog, hold, confirm, patient cancel/reschedule, and payment webhook.
- RFC 9457-style errors and correlation IDs.
- Non-root runtime users in both Dockerfiles.

### Gaps and risks

| Gap                                    | Evidence and impact                                                                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin MFA absent                       | No MFA/TOTP/WebAuthn implementation found; this does not meet the portal contract's privileged-user baseline.                                                                            |
| Login/refresh/admin rate limits absent | `RateLimitingFilter` explicitly states authentication and admin categories are not enforced. Brute-force and authenticated abuse protection remain incomplete.                           |
| Spoofable client-IP source             | The limiter trusts the first `X-Forwarded-For` value with no trusted-proxy validation found; direct or misconfigured ingress access can bypass/pervert buckets.                          |
| OpenAPI auth absent                    | Consumers cannot generate correct authenticated clients from the export.                                                                                                                 |
| Capability token in URL                | Ingress/CDN access logs can capture the token. A runbook describes required masking, but no controller-level ingress configuration proving masking was found.                            |
| User-supplied correlation ID           | `X-Trace-Id` is accepted without observed length/character validation; structured logging reduces injection risk but unbounded attacker-controlled values remain a telemetry-abuse risk. |
| Secret lifecycle unproven              | Secrets are injected through environment/Kubernetes Secret references. No external secrets controller, rotation evidence, or production secret store was found.                          |
| Encryption at rest unproven            | PostgreSQL/PVC manifests do not prove volume/database encryption or key rotation.                                                                                                        |
| No network policies                    | No Kubernetes `NetworkPolicy` was found.                                                                                                                                                 |
| Supply-chain gaps                      | CodeQL and Dependabot are configured, but no secret scan, SBOM generation, image scan, IaC scan, signature/provenance gate, or enforcement evidence was found.                           |

The targeted high-confidence credential scan returned no matching tracked file. Secret values were not printed. This is not a complete security audit.

## Privacy

### Personal and health-related fields

The platform stores patient first/last name, email, optional phone, optional home address, organization link, appointment/service/location/nurse identifiers, schedule times, mode, payment metadata, notification recipients, and audit snapshots/reasons. Home booking also processes coordinates for service-area checking, although the hold table stores only the resulting location/mode, not coordinates.

Service-specific booking questions exist in the catalog, but no answer persistence is implemented. The current confirm DTO omits answers.

The repository states that it does not store clinical records. Nevertheless, appointment and home-care scheduling data associated with an identifiable patient can be health-related/special-category data in the NEXT GEN CARE context; qualified legal review is required.

### Retention, deletion, and export

- A retention job exists but defaults to disabled.
- When enabled, it anonymizes the patient row only for terminal appointments older than 30 days.
- It does not anonymize notification recipient copies; the repository risk register acknowledges this gap.
- Financial/audit retention is configured as a placeholder but not implemented.
- No patient self-service export/deletion workflow was found.
- Audit rows are intended to be immutable, creating an unresolved retention tension.

### Logging

Application configuration enables structured logging and source comments prohibit patient bodies. A targeted source scan found logs of patient and appointment UUIDs in the retention job and refund-error path. Linkable identifiers are still personal data/pseudonymous data; a telemetry data-classification and redaction decision is required. No runtime log sample was inspected.

No DPIA, lawful-basis approval, Article 9 condition, processor register, retention approval, or data-subject workflow acceptance was found. Technical mechanisms must not be described as GDPR compliance.

## Persistence

| Area        | Observed evidence                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database    | PostgreSQL with Flyway migrations V1-V16; Hibernate schema mode `validate`                                                                                          |
| Ownership   | Appointment service owns its schema in one database; organization identifiers are present on core admin-visible patient/payment/notification entities after V14-V16 |
| Consistency | Transactions, advisory locks, optimistic versioning for appointments, GiST exclusion constraints                                                                    |
| Redis       | Rate limiting only in source; non-authoritative and ephemeral in Kubernetes                                                                                         |
| Migrations  | Automatic on backend startup; no separately observable migration Job                                                                                                |
| Backups     | Daily/weekly logical dumps plus WAL archiving manifests; same-cluster PVCs                                                                                          |
| Restore     | Runbook and SQL verification script exist; no recorded restore execution result was found                                                                           |
| Encryption  | TLS and at-rest encryption are not established by repository evidence                                                                                               |

The restore documentation explicitly states that logical dumps cannot use the archived WAL for point-in-time recovery. Practical repository-designed RPO is therefore up to approximately 24 hours, not the proposed minutes-level objective. Backups share the cluster failure domain.

## Quality

| Test/control              | Observed state                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Java tests                | 66 `*Test.java` files                                                                                                          |
| Unit tests                | Domain/application tests across major modules                                                                                  |
| Integration tests         | PostgreSQL 17 and Redis 7 Testcontainers base; concurrency and outbox integration classes present                              |
| E2E tests                 | Two Spring/MockMvc classes under `backend/src/test/.../e2e` for booking confirmation and payment webhook                       |
| Concurrency               | Same-slot hold test and reschedule concurrency test present                                                                    |
| Architecture              | ArchUnit fitness test present                                                                                                  |
| API/contract              | Error-handler tests exist, but no OpenAPI snapshot, breaking-change, schema-compatibility, or consumer contract test was found |
| Coverage                  | No JaCoCo/coverage gate was found                                                                                              |
| Admin frontend            | CI lint/build only; zero local `*.test.*`/`*.spec.*` files found                                                               |
| Browser E2E/accessibility | No Playwright/Cypress/browser accessibility suite found                                                                        |

No tests were executed during this Phase 0 inspection. Historical documentation saying CI was green is not a current test result.

## Delivery

- Backend CI runs `./mvnw --batch-mode clean verify` and then a no-push Docker build.
- Admin CI runs `npm ci`, lint, build/type-check, and a no-push Docker build.
- CodeQL analyzes Java and JavaScript/TypeScript, but SARIF Security-tab upload is disabled pending an external repository decision; results are retained as artifacts.
- Dependabot is configured weekly for Maven, npm, and GitHub Actions.
- No registry push, immutable digest promotion, GitOps reconciliation, deployment, or environment promotion workflow exists.
- Plain Kubernetes YAML is under the appointment repository; no Helm chart or Argo CD definition was found.
- No Taskfile exists.
- The manifests use mutable `:latest` application image placeholders.

## Operations

### Observed

- Actuator health, liveness, readiness, info, and Prometheus endpoints.
- Structured JSON logs and correlation IDs.
- Business metrics for booking, scheduling, payments, notifications, retention, and rate limiting.
- Five Grafana dashboard ConfigMaps.
- Kubernetes readiness/liveness probes and resource requests/limits.
- Backup and restore runbooks.

### Not evidenced

- OpenTelemetry distributed tracing/exporter.
- Alert rules or an Alertmanager configuration.
- Accepted SLOs/SLIs and error-budget policy.
- Certificate, dependency-degradation, rollback, or incident-response runbooks covering all Master Contract scenarios.
- Actual monitoring stack installation or dashboard import.
- Restore drill evidence.
- Production/staging health evidence.

Repository configuration proves intended instrumentation, not a running or monitored service.

## Tenancy

- The model contains organizations and organization-scoped principals/entities.
- Recent migrations add `organization_id` to patients, payments, and notification requests; admin controllers/services contain organization checks.
- Public service/location endpoints select the first organization in the database and expose no tenant key or host-to-tenant mapping.
- Availability and holds derive organization from the selected service/location rather than an explicit tenant boundary.
- No quotas, tenant-specific configuration boundary at ingress, row-level security, database-per-tenant isolation, or multi-tenant operational controls were found.

The existing API is therefore suitable only for its documented single-organization public deployment assumption unless a tenant-routing decision is made. The NEXT GEN CARE adapter must pin the intended organization explicitly and must not rely on database row ordering.

## Compatibility: implementation versus OpenAPI and NEXT GEN CARE

| Severity | Mismatch                                            | Evidence                                                                                                        | Required disposition before integration                                                                      |
| -------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Critical | No human validation states                          | `AppointmentStatus` and `AppointmentService` create `CONFIRMED` directly                                        | Human decision and accepted API/workflow change; portal must not fake confirmation semantics                 |
| Critical | Expired `ACTIVE` holds can remain constraint-active | V4 exclusion predicate plus no production expiry transition found                                               | Fix and add real-PostgreSQL TTL-expiry/rebooking test in the appointment repository under separate authority |
| High     | Wrong confirmation address schema                   | Duplicate simple-name `PatientAddress`; export resolves to coordinate fields                                    | Give schemas unique explicit names and contract-test the generated document                                  |
| High     | Auth missing from contract                          | Empty `securitySchemes`, empty operation security; source requires JWT/RBAC                                     | Add bearer scheme and operation security annotations/configuration                                           |
| High     | Status/error contract omitted                       | Every exported operation lists only `200`; source returns other success and problem statuses                    | Annotate success/error responses and reusable RFC 9457 schema                                                |
| High     | Contract untracked/unpinned                         | Only untracked runtime export exists                                                                            | Commit/accept a versioned contract and digest; add breaking-change checks                                    |
| High     | Capability token log exposure                       | Token in URL; masking only documented as a manual controller task                                               | Demonstrate ingress/CDN redaction before public exposure                                                     |
| Medium   | Public tenant selection ambiguous                   | Services/locations choose first organization                                                                    | Define explicit organization binding for the portal adapter                                                  |
| Medium   | API docs drift                                      | Architecture table lists filters, service answers, pagination/error codes not consistently implemented/exported | Reconcile code, OpenAPI, and documentation                                                                   |
| Medium   | Idempotency-row expiry not enforced                 | 24-hour `expires_at` stored; no cleanup or expiry filter found                                                  | Define purge/reuse behavior and tests                                                                        |
| Medium   | No client resilience contract                       | No declared server timeout, retry, correlation, or compatibility policy in OpenAPI                              | Define adapter timeouts, no unsafe retries, error normalization, and circuit behavior by ADR                 |

## Integration recommendation for Phase 0 review

Do not integrate the public portal directly with this export. Prepare a server-side anti-corruption adapter only after:

1. the Human Engineering Authority accepts a versioned OpenAPI contract;
2. human-validation semantics are resolved;
3. the expired-hold database defect is corrected and tested under separate appointment-repository authorization;
4. schema/auth/status discrepancies are corrected;
5. the intended organization binding and production endpoint are approved;
6. privacy, retention, logging, ingress-token redaction, and DPIA questions receive qualified review.

The adapter should preserve client-generated idempotency keys, apply explicit timeouts, avoid retrying mutations unless the key and contract make it safe, normalize external errors, propagate a validated correlation ID, and never log request/response bodies containing patient data.
