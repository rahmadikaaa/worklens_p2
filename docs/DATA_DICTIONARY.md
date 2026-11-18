# Data Dictionary — `Breakdown Activity`

Source: `SOP L1 AGIT.xlsx`, SHA-256 `AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092`, sheet `Breakdown Activity` (the official data baseline). Header row 1; data rows 2–3540 (3,495 data rows). Identity and structure: `SOURCE_OF_TRUTH.md`. Domain mapping: `design/SOURCE_TO_DOMAIN_MAPPING.md`. Business reference: `REQUIREMENTS_RECONCILIATION_Q1_Q51.md`.

This dictionary answers two questions for each of the 36 columns: **what the source contains** (Verified in Phase 1, locked) and **what the column means** (only as far as it is stated, with its status).

## 1. Status vocabulary

| Label | Meaning |
|---|---|
| **Verified** | Observed in the pinned workbook in Phase 1 (or the read-only label counts recorded in the reconciliation). Locked; not re-derived here |
| **Confirmed** | Approved by the owner in a decision record (`0004`: Q-S1 to Q-S6) |
| **Reference** | Stated by the owner in the Q1–Q51 requirements reference. A recorded answer, not an approved technical decision (Q-R1) |
| **Proposed** | Design proposal awaiting approval |
| **Unresolved** | Not stated, or stated ambiguously. No meaning is assumed |

**No column meaning is Confirmed yet.** Meanings are either Reference or Unresolved. Structural facts are Verified.

## 2. Value kinds

Every stored value carries one kind (details in `DOMAIN_MODEL.md` §4):

| Kind | Source |
|---|---|
| `entered` | A constant in a workbook cell |
| `workbook_derived_cached` | A workbook formula's cached result, with its formula text. Not an approved WorkLens calculation (Q-S2) |
| `l1_authored` | Written by an L1 user in WorkLens (assessment layer). Never stored in `raw` |
| `worklens_derived` | Computed by WorkLens from an approved metric definition. **None exist** |
| `ai_generated` | AI output, reviewable. Deferred |

Formula-dominant columns (`workbook_derived_cached`): A, B, C, E, M, N, O, Q, R, T, V. Mixed with a minority of formulas: L (44) and S (241). Per-cell origin is recorded in `raw`; the Origin column below gives the counts.

## 3. Record scope (Confirmed, Q-S3/Q-S4/Q-S5)

| Class | Excel rows | Count | Rule |
|---|---|---|---|
| Activity-structured | 2–3490 | 3,489 | Activity records. One row = one activity (Reference, Q3; confirmation Q-R1) |
| of which `unreviewed` | 3239–3490 | 252 | Preserved and inspectable. Not invalid. Excluded from approved business assessments until eligibility rules exist (Q-B12) |
| Link-only | 3526, 3535, 3537–3540 | 6 | Not activities. Only column I has a value. Kept with original content and row numbers |
| Pivot area | AK, AL:BI | 14 populated columns | Excluded from activity ingestion. Not part of this dictionary |

## 4. Column dictionary

Non-blank counts cover all 3,495 data rows (the 6 link-only rows only have column I). Counts of category labels use the 3,489 activity-structured rows. Error cells (`#N/A`) count as non-blank. Domain field names are **Proposed** (`design/SOURCE_TO_DOMAIN_MAPPING.md`).

### 4.1 Identity and classification (A–I)

| Col | Header | Domain field | Verified profile | Origin | Meaning and status | Open |
|---|---|---|---|---|---|---|
| A | DIV | `wb_div` | 3,489 non-blank; text 3,484, error 5; 3 values (IT CFB 1,860; IT BDC 1,620; IT BITE 4) | Formula: lookup into sheet `List App,BA,Topology` | Unresolved (header only) | Meaning |
| B | CONCAT | `wb_concat` | 3,489; 3,489 distinct; 137 untrimmed | Formula: `APPS & " - " & ACTIVITY NAME` | Unresolved. Unique in this version; not confirmed as an identity key | Activity identity (Q-R24) |
| C | DEPT | `wb_dept` | 3,455; text 3,450, error 5; 6 values | Mixed: 3,449 formula (lookup), 6 constants | Unresolved | Meaning |
| D | APPS | `apps` | 3,489; 125 distinct | Entered | Unresolved (header: application) | |
| E | APP PRIORITY | `wb_app_priority` | 3,489; text 3,441, error 48; 4 values | Formula: lookup | Unresolved | Meaning |
| F | TYPE ACTIVITY | `type_activity` | 3,489; 9 values | Entered | Unresolved | |
| G | ACTIVITY NAME | `activity_name` | 3,489; 3,247 distinct; 137 untrimmed | Entered | **Reference** (Q6): activity name or description is a basis for assessment | |
| H | Link Wiki | `link_wiki` | 2 | Entered | Unresolved (header: link) | |
| I | Link Confluence | `link_confluence` | 3,356; 1,859 distinct; 78 untrimmed. Only value in link-only rows | Entered | Unresolved. Q6 names SOP/documentation as an assessment basis but does not name a column | Meaning |

