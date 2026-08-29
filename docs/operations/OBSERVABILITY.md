# Observability baseline — Phase 1

## Implemented baseline

- `@next-gen-care/observability` exposes a fixed structured-log schema.
- Arbitrary attributes, request/response bodies, patient identifiers, contact identifiers, capability tokens, and free-text messages are not accepted.
- Trace IDs, when introduced at an HTTP boundary, must be exactly 32 lowercase hexadecimal characters.
- Next.js instrumentation emits one safe `application.started` record.
- `/health/live` and `/health/ready` return minimal, non-sensitive, non-cacheable responses.

The schema is compatible with later OpenTelemetry mapping, but no exporter/backend/provider is selected or configured. Metrics, distributed trace propagation, SLI dashboards, alerts, and production probes require observed deployment topology and human-approved operational decisions.

## Logging rule

Callers select an event name and attributes from the closed schema. Adding a field requires security/privacy review, a schema change, and a negative redaction test. Dynamic paths, UUIDs, email addresses, telephone numbers, addresses, form values, CMS bodies, and appointment payloads are prohibited.

## Initial signals for later implementation

The Master Contract requires public-site availability and latency, booking success, external dependency failure, lead delivery, and CMS publication/revalidation indicators. Only application startup/health can be meaningful in Phase 1 because those business dependencies do not yet exist. No SLO is claimed.
