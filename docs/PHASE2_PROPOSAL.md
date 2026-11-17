# Phase 2 Proposal — Domain Model & Architecture Design

Status: **Approved by the owner; superseded by the Phase 2 deliverables** (`DECISIONS/0005`, `DOMAIN_MODEL.md`, `design/*`, `METRIC_DEFINITION_WORKSHOP.md`). Kept as the record of the original proposal.

## Goal

Produce approved design documents and decision records so that Phase 3 (ingestion and raw store) can start without open design questions. Phase 2 is design only: no code, no database schema or migrations, no calculations.

## Proposed deliverables

1. **Stack decision record (ADR)**: language, framework, database, test tooling, package layout, with a comparison of 2–3 options against: Excel reading fidelity (formulas, cached values, row numbers), strong typing and schema validation, migration discipline, local reproducibility, hackathon timeline, sensitivity handling (local-only data).
2. **Domain model v1** (`DOMAIN_MODEL.md`), covering only what the source supports:
   - `SourceWorkbook` (path, SHA-256, size, identity checks, approval reference)
   - `SourceSheet`, `SourceColumn` (header, position)
   - `RawRow` / `RawCell`: verbatim value, cell type, cached-vs-formula flag, formula text and type, Excel row and column
   - `RowClass` (preservation labels only): `activity-structured`, `unreviewed`, `link-only`, plus an extension point for later eligibility rules
   - `ValidationFinding` (type, severity, location; never deletes data)
   - `ImportRun` (workbook hash, time, tool version, counts, outcome) and idempotency key (workbook hash + sheet + row)
   - Provenance model separating *source value*, *workbook-derived (cached)*, and *WorkLens-derived (approved formula only)*
3. **Module contracts** (interfaces only, not implementations) for the modules Phase 3 needs: Configuration Engine, Data Ingestion (Excel source adapter), Logging & Audit. Each contract states inputs, outputs, errors, and what it must not do.
4. **Data handling design**: sensitivity rules in code terms (log redaction, fixtures policy, config for source path), hash gate (refuse unknown hashes), raw-store immutability approach.
5. **Test strategy**: synthetic fixtures only, golden checks against the verified Phase 1 counts (3,495 / 3,489 / 6 / 252 / 36 columns / 108 `#N/A` rows) run locally against the real file but never committed.
6. **Metric definition workshop plan** (design for Phase 5): the checklist from `AGENTS.md` turned into a template, and a prioritized list of Q-B questions to resolve first.
7. **Updated roadmap and status docs.**

## Explicitly not in Phase 2

- Workload or any metric calculation.
- Database schema, migrations, ingestion code, API, UI.
- AI adapter implementation.
- Eligibility rules for the unreviewed rows (needs Q-B12 answered).
- AutoRunner V2.

## Decisions needed from the owner before Phase 2 starts

1. Confirm the verified SHA-256 (Q-S1 open item).
2. Preferences or constraints on language, database and hosting (Q-T1), including any hackathon requirements (Q-T4).
3. Is the planning document available (Q-S7)? If not, confirm that the brief is the architecture baseline.
4. Should Phase 2 include a first draft of the metric definitions with you, or only the workshop template (Business questions Q-B1 to Q-B3 and Q-B7 gate the metric work)?
5. Initialize a git repository now (Q-T5)?

## Risks

- Stack choice affects Excel fidelity: formula text and shared-formula metadata are not exposed by every spreadsheet library. The ADR must verify this against the real file before the choice is final.
- Unanswered Q-B1 (grain) shapes the domain model. Phase 2 will keep the `Activity` entity provisional until it is answered.

## Exit criteria

- Stack ADR, domain model v1, and Phase 3 module contracts reviewed and approved by the owner.
- All design items labeled Confirmed or Proposed; open questions listed.
- Owner approval recorded before Phase 3 starts.
