# 0003 — Open questions

Updated for Phase 2. Source questions are decided (`0004`). Business questions remain **Unresolved**.

## Source (closed)

| ID | State |
|---|---|
| Q-S1 | **Confirmed**, hash `AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092` (earlier `DE3BCC` was a typo) |
| Q-S2 to Q-S6 | Approved (`0004`) |
| Q-S7 | **Resolved.** The Kiroween planning brief supplied by the owner is the authoritative architecture baseline |

## Business definitions (Unresolved; Q-B1 to Q-B12 preserved)

- Q-B1. What does one row of `Breakdown Activity` represent (grain)?
- Q-B2. Definition, unit and formula of "workload". Meaning of `Durasi (Menit)`, `Event Per Month`, `Workload`, `Durasi after`, `Workload after`. The workbook formulas (`K*L`, `K*(1/10)`, `N*L`) are observed, not approved.
- Q-B3. Which columns constitute "assessment"? Meaning of `Assessment Status`, `Improvement Category`, `Category Notes`, `Category Action`, `New Improvement Category Fixed`, `Phase`, `Ops Activity`, `Tools Automation`, `Module AO`.
- Q-B4. Which is current: `Status` or `Status (Old)`; `Improvement Category` or `New Improvement Category Fixed`?
- Q-B5. What do `Automation/Manual` values `AO` and `Manual` mean? What are `Take Out` and `Dismantled`?
- Q-B6. Meaning of numeric `0` in `New Improvement Category Fixed`, and of `Number Activity` = 1.
- Q-B7. Treatment of text in duration and frequency (`30 menit`, `N/A`, `Quarterly`, `30/31`) and of zero event counts (1,630 rows).
- Q-B8. Treatment of `#N/A` lookup errors (108 rows) and blank values.
- Q-B9. Handling of the near-duplicate pair, rows 1451 and 3371.
- Q-B10. Definition of an automation opportunity, scoring criteria, workload reduction and impact.
- Q-B11. Who are the users and what decisions do they make with WorkLens?
- Q-B12. Which rows are eligible for approved business assessments, and how do unreviewed rows (3239–3490) become eligible?

The workshop (`docs/METRIC_DEFINITION_WORKSHOP.md`) maps each question to the candidate metrics it blocks.

### Reference status after the Q1–Q51 requirements reconciliation

Source: `docs/REQUIREMENTS_RECONCILIATION_Q1_Q51.md`. The Q1–Q51 document is an owner-stated requirements reference ("bukan spesifikasi final"). The questions below are **not closed**; the column shows what the reference says and what stays open. Closing any of them needs an owner decision record (Q-R1).

| ID | Reference-stated answer | Still open |
|---|---|---|
| Q-B1 | Q3: one row = one activity assessed | Owner confirmation; the 6 link-only rows are not activities (Q-S3) |
| Q-B2 | Q37/Q38: workload = monthly total per activity = `Durasi (Menit)` × `Event Per Month`, unit minutes/month. Q39/Q40: `Workload after` = static 10% assumption for all activities, not measured | Approval under the `AGENTS.md` calculation gate; missing/invalid handling, aggregation, versioning, acceptance criteria; Q41 saving formula is external and not reconstructed (Q-R2, Q-R3) |
| Q-B3 | Q11: assessment output = `Improvement Category`, `Category Notes`, `Tools Automation`/solution, reasoning, L2 support need, follow-up plan. Q8/Q9: `Assessment Status` semantics and Done criteria | Columns for reasoning, L2 need and follow-up plan; status flow deferred (Q-R8, Q-R9) |
| Q-B4 | Q19: `New Improvement Category Fixed` is the correction of the earlier `Improvement Category` | Whether it overrides when present; its extra values; `Status` vs `Status (Old)` not addressed (Q-R5) |
| Q-B5 | Q21–Q24, Q12–Q16: `Automation/Manual` = actual condition; Automation includes non-AO and partial; `Dismantled` = can be dismantled | `AO` label vs non-AO automation; `Take Out` not addressed (Q-R6, Q-R19) |
| Q-B6 | Not addressed | `Number Activity` = 1; numeric `0` in AD (Q-R5) |
| Q-B7 | Not addressed (validation rules deferred, section G.2) | Text values, zero events (Q-R3, Q-R20) |
| Q-B8 | Q18: flag for L1 review; do not auto-correct source | Effect on eligibility and metrics (Q-R3, Q-R20) |
| Q-B9 | Not addressed | Near-duplicate pair rows 1451 and 3371 |
| Q-B10 | Q1, Q15: L1 decides opportunity using evaluation, L2 feedback and tool availability | Scoring, prioritization, impact: not addressed (Q-R16) |
| Q-B11 | Q48/Q49/Q51: users are L1 (edit) and Management (read-only, summary plus drill-down) | Management comments (Q-R11); role mapping (Q-R12) |
| Q-B12 | Q2, Q7, Q9: all activities in scope; provisional assessments possible; Done criteria | Eligibility rules; treatment of unreviewed rows (Q-R10) |

