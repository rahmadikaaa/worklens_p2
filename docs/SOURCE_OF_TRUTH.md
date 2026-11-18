# Source of Truth

Phase 1 verification, read-only. The workbook was not modified. No workload or other business metric was calculated. Cell values below are the values cached in the file; no recalculation was done.

Labels: **Verified** = observed directly in the file. **Assumption** = not verified. **Unresolved** = needs a user decision. **Confirmed** = approved by the project owner (see `DECISIONS/0004-source-of-truth-decisions.md`).

## 0. Approved source-of-truth decisions (Confirmed)

| ID | Decision | Status |
|---|---|---|
| Q-S1 | `SOP L1 AGIT.xlsx` is the authoritative P2 workbook. Any file with a different hash needs re-verification. | **Confirmed**, hash confirmed by the owner |
| Q-S2 | Cached formula values are kept as source snapshots, with formula text and formula-origin metadata. They are never approved business calculations. External dependencies are not evaluated. Stale-cache risk is documented. | Approved with restrictions |
| Q-S3 | The 6 link-only rows are not activity records. Keep content and Excel row numbers, classify separately, never discard silently. | Approved |
| Q-S4 | Rows 3239–3490 are preserved and inspected, marked **unreviewed**, not auto-classified invalid, and excluded from approved business assessments until eligibility rules exist. | Approved |
| Q-S5 | AL:BI is excluded from activity-record ingestion. Workbook stays unchanged. | Approved |
| Q-S6 | The workbook is sensitive internal operational data. Not committed to a public repo; excluded via `.gitignore`; sensitive values kept out of logs and public docs. | Approved |

### Q-S1 hash confirmation (Confirmed)

The owner confirmed the pinned identity below. An earlier approval message quoted `…DE3BCC…`; the owner stated this was a typo and the correct sequence is `…DEB3CC…`, which equals the recomputed hash of the workspace file.

| Item | Value |
|---|---|
| Approved file | `SOP L1 AGIT.xlsx` |
| Approved SHA-256 | `AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092` |

Any file with a different hash is a different workbook and needs re-verification before use.
## 1. Workbook identity (Verified)

| Item | Value |
|---|---|
| File | `SOP L1 AGIT.xlsx` |
| Location | `C:\Users\rahma\OneDrive\Documents\worklens2\SOP L1 AGIT.xlsx` (workspace root) |
| Size | 43,726,542 bytes |
| File modified | 2026-11-17T16:20:49+07:00 |
| SHA-256 | `AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092` |
| Package integrity | ZIP test passed; XML parts parsed without error |
| Embedded metadata | created 2023-01-10T02:40:07Z; modified 2026-11-17T09:20:23Z; application `Microsoft Excel Online` (creator name omitted from docs) |
| Version label | None in file metadata (title, revision, status empty) |
| External link | 1 external link to a workbook named `Workload parameter_AGIT.xlsx` on an internal SharePoint site. Not followed, opened, or evaluated (Q-S2). |

This is the only workbook in the workspace. It is a different file from the legacy `p2_worklens\SOP L1 AGIT (8).xlsx` (43,709,605 bytes). Both declare the same `Breakdown Activity` range (A1:CJ3540), but the files are not byte-identical and were not compared further.

## 2. Sheets (Verified)

21 sheets. Exactly **one** sheet is named `Breakdown Activity`, so there is no ambiguity about which sheet is the intended source. `Daily Activity` also exists (hidden, A1:V178) and was not used.

| # | Sheet | State | Declared range |
|---|---|---|---|
| 1 | Q1 | hidden | A1:M98 |
| 2 | Ref | hidden | A1:T3052 |
| 3 | Daily Activity | hidden | A1:V178 |
| 4 | List App,BA,Topology | visible | A1:AF156 |
| 5 | All SOP | visible | A1:XEN1048576 |
| 6 | **Breakdown Activity** | visible | A1:CJ3540 |
| 7 | Sheet2 | visible | A1:B3299 |
| 8 | % All SOP | visible | A1:AA156 |
| 9 | SOP Hashtag - Mas Fairuz | hidden | A1:M250 |
| 10 | Mapping SOP - Daily Activity | hidden | A1:H67 |
| 11 | SOP Monitoring | hidden | A1:O123 |
| 12 | SOP Re-deployment | hidden | A1:M48 |
| 13 | Data Patch | hidden | A1:L16 |
| 14 | % Confluence | visible | A1:AA116 |
| 15 | % New and Take Out SOP | visible | A1:AE177 |
| 16 | Rev IT BITTE - Tower | hidden | A1:U691 |
| 17 | App Catalogue | hidden | A1:AD247 |
| 18 | Decom | hidden | A3:G272 |
| 19 | konf agent kedb | hidden | A1:E13 |
| 20 | Sienna | visible | A1:R3067 |
| 21 | Pancasila | visible | A1:AV23 |

