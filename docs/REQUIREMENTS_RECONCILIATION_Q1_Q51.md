# Requirements Reconciliation — Q1 to Q51

Status: **Reconciliation, not a decision record.** The reference document (`Workload_Enrichment_Tanya_Jawab_Q1-Q51`) describes itself as "Rekaman jawaban pengguna; bukan spesifikasi final" and says gaps must not be filled with assumptions. Its answers are therefore recorded here as **owner-stated requirements (reference)**. They become **Confirmed** only when the owner approves them in a decision record (Q-R1).

Precedence: approved decisions (`0001`–`0004`, locked 10 + 4 modules, calculation gate in `AGENTS.md`) stay in force. The pinned workbook `SOP L1 AGIT.xlsx` (SHA-256 `AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092`) remains the only source of truth.

## 1. Notes on the reference

- It names the workbook `DUMMY L1 AGIT.xlsx`, not the pinned file. The column names it uses all exist in the pinned `Breakdown Activity` headers. Section 5 checks its target rules against the pinned data. Whether "DUMMY" is a stand-in for the same structure is unconfirmed (Q-R22).
- Its title says Q1–Q49. Q50–Q51 are appended. All 51 are recorded below.
- Language: Indonesian terms are kept where they are product terms (`Durasi (Menit)`, `Event Per Month`, `Tools Automation`).
- Not reconstructed: the workload-saving formula (Q41) and any measured impact. `Workload after` as 10% of `Workload` is recorded as a **static assumption, not measured impact** (Q39).

## 2. Status legend

| Status | Meaning |
|---|---|
| COVERED | Existing documents already consistent; nothing to change |
| UPDATED | Answer is unambiguous; documentation now reflects it as reference-stated |
| PARTIAL | Answer is useful but mapping, scope or approval items remain open |
| MISSING | Requirement has no counterpart in the current design |
| CONFLICT | Conflicts with an existing document, decision, or observed data. Not resolved here |
| UNRESOLVED | The reference itself leaves it open |

Totals (counted from the table in section 3, after the Phase 2 finalization pass): UPDATED 22, PARTIAL 14, CONFLICT 8, UNRESOLVED 4, COVERED 3, MISSING 0. Total 51. Q7 and Q46 moved from MISSING to PARTIAL because the design now has a Proposed counterpart; neither is approved.

## 3. Q1–Q51 reconciliation

