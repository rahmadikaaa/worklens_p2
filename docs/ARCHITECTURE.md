# Architecture (Phase 2 baseline)

Status legend: **Confirmed** = owner decision or the Kiroween planning brief. **Reference** = owner's Q1–Q51 answers (not yet approved technical decisions). **Proposed** = design awaiting approval. **Unresolved** = open, with an ID. Nothing here is implemented.

Related: `DATA_DICTIONARY.md` (what the data is), `DOMAIN_MODEL.md` (how WorkLens represents it), `design/` (contracts, mapping, provenance, validation, schema, API, security, testing), `DECISIONS/0005` (stack), `DECISIONS/0006` and the agent harness documents, `REQUIREMENTS_RECONCILIATION_Q1_Q51.md`, `ROADMAP.md` (gate register).

## 1. Confirmed direction

- "One Skeleton. Two Applications." Current scope is **WorkLens only**. AutoRunner V2 is out of scope.
- **Shared Modular Foundation, 10 modules:** Configuration Engine, Data Ingestion, Normalization Engine, Rules Engine, Assessment Engine, Plugin / Adapter System, AI Provider Adapter, Logging & Audit, Reporting Engine, Notification Interface.
- **WorkLens-specific modules, 4:** Workload Calculation Engine, Automation Opportunity Scoring, Impact Assessment Engine, Workforce Analytics.
- Shared modules hold only reusable capability. WorkLens logic stays application-specific. No framework beyond actual requirements. Clear boundaries and standardized interfaces. WorkLens can adopt a future shared foundation without AutoRunner V2.
- Data integrity rules (`AGENTS.md`): immutable source, row-level provenance, labeled separation of source and derived values, no calculation without an approved definition.
- **Runtime orchestration is the Hybrid Orchestrator (synchronous plus asynchronous).** Not replaced.
- Stack **adopted** (`DECISIONS/0007`, GT-1): Python 3.12, FastAPI, Next.js, React, TypeScript, PostgreSQL. Hosting is open; version pins are decided in the Phase 3 plan.
- Development and Runtime agent harnesses are separate systems.

## 2. Product to architecture (Reference, Q45–Q51)

The six MVP capabilities are product features, not modules. The module list above is not changed. Users: **L1** (edits) and **Management** (read-only, summary plus drill-down).

| MVP capability | Built from | Data (domain model) | Phase gate |
|---|---|---|---|
| Assessment Workspace (L1) | Ingestion output, application assessment service, Logging & Audit | ActivityRecord, AssessmentRecord, ValueCatalog | Q-R8, R9, R13, R23, R24, R25 |
| Monitoring Dashboard (Management) | Workforce Analytics (read-only), application services | Counts over activity, class, assessment, review, follow-up | Q-R17 |
| Download Enriched CSV | Reporting Engine | Projection with value-kind labels | Q-R14; Reporting Engine is Deferred to Phase 10 (Q-R16) |
| Generate Assessment Report | Reporting Engine; optional Report Generation agent | Projection plus manifest | Q-R15, Q-R16 |
| Quality Review | Rules Engine findings; application review service | ValidationFinding, QualityReviewItem | Dispositions catalog (Q-R9 family) |
| Follow-up Management | Application follow-up service | FollowUpItem | Q-R18 |

The brief's scoring, prioritization, impact and AI recommendations are not among the six capabilities. Whether they are MVP, later, or out is Q-R16. The locked modules remain; only their scheduling is open.

## 3. Modules and application services

### 3.1 Shared foundation

| Module | First needed | Notes |
|---|---|---|
| Configuration Engine | Phase 3 | Typed settings from environment variables |
| Data Ingestion | Phase 3 | `SourceAdapter` (Excel), `RawStore`, hash gate, reconciliation |
| Rules Engine | Phase 3 | Row classification and validation (deterministic, versioned) |
| Logging & Audit | Phase 3 | Redacted structured logs; append-only audit events |
| Normalization Engine | Phase 4 | Versioned mapping, no interpretation |
| Reporting Engine | Deferred (roadmap: Phase 10) | Needed earlier by the CSV and report capabilities (Q-R16) |
| Assessment Engine | Deferred | Criteria-based assessment; criteria undefined (Q-B3, Q-B10, Q-B12) |
| AI Provider Adapter | Deferred (Phase 9) | Provider-independent, redacted, reviewable |
| Plugin / Adapter System | Phase 3: the `SourceAdapter` interface only | The two-kind registry (source, AI provider) arrives with the AI adapter (Q-T3); no dynamic loading |
| Notification Interface | Deferred | No WorkLens use identified |

### 3.2 WorkLens modules (all gated)

| Module | Gate |
|---|---|
| Workload Calculation Engine | Approved definition under the calculation gate. Q37/Q38 state a definition; the gate items are incomplete (Q-R3); the saving formula is external (Q-R2). The 10% `Workload after` is a static assumption, not measured impact |
| Automation Opportunity Scoring | Q-B10, Q-R16. The Reference makes opportunity an L1 decision; no scoring criteria exist |
| Impact Assessment Engine | Q-B10; requires measurement data not in the workbook |
| Workforce Analytics | Counts of ingestion results are allowed early. Counts of business fields need Q-R17 |

### 3.3 WorkLens application services (Proposed; not modules)

The Reference requires behavior that the 14 modules do not own: L1 editing, quality-review dispositions, follow-up, and sources glue. Proposed: these are **application services** in the WorkLens backend, built on the modules, not new modules:

