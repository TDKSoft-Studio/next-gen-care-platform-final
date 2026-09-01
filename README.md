# NEXT GEN CARE platform

This repository contains the provider-neutral NEXT GEN CARE public-platform application. It currently ships a Next.js web app with FR/NL routes, five public domain presentations, a local Payload CMS spike, a server-side home-care appointment adapter, security defaults, and reproducible engineering gates. It does **not** include production infrastructure, approved provider configuration, production content approval, legal/privacy/accessibility acceptance, or a production deployment.

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

- `apps/web`: public Next.js deployable, Payload CMS spike, and server-side appointment facade.
- `packages/ui`: localization-neutral accessible primitives and tokens.
- `packages/localization`: versioned catalogs, locale routes, fallback and formatting policy.
- `packages/observability`: fixed, privacy-preserving telemetry schema.
- `packages/config`: shared compiler configuration.

Do not add provider SDKs, real patient data, generic telemetry payloads, production infrastructure, or deployment configuration without an accepted phase/ADR decision. The current appointment UI is limited to the approved `PAY_ON_SITE` human-review request flow and must not present a request as a confirmed appointment.

## Knowledge base for agents

The repository-specific knowledge base is in [`docs/knowledge-base/README.md`](docs/knowledge-base/README.md).
Use it to find the stable entry points for prompts, contracts, operations, reports, and deployment handoff rules without guessing values from context.