| Q | Answer in reference (faithful summary) | Status | Reconciliation |
|---|---|---|---|
| 1 | Purpose: identify automation opportunities with AO; validate running automation; identify manual activities and activities that can be dismantled; potential workload reduction | PARTIAL | Matches vision. "Potential workload reduction" depends on the Q41 artifact (Q-R2) |
| 2 | Object: all activities in `Breakdown Activity` (manual, already AO/automation, potential) | UPDATED | Consistent with Q-S4 (all rows preserved). Eligibility rules still open (Q-B12) |
| 3 | Unit: one row = one activity assessed | UPDATED | Answers Q-B1 (reference-stated). The 6 link-only rows are not activities (Q-S3) |
| 4 | L1 AGIT owns and performs assessment; L2 supports technical knowledge when needed | UPDATED | Roles and agent notes updated. No L2 application role stated |
| 5 | L1 assesses and asks L2 feedback when needed; not every activity | PARTIAL | Where L2 feedback is recorded is open (Q-R8) |
| 6 | Basis: activity name/description, SOP/docs, L2 explanation, As Is observation, tools, automation info, obstacles, improvement target, PIC/stakeholder, duration, frequency; not all mandatory | PARTIAL | Several inputs (obstacles, target, PIC) have no identified workbook column |
| 7 | Incomplete information: defer assessment, or L1 assesses provisionally and records the gaps | PARTIAL | Phase 2 finalization: the L1 layer has an `information_gaps` field (Proposed). Use of provisional assessments in reports and eligibility is open (Q-R10) |
| 8 | `Assessment Status` should reflect progress, data completeness and L2 validation; today `Done` does not prove completeness | CONFLICT | Pinned data: column Y has one value, `Done` (2,754 rows; 741 blank). It cannot be used as proof of completeness (Q-R9) |
| 9 | Done = L1 finished, information judged sufficient, category decision available; L2 feedback only if needed; current filling may follow team convention | UNRESOLVED | Flow from initial status to `Done` is deferred in the reference (section G.1) |
| 10 | L1 decides when L2 is needed (unclear description or SOP, AO/dismantle opportunity, confirmation) | COVERED | L1 discretion; no system rule needed |
| 11 | Assessment output: `Improvement Category`, `Category Notes`, `Tools Automation`/solution, reasoning/justification, L2 support need, follow-up plan. `Automation/Manual` is actual condition, not an improvement decision | PARTIAL | First three map to columns W, Z, AI. Reasoning, L2 support need and follow-up plan have no confirmed column; `Support Needed` and `Confirmation Tower/L2` are empty in all rows (Q-R8) |
| 12 | `Improvement Category` = direction decided by L1: `Automation`, `As Is`, `Dismantled` | UPDATED | Pinned column W matches, plus 1 variant (`Automated`) and 252 blanks |
| 13 | `Category Notes` explains the condition or status that follows from the category | UPDATED | Column Z |
| 14 | Target mapping: `Automation` → `Already Automation`; `As Is` → `To Be Automated`; `Dismantled` → `Dismantled` | CONFLICT | Target rule vs. data differs widely (section 5). Q17 acknowledges data may differ |
| 15 | Decision factors: L1 opportunity evaluation, L2 feedback, availability of AO solution/tools | COVERED | Factors, not an algorithm. Supports "AI advisory only; L1 decides" |
| 16 | `Already Automation` = solution/tool created or available. `To Be Automated` = planned; implementation need not have started | UPDATED | Added to data dictionary terms |
| 17 | The Q14 mapping is the target rule; current data may be inconsistent | COVERED | Consistent with flag-only validation (Q-D3) |
| 18 | Inconsistent data: flag for L1 review; do not auto-correct source; L1 decides corrections | UPDATED | Supports flag-only findings and the Quality Review capability; corrections live outside the source |
| 19 | `New Improvement Category Fixed` = correction of the earlier `Improvement Category`, not the initial recommendation | CONFLICT | Pinned column AD has values beyond the three categories (section 5). Whether AD overrides W is open (Q-R5) |
| 20 | L1 determines the correction using assessment and optional L2 feedback | UPDATED | L1 is the decision authority |
| 21 | `Automation/Manual` = actual condition: still manual or already automated | UPDATED | Column P; observed labels are `AO`, `Manual` (see Q23) |
| 22 | Determined as the actual condition at assessment time | UPDATED | |
| 23 | Automation = already running via AO or other automation (script/tools); not limited to AO | CONFLICT | Column P labels are `AO` / `Manual`. Whether `AO` covers non-AO automation is open (Q-R6) |
| 24 | Partial automation still counts as `Automation` | UPDATED | |
| 25 | `Tools` = tools actually used now (scripts, APIs, other apps, AO, combinations) | PARTIAL | Column AA is populated in 1,353 rows. Semantics per row not verified |
| 26 | `Tools Automation` may hold existing or planned automation tools | PARTIAL | Column AI. Observed top value `Not Automate` (1,869 rows) is not a tool; meaning open |
| 27 | Existing and future automation are recorded in the one `Tools Automation` column | UPDATED | |
| 28 | Existing vs future is interpreted from `Improvement Category`, `Category Notes` and `Automation/Manual`; no separate marker | PARTIAL | Derivation rule not defined |
| 29 | Unknown tool: L1 searches alternatives; if none, `Category Notes = Not Yet Solution` | UPDATED | |
| 30 | `Not Yet Solution` = solution not found, search unsuccessful, L2 support needed, or feasibility unconfirmed; not "impossible" | CONFLICT | Pinned column Z has `Not Possible Automate` (780 rows), which the reference does not define (Q-R4) |
| 31 | `To Be Automated` can also be `Not Yet Solution`; the single-cell format is not decided | UNRESOLVED | Q-R7 |
| 32 | After a solution is found, notes stay `To Be Automated` until automation is actually built | UPDATED | |
| 33 | "Created" = tool/script/AO exists; use is not required | UPDATED | |
| 34 | Never having been triggered does not matter; still `Already Automation` | UPDATED | |
| 35 | Built but failing: still `Already Automation`; failure handled operationally | UPDATED | |
| 36 | Monitoring is operational and outside assessment and `Assessment Status` | UPDATED | Out of scope for the assessment model |
| 37 | Workload = total monthly workload for one activity | PARTIAL | Matches candidate C-02. Calculation gate incomplete (Q-R3) |
| 38 | `Workload = Durasi (Menit) × Event Per Month`; unit minutes/month | PARTIAL | Definition, fields, formula and unit are stated. Still not approved: missing/invalid handling (text such as `30 menit`, `N/A`, `Quarterly`; 1,630 zero-event rows), aggregation, versioning, acceptance criteria. `AGENTS.md` gate unchanged |
| 39 | `Durasi after`/`Workload after`: estimate after improvement, can be ignored for now. Static assumption `Workload after` = 10% of `Workload` before. **Not measured** | UPDATED | Answers workshop question 16: assumption, not measurement. Workbook formulas are structurally consistent (`N = K×(1/10)`, `O = N×L`); not recalculated here |
| 40 | The 10% assumption applies to all activities | UPDATED | |
| 41 | Workload-saving formula already exists in project artifacts; do not reconstruct it | UNRESOLVED | The artifact is not in the pinned workbook or this repo's docs. Not reconstructed (Q-R2) |
| 42 | `Action by` = party responsible for follow-up | PARTIAL | Column AB: `L1` 699, `Part of L2` 23, blank 2,767. Meaning of `Part of L2` open (Q-R18) |
| 43 | Determined by activity type, follow-up need, and L0/L1/L2 authority | UNRESOLVED | Rule not stated; follow-up detail deferred (G.3) |
| 44 | L0 operations, L1 improvement, L2 technical support. Project focus is L1; L2 is not the activity owner; do not over-engineer L0/L2 | PARTIAL | No L0 values in the data. No L0/L2 modeling needed beyond `Action by` |
| 45 | Outputs: Dashboard (primary), plus enriched CSV and Assessment Report | CONFLICT | Roadmap puts Reporting Engine in Phase 10 and workload metrics in Phases 5–6, while CSV and report are MVP (Q50). "Enrichment" content undefined (Q-R14–R16) |
| 46 | Dashboard is both Assessment Workspace (L1) and Monitoring Dashboard | PARTIAL | Phase 2 finalization: the workspace is designed as the Proposed L1 assessment layer and services (`DOMAIN_MODEL.md` §6, `ARCHITECTURE.md` §3.3). Gated by Q-R8, Q-R9, Q-R13, Q-R23–R25 |
| 47 | Dashboard shows Summary, Assessment, Quality, Automation, Follow-up. Workload before/after not selected (not prioritized, not prohibited) | PARTIAL | Counts on business fields may need approved definitions (Q-R17) |
| 48 | Users: L1 and Management | UPDATED | Answers Q-B11 (reference-stated) |
| 49 | Management: summary plus drill-down; edit rights not automatic | UPDATED | |
| 50 | Six MVP capabilities: Assessment Workspace, Monitoring Dashboard, Download Enriched CSV, Generate Assessment Report, Quality Review, Follow-up Management | CONFLICT | Preserved as stated. Sequencing conflicts with roadmap phases; scoring, prioritization, impact and AI recommendations are not in the six (Q-R16) |
| 51 | L1 can edit assessment, `Improvement Category`, `Category Notes`, Quality Review, Follow-up. Management read-only (summary, drill-down). Management comments/feedback not decided | CONFLICT | Existing API/role proposals have three roles and no edit endpoints (section 4.2). Management comments undecided (Q-R11) |

