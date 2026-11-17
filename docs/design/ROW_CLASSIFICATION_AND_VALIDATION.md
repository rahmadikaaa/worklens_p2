# Row Classification and Validation Model

Status: **Proposed**, built on **Confirmed** owner decisions Q-S3, Q-S4. Classes are source-preservation labels. They are not business eligibility.

## 1. Row classes

| Field | Values | Meaning |
|---|---|---|
| `row_class` | `activity_structured`, `link_only` | Structural class of a non-empty row |
| `review_state` | `unreviewed`, `not_flagged` | Owner-defined flag (Q-S4) |
| `assessment_eligibility` | `undetermined` (only value for now) | Placeholder until Q-B12 defines rules. No row is "eligible" or "ineligible" |

Rows that do not exist in the file are not classified (reported as absent in the manifest). A header row (row 1) is metadata, not a data row.

### Rules (versioned, `classification_version = 1`)

| Rule ID | Condition | Result |
|---|---|---|
| RC-1 | Row is in the owner list of link-only rows: 3526, 3535, 3537, 3538, 3539, 3540 | `link_only` |
| RC-2 | Row has a value in column I and no value in any other A:AJ column | `link_only` (structural rule; must agree with RC-1) |
| RC-3 | Any other non-empty row | `activity_structured` |
| RU-1 | Excel row between 3239 and 3490 inclusive | `review_state = unreviewed` (owner-defined range, configured, not inferred) |

- RC-1 is the owner decision; RC-2 is a structural check. A disagreement between them raises finding `V-CLS-MISMATCH` and the owner list wins. This catches future workbook versions where link-only rows change.
- The `unreviewed` range is configuration approved by the owner. It is not derived from data patterns, though the pattern (missing `Automation/Manual` and `Status`) is consistent with it.
- `unreviewed` rows are `activity_structured`, preserved, inspectable, and not flagged invalid.

### Expected distribution for the approved workbook (golden values)

| Class | Count | Rows |
|---|---|---|
| `activity_structured` | 3,489 | 2–3490 |
| of which `unreviewed` | 252 | 3239–3490 |
| `link_only` | 6 | 3526, 3535, 3537–3540 |
| Total data rows | 3,495 | |

## 2. Validation findings

Findings are observations, never deletions. Each finding stores code, severity, location (row, column), and non-sensitive details (counts, kinds). It never stores source text values.

| Code | Severity | Condition | Phase 1 expectation |
|---|---|---|---|
| V-CELL-ERROR | warning | Cell has an error value (`#N/A`) | 232 cells in 108 rows (cols A, C, E, Q, R, S, T, U) |
| V-TYPE-TEXT-IN-NUMERIC | warning | Text in K or L | K 80, L 75 |
| V-TYPE-NUMERIC-IN-TEXT | info | Number in X or AD | X 76, AD 203 |
| V-UNTRIMMED | info | Leading/trailing whitespace in a text cell | 377 cells (B 137, G 137, I 78, S 21, X 3, AA 1; the AA cell is also whitespace-only, so it may be counted under both codes) |
| V-WHITESPACE-ONLY | info | Whitespace-only text cell | 1 (AA) |
| V-MISSING-STRUCTURAL | warning | D, F or G blank in an `activity_structured` row | 0 expected |
| V-DUP-EXACT | warning | Identical A:AJ content in two rows | rows 3539/3540 (both `link_only`) |
| V-DUP-KEY-NORMALIZED | warning | Same D+F+G after trim and lowercase, different raw text | rows 1451 and 3371 |
| V-CATEGORY-VARIANT | info | Values in a configured variant group (e.g. `Take Out`/`Takeout`/`Take out`; `Shell script`/`Shell Script`; `Mobile & FMC`/`FMC & Mobile`) | configured list; no merging |
| V-CLS-MISMATCH | error | RC-1 and RC-2 disagree | 0 expected |
| V-UNREVIEWED | info | Row is in the unreviewed range (one finding per run, with count) | 252 |
| V-HEADER-DRIFT | error | Header differs from the approved 36 | 0 expected; blocks import |
| V-STALE-CACHE-RISK | info | Run-level reminder: workbook has formulas and an external link (cached values unverified) | 1 per run |

Severity vocabulary: `error` (blocks the run or invalidates an assumption), `warning` (data issue to review), `info` (observation). No severity deletes or excludes data. Whether warnings affect eligibility is Q-B12/Q-B8.

Category-variant groups are configuration, not business rules. They only flag; harmonization needs an approved rule.

## 3. Runs and versioning

- `ClassificationRun` records `classification_version`, the rule config hash, and counts per class.
- `ValidationRun` (a kind of run attached to the ImportRun) records the code catalog version.
- Rerunning with the same versions on the same import is idempotent: it returns the existing run.
- A new rule version creates a new run; previous classifications remain queryable.

## 4. Acceptance checks (golden)

A run on the approved workbook must reproduce: 3,495 data rows; 3,489 `activity_structured`; 252 `unreviewed`; 6 `link_only`; 36 header columns; 232 error cells in 108 rows; counts by finding code above. Mismatch fails the run's reconcile step.

## 5. Unresolved

- Q-B12: which rows are eligible for approved business assessments, and how unreviewed rows become eligible.
- Q-B8: effect of `#N/A` and blanks on eligibility.
- Q-B9: handling of the key-duplicate pair.
- Q-B4/Q-B5: which category spellings are equivalent.
