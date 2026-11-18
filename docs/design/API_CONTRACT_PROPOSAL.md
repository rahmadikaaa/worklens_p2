# API Contract Proposal

Status: **Proposed. No endpoint exists.** FastAPI produces an OpenAPI document; that document will be the single source of truth for the contract and for generated frontend types.

## 1. Conventions

- Base path `/api/v1`. JSON. Timestamps ISO 8601 UTC.
- Errors use RFC 9457 `application/problem+json` with a stable `code` (for example `UNKNOWN_IDENTITY`, `RECONCILIATION_FAILED`). Messages never contain source values.
- Pagination: `limit` (default 50, max 500) and `cursor`. Sorting by `excel_row` by default.
- Idempotency: `POST` imports are idempotent per `(sha256, sheet, extractor_version, config_hash)`; a repeat returns the existing run with `200` and `X-Idempotent-Replay: true`.
- Versioning: breaking changes get `/api/v2`. Contract tests compare against the committed OpenAPI file.
- Source values are exposed only by endpoints marked **[values]**, which require authorization and are never logged.
- **Phase 3 model approved (`0007`, GT-3):** bind to localhost; one bearer token per role from environment configuration; capability checks; `/health` unauthenticated. Per-user identities and the L1/Management role mapping stay **Unresolved (Q-T7, Q-R12)**. Earlier proposal: bind to localhost and require a configured bearer token; role split `viewer` (counts and metadata), `inspector` (source values), `admin` (trigger imports).

## 2. Endpoints

Phase = the roadmap phase in which the endpoint would first be built. Nothing before Phase 3 is built.

| Method and path | Purpose | Phase | Notes |
|---|---|---|---|
| `GET /health` | Liveness and database check | 3 | No auth; no data |
| `GET /config/public` | Non-secret build/runtime info (versions) | 3 | |
| `GET /source/workbooks` | List known workbooks (hash, size, status, approval ref) | 3 | |
| `GET /source/workbooks/{id}` | Identity, sheets, manifest | 3 | |
| `POST /imports` | Start an import of the configured file; body: `{ "sheet": "Breakdown Activity", "reason": "..." }` | 3 | `admin`. Path comes from configuration, never from the request, to avoid arbitrary file reads |
| `GET /imports` / `GET /imports/{id}` | Run status, counts, reconciliation result | 3 | |
| `GET /imports/{id}/manifest` | Excluded ranges, absent rows, golden comparison | 3 | |
| `GET /rows` | Raw rows with filters: `row_class`, `review_state`, `excel_row_from/to` | 3 | **[values]** optional via `include_values=true` |
| `GET /rows/{excel_row}` | One row with all cells, formula, type, origin | 3 | **[values]** |
| `GET /rows/summary` | Counts by class, review state | 3 | Counts only |
| `GET /findings` | Findings with `code`, `severity`, `excel_row`, `column` | 3 | No values |
| `GET /findings/summary` | Counts by code and severity | 3 | |
| `GET /activities` | Normalized records | 4 | **[values]** |
| `GET /activities/{id}` | One normalized record with provenance | 4 | **[values]** |
| `GET /schema/columns` | The 36 headers, mapping, origin summary | 4 | Metadata only |
| `GET /metrics/definitions` | Metric definitions and status | 5 | All start as `draft` or absent |
| `POST /metrics/definitions` | Create draft definition | 5 | `admin`; cannot set `approved` |
| `POST /metrics/definitions/{id}/approve` | Record owner approval with decision reference | 5 | `admin`; writes audit event |
| `POST /metrics/runs`, `GET /metrics/runs/{id}` | Execute and read approved metrics | 6 | Rejects non-approved definitions |
| `GET /opportunities`, `GET /impact/*` | Scoring and impact outputs | 8 | Gated |
| `POST /ai/recommendations`, `GET /ai/recommendations/{id}` | Reviewable AI recommendations | 9 | Gated; stored as `AiOutput` |
| `GET /audit/events` | Audit trail | 3 | `admin`; no values |

Not proposed: any endpoint that edits or deletes raw data, accepts a file path, or uploads a workbook (no upload in v1, decided in `0007` GT-4; a new workbook version enters through configuration and re-verification).

## 3. Example shapes (illustrative)

`GET /imports/{id}`
```json
{
  "id": "…",
  "status": "succeeded",
  "workbook": { "sha256": "AA7B…D0092", "approval_ref": "DECISIONS/0004" },
  "sheet": "Breakdown Activity",
  "counts": { "data_rows": 3495, "activity_structured": 3489, "link_only": 6, "unreviewed": 252 },
  "reconciliation": { "golden_match": true, "differences": [] }
}
```
Values shown are the Phase 1 golden counts; real responses are computed per run.

`GET /rows/summary`
```json
{ "activity_structured": 3489, "link_only": 6, "unreviewed": 252, "assessment_eligibility": { "undetermined": 3495 } }
```

## 4. Contract governance

- OpenAPI file committed under `docs/api/` when Phase 3 starts; CI fails on undocumented drift.
- Every endpoint documents auth role, errors, and whether it returns source values.
- Frontend types are generated from OpenAPI, not hand-written.

## 4a. Requirements alignment, Q1–Q51 (reference-stated; additions are Proposed, not approved)

Source: `REQUIREMENTS_RECONCILIATION_Q1_Q51.md`. The role set above does not match the reference:

- Reference roles: **L1** (edits assessment, `Improvement Category`, `Category Notes`, Quality Review, Follow-up) and **Management** (read-only; summary plus drill-down; comments undecided).
- Section 1 proposes `viewer`, `inspector`, `admin`, and the statement that no endpoint edits data. Neither expresses L1 edit rights. **Conflict, not resolved** (Q-R12). Candidate mappings: (a) `l1`, `management`, `admin`; (b) keep `viewer`/`inspector`/`admin` and add an assessment-edit permission for L1. Management drill-down shows source values, so it needs activity-detail read access under the sensitivity rules.
- **Capability model (Proposed, `ARCHITECTURE.md` §6):** endpoints check capabilities (`activity.read_summary`, `activity.read_detail`, `assessment.edit`, `quality_review.edit`, `followup.edit`, `export.csv`, `report.generate`, `agent.review`, `source.import`, `source.inspect_meta`, `admin.config`). Role names are configuration, so the unresolved role mapping does not block Phase 3. In section 1, read `viewer`, `inspector` and `admin` as provisional role names for this mapping.
- "Not proposed: any endpoint that edits or deletes raw data" still holds. L1 edits would target a separate assessment layer.

Candidate endpoint groups implied by the six MVP capabilities. Names and shapes are placeholders, none exist, none are approved, and they are not scheduled before Phase 3 decisions:

| Capability | Candidate group | Access (reference) |
|---|---|---|
| Assessment Workspace | read and update assessment records per activity | L1 edit; Management read |
| Monitoring Dashboard | summary and drill-down reads | L1, Management read |
| Download Enriched CSV | export | Roles open (Q-R14); sensitive data; audit; protect against spreadsheet formula injection in exported cells |
| Generate Assessment Report | create and read report | Open (Q-R15) |
| Quality Review | list findings, record L1 disposition | L1 edit |
| Follow-up Management | list, create, update follow-up items | L1 edit; Management read |

Edits must record the author and version, and never alter `raw`. The system of record for assessments is unresolved (Q-R13).

## 5. Unresolved

Q-R12, Q-R13, Q-R14, Q-T7 beyond the Phase 3 minimum (per-user identities; Phase 3 model approved in `0007` GT-3), whether `/rows` values should be masked by default in the UI.