## 4. Reconciliation by area

### 4.1 Six MVP capabilities and the locked 10 + 4 modules
The six capabilities are product features. The locked 10 + 4 modules are engines. No change to the module list is needed or made. Mapping (Proposed):

| MVP capability (Q50) | Uses | Notes |
|---|---|---|
| Assessment Workspace (L1) | Data Ingestion output, domain records, Logging & Audit, **new L1 assessment layer** | Needs editable assessment data stored apart from raw source |
| Monitoring Dashboard (Management) | Workforce Analytics (read-only) | Counts only until metrics are approved (Q-R17) |
| Download Enriched CSV | Reporting Engine | MVP need, but Reporting Engine is "Deferred, Phase 10" (conflict, Q-R16). CSV must label source / workbook-derived / L1 / WorkLens-derived values |
| Generate Assessment Report | Reporting Engine, optional Report Generation agent | Same sequencing conflict |
| Quality Review | Rules Engine findings, L1 disposition records | Flag for L1 review, no auto-correct (Q18) |
| Follow-up Management | New application records (`Action by`, coordination) | No counterpart in module contracts or domain model today |

Not covered by the six capabilities but locked in the brief and roadmap: Automation Opportunity Scoring, Impact Assessment Engine, prioritization, AI recommendations. Q47 does not prioritize workload before/after. No document is changed; this is Q-R16.

