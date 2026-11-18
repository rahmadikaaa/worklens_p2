# Source-to-Domain Mapping (all 36 columns)

Status: **Proposed.** Field names, types and mapping rules are design proposals (mapping version 1). This mapping is mechanical: it moves values, it does not interpret them. Column **meanings** and their statuses (Confirmed, Reference, Unresolved) are in `DATA_DICTIONARY.md`; unresolved meanings do not block the mapping.

Source: `SOP L1 AGIT.xlsx`, sheet `Breakdown Activity`, header row 1, ingestion window **A:AJ** (Q-S5 excludes AL:BI). Counts come from `DATA_DICTIONARY.md`. Built in Phase 4 (normalization); `raw` capture of A:AJ happens in Phase 3.

## Mapping rules (Proposed)

1. **Raw first.** Every cell in A:AJ of every non-empty row is stored in `raw.raw_cell` exactly as read (value, cell type, formula text and kind, error code). The domain layer is built from raw, never from the workbook.
2. **Names follow headers.** Proposed field names are a mechanical snake_case transliteration of the header. No semantic renaming.
3. **Origin prefix.** Columns where formulas dominate (more than half of populated cells) get a `wb_` prefix on the domain field, as a reminder that the value is a cached workbook result and not a WorkLens calculation. Cell-level origin in `raw_cell` stays authoritative for mixed columns.
4. **No interpretation in normalization.** Normalization only: copies values, assigns the declared type when the cell has that type, and records cell errors. It does not trim, case-fold, parse text such as `30 menit`, replace `N/A`, substitute `0`, or merge category spellings. (Trimming or spelling harmonization needs an approved rule; see Q-B7, Q-B8, V-codes in `ROW_CLASSIFICATION_AND_VALIDATION.md`.)
5. **Mixed-type columns (K, L, X, AD)** get two typed fields: `<field>_num` (set only if the cell is numeric) and `<field>_text` (set only if the cell is text). Exactly one is set per non-blank cell.
6. **Error cells** (`#N/A`) leave the typed field NULL and are recorded in `source_error_codes` (field → error code). Nothing is substituted.
7. **Blank cells** map to NULL. Empty string and whitespace-only text are preserved as-is in raw; in domain they map to NULL only for empty string, and whitespace-only text is kept as text and flagged (V-codes).
8. **Link-only rows** do not produce ActivityRecords. They produce a LinkRecord holding the column I value.
9. **Provenance fields** on every domain row: `raw_row_id`, `excel_row`, `import_run_id`, `normalization_run_id`, `mapping_version`.
10. **Source mirror is never edited.** The fields below mirror the workbook (`entered` or `workbook_derived_cached`). L1 decisions about the same concepts (`improvement_category`, `category_notes`, `tools_automation`, `assessment_status`, and others) are stored in the `assessment` layer as `l1_authored` values (`DOMAIN_MODEL.md` §6). The mirror field and the L1 field are different fields and are shown together in the effective view, each with its kind label.
11. **Values are not conformed.** Values that differ from the Reference's target categories (for example `Old Dismantled`, `Not Possible Automate`, numeric `0` in column AD) are preserved as they are. They produce validation findings (flag-only), never corrections (Reference Q17, Q18).

## Column mapping

Types: `text`, `numeric` (PostgreSQL `double precision` to preserve the stored double), `text+numeric` = dual fields per rule 5.

