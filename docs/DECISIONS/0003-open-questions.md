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

## Technical

| ID | Question | State |
|---|---|---|
| Q-T1 | Stack | **Candidates approved for evaluation** (Python 3.12, FastAPI, Next.js, React, TypeScript, PostgreSQL). Final adoption proposed in `0005`, awaiting approval |
| Q-T2 | First AI provider and what data may be sent | Unresolved. Source values are not sent externally until approved |
| Q-T3 | Plugin/Adapter scope | Proposed: a two-kind registry (source adapters, AI providers), no dynamic loading |
| Q-T4 | Hackathon deadline and demo format | Unresolved; affects sequencing and UI choice |
| Q-T5 | Git | **Approved and initialized** (see status) |
| Q-T6 | Formula handling | Closed by Q-S2 |
| Q-T7 | Users, authentication, roles | Unresolved. Proposal: localhost plus bearer token, roles `viewer`, `inspector`, `admin` |
| Q-T8 | How the local database is provisioned (dedicated database and role on the existing local PostgreSQL 17 service, or another way). Docker is not installed | Unresolved. The existing service has not been accessed |
| Q-T9 | Hosting | Unresolved. Options and trade-offs in `0005` |
| Q-T10 | Pinned versions (PostgreSQL major, Next.js major, Python dependency set) | Unresolved; decide at Phase 3 start |

## Design questions raised by Phase 2

- Q-D1. Archive the excluded AL:BI region cells in `raw`, or keep only a manifest with a region hash? (Proposed: manifest only.)
- Q-D2. How the source file reaches the system: configured local path (proposed) or upload.
- Q-D3. Should category-variant findings (`Take Out`/`Takeout`/`Take out` etc.) stay flag-only until Q-B4/Q-B5 are answered? (Proposed: yes.)
- Q-D4. Is a direct XML reader needed to capture shared-formula flags and original number text? (Proposed: no for v1; see `0005` limits.)