### 4.2 Roles and API
- Reference roles: **L1** (edits assessment, categories, notes, Quality Review, Follow-up) and **Management** (read-only; summary plus drill-down into activity detail). L2 is a knowledge source, not an application user in the answers.
- Current proposals: API has `viewer`, `inspector`, `admin` (Q-T7); the governance doc adds `reviewer` and project owner. No role can edit assessment data.
- **Conflict, not resolved.** Candidate resolutions: (a) business roles `l1` and `management` plus technical `admin`, with project-owner approvals outside the app; (b) keep technical roles and map users to them with an added assessment-editor permission. Drill-down shows source values, so Management needs activity-detail read access under the sensitivity rules (Q-S6).
- Edits go to a separate assessment layer, never to `raw` (Q-G8 and Q-S decisions). API shape is Proposed in `API_CONTRACT_PROPOSAL.md` and is not approved.

### 4.3 Domain model (finalized in `DOMAIN_MODEL.md` §6)
- Q3 gives the grain (one row = one activity). `ActivityRecord` stays provisional until the owner confirms (Q-R1).
- Proposed additions, not approved: an L1 assessment layer (decisions on category, notes, tools/solution, reasoning, status), Quality Review dispositions, Follow-up items. Field-to-column mapping for reasoning, L2 support need and follow-up plan is unresolved (Q-R8).

### 4.4 Metric Definition Workshop
Updated notes only; nothing approved:
- C-02: Q37/Q38 state the definition, fields, formula and unit. The gate items on missing/invalid values, aggregation, versioning and acceptance criteria remain open.
- C-04/C-05: Q39/Q40 describe a static 10% assumption for all activities. It is **not** measured impact and not an input to C-11 (realized impact).
- C-06/C-07: Q41 says the saving formula exists elsewhere. It is not reconstructed here; the artifact must be identified.
- Dashboard: workload before/after is not prioritized (Q47).

### 4.5 Agent Harness
- L1 owns assessment decisions (Q4, Q12, Q20). The Automation Assessment agent stays advisory; AI cannot set `Improvement Category`, `Category Notes`, or `Assessment Status` (Done requires L1).
- Management is read-only, so it cannot accept or reject agent outputs. L1 is the natural reviewer of assessment-related AI output. This is a proposal, not stated by the reference (Q-R12).
- The Data Quality Review agent aligns with Quality Review: findings flagged for L1, no auto-correction (Q18).
- Monitoring (Q36) is outside assessment and outside agent scope.

## 5. Pinned data vs. the reference's target rules
Read-only label counts over data rows 2–3490 (3,489 rows). Category labels only; no activity text. No metric was calculated.

| Check | Observed in `SOP L1 AGIT.xlsx` |
|---|---|
| `Improvement Category` (W) | `Automation` 1,481; `As Is` 1,271; `Dismantled` 484; `Automated` 1; blank 252 |
| `Category Notes` (Z) | `Already Automation` 1,481; `Not Possible Automate` 780; `Dismantled` 488; `Not Yet Solution` 351; `To Be Automated` 118; blank 259; spelling variants of those values 7; other free text 5 |
| `New Improvement Category Fixed` (AD) | `Automation` 1,437; `As Is` 1,068; `New Dismantled` 254; `Old Dismantled` 196; `To Be Automated` 126; numeric `0` 203; blank 205 |
| `Automation/Manual` (P) | `Manual` 1,685; `AO` 1,552; blank 252 |
| `Action by` (AB) | `L1` 699; `Part of L2` 23; blank 2,767 |
| W × Z, against the Q14 mapping | `Automation` (1,481): `Already Automation` 1,478; `Dismantled` 3. `Dismantled` (484): `Dismantled` 484. `As Is` (1,271): `To Be Automated` 118 (+4 spelling variants); `Not Possible Automate` 780 (+2 variants); `Not Yet Solution` 351; `Already Automation` 2 (+1 variant); `Dismantled` 1; blank 7; other free text 5 |
| W × AD | Same label in both: `Automation` 1,436; `As Is` 1,035. W `Dismantled` (484) appears in AD as `New Dismantled` 254, `Old Dismantled` 196, `As Is` 22, `To Be Automated` 11, `0` 1. W `As Is` (1,271) appears as `0` 120, `To Be Automated` 113, blank 2, `Automation` 1. W `Automation` (1,481) appears as `0` 33, `As Is` 11, `To Be Automated` 1. Where W is blank (252), AD is `0` in 49 rows and blank in 203 |
| P × W | `AO`+`Automation` 1,480; `Manual`+`As Is` 1,270; `Manual`+`Dismantled` 414; `AO`+`Dismantled` 70 |

