# Application Deployment Contract — pointer

The authoritative application deployment contract for this repository now lives at:

- [`docs/application-deployment-contract.md`](docs/application-deployment-contract.md)

with a machine-readable example profile at:

- [`docs/contracts/application-profile.example.yaml`](docs/contracts/application-profile.example.yaml)

Use those as the source of truth for the infrastructure handoff. The
infrastructure repository (`next-gen-care-infra`) consumes the contract and must
not invent runtime values that the contract does not state. If the contract is
missing, incomplete, ambiguous, obsolete, or contradictory, deployment stops
until this repository updates it (see
[`docs/knowledge-base/README.md`](docs/knowledge-base/README.md) → _Deployment
handoff rule_).

> This file previously held the full contract (v1.0, 2026-09-01). That content
> was promoted, refreshed, and superseded by `docs/application-deployment-contract.md`
> (v1.1, 2026-09-02).