Declared ranges are file metadata, not populated counts. Only `Breakdown Activity` was read cell by cell.

## 3. `Breakdown Activity` structure (Verified)

| Measure | Result |
|---|---|
| Declared range | A1:CJ3540 |
| Header row | Row 1 (frozen pane: row 1 and columns A–I) |
| Header columns | 36 (A–AJ), no duplicate header names, no blank header inside A–AJ |
| Data rows (rows with any value, excluding header) | **3,495** |
| Rows with any value including header | 3,496 |
| Rows that exist in the XML | 3,496 of 3,540 in the declared range; 44 row numbers are absent |
| Populated columns overall | 50: the 36 header columns plus 14 columns in AL:BI (see below) |
| Rightmost populated column | BI |
| Hidden rows | none |
| Merged cells | 1 (`AL56:BF56`, in the pivot area) |

**Source row numbering:** use the Excel row number of the sheet as seen in the file. Header is row 1; first data row is row 2.

**Row blocks (Excel row numbers):**
- Rows 2–3490: contiguous, 3,489 rows. All have values in D, F, G (APPS, TYPE ACTIVITY, ACTIVITY NAME), except where noted below.
- Rows 3491–3525, 3527–3534, 3536: absent (blank rows).
- Rows 3526, 3535, 3537, 3538, 3539, 3540: 6 rows that contain only column I (`Link Confluence`) and nothing else. They look like orphan link entries, not activities.
- 3,489 + 6 = 3,495 data rows.

**Column AK** (between the 36 header columns and the pivot area) is empty.

**Area AL:BI (14 columns):** contains pivot-table output with text such as `Count of ACTIVITY NAME`, `Grand Total`, `(Multiple Items)` and `#DIV/0!`. It sits in rows 2–149. The workbook contains pivot table parts; I did not verify which sheet each belongs to, so the pivot origin of this area is an Assumption based on its content. It looks like a summary, not source data. It must not be ingested as records.

## 4. Comparison with the historical reference

| Item | Historical | Verified | Result |
|---|---|---|---|
| Source rows | 3,495 | 3,495 data rows (rows with any value, header excluded) | Matches the count, but 6 of the rows contain only a link (see above), and rows are not contiguous |
| Columns | 36 | 36 header columns (A–AJ) | Matches |
| Declared sheet range | n/a | A1:CJ3540 | Larger than the data because of the pivot area and row gaps |
| Assessment information | Present | A column named `Assessment Status` exists (column Y) plus other candidate columns | Present, meaning not interpreted |

Caution: the match on 3,495 depends on counting the 6 link-only rows. Excluding them gives 3,489. Resolved by Q-S3: the 6 link-only rows are not activity records, so there are 3,489 activity-structured rows plus 6 link-only rows (section 7).

## 5. Data quality findings (Verified)

Counts are over the 3,495 data rows. "Blank" includes absent cells, empty cells and empty strings.

