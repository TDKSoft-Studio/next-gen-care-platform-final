# Phase 0 Repository Inventory

**Evidence snapshot:** 2026-08-29, Europe/Brussels  
**Mode:** read-only discovery outside this repository's Phase 0 documentation  
**Authority:** `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md` and `AGENTS.md`

## Scope and repository boundaries

| Logical area                        | Observed path                                             | Observed state                                                                                                                                                                                                                                                            | Evidence                                                                |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| NEXT GEN CARE public platform       | `/home/hkengne/projects/next-gen-care-platform`           | Phase 0 starter pack only. No application source, manifest, lockfile, CI workflow, test configuration, container definition, or deployable artifact was found. The `.git` directory exists but is empty, so Git commands report that this is not a repository.            | Root file inventory; empty `.git`; failed `git status`/`git log`.       |
| Dedicated infrastructure repository | `/home/hkengne/projects/next-gen-care-infra`              | Empty directory. No Git metadata, Helm chart, GitOps definition, IaC, environment overlay, runbook, or cluster evidence was found.                                                                                                                                        | `find` inventory returned the directory itself only; `NO_GIT_METADATA`. |
| Existing appointment platform       | `/home/hkengne/projects/nurse-appointment-scheduling-api` | Git repository on `main`, tracking `origin/main`. Contains a Spring Boot backend, a Next.js administration frontend, PostgreSQL migrations, GitHub Actions, Dockerfiles, local Compose, plain Kubernetes YAML, architecture records, tests, and operations documentation. | `git status`, `git log`, repository file inventory.                     |

## Working-tree safety

The appointment repository was already dirty before this Phase 0 documentation work:

- `CLAUDE.md` is modified;
- `nurse-appointment-api.json` is untracked.

These changes belong to the user and were not modified. The OpenAPI JSON was inspected in place because it is the only concrete contract artifact found, but its untracked state is explicitly treated as a contract-governance gap.

The platform root is not a functional Git repository, so a root diff cannot prove ownership or provide a clean baseline. Phase 0 documentation files are therefore listed explicitly in the final report.

## Evidence coverage

| Required evidence       | Public platform                                               | Infrastructure repository | Appointment repository                                                                                                            |
| ----------------------- | ------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Repository instructions | `AGENTS.md`, Master Contract, Phase 0 trigger read completely | None found                | Root `CLAUDE.md`; nested admin frontend `AGENTS.md` and `CLAUDE.md` read completely                                               |
| Manifests and lockfiles | None                                                          | None                      | `backend/pom.xml`, Maven wrapper 3.3.4 / Maven 3.9.9, `admin-frontend/package.json`, `package-lock.json`                          |
| CI workflows            | None                                                          | None                      | Backend CI, admin frontend CI, CodeQL workflow, Dependabot configuration                                                          |
| Containers              | None                                                          | None                      | Backend and admin frontend multi-stage Dockerfiles; local `docker-compose.yml`                                                    |
| Helm / GitOps / IaC     | None                                                          | None                      | No Helm, Argo CD, Kustomize, Terraform/OpenTofu, or equivalent definitions found                                                  |
| Kubernetes              | None                                                          | None                      | Plain YAML for API, admin frontend, PostgreSQL, Redis, ingress, dashboards, and backups, co-located in the appointment repository |
| Migrations              | None                                                          | None                      | Flyway V1-V16 inspected                                                                                                           |
| Tests                   | None                                                          | None                      | 66 Java test classes, including two `e2e` classes and PostgreSQL/Redis Testcontainers support; no admin frontend test files found |
| OpenAPI                 | None                                                          | None                      | Runtime-generated `/v3/api-docs`; untracked `nurse-appointment-api.json` inspected and hashed                                     |
| Operations              | None                                                          | None                      | Kubernetes README, backup README, restore runbook, health/metrics configuration, Grafana dashboard ConfigMaps                     |

## Observed delivery and topology constraints

1. No NEXT GEN CARE public application exists in the inspected workspace.
2. The dedicated infrastructure repository is empty.
3. The appointment repository contains manual, single-environment Kubernetes quick-start YAML rather than the separate Helm/Argo CD/GitOps repository required by the Master Contract.
4. Appointment images use mutable `:latest` placeholders in the manifests, and the CI workflows build but do not push or deploy images.
5. No evidence of a development/staging/production environment model was found.
6. No cluster was queried and no deployment was performed. Repository manifests prove intent only, not actual runtime state.

## Sensitive-data inspection boundary

A targeted, read-only scan found no high-confidence private-key/API-token pattern and no SQL seed loading patient or appointment records. Values from configuration lines whose names indicated passwords, secrets, tokens, keys, or credentials were redacted from command output. This is evidence for the inspected files and patterns only; it is not a certification that the repositories contain no sensitive material.

No real patient/health record was observed. Synthetic test identities under example domains were present in tests.

## Limitations and unresolved inputs

- Approved primary public domain: not provided.
- Public contact details: not provided.
- Exact home-care service area: not approved; only configurable appointment-API fields exist.
- Launch services, prices, and approved INAMI content: not provided.
- Production sender domain and recipient routing: not provided.
- Final French and Dutch content owners: not provided.
- Actual cluster conventions and current cluster state: not available in repository evidence.
- Current remote CI status and artifacts: not queried; no test result is inferred from workflow files or historical documentation.
