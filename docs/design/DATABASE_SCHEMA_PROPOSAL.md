# Database Schema Proposal

Status: **Proposed. This is a design description, not DDL and not a migration.** No schema exists. Target: PostgreSQL (version to be pinned at Phase 3; a PostgreSQL 17 service exists on this machine but has not been accessed and is not assumed to be the project database, Q-T8).

## 1. Conventions

- Schemas: `raw`, `domain`, `derived`, `audit`. One migration tool (Alembic), forward migrations with tested downgrade where safe, every migration reviewed.
- Primary keys: `bigint generated always as identity` for high-volume tables, `uuid` for runs and workbooks.
- Timestamps `timestamptz`, UTC. Names `snake_case`. Enumerations as `text` with CHECK constraints (easier to evolve than native enums).
- Roles: `worklens_owner` (migrations), `worklens_app` (runtime). Runtime has no UPDATE/DELETE on `raw`.
- Source values never appear in `audit` or `validation_finding.details`.

## 2. `raw` schema (append-only)

**source_workbook**: `id uuid pk`; `sha256 char(64) unique not null`; `file_name text`; `size_bytes bigint`; `file_mtime timestamptz`; `properties jsonb` (non-identifying metadata); `sensitivity text not null default 'internal-sensitive'`; `approval_ref text` (decision record); `verified_at timestamptz`; `created_at`.

**source_sheet**: `id bigint pk`; `source_workbook_id fk`; `sheet_name text`; `sheet_state text`; `declared_range text`; `ingestion_window text` (e.g. `A:AJ`); unique `(source_workbook_id, sheet_name)`.

**import_run**: `id uuid pk`; `source_sheet_id fk`; `kind text` (`ingest`); `status text` (`running|succeeded|failed`); `extractor_name`, `extractor_version`, `library_versions jsonb`; `config_hash char(64)`; `mapping_scope text`; `started_at`, `finished_at`; `manifest jsonb` (counts, absent rows, excluded ranges with region hash, golden comparison); `reason text`; `initiated_by text`; unique `(source_sheet_id, extractor_version, config_hash)` where `status='succeeded'`.

**raw_row**: `id bigint pk`; `source_sheet_id fk`; `excel_row integer not null`; `first_import_run_id fk`; `row_hash char(64)`; unique `(source_sheet_id, excel_row)`. Header row stored with `is_header boolean`.

**raw_cell**: `raw_row_id fk`; `col_index smallint` (1 = A); `col_letter text`; `cell_type text` check in (`blank,string,number,boolean,error`); `value_text text`; `value_number double precision`; `value_bool boolean`; `error_code text`; `is_formula boolean`; `formula_text text`; `formula_kind text` check in (`normal,array`, null); `origin_kind text` check in (`entered,workbook_derived_cached`); primary key `(raw_row_id, col_index)`. Checks enforce that exactly the value field matching `cell_type` is set, and that `origin_kind` agrees with `is_formula`.

Volume: 3,496 rows × 36 cells ≈ 126k cell rows per import. Small. No partitioning.

## 3. `domain` schema (versioned, rebuilt per run)

**classification_run**: `id uuid`; `import_run_id fk`; `classification_version int`; `config_hash`; `counts jsonb`; unique `(import_run_id, classification_version, config_hash)`.

**row_classification**: `classification_run_id fk`; `raw_row_id fk`; `row_class text` check (`activity_structured, link_only`); `review_state text` check (`unreviewed, not_flagged`); `assessment_eligibility text` check (`undetermined`) default `undetermined`; `rule_ids text[]`; pk `(classification_run_id, raw_row_id)`.

**normalization_run**: `id uuid`; `import_run_id fk`; `mapping_version int`; `config_hash`; `counts jsonb`; unique `(import_run_id, mapping_version, config_hash)`.

**activity_record**: `id bigint`; `normalization_run_id fk`; `raw_row_id fk`; `excel_row int`; one column per mapped field (36 columns; types per `SOURCE_TO_DOMAIN_MAPPING.md`); `source_error_codes jsonb`; unique `(normalization_run_id, raw_row_id)`. Table name provisional (Q-B1).

**link_record**: `id`; `normalization_run_id`; `raw_row_id`; `link_confluence text`; same uniqueness.

**validation_run**: `id uuid`; `import_run_id`; `catalog_version int`; unique `(import_run_id, catalog_version)`.

**validation_finding**: `id bigint`; `validation_run_id fk`; `code text`; `severity text` check (`info,warning,error`); `raw_row_id fk null`; `col_index smallint null`; `details jsonb` (counts and kinds only); index on `(validation_run_id, code)`, `(raw_row_id)`.

Current-run pointers: a `current_runs` view selects the latest succeeded run per version; consumers must pass explicit run ids for reproducible results.

## 4. `derived` schema (empty until approvals)

**metric_definition**: `id uuid`; `key text`; `version int`; `status text` check (`draft,approved,retired`); `definition jsonb` (fields, unit, formula, missing/invalid handling, aggregation, acceptance criteria); `decision_ref text`; `approved_by text`; `approved_at timestamptz`; unique `(key, version)`. CHECK: `status='approved'` requires non-null `decision_ref`, `approved_by`, `approved_at`.

**metric_run**: `id uuid`; `metric_definition_id fk`; `input_run_ids jsonb`; `status`; `counts jsonb` (missing, invalid, excluded); `started_at`, `finished_at`. A trigger rejects insertion when the definition is not `approved`.

**metric_value**: `id bigint`; `metric_run_id fk`; `subject_type text`; `subject_id bigint`; `value double precision`; `unit text`; `provenance jsonb` (input field refs and raw_row ids). Origin label is always `worklens_derived`.

## 5. `audit` schema

**audit_event**: `id bigint`; `occurred_at timestamptz`; `actor text`; `action text`; `entity_type text`; `entity_id text`; `detail jsonb` (no source values); append-only.
**ai_output** (Deferred): request hash, model, provider, redaction applied, output text, reviewer, review status.

## 6. Immutability and integrity controls

- Trigger on `raw.*`: `BEFORE UPDATE OR DELETE` raises an exception.
- Foreign keys everywhere; no cascading deletes on `raw`.
- CHECK constraints for cell type consistency; unique natural keys for idempotency.
- `row_hash` computed at insert, verified by an integrity query.
- Backups: before any migration run on a database that holds imported data (policy).

## 7. Open points

- Q-T8: how the database is provisioned for local dev (dedicated database and role on the existing local PostgreSQL service, or another approach). Needs the owner's approval before touching the existing service.
- Q-D1: whether to archive the excluded AL:BI region in raw.
- Q-B1 may rename or reshape `activity_record`.