1. **Incomplete lower block.** Rows 3239–3490 (252 rows) have no value in `Automation/Manual` (P), `Status` (T), and mostly no values in P–AC. They hold only the leading columns (A–G, I and some of R, S, AD, AG). Rows 3288–3490 also have no `New Improvement Category Fixed` or `Phase`. These look like rows added after the last review pass. Per Q-S4 they are preserved, marked unreviewed, and kept out of approved business assessments until eligibility rules exist.
2. **Error values.** 108 rows contain at least one `#N/A` in A–AJ. These come from VLOOKUP formulas. By column: DIV 5, DEPT 5, APP PRIORITY 48, FMC/Mobile 7, Team QC 5, SOP Name 31, Status 62, Status (Old) 69 (Status (Old) is not a formula column). Errors are recorded as errors; they were not replaced.
3. **Formula (derived) columns.** Several columns are computed by Excel formulas, not entered as source values: A, B, C (mostly), E, M, N, O, Q, R, T, V; S (241 cells), and L (44 cells, e.g. `1/3`). Formulas depend on other sheets (`List App,BA,Topology`, `All SOP`). See `DATA_DICTIONARY.md`. Their cached values depend on those other sheets' state at save time.
4. **Mixed types in numeric-looking columns.**
   - `Durasi (Menit)` (K): 3,165 numbers and 80 text values (`30 menit` 31, `25 menit` 23, `20 menit` 11, `45 menit` 8, `15 menit` 4, `120 menit` 1, `60 menit` 1, `N/A` 1). Numbers range 0–1440, 33 zeros.
   - `Event Per Month` (L): 3,167 numbers and 75 text values (`N/A` 68, `30/31` 6, `Quarterly` 1). Numbers range 0–495, 1,630 zeros, 41 non-integers.
   - `Additional Notes` (X): 76 numeric cells in a text column.
   - `New Improvement Category Fixed` (AD): 203 numeric `0` cells among text categories.
5. **Missing values (blank or absent) per column:** H 3,493; I 139; J 127; K 250; L 253; M, N, O 415 each; P 258; Q 423; R 209; S 612; T 261; U 262; V, W, AH, AI 258 each; X 300; Y 741; Z 265; AA 2,143; AB 2,773; AC 3,381; AD and AG 211 each; AE, AF, AJ 3,495 (completely empty); C 40; A, B, D, F, G 6 each (the link-only rows).
6. **Duplicates.**
   - Rows 3539 and 3540 are identical (link-only rows).
   - Rows 1451 and 3371 share the same APPS + TYPE ACTIVITY + ACTIVITY NAME after trimming and lowercasing, but differ in raw text, so they are not exact duplicates. Values are omitted here because the workbook is sensitive; read them from the workbook by row number.
   - No duplicate `CONCAT` values (3,489 distinct), and no exact duplicate keys on APPS + TYPE ACTIVITY + ACTIVITY NAME.
7. **Whitespace.** Leading or trailing spaces: 137 values in `CONCAT`, 137 in `ACTIVITY NAME`, 78 in `Link Confluence`, 21 in `SOP Name`, 3 in `Additional Notes`; 1 whitespace-only value in `Tools`. (This corrects the loose wording in the Phase 1 chat summary, "about 240 values".)
8. **Inconsistent category spellings.**
   - `Status` and `Status (Old)`: `Take Out` / `Takeout` / `Take out`.
   - `Tools Automation`: `Shell script` (448) vs `Shell Script` (320).
   - `FMC/Mobile`: `Mobile & FMC` (44) vs `FMC & Mobile` (1).
   - `Improvement Category`: one value `Automated` next to `Automation`.
9. **Single-value columns.** `Number Activity` (J) is `1` in all 3,368 populated cells. `Assessment Status` (Y) is `Done` in all 2,754 populated cells. `Confirmation Tower/L2` (AE), `Support Needed` (AF) and `Module AO` (AJ) are empty in every row.
10. **Low-population columns.** `Link Wiki` (H) has 2 values. `Category Action` (AC) has 114. `Action by` (AB) has 722.
11. **Row-level redundancy.** `Status` vs `Status (Old)` and `New Improvement Category Fixed` vs `Improvement Category` are parallel columns with different value sets. Which is current is unresolved.

## 6. Assessment-related columns (names only, meaning not assumed)

Only column Y has "Assessment" in its name. The following columns could be related but this is a candidate list, not a finding:

`Assessment Status` (Y), `Improvement Category` (W), `Additional Notes` (X), `Category Notes` (Z), `Tools` (AA), `Action by` (AB), `Category Action` (AC), `New Improvement Category Fixed` (AD), `Confirmation Tower/L2` (AE), `Support Needed` (AF), `Phase` (AG), `Ops Activity` (AH), `Tools Automation` (AI), `Module AO` (AJ).

Which of these belong to "assessment" is Unresolved (Q-B3).


## 7. Record classes and handling rules (Confirmed unless marked Proposed)

These classes describe how source rows are preserved and labeled. They are source-preservation categories, not business classifications. No business eligibility rule is defined yet.

