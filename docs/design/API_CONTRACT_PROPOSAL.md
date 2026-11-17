# API Contract Proposal

Status: **Proposed. No endpoint exists.** FastAPI produces an OpenAPI document; that document will be the single source of truth for the contract and for generated frontend types.

## 1. Conventions

- Base path `/api/v1`. JSON. Timestamps ISO 8601 UTC.
- Errors use RFC 9457 `application/problem+json` with a stable `code` (for example `UNKNOWN_IDENTITY`, `RECONCILIATION_FAILED`). Messages never contain source values.
- Pagination: `limit` (default 50, max 500) and `cursor`. Sorting by `excel_row` by default.
- Idempotency: `POST` imports are idempotent per `(sha256, sheet, extractor_version, config_hash)`; a repeat returns the existing run with `200` and `X-Idempotent-Replay: true`.
- Versioning: breaking changes get `/api/v2`. Contract tests compare against the committed OpenAPI file.
- Source values are exposed only by endpoints marked **[values]**, which require authorization and are never logged.
- Authentication and authorization are **Unresolved (Q-T7)**. Proposed MVP: bind to localhost and require a configured bearer token; role split `viewer` (counts and metadata), `inspector` (source values), `admin` (trigger imports).

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

Not proposed: any endpoint that edits or deletes raw data, accepts a file path, or uploads a workbook (upload is **Unresolved**, Q-D2; a new workbook version enters through configuration and re-verification).

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

## 5. Unresolved

Q-T7 (users, auth), Q-D2 (workbook upload), whether `/rows` values should be masked by default in the UI.
