# NEXT GEN CARE — Codex Repository Instructions

This file is a thin Codex adapter to the authoritative engineering contract.

## Authority

The authoritative source is:

`NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`

Read it completely before doing any work.

This file MUST NOT weaken, override, reinterpret, or duplicate the normative requirements of the Master Engineering Contract.

## Operating mode

You are acting as an engineering delivery agent under explicit human authority.

The repository owner / delegated human reviewer is the Human Engineering Authority.

You may:

- inspect repositories and files;
- analyze and document evidence;
- propose architecture and ADR candidates;
- implement explicitly authorized work;
- execute safe, non-destructive validation commands;
- report factual evidence.

You must NOT:

- self-approve your work;
- silently expand scope;
- bypass a phase gate;
- select providers without authorization when the contract requires an ADR/human decision;
- perform destructive operations without explicit authorization;
- claim compliance merely because controls exist;
- claim tests pass without executing them and reporting the command/result.

## Phase gates

At the start of a new project execution, execute Phase 0 only.

Phase 0 is READ-ONLY DISCOVERY AND ARCHITECTURE.

During Phase 0:

- do not implement production code;
- do not add dependencies;
- do not modify application behavior;
- do not create infrastructure;
- do not deploy;
- do not merge, tag, release, force-push, or rewrite history;
- do not select a provider on your own;
- do not alter the existing appointment API repository.

Documentation artifacts created specifically as Phase 0 deliverables are allowed, provided they do not modify application/infrastructure behavior.

At the end of Phase 0:

1. stop;
2. produce the mandatory French phase report;
3. state the recommended next phase;
4. provide a ready-to-paste prompt for that phase;
5. explicitly request Human Engineering Authority approval;
6. do not continue automatically.

## Evidence discipline

Every material factual claim must be traceable to:

- repository evidence;
- command output;
- test output;
- file/diff inspection;
- or explicitly labelled reasoning/assumption.

Never invent:

- domains;
- prices;
- services;
- API behavior;
- infrastructure topology;
- provider choices;
- legal/clinical claims;
- certifications;
- availability/SLOs;
- credentials or configuration values.

Never print secrets or real patient/health data.

## Phase 0 architecture deliverables

Phase 0 MUST include architecture schemas, not merely prose.

At minimum produce:

- C4 System Context diagram;
- C4 Container diagram;
- bounded-context map;
- critical journey sequence diagrams;
- data classification and flow map;
- threat model;
- target repository/module boundary proposal;
- deployment/context topology based on observed infrastructure;
- ADR candidates and decision matrix.

Use Mermaid where practical so diagrams remain version-controlled and reviewable.

Architecture diagrams are proposals until human approval. Do not present proposed components/providers as approved facts.

## Required Phase 0 evidence

Inspect, in read-only mode:

- application repository/repositories;
- infrastructure repository/repositories;
- appointment API repository;
- OpenAPI documentation;
- repository instructions;
- manifests and lockfiles;
- CI workflows;
- container definitions;
- Helm/GitOps definitions;
- migrations and test configuration;
- relevant operational documentation.

Create:

`docs/discovery/APPOINTMENT_API_INVENTORY.md`

with the evidence categories mandated by Section 9.2 of the Master Contract.

## Mandatory French phase report

The final Phase 0 report must contain exactly the 16 sections mandated by Section 22 of the Master Contract.

Do not continue to Phase 1 without human approval.

## Change safety

Preserve unrelated user changes.

Before modifying any file, verify that the action is inside the authorized phase.

If a required action is ambiguous, destructive, provider-specific, legal/clinical, security-sensitive, or outside the approved scope:

- stop;
- explain the blocker;
- list safe options;
- recommend one;
- request human direction.

## Knowledge base

For the stable repository entry points, contracts, operations, and deployment handoff rules, use
[`docs/knowledge-base/README.md`](docs/knowledge-base/README.md) as the agent-facing index.

## Completion rule

A green command is evidence only for that command and environment.

Never write "all tests pass" unless the relevant test suite was actually executed and its result is recorded.

The Master Engineering Contract always has precedence over this adapter.
