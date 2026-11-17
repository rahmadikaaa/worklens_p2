# AGENTS.md — WorkLens (clean rebuild)

Global engineering and agent rules. Read this before changing anything.

## Status

Phase: **Phase 2 (design only) deliverables prepared; no application code exists.** See `docs/IMPLEMENTATION_STATUS.md`.

## Scope

- This repository is **WorkLens only** (Workforce & Automation Intelligence).
- **AutoRunner V2 is out of scope.** Do not start or scaffold it.
- Shared foundation modules are designed for reuse, but only what WorkLens actually needs is built.

## Legacy rule

The previous WorkLens repository (`C:\Users\rahma\OneDrive\Documents\worklens`) and related folders are LEGACY.

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

## Documentation rules

Every doc item is labeled one of: **Confirmed**, **Proposed**, **Unresolved**, **Implemented**, **Deferred**. Never describe a proposal as implemented. Update `docs/IMPLEMENTATION_STATUS.md` with every change in capability.

## Approval gates

Stop and wait for explicit user approval before: starting a new roadmap phase, choosing the authoritative source workbook, approving any metric definition, adopting the final stack, selecting hosting, provisioning or touching any database, or reusing any legacy artifact.
