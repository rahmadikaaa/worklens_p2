# Module Contracts

Status: **Proposed.** Module list and separation are **Confirmed** (Kiroween brief). Signatures below are illustrative design notation, not code, and not final. Each contract states purpose, inputs, outputs, errors, and what the module must not do.

## 1. Layout and dependency rules (Proposed)

```
foundation/               shared, reusable; knows nothing about WorkLens
  config/  ingestion/  normalization/  rules/  assessment/
  adapters/  ai/  audit/  reporting/  notifications/
worklens/
  backend/                WorkLens application (FastAPI), WorkLens modules
    workload/  scoring/  impact/  analytics/
    sources/              WorkLens source-to-domain mapping, row classes
  frontend/               Next.js app
docs/
```

Rules:
1. `foundation` never imports `worklens`. Enforced by an automated import test.
2. WorkLens modules depend on foundation **interfaces** (Protocols/ABCs and Pydantic models), not on foundation internals.
3. WorkLens-specific knowledge (the 36 headers, row classes, Q-S decisions, metric formulas) lives only under `worklens`.
4. Shared modules are extracted only when they have a concrete consumer. Modules without a Phase 3 consumer are specified here, but **not built** until needed (see section 4).
5. Contracts use typed models; errors are typed exceptions mapped to documented codes.

## 2. Shared foundation contracts

### 2.1 Configuration Engine
- **Purpose:** typed settings from environment variables; fail fast on missing or invalid values.
- **In:** environment, optional `.env` for local use only. **Out:** immutable settings objects per module (database URL, source file path, log level, approved-hash registry path).
- **Errors:** `ConfigError(key, reason)`; messages never contain secret values.
- **Must not:** read secrets from the repo; log secret values; hold business rules.

### 2.2 Data Ingestion
- **Purpose:** read an external source through a `SourceAdapter` and write raw records to a `RawStore` with provenance, idempotently.
- **In:** source descriptor (path, expected identity), adapter, ingestion window, approved identities. **Out:** `ImportResult` (run id, counts, manifest, status).
- **Contracts:** `SourceAdapter.open(descriptor) -> SourceHandle` (identity, sheets); `SourceHandle.read(window) -> Iterator[RawRecord]`; `RawStore.begin_run / append / complete`.
- **Errors:** `UnknownIdentity` (hash not approved), `StructureMismatch` (headers or sheets), `ReconciliationFailed`, `AlreadyImported` (returns the existing run, not an error to callers that opt in).
- **Must not:** modify the source; interpret business meaning; delete or skip records; write outside a transaction.

### 2.3 Normalization Engine
- **Purpose:** apply a versioned mapping from raw records to typed domain records without interpretation.
- **In:** raw records, mapping spec (field, type, rules). **Out:** typed rows plus `source_error_codes`, `NormalizationRun`.
- **Errors:** `MappingError` (unknown column, bad spec).
- **Must not:** trim, parse, substitute or merge values unless the mapping declares an approved rule; hold WorkLens field names.

### 2.4 Rules Engine
- **Purpose:** evaluate declarative, versioned, deterministic rules over records and return findings or labels with rule id and version.
- **In:** rule set, records. **Out:** `RuleResult(rule_id, version, subject, outcome, evidence_refs)`.
- **Must not:** contain WorkLens rules; call AI; mutate records. Used in Phase 3 for row classification and validation.

### 2.5 Assessment Engine
- **Purpose:** apply approved assessment criteria to records and produce traceable assessment results (inputs, criteria version, outcome).
- **Status:** **Deferred.** Criteria are undefined (Q-B3, Q-B10, Q-B12). No code until criteria are approved. It may be absorbed by the Rules Engine if no distinct behavior emerges.

### 2.6 Plugin / Adapter System
- **Purpose:** a small registry for named adapters (source adapters, AI providers) with explicit interfaces.
- **Scope decision (Proposed):** v1 is a registry of two adapter kinds (`SourceAdapter`, `AiProvider`). No dynamic plugin loading or discovery. (Q-T3)
- **Must not:** execute third-party code from user input.

