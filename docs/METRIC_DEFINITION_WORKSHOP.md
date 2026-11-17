# Metric Definition Workshop

Status: **Proposed template and candidate list.** **Nothing here is an approved business rule.** Candidate formulas are discussion options. No workload, scoring, or impact formula is finalized or implemented. Every metric needs explicit project-owner approval recorded in `docs/DECISIONS/`.

## 1. How to use

For each metric: pick a candidate (or define a new one), answer the required questions, fill the approval record, and have the owner approve. Only then may a MetricDefinition move to `approved` and be implemented (Phase 5 outcome, Phase 6 implementation).

## 2. Approval record template (one per metric)

| Field | Content |
|---|---|
| Metric key and version | e.g. `workload.monthly_minutes` v1 |
| Business purpose | Which decision it supports |
| Definition (plain language) | |
| Subject / grain | What one value describes (row, app, department…) |
| Source fields | Domain fields, with origin (entered / workbook-derived) |
| Unit | |
| Formula | Exact, with operator precedence |
| Missing values | Rule per input field |
| Invalid values | Rule per input (text, errors, negatives, zero) |
| Eligibility | Which rows are included (links to Q-B12 outcome) |
| Aggregation rules | Sum, weighted, grouping dimensions, double-count protection |
| Rounding and precision | |
| Versioning | When a change creates a new version; how old results are kept |
| Validation and acceptance criteria | Hand-checked examples, reconciliation target, tolerance |
| Provenance | Inputs and runs recorded per value |
| Owner decision reference / approver / date | |

## 3. Candidate metrics (not approved)

Dependencies refer to domain fields from `SOURCE_TO_DOMAIN_MAPPING.md`.

| ID | Candidate metric | Candidate formula options | Data dependencies | Missing definitions | Blocking questions |
|---|---|---|---|---|---|
| C-01 | Activity count | (a) count of activity-structured rows; (b) count after eligibility filter; (c) count of distinct activity names | `row_class`, eligibility, `activity_name` | What counts as one activity (grain); eligibility | Q-B1, Q-B12 |
| C-02 | Activity workload (per activity, per month) | (a) duration × events per month, as the workbook computes in column M; (b) (a) with text values normalized by an approved parsing rule; (c) (a) restricted to rows with numeric inputs only; (d) other, owner-defined | `durasi_menit_*`, `event_per_month_*`, `number_activity`, `wb_workload` for reconciliation | Unit (minutes?); meaning of `Event Per Month` (events per month, or count, with `1/3` and `Quarterly`); role of `Number Activity` (always 1); text handling; treatment of zeros | Q-B2, Q-B6, Q-B7 |
| C-03 | Total workload by dimension | Sum of C-02 grouped by department, app, type, category, tower; options for unreviewed rows included or excluded | C-02 plus dimension fields | Aggregation rules, eligibility, which dimension is authoritative (formula-derived dept and app priority) | Q-B2, Q-B12 |
| C-04 | Duration after automation | (a) workbook column N (`K*(1/10)`, a fixed 10%); (b) measured post-automation duration; (c) owner-approved factor per category; (d) not computed until measured data exist | `durasi_menit_*`, `wb_durasi_after`; measured values do not exist in the workbook | Where the 10% comes from; whether it is an assumption or a measurement | Q-B2, Q-B10 |
| C-05 | Workload after automation | (a) duration after × events (workbook column O); (b) based on measured actuals | C-04, events | As C-04 | Q-B2, Q-B10 |
| C-06 | Workload reduction (absolute) | (a) C-02 minus C-05; (b) applied only to activities with an approved automation status | C-02, C-05, `automation_manual`, `improvement_category`, `wb_status` | Which activities count as automated or planned; time horizon | Q-B3, Q-B5, Q-B10 |
| C-07 | Workload reduction (percent) | (a) C-06 / C-02; (b) weighted across a group; (c) undefined for zero baseline | C-06, C-02 | Zero-baseline handling (1,630 rows have zero events) | Q-B2, Q-B7 |
| C-08 | Automation coverage | (a) share of activities labeled `AO` in `automation_manual`; (b) share by workload; (c) by improvement category | `automation_manual`, `improvement_category`, `new_improvement_category_fixed_*` | Which of the parallel columns is authoritative; what `AO`, `As Is`, `Dismantled`, `Take Out` mean | Q-B3, Q-B4, Q-B5 |
| C-09 | Automation opportunity indicator | (a) rule-based flag from category fields; (b) criteria set on workload, frequency, feasibility notes; (c) AI-assisted advisory only, reviewed | C-02, category fields, `category_notes`, `tools`, `tools_automation` | What an opportunity is; feasibility criteria; relation to notes such as "Not Possible Automate" | Q-B3, Q-B10 |
| C-10 | Opportunity priority score | (a) ranking by C-02 or C-06; (b) weighted multi-criteria (workload, app priority, effort, risk); (c) rank within category; weights set by the owner | C-09 inputs, `wb_app_priority`, `phase` | Criteria, weights, tie-breaking, normalization | Q-B10 |
| C-11 | Realized impact | (a) measured before/after; (b) estimate from C-06; (c) not computed until post-automation measurements exist | Not available in this workbook (post-automation actuals) | Source of actuals; validation method | Q-B10 |
| C-12 | Capacity equivalent (e.g. FTE) | (a) C-02 or C-06 divided by available minutes per person per month; (b) not in scope | Needs an hours-per-FTE parameter that is not in the workbook | The parameter and its source | Q-B2, Q-B10 |
| C-13 | Data completeness | (a) share of eligible rows with usable duration and frequency; (b) count of rows excluded per reason | validation findings, inputs | Eligibility; this metric supports trust, and is not a business outcome | Q-B8, Q-B12 |

