# CLAUDE CODE TRIGGER — NEXT GEN CARES — PHASE 0

> Claude Code counterpart of `docs/prompts/codex/PHASE_0_PROMPT.md`. Phase 0 has already
> been executed and approved for this repository (`docs/reports/PHASE-0-REPORT.md`).
> This file is kept as the reusable, canonical Phase-0 trigger for Claude
> Code — reuse it verbatim when bootstrapping a new NEXT GEN CARES-derived
> repository, or as a reference for how a phase trigger should read under
> `CLAUDE.md`.

## Mission

Begin **Phase 0 — Read-only discovery and architecture** for the NEXT GEN CARES public platform.

This prompt is subordinate to the authoritative:

`NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`

and to repository-specific instructions, especially:

`CLAUDE.md`

Read both completely before acting. If either file is not already in context, read it directly with the `Read` tool before doing anything else — do not proceed from a summary or from prior conversation memory.

---

## Non-negotiable gate

You are authorized to execute **Phase 0 only**.

Phase 0 is READ-ONLY DISCOVERY AND ARCHITECTURE.

Do NOT:

- implement production code;
- modify application behavior;
- add dependencies;
- modify package manifests or lockfiles;
- create infrastructure;
- deploy anything;
- change Kubernetes state;
- change DNS/certificates;
- modify databases;
- modify the appointment API repository;
- select a provider as an approved decision;
- merge/tag/release/force-push;
- rewrite history;
- use real patient data;
- print secrets.

You MAY create or update Phase 0 documentation artifacts required by the Master Contract.

If completing a requested discovery task would require a prohibited mutation, stop and report the blocker.

---

## Step 1 — Read instructions

Read completely, using the `Read` tool (not a shell `cat`, so the evidence trail stays in the transcript):

