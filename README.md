# NEXT GEN CARE platform

This repository contains the provider-neutral application foundation approved for Phase 1. It currently ships a neutral FR/NL foundation page, accessible UI primitives, safe telemetry contracts, security defaults, and reproducible engineering gates. It does **not** yet publish business services, patient forms, CMS content, appointment integration, infrastructure, or a production deployment.

## Toolchain

- Node.js `24.20.0`
- pnpm `11.24.0` through Corepack
- Task `3.53.1` (available repository-locally after dependency installation)

The versions are exact by design. `task setup` only inspects the workstation and never installs or changes tools.

## Start locally

```bash
corepack enable
corepack install
pnpm install --frozen-lockfile
pnpm exec task setup
pnpm dev
```

Then open `http://localhost:3000/fr` or `http://localhost:3000/nl`. The root route negotiates French or Dutch from `Accept-Language`; unsupported languages use the documented French default and never render French strings under a Dutch route.

## Quality gates

```bash
pnpm exec task ci
```

The extended gate adds registry audit, SBOM generation, and browser tests:

```bash
pnpm exec task browser:install
pnpm exec task ci:extended
```

Container gates require Docker and Trivy. Infrastructure Helm gates belong to the separately authorized infrastructure repository. Exact status and parity are documented in `docs/operations/QUALITY-GATES.md`.

## Boundaries

- `apps/web`: public Next.js deployable and its server-side facade.
- `packages/ui`: localization-neutral accessible primitives and tokens.
- `packages/localization`: versioned catalogs, locale routes, fallback and formatting policy.
- `packages/observability`: fixed, privacy-preserving telemetry schema.
- `packages/config`: shared compiler configuration.

Do not add provider SDKs, appointment clients, patient data, or generic telemetry payloads without an accepted phase/ADR decision.