| Service | Responsibility |
|---|---|
| `sources` | The 36-header spec, approved-hash registry, ingestion window A:AJ, row-class rules, validation catalog, mapping v1 (Phase 3–4) |
| `assessment` | AssessmentRecord and ValueCatalog writes and reads, effective view |
| `review` | QualityReviewItem dispositions |
| `followup` | FollowUpItem |
| `exports` | Assembly of CSV and report projections through the Reporting Engine |

Placement alternatives (a fifth WorkLens module; use of the shared Assessment Engine) would change the locked list or the shared module's purpose. **This document does not change the list.** Decision: Q-R23. It does not affect Phases 3 and 4.

## 4. Structure and boundaries (Proposed)

```
foundation/ (shared)  <-  worklens/backend (modules + application services + sources)  <-  worklens/frontend
```

- Dependencies are one-way. `foundation` never imports `worklens`; an automated test enforces it.
- WorkLens code calls foundation interfaces (typed models and Protocols), not internals.
- Shared modules are built only when a concrete consumer exists. Contracts: `design/MODULE_CONTRACTS.md`.
- **Phase 3 builds only:** Configuration, Data Ingestion with an Excel adapter (the `SourceAdapter` interface), Rules (classification and validation), Logging & Audit, and the `sources` service. **Phase 4** adds Normalization.

## 5. Data layers and flow (Proposed)

```
Workbook (immutable file, sha256 gate)
  -> Ingestion -> raw (append-only rows, cells, formulas, types, provenance)
  -> Rules: row classification + validation findings (nothing deleted)
  -> Normalization -> domain (typed mirror, versioned mapping, no interpretation)
  -> assessment (L1-authored layer: assessment, review dispositions, follow-up)
  -> [gated] derived: approved metric definitions -> runs -> values
  -> Analytics / Reporting / API / UI
AI Provider Adapter: advisory, reviewable, redacted; deferred
```

PostgreSQL schemas: `raw`, `domain`, `assessment`, `derived`, `audit`. Value kinds: `entered`, `workbook_derived_cached`, `l1_authored`, `worklens_derived`, `ai_generated`. Every view, export and report labels the kind. Source data and edits never mix in the same table.

## 6. Roles and permissions (Proposed capability model)

The design is expressed in **capabilities**, so the unresolved mapping from business roles to technical roles (Q-T7, Q-R12) does not block the build. Role names become configuration.

| Capability | L1 | Management | Technical admin | Basis |
|---|---|---|---|---|
| `activity.read_summary` | yes | yes | open | Reference Q48, Q49 |
| `activity.read_detail` (source values, drill-down) | yes | yes | open | Reference Q49; sensitive data (Q-S6) |
| `assessment.edit`, `quality_review.edit`, `followup.edit` | yes | **no** | no | Reference Q51 |
| `export.csv`, `report.generate` | open | open | open | Q-R14, Q-R15 |
| `agent.review` (accept or reject AI output) | proposed | no | no | Q-R12 |
| `source.import`, `source.inspect_meta`, `admin.config` | no | no | yes | Proposed |
| Approve business definitions, source decisions | outside the application: project owner via decision records | | | Confirmed |

Management comments or feedback: Unresolved (Q-R11). Technical role names (`viewer`, `inspector`, `admin`; L1/Management as roles) are Unresolved. Phase 3 only needs `source.import`, `source.inspect_meta` and `activity.read_detail` for row inspection.

## 7. Cross-cutting (Proposed)

- Idempotent imports keyed by workbook hash, sheet, extractor version and config hash. Hash gate and header guard before any read. Reconciliation with a golden manifest before commit.
- Structured logging with redaction; no source values in logs.
- Audit events for imports, approvals, forced re-runs, and **every L1 edit** (ids and field names, never values). Events carry `actor_type` (`user`, `system`, `agent`) and an optional task reference.
- Configuration through environment variables; secrets never in the repo.
- Versioned mapping, classification, validation, value catalogs, and metric definitions.
- Spreadsheet export protects against formula injection (values starting with `=`, `+`, `-`, `@`).

## 8. Agent harnesses (summary)

- **Development Agent Harness:** governs AI coding agents (plan, implement, review, test, verify, human gates). Kiro configuration, docs and scripts; not application code.
- **Runtime Agent Harness:** the **Hybrid Orchestrator** for business AI agents inside WorkLens. Proposed as an application component (`worklens/backend/agents/`) built on existing foundation modules, not an 11th shared module. Async uses a PostgreSQL task table and a same-codebase worker; no broker, vector store or extra service. AI output is labeled, evidence-linked and review-gated; AI never decides definitions or sets `Improvement Category`, `Category Notes` or `Assessment Status`.
- Reviewer of assessment-related AI output: L1 (Proposed, Q-R12). Management cannot accept AI output.
- The two harnesses share policy and conventions only. Details: `AGENT_HARNESS_ARCHITECTURE.md`, `DEVELOPMENT_AGENT_HARNESS.md`, `RUNTIME_AGENT_HARNESS.md`, `AGENT_GOVERNANCE_AND_SECURITY.md`, `DECISIONS/0006`.

## 9. What is not designed on purpose

No message broker, vector database, extra services, generic plugin framework, or multi-tenant features. Hosting, authentication details, and the L1 layer's catalogs and state lists wait for owner decisions.

## 10. Unresolved and gates

The single register is in `ROADMAP.md` ("Design gate register"). In short:

- **None of the unresolved items blocks the design of Phases 3 and 4.** Phase 3 depends on approvals, not on missing design: stack adoption, database provisioning (Q-T8), minimal authentication (Q-T7), Q-D1, Q-D2, and the development harness decisions (Q-H4, Q-H6, Q-H7, Q-H8).
- The L1 layer, exports and reports, metrics, and AI-backed agents each have their own gates. They are the reason those parts are specified as proposals and not as build-ready designs.