### 4.2 Workload fields (J–O)

| Col | Header | Domain field | Verified profile | Origin | Meaning and status | Open |
|---|---|---|---|---|---|---|
| J | Number Activity | `number_activity` | 3,368; single value `1` | Entered | Unresolved | Q-B6 |
| K | Durasi (Menit) | `durasi_menit_num` / `_text` | 3,245; number 3,165 (0–1,440; 33 zeros), text 80 (`30 menit`, `25 menit`, `N/A`, …) | Entered | **Reference** (Q38): duration input to workload; minutes by header and Q38 | Text values (Q-R3) |
| L | Event Per Month | `event_per_month_num` / `_text` | 3,242; number 3,167 (0–495; 1,630 zeros; 41 non-integer), text 75 (`N/A` 68, `30/31` 6, `Quarterly` 1) | Mixed: 44 formulas (e.g. `1/3`) | **Reference** (Q38): frequency input to workload | `0`, `N/A`, `30/31`, `Quarterly` (Q-R3) |
| M | Workload | `wb_workload` | 3,080 numbers | Formula `K*L` | **Reference** (Q37, Q38): monthly total workload for one activity = `Durasi (Menit)` × `Event Per Month`, minutes/month. Workbook cache. **Not approved** under the `AGENTS.md` calculation gate | Gate items (Q-R3) |
| N | Durasi after | `wb_durasi_after` | 3,080 numbers (3,061 formula) | Formula `K*(1/10)` | **Reference** (Q39, Q40): estimate after improvement; static assumption, **not measured**. Not approved | Use of the assumption |
| O | Workload after | `wb_workload_after` | 3,080 numbers | Formula `N*L` | **Reference** (Q39, Q40): static assumption, 10% of `Workload` before, for all activities; **not measured impact** | Q41 saving formula is external; not reconstructed (Q-R2) |

### 4.3 Automation status and classification (P–V)

| Col | Header | Domain field | Verified profile | Origin | Meaning and status | Open |
|---|---|---|---|---|---|---|
| P | Automation/Manual | `automation_manual` | 3,237; `Manual` 1,685, `AO` 1,552; 252 blank | Entered | **Reference** (Q11, Q21–Q24): actual condition at assessment time, not an improvement decision. Automation includes non-AO and partial automation | Does the `AO` label cover non-AO automation (Q-R6) |
| Q | FMC/Mobile | `wb_fmc_mobile` | 3,072; text 3,065, error 7; 4 values | Formula: lookup into `All SOP` | Unresolved | |
| R | Team QC | `wb_team_qc` | 3,286; text 3,281, error 5; 8 values | Formula (3,249): lookup | Unresolved | |
| S | SOP Name | `sop_name` | 2,883; text 2,852, error 31; 1,633 distinct | Mixed: 241 formulas | Unresolved. SOP is an assessment basis (Q6) but the column is not named there | |
| T | Status | `wb_status` | 3,234; text 3,172, error 62; `DONE`, `Take Out`, `Takeout`, `Take out` | Formula (3,232): lookup into `All SOP` | Unresolved | Current vs `Status (Old)` (Q-B4); `Take Out` (Q-R19) |
| U | Status (Old) | `status_old` | 3,233; text 3,164, error 69 | Entered | Unresolved | Q-B4 |
| V | TYPE ACTIVITY2 | `wb_type_activity2` | 3,237; 5 values | Array formula (`IFS` on F) | Unresolved | |

### 4.4 Assessment and follow-up (W–AJ)