### 2.7 AI Provider Adapter
- **Purpose:** provider-independent interface for language tasks with full traceability.
- **In:** `AiRequest(task_id, prompt_template_version, inputs_ref, redaction_policy)`. **Out:** `AiResponse(text, model, provider, usage, request_hash)` stored as `AiOutput`.
- **Rules:** deterministic rules decide; AI only drafts or interprets; outputs that influence decisions are stored, reviewable, and marked as AI-generated. Sensitive source values are not sent to an external provider without owner approval (Q-T2). Includes a mandatory redaction hook and a "no provider configured" mode.
- **Status:** **Deferred** to Phase 9.

### 2.8 Logging & Audit
- **Purpose:** structured logs plus append-only audit events.
- **In:** log calls with a redaction filter; audit events `(actor, action, entity, entity_id, detail)`. **Out:** JSON logs; `audit.audit_event` rows.
- **Must not:** log source cell values, link URLs, secrets, or full file paths beyond a configured safe form. Allowed in logs: row numbers, column letters, counts, hashes, run ids.

### 2.9 Reporting Engine
- **Purpose:** render structured results into reports (HTML/CSV/JSON) from versioned report definitions.
- **Status:** **Deferred** to Phase 10. Phase 3 needs only an import summary, served by the API.

### 2.10 Notification Interface
- **Purpose:** send events through a channel interface (log, email, webhook).
- **Status:** **Deferred.** No WorkLens use identified (Q-T3). Only the interface may exist, with a log channel, when first needed.

## 3. WorkLens-specific contracts

### 3.1 Workload Calculation Engine
- **Purpose:** compute approved workload metrics, versioned, with provenance to input fields.
- **Status:** **Gated.** No code, no stubs, until the owner approves definitions (`docs/METRIC_DEFINITION_WORKSHOP.md`).
- **Contract (when approved):** `calculate(definition_id, version, input_records) -> MetricRun` containing values, inputs refs, handling counts (missing, invalid, excluded), and the definition reference. It refuses to run for a definition not in `approved` status.
- **Must not:** reuse workbook formulas implicitly; apply defaults for missing values; run against rows not eligible per the approved eligibility rule.

### 3.2 Automation Opportunity Scoring
- **Status:** **Gated** (Q-B10). Depends on workload metrics and criteria that are not defined. Contract when approved: `score(model_id, version, activity_metrics) -> ScoreRun` with component scores and explanation. AI may propose criteria; it cannot score autonomously.

### 3.3 Impact Assessment Engine
- **Status:** **Gated** (Q-B10). Requires before/after definitions and, probably, actual measurements not in the workbook. Contract when approved: `assess(definition, baseline, post) -> ImpactRun`.

### 3.4 Workforce Analytics
- **Purpose:** read-only aggregation and slicing of approved outputs by dimensions (for example department or app) for the UI and reports.
- **Status:** **Gated** on approved metrics; descriptive counts of ingestion results (row classes, findings) are allowed earlier because they are not business metrics.

### 3.5 WorkLens sources (non-shared WorkLens code)
- **Purpose:** WorkLens-specific glue: the 36-header spec, approved-hash registry, ingestion window A:AJ, row-class rules RC/RU, validation catalog, mapping v1.
- **Consumes:** foundation ingestion, normalization, rules, audit.

## 4. What Phase 3 needs (Proposed minimum)

| Needed | Module |
|---|---|
| Yes | Configuration, Data Ingestion + Excel adapter, Normalization, Rules (classification and validation), Logging & Audit |
| Defer | Assessment, AI Provider, Reporting, Notification, generic plugin loading |
| Gated | All four WorkLens calculation/analytics modules |

## 5. Contract testing (Proposed)

Each shared module ships a contract test suite that any implementation must pass. WorkLens tests run against fakes of the foundation interfaces. Import-boundary tests enforce rule 1.