Reading: the Q14 mapping holds for `Automation` and `Dismantled` rows but not for most `As Is` rows. This is consistent with Q17 (target rule, data not yet conformant) and is why Q18 requires flag-for-L1-review, not correction. The workbook is not changed and no correction is proposed.

The 252 blank `Improvement Category` rows equal the size of the unreviewed range (rows 3239–3490). I did not verify they are the same rows. If they are, it supports Q-S4 and Q2 (in scope, not yet assessed).

## 6. Conflicts and tensions (documented, not resolved)

| ID | Tension | Documents / decisions | Possible resolutions |
|---|---|---|---|
| C1 | Reference names `DUMMY L1 AGIT.xlsx`, not the pinned file | `0004`, `SOURCE_OF_TRUTH.md` | Owner confirms it describes the same structure (Q-R22). Pinned workbook stays authoritative either way |
| C2 | CSV export and Assessment Report are MVP; Reporting Engine and Workforce Analytics are deferred/gated; Phase order puts reports last | `ROADMAP.md`, `MODULE_CONTRACTS.md`, Q50 | Re-sequence phases; keep order and deliver CSV/report late; build a minimal export earlier. Owner decides |
| C3 | MVP lacks scoring, prioritization, impact and AI recommendations; the brief's core question is "what to automate and how much impact" | Kiroween brief, `ARCHITECTURE.md`, Q47, Q50 | MVP = six capabilities and later phases add the rest; add a scoring capability to MVP; reinterpret MVP. Owner decides |
| C4 | L1 edit rights vs immutable source and no edit endpoints | `AGENTS.md` integrity rules, `API_CONTRACT_PROPOSAL.md`, Q51 | Edits as separate attributed, versioned assessment records; keep the workbook as working copy and re-import new versions (re-verification each time); or hybrid. Owner decides (Q-R13) |
| C5 | Role model: reference has L1/Management; documents have viewer/inspector/admin/reviewer/owner | Q-T7, governance doc, Q48, Q51 | See 4.2 (a) or (b) |
| C6 | `Assessment Status` meaning vs. data | Q8, Phase 1 findings | Treat the current value as non-evidence; define status flow later (Q-R9) |
| C7 | `Not Possible Automate` is undefined while `Not Yet Solution` is explicitly "not impossible" | Q30, pinned column Z | Owner defines the value and its mapping |
| C8 | `AO` label vs. "Automation not limited to AO" | Q23, pinned column P | Owner defines whether `AO` means any automation |
| C9 | AD values go beyond the three categories | Q12, Q19, pinned column AD | Owner defines `Old/New Dismantled`, `To Be Automated`, `0` and whether AD overrides W |
| C10 | Q37/Q38 state the workload definition, but `AGENTS.md` requires an approved definition with missing/invalid handling, aggregation, versioning and acceptance criteria | `AGENTS.md`, workshop | Owner approves in a decision record after answering Q-B7/B8 items |
| C11 | Descriptive dashboard counts on business fields may count as calculations | `AGENTS.md`, `MODULE_CONTRACTS.md` 3.4 | Owner decides whether counts need approved definitions (Q-R17) |

## 7. Unresolved questions (new, from this reconciliation)

