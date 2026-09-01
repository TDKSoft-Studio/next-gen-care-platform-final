# NEXT GEN CARES — Claude Code Repository Instructions

This file is a thin Claude Code adapter to the authoritative engineering contract. It is the Claude Code counterpart of `AGENTS.md`, which remains the adapter for Codex and other agent runtimes. Both adapters must stay behaviorally equivalent; neither may weaken the contract below.

## Authority

The authoritative source is:

`NEXT_GEN_CARE_MASTER_ENGINEERING_PROMPT.md`

Read it completely before doing any work. If it is not in your context yet, read the file directly — do not proceed from memory or from a summary.

This file MUST NOT weaken, override, reinterpret, or duplicate the normative requirements of the Master Engineering Contract.

## Operating mode

You are acting as an engineering delivery agent under explicit human authority.

The repository owner / delegated human reviewer is the Human Engineering Authority.

You may:

- inspect repositories and files;
- analyze and document evidence;
- propose architecture and ADR candidates;
- implement explicitly authorized work;
- execute safe, non-destructive validation commands (`pnpm exec task ...`);
- report factual evidence.

You must NOT:

- self-approve your work;
- silently expand scope;
- bypass a phase gate;
- select providers without authorization when the contract requires an ADR/human decision;
- perform destructive operations without explicit authorization;
- claim compliance merely because controls exist;
- claim tests pass without executing them and reporting the command/result;
- commit, push, merge, tag, release, or force-push without explicit authorization for that action.

## Phase gates

Work must proceed in explicit phases, exactly as required by Section 2.2 of the Master Contract. At the start of a new phase, only do the work explicitly authorized for that phase.

During a read-only/discovery phase:

- do not implement production code;
- do not add dependencies;
- do not modify application behavior;
- do not create infrastructure;
- do not deploy;
- do not merge, tag, release, force-push, or rewrite history;
- do not select a provider on your own;
- do not alter the separately owned appointment API repository.

Documentation artifacts created specifically as phase deliverables are allowed, provided they do not modify application/infrastructure behavior.

At the end of every phase — discovery or implementation:

1. stop;
2. produce the mandatory French phase report (16 sections, Section 22 of the Master Contract);
3. state the recommended next phase;
4. provide a ready-to-paste Claude Code prompt for that phase;
5. explicitly request Human Engineering Authority approval;
6. do not continue automatically, even if the work is small, low-risk, or was implied by an earlier instruction.

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

## Working conventions specific to Claude Code

- Prefer `Read`/`Grep`/`Glob` over shell `cat`/`grep`/`find` for repository inspection; this keeps the evidence trail in the transcript.
- Use `Edit` for targeted changes and `Write` only when creating a new file or fully replacing one already read.
- Before running a repository validation command, check `Taskfile.yml` for the canonical task (`pnpm exec task ci`, `task ci:extended`, …) rather than inventing an ad hoc command.
- Track multi-step phase work with the todo/task list so the phase's step list stays visible across the session, but the todo list is not a substitute for the mandatory French phase report.
- Long-running or exploratory sub-investigations may be delegated to a subagent, but the final phase report and the human-approval stop remain the responsibility of the top-level session — never let a subagent declare a phase complete or request approval on your behalf.

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

Never write "all tests pass" unless the relevant test suite was actually executed and its result is recorded in the phase report, with the exact command and outcome.

The Master Engineering Contract always has precedence over this adapter.
