# Raw Data and Provenance Model

Status: **Proposed.**

## 1. What is preserved

| Item | Preserved as | Where |
|---|---|---|
| The workbook file | Unchanged on disk; identified by SHA-256 | Local source path from configuration; never copied into the repo |
| Workbook identity | Hash, size, mtime, approval reference, workbook properties | `raw.source_workbook` |
| Sheet metadata | Name, state, declared range, ingestion window | `raw.source_sheet` |
| Every non-empty row of the window | Excel row number | `raw.raw_row` |
| Every cell of A:AJ in those rows | Value, cell type, formula text/kind, error code | `raw.raw_cell` |
| Exclusions and absent rows | Manifest in the run record | `raw.import_run.manifest` |

Cells that are blank in a non-empty row are stored as `blank` cells so a row is always complete (36 cells). Rows that do not exist in the file are not invented; they appear in the manifest.

## 2. Value fidelity

| Aspect | Rule |
|---|---|
| Text | Stored exactly, including leading and trailing spaces |
| Numbers | Stored as `double precision`. The library returns Python floats; shortest-repr round trip preserves the double (limit documented in `0005`) |
| Errors | `cell_type = error`, `error_code = '#N/A'`; value fields NULL |
| Formulas | `formula_text` as the library returns it (leading `=`), `formula_kind` = `normal` or `array`; shared formulas are seen in expanded form (limit documented) |
| Cached value | The value read with `data_only=True` |
| Origin | `origin_kind`: `entered` (no formula) or `workbook_derived_cached` (formula present) |
| External dependencies | Never fetched or evaluated (Q-S2) |

## 3. Kinds of values (Confirmed principle, Proposed mechanism)

Only the first two kinds live in `raw`. Two more kinds exist elsewhere: `l1_authored` (in the `assessment` layer) and `ai_generated` (in `audit`). `DOMAIN_MODEL.md` §4 lists all five. The table below covers the three kinds relevant to the source and metrics.


| Kind | Label in storage | Source |
|---|---|---|
| Source entered | `entered` | Cell without formula |
| Workbook-derived | `workbook_derived_cached` | Cell with formula; cached result plus formula text. Not an approved calculation |
| WorkLens-derived | `worklens_derived` | Only from an approved MetricDefinition. **None exist** |

The first two live in `raw` and are mirrored (typed) in `domain`. The third lives only in `derived`.

## 4. Traceability chain

Every downstream record resolves to a source cell:

```
MetricValue -> MetricRun -> ActivityRecord -> RawRow -> SourceSheet -> SourceWorkbook (sha256)
                                                    \-> RawCell (value, formula, type)
```

Each domain row stores `raw_row_id`, `excel_row`, `import_run_id`, `normalization_run_id`, `mapping_version`. An API or UI can always answer: "which workbook (hash), sheet, row and column?"

## 5. Import lifecycle (Proposed)

1. **Preflight (no writes).** Resolve the configured path. Compute SHA-256. Compare with the approved hash registry. Unknown hash: stop with a re-verification-required error.
2. **Structure checks.** Exactly one sheet named `Breakdown Activity`; header row equals the 36 approved headers; no data in unexpected windows beyond what the manifest allows.
3. **Idempotency check.** If `(sha256, sheet, extractor_version, config_hash)` already has a completed run, return it and write nothing. A forced re-run requires an explicit flag and an audit reason, and still cannot duplicate raw rows (unique keys).
4. **Extract.** Single transaction: insert `source_workbook` (if new), `source_sheet`, `import_run` (status `running`), then rows and cells.
5. **Reconcile.** Counts from the extractor must equal inserted counts and the approved golden manifest (row and cell totals). Mismatch rolls back and marks the run `failed` with an audit event.
6. **Complete.** Mark `succeeded`; emit audit events. Classification, normalization and validation are separate runs that read from `raw`.

A failed run leaves no partial raw data (single transaction). Reprocessing is safe: raw is append-only and keyed by natural key.

## 6. Immutability (Proposed enforcement)

- Application role has INSERT and SELECT on `raw.*`, no UPDATE or DELETE.
- Database triggers raise an error on UPDATE or DELETE of raw tables as a second layer.
- Migrations are the only path to schema change, performed by a separate owner role.
- `raw_row.row_hash` (hash of the row's cell data) supports tamper checks and re-import comparison.

## 7. Same file, new version

A different SHA-256 is a different workbook. It gets its own `source_workbook`, requires re-verification (Q-S1), and never overwrites older raw data. Comparing versions is a later capability (Deferred).

## 8. Unresolved

- Q-D1: **decided (`0007`, GT-4): manifest-only.** AL:BI cells are not stored in `raw`.
- Q-D2: **decided (`0007`, GT-4):** the source is read from a configured local path (`WORKLENS_SOURCE_FILE`). The workbook stays where it is (git-ignored, in the repo root). The earlier "outside the repo" proposal is superseded.
