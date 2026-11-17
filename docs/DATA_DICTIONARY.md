# Data Dictionary — `Breakdown Activity`

Source: `SOP L1 AGIT.xlsx`, SHA-256 `AA7B8166…D0092`, sheet `Breakdown Activity` (see `SOURCE_OF_TRUTH.md`). Header row 1, data rows 2–3540 (3,495 data rows).

**Status: Verified structure and observed values. Domain mapping and business meaning are NOT defined.** Header names are kept in original spelling and order. "Domain field" is left unmapped on purpose.

Origin legend: **Entered** = constants typed or pasted in the cell. **Formula** = computed by Excel from other cells/sheets; the cached value is what we observe. **Mixed** = some cells formulas, some constants.

Non-blank counts are over 3,495 data rows and include error cells. Types are the cell types in the file (text, number, error).

| Col | Original header | Non-blank | Observed types | Origin | Formula pattern (as stored) | Distinct / notes |
|---|---|---|---|---|---|---|
| A | DIV | 3,489 | text 3,484; error 5 | Formula | `VLOOKUP(D,'List App,BA,Topology'!$A:$E,5,FALSE)` | 3 values (IT CFB 1,860; IT BDC 1,620; IT BITE 4) |
| B | CONCAT | 3,489 | text | Formula | `CONCAT(D," - ",G)` | 3,489 distinct; 137 untrimmed |
| C | DEPT | 3,455 | text 3,450; error 5 | Mixed (3,449 formula, 6 constant) | `VLOOKUP(D,'List App,BA,Topology'!$A:$E,3,FALSE)` | 6 values |
| D | APPS | 3,489 | text | Entered | | 125 distinct |
| E | APP PRIORITY | 3,489 | text 3,441; error 48 | Formula | `VLOOKUP(D,'List App,BA,Topology'!$A:$E,2,FALSE)` | 4 values |
| F | TYPE ACTIVITY | 3,489 | text | Entered | | 9 values |
| G | ACTIVITY NAME | 3,489 | text | Entered | | 3,247 distinct; 137 untrimmed |
| H | Link Wiki | 2 | text | Entered | | URLs |
| I | Link Confluence | 3,356 | text | Entered | | 1,859 distinct; 78 untrimmed |
| J | Number Activity | 3,368 | number | Entered | | Single value `1` |
| K | Durasi (Menit) | 3,245 | number 3,165; text 80 | Entered | | 29 distinct; text like `30 menit`, `N/A`; unit label suggests minutes (Assumption) |
| L | Event Per Month | 3,242 | number 3,167; text 75 | Mixed (44 formula such as `1/3`) | | 36 distinct; text `N/A`, `30/31`, `Quarterly` |
| M | Workload | 3,080 | number | Formula | `K*L` | Derived in the workbook. Not an approved WorkLens definition |
| N | Durasi after | 3,080 | number | Mixed (3,061 formula) | `K*(1/10)` | Derived in the workbook. Not approved |
| O | Workload after | 3,080 | number | Formula | `N*L` | Derived in the workbook. Not approved |
| P | Automation/Manual | 3,237 | text | Entered | | `Manual` 1,685; `AO` 1,552 |
| Q | FMC/Mobile | 3,072 | text 3,065; error 7 | Mixed (3,012 formula) | `VLOOKUP(I,'All SOP'!$H:$N,7,FALSE)` | 4 values |
| R | Team QC | 3,286 | text 3,281; error 5 | Mixed (3,249 formula) | `VLOOKUP(D,'List App,BA,Topology'!$A:$G,6,FALSE)` | 8 values |
| S | SOP Name | 2,883 | text 2,852; error 31 | Mixed (241 formula) | `CONCAT(D," - ",G)` where formula | 1,633 distinct |
| T | Status | 3,234 | text 3,172; error 62 | Mixed (3,232 formula) | `VLOOKUP(I,'All SOP'!H:I,2,FALSE)` | `DONE`, `Take Out`, `Takeout`, `Take out` |
| U | Status (Old) | 3,233 | text 3,164; error 69 | Entered | | Same value family as T |
| V | TYPE ACTIVITY2 | 3,237 | text | Formula | `IFS` mapping from F to 5 groups | 5 values |
| W | Improvement Category | 3,237 | text | Entered | | `Automation` 1,481; `As Is` 1,271; `Dismantled` 484; `Automated` 1 |
| X | Additional Notes | 3,195 | text 3,119; number 76 | Entered | | 170 distinct |
| Y | Assessment Status | 2,754 | text | Entered | | Single value `Done` |
| Z | Category Notes | 3,230 | text | Entered | | 11 values |
| AA | Tools | 1,353 | text | Entered | | 99 distinct; 1 whitespace-only |
| AB | Action by | 722 | text | Entered | | `L1` 699; `Part of L2` 23 |
| AC | Category Action | 114 | text | Entered | | 4 values |
| AD | New Improvement Category Fixed | 3,284 | text 3,081; number 203 | Entered | | `Automation` 1,437; `As Is` 1,068; `New Dismantled` 254; numeric `0` 203 |
| AE | Confirmation Tower/L2 | 0 | | | | Empty in all rows |
| AF | Support Needed | 0 | | | | Empty in all rows |
| AG | Phase | 3,284 | text | Entered | | `Phase 1` 2,941; `Phase 2` 343 |
| AH | Ops Activity | 3,237 | text | Entered | | `Workaround` 1,815; `Ops Activity` 1,422 |
| AI | Tools Automation | 3,237 | text | Entered | | 11 values; `Shell script`/`Shell Script` case variants |
| AJ | Module AO | 0 | | | | Empty in all rows |

Columns AK (empty) and AL:BI (pivot-style summary area, 14 populated columns) are outside the record structure. AL:BI is excluded from activity-record ingestion (approved Q-S5). It is preserved in the workbook, which stays unchanged.

## Handling rules from approved decisions

- Every formula-origin value (see Origin column) is stored as `workbook-derived (cached)` together with its formula text and formula type (Q-S2). Cached values are never treated as approved calculations. External dependencies are not evaluated.
- Row classes: activity-structured rows 2–3490 (3,489), of which rows 3239–3490 are flagged `unreviewed` (Q-S4); link-only rows 3526, 3535, 3537–3540 (6) are not activity records and are classified separately with original content kept (Q-S3).
- The dictionary records structure and low-cardinality category values only. Source text values are sensitive (Q-S6) and are not reproduced.

## Original vs. derived

- Columns computed inside the workbook (A, B, E, M, N, O, V, and the formula portions of C, L, N, Q, R, S, T) are **workbook-derived values**. Ingestion must store them as source-labeled "workbook-derived" and never as WorkLens-calculated values. Their formulas depend on other sheets and an external workbook.
- `Workload` (M), `Durasi after` (N) and `Workload after` (O) are stored by the workbook as formulas. Their presence does not approve any formula for WorkLens (see `AGENTS.md` calculation gate).

## Observed assessment-related column names (meaning not assumed)

Y `Assessment Status`; candidates W, X, Z, AA, AB, AC, AD, AE, AF, AG, AH, AI, AJ. See `SOURCE_OF_TRUTH.md` section 6.

## Unmapped / pending

- Domain field names, types, nullability, and keys (no natural key is confirmed; `CONCAT` is unique but is a formula).
- Meaning of every column beyond its header text.
- Unit of K and L (header suggests minutes and events per month; not confirmed).
- Treatment of text values in K and L (`30 menit`, `N/A`, `Quarterly`, `30/31`).
- Treatment of `#N/A` error cells and blank cells.