| ID | Question |
|---|---|
| Q-R1 | Does the owner approve the unambiguous Q1–Q51 answers (the UPDATED rows) as Confirmed requirements in a decision record? Until then they remain reference-stated |
| Q-R2 | Where is the existing workload-saving formula artifact (Q41)? It is not reconstructed |
| Q-R3 | Which gate items complete the workload definition: handling of text/`N/A`/`Quarterly`/`30/31`, zero events, missing values, aggregation, versioning, acceptance criteria? |
| Q-R4 | What does `Not Possible Automate` mean, and how does it relate to `Not Yet Solution` and the Q14 mapping? |
| Q-R5 | What do `Old Dismantled`, `New Dismantled`, `To Be Automated` and numeric `0` mean in `New Improvement Category Fixed`? Does it override `Improvement Category` when present? |
| Q-R6 | Does the `AO` label in `Automation/Manual` cover non-AO automation (Q23)? |
| Q-R7 | Format for `To Be Automated` together with `Not Yet Solution` in one `Category Notes` cell (Q31)? |
| Q-R8 | Which columns hold reasoning/justification, L2 support need, L2 feedback and follow-up plan (Q11)? `Support Needed` and `Confirmation Tower/L2` are empty in every row |
| Q-R9 | `Assessment Status`: allowed states, transitions, who sets them, and the criteria for `Done` (Q8, Q9, G.1) |
| Q-R10 | How are provisional assessments with recorded gaps (Q7) and unreviewed rows treated in reports and eligibility (Q-B12)? |
| Q-R11 | May Management comment or give feedback (Q51)? |
| Q-R12 | Role model: how do L1, Management and technical roles map to permissions; who accepts AI outputs; who may import? |
| Q-R13 | Where does the system of record for assessment decisions live: WorkLens, or the workbook with re-imports? How are L1 edits stored, attributed and versioned? |
| Q-R14 | What is "enriched" in the Enriched CSV: which columns, and how are source, workbook-derived, L1-edited and WorkLens-derived values labeled? Who may download (sensitive data)? |
| Q-R15 | What does the Assessment Report contain (summary, findings, recommendations)? Who authors recommendations? |
| Q-R16 | How do the six MVP capabilities fit the phase order, and are scoring, prioritization, impact and AI recommendations MVP, later, or out? |
| Q-R17 | Do dashboard counts on business fields (status, category) need approved definitions? |
| Q-R18 | What does `Part of L2` in `Action by` mean? Rule for assigning `Action by` (Q43)? Follow-up data model (deferred G.3)? |
| Q-R19 | Meaning of `Take Out` (`Status`) and whether dismantled or taken-out activities are excluded from any metric |
| Q-R20 | When are business validation rules defined (deferred G.2)? Is the structural V-code catalog enough meanwhile? |
| Q-R21 | What team conventions currently drive how `Assessment Status` is filled (Q9)? |
| Q-R22 | Is `DUMMY L1 AGIT.xlsx` a structural stand-in for the pinned workbook? |
| Q-R23 | Placement of the L1 assessment, review and follow-up behavior: WorkLens application services (Proposed, `ARCHITECTURE.md` §3.3), the shared Assessment Engine, or a fifth WorkLens module (would amend the locked list)? |
| Q-R24 | Activity identity across workbook versions: what stable key (if any) lets L1 data follow an activity when a new workbook version is imported? `CONCAT` is unique in the pinned version but is a formula |
| Q-R25 | Effective-value semantics: show L1 values over workbook values (Proposed), seed the L1 layer from workbook values, or show both without precedence? Depends on Q-R13 |

Business questions Q-B1 to Q-B12 remain in `DECISIONS/0003-open-questions.md` with their status updated to show which Q-answers address them.

## 8. Documentation updated by this reconciliation

`0003-open-questions.md`, `DATA_DICTIONARY.md`, `DOMAIN_MODEL.md`, `ARCHITECTURE.md`, `MODULE_CONTRACTS.md`, `API_CONTRACT_PROPOSAL.md`, `METRIC_DEFINITION_WORKSHOP.md`, `RUNTIME_AGENT_HARNESS.md`, `ROADMAP.md`, `SOURCE_OF_TRUTH.md`, `IMPLEMENTATION_STATUS.md`, `README.md`. Each addition is labeled reference-stated, Proposed, or Unresolved. No approved decision was changed.

## 9. Phase 2 finalization pass

The Data Dictionary, Domain Model and Architecture were consolidated into one consistent baseline, and `SOURCE_TO_DOMAIN_MAPPING.md`, `MODULE_CONTRACTS.md`, `ROADMAP.md` and `IMPLEMENTATION_STATUS.md` were aligned. What changed relative to this reconciliation:

- Q7 and Q46 now have a Proposed design counterpart (status PARTIAL); totals in section 2 are updated.
- New design questions Q-R23 to Q-R25 (placement of the L1 behavior, activity identity across versions, effective-value semantics).
- Every unresolved question is attached to a gate in `ROADMAP.md` ("Design gate register"). None of them blocks the design of Phases 3 and 4.
- Conflicts C1–C11 remain open exactly as listed. The finalization pass did not resolve any of them.
