# Knowledge base for agentic work

Date: 2026-09-01

This directory is the high-signal entry point for agents and maintainers who
need to understand this repository quickly and safely.

Its purpose is not to repeat the full engineering contract. It groups the
minimum set of stable references that let an agent:

- identify the right prompt for the current runtime;
- understand the repository boundaries;
- locate the deployment contract;
- find the operational gates and reports;
- avoid inventing values that belong in a different contract.

## How an agent should use this knowledge base

1. Read the root contract and the repository instructions first:
   - `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
   - `AGENTS.md`
   - `CLAUDE.md`
2. Use the specialized prompt for the active agent runtime:
   - `docs/prompts/codex/`
   - `docs/prompts/claude/`
3. Read the contract or document that matches the task:
   - architecture
   - deployment contract
   - operations
   - reports
   - compliance
4. Do not guess runtime values, secrets, ports, image tags, health checks,
   namespaces, ingress rules, or resource sizing.

## Repository map

| Area                                      | What it contains                                                            | Why it matters                                 |
| ----------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------- |
| `docs/architecture/`                      | system context, container model, bounded contexts, data flows, threat model | architectural source of truth                  |
| `docs/architecture/adr/`                  | decision records and decision boundaries                                    | explains what was approved and why             |
| `docs/application-deployment-contract.md` | normalized deployment profile schema                                        | contract consumed by the deployment repository |
| `docs/contracts/`                         | example application profiles and contract examples                          | machine-readable contract inputs               |
| `docs/discovery/`                         | inventory, audits, discovery evidence                                       | historical facts and evidence snapshots        |
| `docs/operations/`                        | development, quality gates, observability and operational procedures        | repeatable operational behavior                |
| `docs/prompts/codex/`                     | Codex-specific prompt entry points and starter pack                         | agent-specific bootstrap                       |
| `docs/prompts/claude/`                    | Claude Code-specific prompt entry points and starter pack                   | agent-specific bootstrap                       |
| `docs/reports/`                           | phase reports and validation evidence                                       | execution trace and human review artifacts     |

## Deployment handoff rule

Before the infrastructure repository deploys this application, it must read:

- `docs/application-deployment-contract.md`
- `docs/contracts/application-profile.example.yaml`
- the relevant application repository instructions

If the contract is missing, incomplete, ambiguous, obsolete, or contradictory,
deployment must stop until the application repository updates its contract.

## Operational map

- Local development contract: `docs/operations/DEVELOPMENT.md`
- Quality gates: `docs/operations/QUALITY-GATES.md`
- Deployment context: `docs/architecture/DEPLOYMENT-CONTEXT.md`
- Repository inventory: `docs/discovery/REPOSITORY_INVENTORY.md`
- Phase and migration evidence: `docs/reports/`

## Agent-routing map

| Runtime     | Root adapter | Prompt directory       |
| ----------- | ------------ | ---------------------- |
| Codex       | `AGENTS.md`  | `docs/prompts/codex/`  |
| Claude Code | `CLAUDE.md`  | `docs/prompts/claude/` |

The root adapters stay thin. They point to the authoritative engineering
contract and to the correct runtime-specific prompt set.

## Safety rules

- Never create deployment inputs from assumptions.
- Never modify the application repository from the infrastructure repository.
- Never treat green tests as a substitute for a deployment contract.
- Never skip the approval gate when a contract, release, or deployment decision
  requires human validation.

## Recommended reading order for a deployment task

1. `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
2. `AGENTS.md` or `CLAUDE.md`
3. `docs/application-deployment-contract.md`
4. `docs/contracts/application-profile.example.yaml`
5. `docs/operations/QUALITY-GATES.md`
6. `docs/architecture/DEPLOYMENT-CONTEXT.md`
7. `docs/reports/`

That order gives an agent enough context to operate without inventing runtime
values or deployment assumptions.