| Col | Header | Domain field | Verified profile | Origin | Meaning and status | Open |
|---|---|---|---|---|---|---|
| W | Improvement Category | `improvement_category` | 3,237; `Automation` 1,481; `As Is` 1,271; `Dismantled` 484; `Automated` 1; 252 blank | Entered | **Reference** (Q12): L1 decision of improvement direction: `Automation`, `As Is`, `Dismantled` | 1 variant; 252 blank |
| X | Additional Notes | `additional_notes_text` / `_num` | 3,195; text 3,119, number 76; 170 distinct | Entered | Unresolved. Not named in the reference; may relate to reasoning (Q11) but no mapping is assumed | Q-R8 |
| Y | Assessment Status | `assessment_status` | 2,754; single value `Done`; 735 blank | Entered | **Reference** (Q8, Q9): target is progress, data completeness and L2 validation; `Done` today does not prove completeness | State list, transitions, criteria (Q-R9) |
| Z | Category Notes | `category_notes` | 3,230; `Already Automation` 1,481; `Not Possible Automate` 780; `Dismantled` 488; `Not Yet Solution` 351; `To Be Automated` 118; 7 spelling variants of these; 5 other free-text; 259 blank | Entered | **Reference** (Q13, Q14, Q16, Q29–Q35): condition or status following the category. Target mapping: `Automation`→`Already Automation`; `As Is`→`To Be Automated`; `Dismantled`→`Dismantled` | `Not Possible Automate` undefined (Q-R4); combined format for `To Be Automated` + `Not Yet Solution` (Q-R7) |
| AA | Tools | `tools` | 1,353; 99 distinct; 1 whitespace-only | Entered | **Reference** (Q25): tools actually in use now (scripts, APIs, other apps, AO, combinations) | Per-row semantics |
| AB | Action by | `action_by` | 722; `L1` 699, `Part of L2` 23; 2,767 blank | Entered | **Reference** (Q42–Q44): party responsible for follow-up; L0/L1/L2 context | `Part of L2`; assignment rule (Q-R18) |
| AC | Category Action | `category_action` | 114; 4 values | Entered | Unresolved | Q-B3 |
| AD | New Improvement Category Fixed | `new_improvement_category_fixed_text` / `_num` | 3,284; `Automation` 1,437; `As Is` 1,068; `New Dismantled` 254; `Old Dismantled` 196; `To Be Automated` 126; numeric `0` 203; 205 blank | Entered | **Reference** (Q19, Q20): correction of the earlier `Improvement Category`, decided by L1 | Extra values; whether it overrides W (Q-R5) |
| AE | Confirmation Tower/L2 | `confirmation_tower_l2` | 0 (empty in all rows) | n/a | Unresolved | Where L2 confirmation is recorded (Q-R8) |
| AF | Support Needed | `support_needed` | 0 (empty in all rows) | n/a | Unresolved | Where L2 support need is recorded (Q-R8) |
| AG | Phase | `phase` | 3,284; `Phase 1` 2,941, `Phase 2` 343 | Entered | Unresolved | Q-B3 |
| AH | Ops Activity | `ops_activity` | 3,237; `Workaround` 1,815, `Ops Activity` 1,422 | Entered | Unresolved | |
| AI | Tools Automation | `tools_automation` | 3,237; 11 values (`Not Automate` 1,869; `Shell script` 448; `Shell Script` 320; `AION` 250; `Grafana` 249; …) | Entered | **Reference** (Q26–Q28): existing and planned automation tools in one column; existing vs. future is read from W, Z and P | `Not Automate` is not a tool |
| AJ | Module AO | `module_ao` | 0 (empty in all rows) | n/a | Unresolved | |

The reference does not name columns for reasoning/justification, L2 feedback or follow-up plan (Q11). **No mapping is assumed.** These are L1-authored fields in the assessment layer (Proposed, `DOMAIN_MODEL.md` §6) unless the owner assigns existing columns (Q-R8).

## 5. Reference-stated terms (business glossary)

All **Reference**; none Confirmed.

| Term | Meaning (Q) |
|---|---|
| Activity | One row of `Breakdown Activity` (Q3) |
| L0 / L1 / L2 | L0 operations; L1 performs improvement and owns assessment; L2 gives technical support and is not the activity owner (Q4, Q44) |
| Improvement Category | L1's decision: `Automation`, `As Is`, `Dismantled` (Q12) |
| Already Automation | Tool, script or AO is created or available. Use and success are not required (Q16, Q33–Q35) |
| To Be Automated | Automation planned, not yet built; stays so until built (Q16, Q32) |
| Not Yet Solution | Solution not found or not confirmed; not "impossible" (Q29, Q30) |
| Dismantled | Activity that can be dismantled (Q1, Q12) |
| Automation | Running via AO or other automation; partial counts (Q23, Q24) |
| Workload | `Durasi (Menit)` × `Event Per Month`, minutes/month, per activity (Q37, Q38). Gate incomplete |
| Workload after | Static assumption: 10% of `Workload` for all activities; not measured (Q39, Q40) |
| Monitoring | Operational process after assessment; not part of assessment or `Assessment Status` (Q36) |
| Enrichment / corrections | Never change the source file (Section G.8) |

## 6. Handling rules (Confirmed unless marked)

- Formula-origin values are stored as `workbook_derived_cached` with formula text and kind. External dependencies are not evaluated (Q-S2).
- The workbook, raw rows and raw cells are immutable. Corrections and edits live in the L1 assessment layer (Proposed layer; immutability is Confirmed).
- Inconsistent data is flagged for L1 review, never auto-corrected (Reference, Q18; aligns with flag-only findings).
- Source text values are sensitive. This dictionary records structure and low-cardinality category labels only (Q-S6).

## 7. Unresolved items

Each item has an ID in `REQUIREMENTS_RECONCILIATION_Q1_Q51.md` §7 and a gate in `ROADMAP.md`. They do not block the structural parts of this dictionary: types, origins, counts and domain field names are complete for all 36 columns.

- Meanings of columns marked Unresolved (A–F, H–J, Q–V, X, AC, AE–AH, AJ).
- Workload gate items: text values, zero events, missing values, aggregation, versioning, acceptance criteria (Q-R3).
- Category semantics: `Not Possible Automate`, AD extra values, `AO` label, combined notes format (Q-R4–R7).
- `Assessment Status` states and criteria (Q-R9).
- Where reasoning, L2 feedback and follow-up plan live (Q-R8).
- Activity identity across workbook versions (Q-R24).