New questions Q-R1 to Q-R25 are in section 7 of `docs/REQUIREMENTS_RECONCILIATION_Q1_Q51.md`. They are carried here by reference to avoid two copies.

## Requirements reconciliation questions

Q-R1 to Q-R25 (approval of reference answers, saving-formula artifact, workload gate items, category semantics, `Assessment Status` flow, edit storage and system of record, Enriched CSV and report content, MVP sequencing, roles, `Part of L2`, `DUMMY` workbook identity): see `docs/REQUIREMENTS_RECONCILIATION_Q1_Q51.md` section 7.

## Technical

| ID | Question | State |
|---|---|---|
| Q-T1 | Stack | **Adopted** (Python 3.12, FastAPI, Next.js, React, TypeScript, PostgreSQL; library list in `0005`). Decision: `0007` GT-1. Hosting and version pins remain open |
| Q-T2 | First AI provider and what data may be sent | Unresolved. Source values are not sent externally until approved |
| Q-T3 | Plugin/Adapter scope | Proposed: a two-kind registry (source adapters, AI providers), no dynamic loading |
| Q-T4 | Hackathon deadline and demo format | Unresolved; affects sequencing and UI choice |
| Q-T5 | Git | **Approved and initialized** (see status) |
| Q-T6 | Formula handling | Closed by Q-S2 |
| Q-T7 | Users, authentication, roles | **Phase 3 minimal model approved** (`0007` GT-3: localhost, per-role bearer tokens, capability checks). Role names, the L1/Management mapping and per-user identities remain Unresolved (Q-R12). Earlier proposal: localhost plus bearer token; permissions expressed as capabilities (`ARCHITECTURE.md` §6), so role names (`viewer`, `inspector`, `admin`, or L1/Management) are configuration. **Tension with the requirements reference:** business users are L1 (edit) and Management (read-only, drill-down). No proposed role can edit assessment data (Q-R12, `REQUIREMENTS_RECONCILIATION_Q1_Q51.md` section 4.2) |
| Q-T8 | How the local database is provisioned (dedicated database and role on the existing local PostgreSQL 17 service, or another way). Docker is not installed | **Approved in principle** (`0007` GT-2): dedicated databases and roles on the existing local service. **Provisioning not authorized.** The service was inspected read-only, not connected to. Exposure finding in `0007`: listens on all interfaces, but `pg_hba.conf` is loopback-only and the firewall has no inbound rule. Owner choice pending |
| Q-T9 | Hosting | Unresolved. Options and trade-offs in `0005` |
| Q-T10 | Pinned versions (PostgreSQL major, Next.js major, Python dependency set) | Unresolved; decide at Phase 3 start |

## Agent harness questions

**Decided in `0007` (GT-5):** Q-H4 (a), Q-H6 (a), Q-H7 (c), Q-H8 (a). Still open: Q-H1, Q-H2, Q-H3, Q-H5, Q-H9, Q-H10.

Q-H1 to Q-H10 are listed in `0006-agent-harness-architecture.md` section D (original Iteration 2 record, orchestrator placement, DB-backed worker, `AGENTS.md` amendments, prompt/output storage, evidence storage, reviewer counts, enforcement layer, number of agents, evaluation set ownership).

## Design questions raised by Phase 2

- Q-D1. Archive the excluded AL:BI region cells in `raw`, or keep only a manifest with a region hash? **Decided (`0007` GT-4): manifest only.**
- Q-D2. How the source file reaches the system: configured local path or upload. **Decided (`0007` GT-4): configured local path (`WORKLENS_SOURCE_FILE`); no upload; the file stays in place.**
- Q-D3. Should category-variant findings (`Take Out`/`Takeout`/`Take out` etc.) stay flag-only until Q-B4/Q-B5 are answered? (Proposed: yes.)
- Q-D4. Is a direct XML reader needed to capture shared-formula flags and original number text? (Proposed: no for v1; see `0005` limits.)