Observation, not a rule: the workbook contains formulas for M, N and O (`K*L`, `K*(1/10)`, `N*L`). They are listed as candidate options (C-02a, C-04a, C-05a). `AGENTS.md` still forbids treating them as approved.

## 4. Required business questions

### Meaning and grain
1. What does one row represent: an activity, an activity instance, an activity-per-app pair, an SOP step?
2. Is `Number Activity` (always 1) used for anything?
3. Which key identifies an activity? Is `CONCAT` (app + activity name) a key? How should the near-duplicate pair (rows 1451, 3371) be handled?

### Workload inputs
4. Unit and meaning of `Durasi (Menit)`: minutes per execution?
5. Meaning of `Event Per Month`: executions per month? What do `0`, `1/3`, `30/31`, `N/A`, and `Quarterly` mean? Why are 1,630 rows zero?
6. Is workload per activity, per person, per team, per tower? Is there a time window other than a month?
7. How to treat text durations (`30 menit`) and `N/A`: parse, exclude, or ask for correction at the source?
8. How to treat `#N/A` values and blank inputs: exclude, count separately, or block the metric?

### Status and categories
9. Which status is current: `Status` or `Status (Old)`? Which category is current: `Improvement Category` or `New Improvement Category Fixed`?
10. Meaning of `AO`, `Manual`, `As Is`, `Automation`, `Automated`, `Dismantled`, `New Dismantled`, `Take Out`, `Phase 1`, `Phase 2`, `Ops Activity`, `Workaround`, and the numeric `0` in the new category column.
11. Which columns form the "assessment"? Does `Assessment Status` = `Done` mean the row is eligible?

### Eligibility and scope
12. How do unreviewed rows (3239–3490) become eligible? Are rows with missing inputs or `#N/A` eligible?
13. Are dismantled or taken-out activities excluded from workload?

### Automation and impact
14. What is an automation opportunity? Which activities are candidates?
15. What are the prioritization criteria and their weights? Who owns them?
16. Is "10% duration after" (column N) an assumption, a target, or a measurement?
17. How will impact be measured and validated? Are post-automation actuals available?
18. What is the time horizon and the baseline period?

### Users and decisions
19. Who uses the outputs and which decisions do they support (Q-B11)?

## 5. Missing data (observed)

- Post-automation measured durations and event counts: not in the workbook.
- Hours per FTE or capacity parameters: not in the workbook.
- Cost data (if cost impact is wanted): not in the workbook.
- Definitions of status and category values: not in the workbook.
- Lookup sheets behind formula columns (`List App,BA,Topology`, `All SOP`) are not approved sources.

## 6. Proposed workshop sequence

1. Settle grain, units, and eligibility (Q-B1, Q-B2, Q-B7, Q-B8, Q-B12). These gate C-01 to C-03.
2. Settle status and category semantics (Q-B3 to Q-B6). These gate C-06 to C-09.
3. Define baseline workload (C-02, C-03), with worked examples approved by hand.
4. Define post-automation and reduction (C-04 to C-07).
5. Define opportunity and priority criteria (C-09, C-10); decide AI role.
6. Define impact measurement (C-11, C-12) once the actuals question is answered.

Each step ends with an approved record and a decision file (`0006+`). No step starts implementation.
