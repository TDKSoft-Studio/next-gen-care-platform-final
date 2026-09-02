# Deployment and Infrastructure Context

**Status:** observed repository topology plus unapproved target proposal. No
cluster state was inspected. Updated 2026-09-02: the dedicated infrastructure
repository now exists and acts as the deployment controller (see below); its
internal structure has **not** been inspected from this repository.

The authoritative, machine-consumable handoff is
[`../application-deployment-contract.md`](../application-deployment-contract.md)
and [`../contracts/application-profile.example.yaml`](../contracts/application-profile.example.yaml).
This document only describes topology and boundaries.

## Observed appointment-repository topology

```mermaid
flowchart TB
    Internet["Internet"]
    Ingress["Ingress resource\nclass: nginx\nhosts: api.<domain>, admin.<domain>"]
    Cert["cert-manager ClusterIssuer\nname referenced: letsencrypt"]

    subgraph Namespace["namespace: nurse-scheduling"]
        API["Backend Deployment\n2 replicas\n:latest placeholder"]
        Admin["Admin Frontend Deployment\n2 replicas\n:latest placeholder"]
        PG["PostgreSQL 16 StatefulSet\n1 replica + PVC"]
        Redis["Redis 7 Deployment\n1 replica, no PVC"]
        Backup["Daily/weekly pg_dump + WAL archive\nsame-cluster PVC"]
        Dashboards["Grafana dashboard ConfigMaps"]
    end

    Internet --> Ingress
    Cert -. "annotation/reference only" .-> Ingress
    Ingress --> API
    Ingress --> Admin
    Admin --> API
    API --> PG
    API --> Redis
    PG --> Backup
    API -. "Prometheus scrape annotations" .-> Dashboards
```

Evidence is in `nurse-appointment-scheduling-api/k8s`. The manifests are explicitly described there as manual quick-start YAML. They do not prove an NGINX controller, cert-manager, Prometheus, Grafana, Loki, registry, DNS, certificates, secrets, volumes, or workloads actually exist.

## Observed delivery characteristics

| Area            | Evidence                                              | Gap against Master Contract                                                                |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Environments    | One namespace/topology; no overlays                   | Development/staging/production not modeled                                                 |
| Packaging       | Plain YAML; no Helm/Kustomize                         | No Helm lint/template path                                                                 |
| GitOps          | No Argo CD definitions                                | Production reconciliation path absent                                                      |
| Image promotion | CI builds only; manifests reference mutable `:latest` | No registry push, digest pin, provenance, promotion, or rollback identity                  |
| Migrations      | Flyway runs on API pod startup                        | Not separately observable; concurrent startup/migration and rollback policy require review |
| Database        | Single self-managed PostgreSQL instance               | No HA; version differs from test/local; encryption/managed backup unproven                 |
| Backups         | Same-cluster dumps/WAL plus runbook                   | Same failure domain; no restore result; effective RPO up to ~24h                           |
| Observability   | Metrics endpoint and dashboard ConfigMaps             | No alert rules, tracing backend, accepted SLOs, or installation evidence                   |
| Secrets         | Kubernetes Secret template, manual creation           | No approved secret manager, rotation, or audit evidence                                    |

## Dedicated infrastructure repository

`next-gen-care-infra` is a **separate repository** that now exists and acts as
the **deployment controller** for this application: it consumes
`docs/application-deployment-contract.md` (plus
`docs/contracts/application-profile.example.yaml` and the repository
instructions) and translates them into the target environment via Helm / GitOps
/ Argo CD. It is not authorized to invent runtime values that this application
repository has not stated.

The infrastructure repository's internal structure (its Helm chart, Argo CD
model, environment overlays, its recorded application profile) has **not** been
inspected from this repository, so no NEXT GEN CARE platform convention for those
is asserted here. ADR-0011 continues to govern the repository boundary:
application changes and infrastructure changes are not bundled, and
cross-repository contract versions must be explicit and reproducible.

Historical note: the Phase 0 inventory recorded this repository as empty with no
Git metadata; its creation was authorized subsequently, and the pre-deployment
control (`/ngc:prod-preflight`) run from the infrastructure side is what
triggered production of the application deployment contract.

## Proposed target topology

```mermaid
flowchart TB
    Internet["Internet"]
    Edge["Approved DNS / edge / ingress\nPROPOSED"]

    subgraph ExistingBoundary["Existing appointment service boundary"]
        Appointment["Appointment API\nexisting, contract remediation required"]
        AppointmentData[("Appointment-owned PostgreSQL")]
    end

    subgraph PortalBoundary["NEXT GEN CARE platform boundary — PROPOSED"]
        Web["Public Web + server facade"]
        CMS["Approved CMS candidate"]
        LeadData[("Approved non-medical lead store\nif selected")]
    end

    Identity["Approved admin identity"]
    Email["Approved email delivery"]
    Media["Approved media storage/CDN"]
    Obs["Approved logs/metrics/traces/alerts"]
    GitOps["Separate infra repository + Argo CD\nPROPOSED, not observed"]
    Secrets["Approved secrets management"]
    Backups["Encrypted off-failure-domain backups"]

    Internet --> Edge --> Web
    Web --> CMS
    Web --> Appointment
    Appointment --> AppointmentData
    Web --> LeadData
    Web --> Identity
    Web --> Email
    CMS --> Media
    Web --> Obs
    Appointment --> Obs
    GitOps -. "reconciles approved manifests" .-> PortalBoundary
    Secrets -. "injects least-privilege values" .-> PortalBoundary
    LeadData -.-> Backups
```

The target intentionally does not name a cloud, hosting, database, storage, identity, email, or analytics provider. It is a boundary proposal only.

## Environment proposal

| Environment | Purpose                              | Data rule                                                                              | Promotion rule                                             |
| ----------- | ------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Development | Local/integration development        | Synthetic only; isolated credentials                                                   | Developer/CI builds, no production endpoints               |
| Staging     | Production-representative acceptance | Synthetic or specifically approved anonymized dataset; no real patient data by default | Immutable candidate image and GitOps review                |
| Production  | Public service                       | Approved real data only under accepted privacy/security architecture                   | Explicit Human Engineering Authority release authorization |

Each environment needs separate configuration, secrets, domains, data stores, access, telemetry, and retention. Production images must be promoted by digest; configuration changes must be reviewable and reversible.

## Required infrastructure evidence before implementation/deployment

1. Human-approved repository boundary (ADR-0011) — satisfied; `next-gen-care-infra` exists as the separate deployment controller.
2. Existing cluster inventory or explicit statement that no cluster conventions exist.
3. Approved namespaces, ingress class, cert issuer, storage classes, network policies, pod-security posture, observability stack, and registry.
4. Approved secrets mechanism and key rotation.
5. Helm/GitOps structure for three environments and Argo CD ownership.
6. Database ownership, migrations, backup topology, RPO/RTO, restore drill, and rollback process.
7. DNS/domain and sender-domain decisions.
8. Capacity/SLO assumptions and cost envelope.

## Deployment stop conditions

No deployment may proceed while the application deployment contract is
incomplete (`docs/application-deployment-contract.md` Section 24 still lists open
decisions and contradictions that block production), providers are unapproved,
contracts/privacy are unresolved, or explicit production authority is absent.
This document's updates performed no `kubectl`, `helm`, `argocd`, DNS,
certificate, database, registry, or deployment mutation.