| Class | Excel rows | Count | Rule |
|---|---|---|---|
| Activity-structured rows | 2–3490 | 3,489 | Preserved as activity records (Q-S3 identifies only the 6 link-only rows as non-activity) |
| of which: **unreviewed** subset | 3239–3490 | 252 | Preserved and inspectable. Flagged `unreviewed`. Not auto-invalid. Excluded from approved business assessments until eligibility rules are approved (Q-S4) |
| Link-only rows | 3526, 3535, 3537, 3538, 3539, 3540 | 6 | Not activity records. Keep full original content and Excel row number. Classified separately. Never silently discarded (Q-S3) |
| Pivot/summary area | AL:BI, rows 2–149 | 14 columns | Excluded from activity-record ingestion. Documented exclusion. Workbook unchanged (Q-S5) |

3,489 + 6 = 3,495 data rows. This resolves the earlier count ambiguity: the historical 3,495 equals activity-structured rows plus link-only rows, and only 3,489 are activity records.

Notes:
- The unreviewed subset (rows 3239–3490) lies inside the contiguous activity block. It overlaps no other class.
- Whether rows 2–3238 are "reviewed" is not established. Only the 252-row subset is flagged unreviewed by the owner decision; no other eligibility is implied.

### Cached formula values (Q-S2)

- Cached values are source snapshots of what Excel stored at save time. They are not approved business calculations.
- Formula text and origin (formula vs entered value, shared/array formula type) are preserved with each cell where the file provides them.
- External workbook dependencies are not evaluated or fetched.
- **Stale-cache conditions (documented risks):**
  1. Lookup columns depend on sheets inside this workbook (`List App,BA,Topology`, `All SOP`). If those sheets changed after the last calculation, cached values may differ from a fresh calculation.
  2. The workbook has an external link to another workbook. Cached values derived from it may be out of date relative to that file, which is unavailable here.
  3. The file was last saved in Excel Online. Calculation mode and last-full-calculation state were not verified.
  4. `#N/A` cached values (108 rows) may reflect lookup misses at save time, not permanent absence.
  5. A cached value and its formula may disagree if the file was saved with stale calculations. No consistency check has been done.
- Ingestion must label every formula-origin value as `workbook-derived (cached)`.

### Sensitivity handling (Q-S6)

- The workbook is sensitive internal operational data. It is excluded from version control via `.gitignore` and must not be committed to a public repository.
- Logs, error messages, test fixtures, and public documentation must not contain source values (activity names, application names, links). Row numbers, column names, counts, and hashes are acceptable.
- Documentation in this repo records structure and low-cardinality category values only. Review `docs/` before any public release.
- Tests must use synthetic fixtures. This is a handling rule, not permission to generate mock business data for analysis.

## 8. Verification status

| Check | Status |
|---|---|
| Workbook located, identified, hashed | Done |
| `Breakdown Activity` exists exactly once | Done |
| Headers inventoried | Done (see `DATA_DICTIONARY.md`) |
| Counts compared with history | Done |
| Anomalies documented | Done |
| Owner approval of the source (Q-S1) | **Confirmed**, hash confirmed (section 0) |
| Q-S2 to Q-S6 | Approved |
| Source-to-domain mapping | Not started (Phase 2 proposal) |

## 8a. Related requirements reference (not a source)

The owner's business-requirements reference (`Workload_Enrichment_Tanya_Jawab_Q1-Q51`, reconciled in `REQUIREMENTS_RECONCILIATION_Q1_Q51.md`) names the workbook `DUMMY L1 AGIT.xlsx`. It is a requirements reference, **not a data source**. The pinned workbook above remains the only source of truth. Its statement that source files stay immutable and that enrichment and corrections must not change the source (section G.8) is consistent with Q-S decisions. Whether `DUMMY` is a structural stand-in for the pinned file is unconfirmed (Q-R22).

## 9. Re-verification trigger

Any file whose SHA-256 differs from the approved hash must be re-verified before use: identity, sheet existence, headers, counts, anomalies, and a comparison against this document. A different hash never inherits approval.

## 10. Unresolved

Source questions Q-S1 to Q-S6 are decided. Business definitions Q-B1 to Q-B11 are unresolved and listed in `DECISIONS/0003-open-questions.md`.

