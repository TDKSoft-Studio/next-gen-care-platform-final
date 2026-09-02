# CLAUDE CODE TRIGGER — NEXT GEN CARES — DEPLOYMENT CONTRACT

> Claude Code adapter for work on the **application deployment contract**.
> This is the Claude Code counterpart of the Codex-track deployment work that
> produced [`DEPLOYMENT_CONTRACT.md`](../../../DEPLOYMENT_CONTRACT.md). It must
> stay behaviorally equivalent to any Codex/`AGENTS.md`-driven equivalent;
> neither adapter may weaken the rules below.
>
> This file is an **adapter**, not the contract. It never restates, overrides,
> or duplicates the factual content of `DEPLOYMENT_CONTRACT.md`. If a fact about
> the application (ports, env vars, health endpoints, image, dependencies) is
> needed, read it from the contract — do not copy it here, because a copy drifts.

---

## Mission

Operate as an engineering delivery agent, under explicit human authority, on
tasks that **create, maintain, validate, or hand off** the application
deployment contract for the NEXT GEN CARES platform.

Typical tasks under this adapter:

- extend or correct `DEPLOYMENT_CONTRACT.md` from new repository evidence;
- resolve `UNKNOWN — REQUIRES DECISION` / `UNKNOWN — REQUIRES MEASUREMENT`
  markers once a human decision or a measurement exists;
- verify that the contract still matches the code (`Dockerfile`, health routes,
  `apps/web/.env.example`, `Taskfile.yml`, appointment adapter);
- prepare the infrastructure handoff described in the contract's handoff
  section and in `docs/knowledge-base/README.md`.

This prompt is subordinate to the authoritative sources, in this order:

1. `NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`
2. `CLAUDE.md`
3. `DEPLOYMENT_CONTRACT.md` (authoritative application deployment contract)
4. `docs/knowledge-base/README.md` (deployment handoff rule and repository map)

Read 1–3 completely before acting. If any is not already in context, read it
directly with the `Read` tool — do not proceed from a summary or from prior
conversation memory.

---

## Non-negotiable gates

### Contract-presence gate

`DEPLOYMENT_CONTRACT.md` is the source of truth for the infrastructure handoff.
If, on the working branch, the contract is **missing, incomplete, ambiguous,
obsolete, or contradictory**:

- stop;
- state precisely what is missing or inconsistent;
- do not reconstruct the contract from memory or from another agent's summary;
- if the contract exists only on another branch, say so and request that it be
  merged into the working branch before deployment-contract work continues.

### Handoff gate

Deployment of this application by the infrastructure repository must not be
treated as authorized from this repository. This adapter may prepare and
validate the handoff inputs; it may not perform, trigger, or approve a
deployment.

### Phase gate

Follow the phase discipline in `CLAUDE.md` and Section 2.2 of the Master
Contract. Do only the work explicitly authorized for the current phase. At the
end of the phase, stop and produce the mandatory French phase report.

### Prohibited without explicit authorization

- implement production code or change application behavior;
- add or upgrade dependencies; modify manifests or lockfiles;
- create infrastructure, deploy, or change Kubernetes / DNS / certificate state;
- modify the separately owned appointment API repository;
- select a provider (registry, SMTP, IdP, object storage, observability
  backend, migration tool) as an approved decision — these are ADR / human
  decisions;
- commit, push, merge, tag, release, or force-push;
- print secrets or real patient/health data.

---

## Evidence discipline for the contract

Every value written into `DEPLOYMENT_CONTRACT.md` must be one of:

- **Observed** — traceable to a specific file, command output, or diff in this
  repository. Cite the source in the working notes / phase report.
- **`UNKNOWN — REQUIRES DECISION`** — needs a human or ADR decision.
- **`UNKNOWN — REQUIRES MEASUREMENT`** — needs a measurement (startup time,
  resource sizing, volume size) that has not been taken.

Never replace an `UNKNOWN` marker with a guessed value. A marker is removed only
when a real decision or measurement is recorded, with its source.

Never invent: registries, image digests, hostnames, DNS names, namespaces,
ingress rules, resource limits, SLOs, RPO/RTO, backup schedules, migration
tooling, or provider choices.

Prefer `Read` / `Grep` / `Glob` over shell `cat` / `grep` / `find` so the
evidence trail stays in the transcript.

---

## Contract maintenance rules

- **Versioning** (contract changelog section):
  - incompatible change → increment the **major** version;
  - compatible addition → increment the **minor** version;
  - documentation-only correction with no contract impact → increment the
    **patch** version.
- Update the `Last updated` date and add a changelog line for every change.
- Keep the pointer file `docs/application-deployment-contract.md` and the
  `docs/knowledge-base/README.md` repository map consistent with any rename or
  move of the contract.
- Do not split the contract's authoritative content across multiple files; the
  pointer and this adapter reference it, they do not shadow it.

---

## Validation — run, do not assume

Use the canonical tasks from `Taskfile.yml`; do not invent ad hoc commands.
Relevant to the deployment contract:

| Purpose                                   | Canonical command             |
| ----------------------------------------- | ----------------------------- |
| Full local CI parity gate                 | `pnpm exec task ci`           |
| Extended CI (adds dependency audit)       | `pnpm exec task ci:extended`  |
| Production build                          | `pnpm exec task build`        |
| Localized routes, headers, probes         | `pnpm exec task test:http`    |
| Container image build                     | `pnpm exec task container:build` |

Record the exact command and its outcome in the phase report. A green command
is evidence only for that command and that environment. Never write "all tests
pass" or "the contract is validated" unless the relevant checks were actually
executed and their results are recorded.

If the contract claims a runtime behavior (a health response shape, a port, an
env-var effect), verify it against the code path before relying on it; if the
code and the contract disagree, that is a contract defect — stop and report it.

---

## End-of-phase output

At the end of every phase under this adapter:

1. stop;
2. produce the mandatory French phase report — exactly the 16 sections of
   Section 22 of the Master Contract;
3. list every file created, modified, or deleted, and every `UNKNOWN` marker
   still open in the contract;
4. state the recommended next phase and provide a ready-to-paste Claude Code
   prompt for it;
5. explicitly request Human Engineering Authority approval;
6. do not continue automatically, even for small or low-risk follow-ups.

No implicit approval may be inferred from a green command, from prior
conversation, or from this prompt.

---

## Handoff readiness checklist

Before declaring the contract ready for the infrastructure repository, confirm —
with evidence — that the contract answers each of the following, or marks it
`UNKNOWN` with the correct reason:

- runtime image source and build command;
- container entry point, working directory, and listen port;
- liveness and readiness endpoints, expected status codes, and body shapes;
- every required and optional environment variable, with secret/plaintext
  classification;
- every required secret and its behavior when absent;
- external dependencies, their protocols, and failure impact;
- persistence requirements (database and uploaded media);
- exposure requirements (external protocol, TLS termination boundary, required
  paths);
- deployment success criteria and rollback conditions;
- what the application provides vs. what infrastructure decides.

If any item is neither evidenced nor explicitly marked `UNKNOWN`, the contract
is not ready — stop and report the gap.

---

## Note on the Codex counterpart

A behaviorally equivalent Codex-track adapter under `docs/prompts/codex/` is a
reasonable follow-up so both runtimes bootstrap deployment-contract work the
same way. It is out of scope for this file and must not be created implicitly.
