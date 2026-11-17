# Architecture

Status legend: **Confirmed** = owner decision or the Kiroween planning brief (authoritative baseline). **Proposed** = design awaiting approval. Nothing here is implemented.

Detailed designs live in `docs/design/`:
`MODULE_CONTRACTS`, `SOURCE_TO_DOMAIN_MAPPING`, `RAW_DATA_AND_PROVENANCE`, `ROW_CLASSIFICATION_AND_VALIDATION`, `DATABASE_SCHEMA_PROPOSAL`, `API_CONTRACT_PROPOSAL`, `SECURITY_AND_SENSITIVITY`, `TESTING_STRATEGY`. Domain concepts and the ER diagram: `DOMAIN_MODEL.md`. Stack: `DECISIONS/0005-technology-stack.md`.

## Confirmed: direction

- "One Skeleton. Two Applications." Current implementation scope is **WorkLens only**. AutoRunner V2 is out of scope.
- Shared Modular Foundation with 10 modules:
  1. Configuration Engine 2. Data Ingestion 3. Normalization Engine 4. Rules Engine 5. Assessment Engine 6. Plugin / Adapter System 7. AI Provider Adapter 8. Logging & Audit 9. Reporting Engine 10. Notification Interface
- WorkLens-specific modules: Workload Calculation Engine, Automation Opportunity Scoring, Impact Assessment Engine, Workforce Analytics.
- Shared modules hold only reusable capability. WorkLens business logic stays application-specific. No generic framework beyond actual requirements. Clear boundaries and standardized interfaces. WorkLens can adopt a future shared foundation without AutoRunner V2 existing.
- Design-candidate stack (approved for evaluation): Python 3.12, FastAPI, Next.js, React, TypeScript, PostgreSQL. Hosting open.

## Proposed: structure

```
foundation/ (shared)  <-  worklens/backend (WorkLens modules + sources)  <-  worklens/frontend
```

- One-way dependencies. `foundation` never imports `worklens`; an automated test enforces it.
- WorkLens modules call foundation interfaces (typed models and Protocols).
- Phase 3 needs only Configuration, Data Ingestion with an Excel adapter, Normalization, Rules, and Logging & Audit. The other shared modules are specified but not built until a consumer exists. The four WorkLens calculation/analytics modules are gated on approved metric definitions.

## Proposed: data flow and layers

```
Workbook (immutable file, sha256 gate)
  -> Ingestion -> raw (append-only: rows, cells, formulas, types, provenance)
  -> Rules: row classification + validation findings (nothing deleted)
  -> Normalization -> domain (typed, versioned mapping, no interpretation)
  -> [gated, owner approval] derived: approved metric definitions -> metric runs -> values
  -> Scoring -> Impact -> Analytics -> Reporting / API / UI
AI Provider Adapter: advisory, reviewable, redacted; deferred
```

PostgreSQL schemas: `raw`, `domain`, `derived`, `audit`. Source value, workbook-derived value, and WorkLens-derived value are labeled separately (`entered`, `workbook_derived_cached`, `worklens_derived`).

## Proposed: cross-cutting

- Idempotent imports keyed by workbook hash, sheet, extractor version and config hash; natural row/cell keys prevent duplicates.
- Hash gate and header guard before any read; reconciliation against a golden manifest before commit.
- Structured logging with redaction; audit events for imports, approvals and forced re-runs.
- Configuration through environment variables; secrets never in the repo.
- Versioned mapping, classification, validation, and metric definitions.

## Unresolved

- Hosting (Q-T9), authentication and users (Q-T7), database provisioning for local development (Q-T8), AI provider and data egress (Q-T2).
- Whether the Plugin/Adapter System is more than a two-kind registry (Q-T3).
- Activity grain (Q-B1) may reshape the domain record.