1. `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
2. `CLAUDE.md`
3. all applicable repository instruction files
4. application repository instructions
5. infrastructure repository instructions
6. appointment API repository instructions

Identify the actual repository boundaries and ownership.

Do not assume that the current repository contains all required repositories. If a referenced repository (e.g. the appointment API) is not attached to this session, say so explicitly rather than inventing its contents — request it be attached before making claims about it.

---

## Step 2 — Establish the evidence baseline

Inspect, read-only, using `Glob`/`Grep`/`Read` in preference to shell equivalents:

- repository structure;
- Git status and recent history where safe (`git log`, `git status` via Bash are fine — they are non-mutating);
- package manifests;
- lockfiles;
- source configuration;
- environment examples without exposing values;
- CI workflows;
- Docker/container definitions;
- Helm charts;
- Argo CD definitions;
- infrastructure-as-code;
- Kubernetes manifests;
- tests;
- migrations;
- OpenAPI/Swagger configuration and documents;
- documentation;
- security configuration;
- observability configuration.

Use commands that do not mutate state.

Before any command that might be destructive, privileged, network-mutating, or environment-changing, stop and request approval.

---

## Step 3 — Appointment API discovery

Inspect the existing appointment API in read-only mode.

Create:

`docs/discovery/APPOINTMENT_API_INVENTORY.md`

The inventory MUST cover:

| Area          | Required evidence                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Runtime       | languages, frameworks, package managers, exact versions                                            |
| Contract      | OpenAPI location/version, endpoints, schemas, errors, auth, idempotency                            |
| Domain        | patient, professional, schedule, availability, hold, booking, cancellation, notification semantics |
| Security      | authentication, authorization, roles, secret handling, rate limits, audit logs                     |
| Privacy       | health data fields, consent, retention, deletion, export, logging behavior                         |
| Persistence   | databases, migrations, ownership, encryption, backups                                              |
| Quality       | unit, integration, contract, E2E tests, coverage, known gaps                                       |
| Delivery      | local setup, CI, images, deployment, environments                                                  |
| Operations    | health endpoints, telemetry, alerts, SLOs, runbooks, recovery                                      |
| Tenancy       | tenant keys, isolation, quotas, configuration boundaries                                           |
| Compatibility | implementation vs OpenAPI mismatches                                                                |

Never print secrets.

If credentials or real patient data are discovered:

1. do not copy or expose them;
2. record only that sensitive material was detected;
3. stop and report the security blocker.

---

## Step 4 — Produce architecture schemas

Phase 0 MUST produce architecture diagrams.

Create or update:

`docs/architecture/`

At minimum:

1. `C4-CONTEXT.md`
2. `C4-CONTAINER.md`
3. `BOUNDED-CONTEXTS.md`
4. `CRITICAL-JOURNEYS.md`
5. `DATA-FLOWS.md`
6. `THREAT-MODEL.md`
7. `DEPLOYMENT-CONTEXT.md`
8. `MODULE-BOUNDARIES.md`
9. `ARCHITECTURE-OPTIONS.md`

Use Mermaid diagrams where appropriate.

The diagrams must be evidence-driven.

Separate:

- observed/current state;
- proposed target state;
- unresolved assumptions.

Never draw a proposed component as though it already exists.

---

## Step 5 — Architecture analysis

Evaluate the Master Contract baseline:

- modular monorepo;
- Next.js;
- conditional NestJS BFF;
- mature headless CMS;
- appointment API as separately owned service;
- anti-corruption layer;
- PostgreSQL for newly approved transactional data;
- separate infrastructure repository;
- Kubernetes;
- Helm;
- Argo CD;
- OpenTelemetry.

Do not install or select any of these merely because they appear in the contract.

For each relevant technology decision, create a proposed ADR using:

`docs/architecture/adr/ADR-TEMPLATE.md`

At minimum prepare ADR candidates for:

1. monorepo orchestration;
2. CMS;
3. appointment API integration;
4. form/lead storage and delivery;
5. administrator identity provider;
6. media storage;
7. email delivery;
8. analytics and consent;
9. secrets management;
10. backup/disaster recovery.

A provider can be recommended but is NOT selected or approved by the agent.

---

## Step 6 — Business bounded contexts

Map at least:

- Corporate Content;
- Home Care Booking Integration;
- Operating-Room Lead Intake;
- Well-Being Catalog and Enquiries;
- Travel and Team-Building Catalog;
- Health-Tech Portfolio and Leads;
- Localization;
- Content Governance;
- Identity and Access for administrators;
- Consent, Audit, and Compliance.

Explain ownership and dependencies.

Do not turn every bounded context into a microservice.

---

## Step 7 — Critical journeys

Create sequence diagrams and failure analysis for:

### Home care

- booking request;
- human validation;
- confirmation/rejection;
- cancellation;
- rescheduling;
- duplicate submission;
- external API timeout/failure.

### Operating-room

- hospital request;
- nurse/professional expression of interest.

### Well-being

- qualified enquiry.

### Travel

- reservation-interest form;
- package comparison without payment.

### Team building

- professional enquiry.

### Health-Tech

- consultation request.

Do not invent API operations.

---

## Step 8 — Data, privacy and threat analysis

Create:

- data classification;
- data-flow map;
- trust boundaries;
- threat model;
- privacy/control gaps;
- health-data handling risks;
- telemetry leakage risks;
- administrator security risks.

Treat the appointment workflow as processing special-category health data.

Identify:

- DPIA requirement/questions;
- lawful-basis questions;
- retention questions;
- processor/subprocessor questions;
- EU data residency questions;
- access/deletion/export questions.

Do not provide a legal approval. Mark these for qualified human review.

---

## Step 9 — MVP feasibility

Evaluate the release target against actual evidence.

Do NOT say it is feasible merely because a date is written in the contract.

Produce:

- critical path;
- known blockers;
- missing inputs;
- dependencies;
- risk-ranked work;
- smallest safe MVP if the full scope is not safely achievable;
- `GO`, `CONDITIONAL GO`, or `NO-GO` recommendation.

Required unresolved inputs from the contract include:

- approved primary domain: `nextgen-cares.org`;
- approved public contact email: `hello@nextgen-cares.org`;
- exact home-care service area;
- approved launch services/prices;
- approved INAMI information;
- appointment API repository/OpenAPI;
- application/infrastructure repository state;
- production email sender/routing;
- FR/NL content owners.

---

## Step 10 — Phase 0 report

Create the final report in French:

`docs/reports/PHASE-0-REPORT.md`

It MUST contain exactly these 16 sections:

1. **Résumé exécutif**
2. **Objectif et périmètre autorisé**
3. **Travaux réalisés**
4. **Fichiers créés, modifiés ou supprimés**
5. **Décisions et ADR concernés**
6. **Commandes exécutées**
7. **Tests, contrôles et résultats factuels**
8. **Sécurité, RGPD, accessibilité et conformité**
9. **Écarts, risques et dette explicitement acceptée**
10. **Éléments reportés hors périmètre**
11. **État du dépôt et du déploiement**
12. **Verdict : GO, CONDITIONAL GO, NO-GO ou BLOCKED**
13. **Suite recommandée et justification**
14. **Décisions humaines nécessaires**
15. **Prompt prêt à coller pour la phase suivante**
16. **Confirmation d'arrêt au gate humain**

Every factual claim must have evidence or be explicitly labelled as reasoning/assumption.

---

## Step 11 — Final verification

Before reporting completion:

- inspect all Phase 0 diffs;
- verify no production/application behavior was changed;
- verify no dependencies were added;
- verify no infrastructure was created;
- verify no deployment occurred;
- verify no secrets or patient data were exposed;
- verify all required architecture diagrams exist;
- verify all required ADR candidates exist;
- verify the appointment API inventory exists;
- verify the French report contains all 16 mandatory sections.

Do not claim "all tests pass" unless tests were actually executed.

---

## Step 12 — STOP

This is mandatory.

After producing the Phase 0 report:

STOP.

Do not begin Phase 1.

Do not implement anything further.

State clearly:

> Phase 0 is complete. I am waiting for explicit approval from the Human Engineering Authority before starting Phase 1.

Then provide:

- the Phase 0 verdict;
- the main blockers/risks;
- the recommended Phase 1;
- the ready-to-paste Phase 1 prompt.

No implicit approval may be inferred from a green command, prior conversation, or this prompt.
