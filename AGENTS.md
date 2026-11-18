# AGENTS.md — WorkLens (clean rebuild)

Global engineering and agent rules. Read this before changing anything.

## Status

Phase: **Phase 2 (design only) deliverables prepared; no application code exists.** See `docs/IMPLEMENTATION_STATUS.md`.

## Scope

- This repository is **WorkLens only** (Workforce & Automation Intelligence).
- **AutoRunner V2 is out of scope.** Do not start or scaffold it.
- Shared foundation modules are designed for reuse, but only what WorkLens actually needs is built.

## Legacy rule

The previous WorkLens repository (`C:\Users\rahma\OneDrive\Documents\worklens\`) and related folders are LEGACY.

- Read-only reference for requirements and history. Never modify them.
- Never copy code, schemas, migrations, ingestion pipelines, calculation logic, or derived results.
- Never treat legacy derived metrics or the old `Daily Activity` sheet assumptions as business data.
- Reuse of any legacy artifact requires explicit user approval recorded in `docs/DECISIONS/`.

## Data integrity (mandatory)

1. Source workbooks are immutable. Never edit, re-save, or "clean" them.
2. Raw records are preserved exactly as read.
3. Every record is traceable to workbook (identity + hash), sheet, and source row number.
4. Invalid or incomplete records stay inspectable. Validation never silently deletes.
5. Source values and derived values are stored separately and labeled as such.
6. Every derived metric has an explicit formula, version, and provenance.
7. No business calculation without an approved definition (see below).
8. Reprocessing is idempotent. It must not silently duplicate records.
9. Never invent missing values. Never silently substitute another sheet.

## Calculation gate

No workload calculation (including `Duration × Event Per Month`) may be implemented until the user approves: definition, source fields, unit, formula, missing/invalid handling, aggregation rules, versioning, and acceptance criteria. Record approval in `docs/DECISIONS/`.

## Architecture rules

- Shared modules hold only genuinely reusable capability. WorkLens business logic stays in WorkLens modules.
- Explicit contracts between modules. No generic framework beyond actual requirements.
- No placeholder code that pretends to work. Unbuilt means absent or clearly marked "not implemented".
- No new dependency without a written justification.

## AI policy

- AI goes through the AI Provider Adapter only; provider-independent.
- AI never replaces deterministic rules. AI outputs that affect decisions must be traceable and reviewable.
- No autonomous business decisions without explicit approval.

## Engineering standards

Strong typing and schema validation; automated tests; config via environment variables; no secrets in code or logs; structured logging; migration discipline; API documentation; reproducible local setup.

## Global agent workflow

### Simplicity first

Before proposing a design, recommending infrastructure, or changing code, load and follow the `ponytail` skill.

### Stay in scope

Read a file before planning changes to it. Do not add features or changes nobody asked for.

### Keep it simple

Use the `caveman` skill to minimize unnecessary complexity, scope expansion, and verbose communication.

### Verify before done

A change is done only when it is verified where it runs:

1. Run `npm run lint` when applicable.
2. Check every "done means" criterion of the task against the running or deployed app, where applicable.
3. Run the relevant tests and other verification commands required by the project or task.
4. If a check fails, fix the cause and run all applicable checks again.
5. Report unavailable or inapplicable checks explicitly. Never invent results or create unnecessary scripts solely to satisfy a check.

### Report in Show Me style

When done, read `.agents/skills/show-me/SKILL.md` and follow it.

Show what changed, then every check you ran with its command and result. Use appropriate visual explanations, diagrams, component flows, or comparisons where they materially help explain the result. Keep the report concise and evidence-based.

## Documentation rules

Every doc item is labeled one of: **Confirmed**, **Proposed**, **Unresolved**, **Implemented**, **Deferred**. Never describe a proposal as implemented. Update `docs/IMPLEMENTATION_STATUS.md` with every change in capability.

## Development agent harness

Coding agents follow `docs/DEVELOPMENT_AGENT_HARNESS.md` (approved in `docs/DECISIONS/0007-gate-decisions-gt1-gt5.md`). That document defines the roles, task tiers T0–T3, approval gates G1–G10, evidence requirements and reviewer policy. Read it before starting a task; its rules are not repeated here. Task evidence stays local in `.agents/tasks/` (git-ignored). Points that always apply:

- Review, testing and verification run in a different session than the implementation. T2 and T3 tasks require the manual two-session workflow.
- Report a test as passed only with its command, exit code and output. Report failures as failures. Never skip, delete or weaken a test to make it pass without G1 approval.
- Agents read real source values only under gate G10. The default is no access.

## Approval gates

Stop and wait for explicit user approval before: starting a new roadmap phase, choosing the authoritative source workbook, approving any metric definition, adopting the final stack, selecting hosting, provisioning or touching any database, or reusing any legacy artifact.