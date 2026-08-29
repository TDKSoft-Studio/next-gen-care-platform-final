# Quality gates and local CI parity — Phase 1

## Gate map

| Capability               | Local Task                                    | CI evidence path               | Phase 1 behavior                                                                      |
| ------------------------ | --------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| Format                   | `task format:check`                           | primary CI                     | Prettier check                                                                        |
| Lint / boundaries        | `task lint`                                   | primary CI                     | Next/TypeScript/security lint plus import-boundary fitness function                   |
| Type checking            | `task typecheck`                              | primary CI                     | Strict TypeScript across workspaces                                                   |
| Unit tests               | `task test:unit`                              | primary CI                     | Localization, UI, security-header, and telemetry policies                             |
| Integration tests        | `task test:integration`                       | primary CI                     | Web/package wiring and health responses                                               |
| Contract compatibility   | `task test:contract`                          | primary CI                     | Explicit not-applicable Phase 1 gate; fails if a generated appointment client appears |
| Accessibility automation | `task test:a11y`                              | primary CI                     | axe-core component composition                                                        |
| E2E                      | `task test:e2e`                               | browser CI                     | FR/NL negotiation, language switch, keyboard skip link, axe browser scan              |
| Secret scan              | `task security:secrets`                       | primary CI                     | High-confidence local patterns without printing values                                |
| SAST                     | `task security:sast`                          | primary CI and CodeQL          | ESLint security baseline locally; CodeQL in GitHub                                    |
| Dependency audit         | `task security:dependencies`                  | supply-chain CI                | npm advisory service; requires network                                                |
| SBOM                     | `task security:sbom`                          | supply-chain CI artifact       | CycloneDX 1.6 JSON under ignored `.artifacts`                                         |
| Performance              | `task performance`                            | primary CI after build         | Gzip JS/CSS foundation budgets                                                        |
| Container build/scan     | `task container:build`, `task container:scan` | container CI                   | Docker build plus Trivy HIGH/CRITICAL fixed-vulnerability gate                        |
| Helm lint/template       | `task infra:helm`                             | infrastructure repository only | Explicitly not applicable here; infrastructure repo remains uninitialized             |

## Parity definition

`task ci` mirrors the provider-independent primary CI job. `task ci:extended` adds network, SBOM, and browser gates. Container commands are identical locally and in their CI job but require Docker/Trivy. The infrastructure repository must own Helm parity once its creation is authorized.

A `NOT_APPLICABLE_PHASE_1` contract result is a recorded phase-gate status, not a passing compatibility test. Automated accessibility results are necessary evidence only and never replace keyboard/screen-reader/manual expert review.

## Performance budget method

`PERFORMANCE_BUDGETS.json` caps the aggregate gzip size of App Router JavaScript and CSS emitted by the Phase 1 build. This protects the empty foundation from unbounded regression. It is not Core Web Vitals evidence; representative 75th-percentile journey measurements must replace or supplement it in Phase 2 and before release.