| Col | Source header | Proposed domain field | Type | Origin (observed) | Open question |
|---|---|---|---|---|---|
| A | DIV | `wb_div` | text | formula (VLOOKUP) | Q-B3 meaning |
| B | CONCAT | `wb_concat` | text | formula (CONCAT) | Q-B1 (is it a key?) |
| C | DEPT | `wb_dept` | text | formula (99.8%); 6 constants | |
| D | APPS | `apps` | text | entered | |
| E | APP PRIORITY | `wb_app_priority` | text | formula | |
| F | TYPE ACTIVITY | `type_activity` | text | entered | |
| G | ACTIVITY NAME | `activity_name` | text | entered | Q-B1 grain |
| H | Link Wiki | `link_wiki` | text | entered | 2 values only |
| I | Link Confluence | `link_confluence` | text | entered | Also the only value in link-only rows |
| J | Number Activity | `number_activity` | numeric | entered | Q-B6 (always 1) |
| K | Durasi (Menit) | `durasi_menit_num` / `durasi_menit_text` | text+numeric | entered | Q-B2 unit, Q-B7 text values |
| L | Event Per Month | `event_per_month_num` / `event_per_month_text` | text+numeric | mixed (44 formulas, e.g. `1/3`) | Q-B2, Q-B7 |
| M | Workload | `wb_workload` | numeric | formula (`K*L`) | Q-B2. Workbook cache, not approved |
| N | Durasi after | `wb_durasi_after` | numeric | formula (`K*(1/10)`), 3,061 of 3,080 | Q-B2. Not approved |
| O | Workload after | `wb_workload_after` | numeric | formula (`N*L`) | Q-B2. Not approved |
| P | Automation/Manual | `automation_manual` | text | entered | Q-B5 |
| Q | FMC/Mobile | `wb_fmc_mobile` | text | formula (VLOOKUP to `All SOP`) | |
| R | Team QC | `wb_team_qc` | text | formula (99%) | |
| S | SOP Name | `sop_name` | text | mixed (241 formulas) | |
| T | Status | `wb_status` | text | formula (VLOOKUP to `All SOP`) | Q-B4, Q-B5 |
| U | Status (Old) | `status_old` | text | entered | Q-B4 |
| V | TYPE ACTIVITY2 | `wb_type_activity2` | text | array formula (IFS) | |
| W | Improvement Category | `improvement_category` | text | entered | Q-B3, Q-B4, Q-B5 |
| X | Additional Notes | `additional_notes_text` / `additional_notes_num` | text+numeric | entered | 76 numeric cells in a text column |
| Y | Assessment Status | `assessment_status` | text | entered | Q-B3 |
| Z | Category Notes | `category_notes` | text | entered | Q-B3 |
| AA | Tools | `tools` | text | entered | |
| AB | Action by | `action_by` | text | entered | |
| AC | Category Action | `category_action` | text | entered | Q-B3 |
| AD | New Improvement Category Fixed | `new_improvement_category_fixed_text` / `_num` | text+numeric | entered | Q-B4, Q-B6 (203 numeric `0`) |
| AE | Confirmation Tower/L2 | `confirmation_tower_l2` | text | n/a (empty in all rows) | Keep the field; empty in this version |
| AF | Support Needed | `support_needed` | text | n/a (empty in all rows) | Keep the field; empty in this version |
| AG | Phase | `phase` | text | entered | Q-B3 |
| AH | Ops Activity | `ops_activity` | text | entered | |
| AI | Tools Automation | `tools_automation` | text | entered | |
| AJ | Module AO | `module_ao` | text | n/a (empty in all rows) | Keep the field; empty in this version |

Empty-in-this-version columns (AE, AF, AJ) are kept so the mapping stays complete and future workbook versions are accepted by re-verification, not by silent schema change.

## L1-authored fields (not mapped from the workbook; Proposed)

These have no source column and are stored only in the `assessment` layer: `reasoning`, `information_gaps`, `l2_feedback`, `l2_support_needed` (Reference Q5, Q7, Q11), and follow-up items. Whether the empty columns AE `Confirmation Tower/L2` and AF `Support Needed` should be used instead is Unresolved (Q-R8); they remain mirrored as empty source fields either way.

## Not mapped

- Columns AK and AL:BI (Q-S5). Each import run records the exclusion in its manifest: excluded range, count of populated cells, and a hash of the region, so a change in the area is visible without ingesting it. Whether to also archive the region cells in `raw` is **Unresolved (Q-D1)**.
- Rows that are absent from the sheet (44 row numbers) have no representation; the run manifest lists them as absent.

## Mapping versioning

The mapping is versioned (`mapping_version`, e.g. `1`). Any change to field names, types, or rules creates a new version and a new NormalizationRun. Old runs remain.

## Header guard (Proposed)

Ingestion refuses a workbook whose `Breakdown Activity` header row differs from the 36 approved headers (names, order, count). Different headers mean a different version and require re-verification (Q-S1).
