# Roadmap

Status: **Proposed**, updated after Phase 2 design. Each phase starts only on explicit owner approval.

| Phase | Name | Outcome | Status |
|---|---|---|---|
| 0 | Initialization | Docs, rules, decisions | Done |
| 1 | Source verification | Workbook identity, structure, quality findings; owner decisions Q-S1 to Q-S6 | Done and accepted |
| 2 | Domain model and architecture design | Data dictionary, domain model, architecture baseline; stack record, mapping, provenance, row classes, contracts, API, schema, security, testing, metric workshop template, requirements reconciliation | **Baseline documents prepared; awaiting owner review.** Remaining items are gates (below), not design gaps in Phases 3–4 |
| 3 | Foundation slice and ingestion | Repo scaffolding; Configuration, Rules, Logging & Audit; Excel `SourceAdapter`; `sources`; raw store; row classification; validation; idempotent re-import; import and inspection API; tests against the golden manifest | Not started. GT-1, GT-3, GT-4, GT-5 approved (`0007`). Remaining before start: GT-2 provisioning authorization, GT-6 pins in the plan, the pending H1 follow-up edits, and your approval to start |
| 4 | Normalization | Normalization Engine, mapping v1; typed domain records from raw; API for activities | Not started. Needs GT-7 |
| 5 | Metric definition workshop | Approved definitions per `METRIC_DEFINITION_WORKSHOP.md`, recorded as decisions | Not started; can run in parallel as discussion from now |
| 6 | Workload Calculation Engine | Versioned, tested calculations for approved workload definitions only | Gated on Phase 5 |
| 7 | Rules and Assessment | Deterministic assessment and eligibility per approved rules | Gated on Q-B3, Q-B12 |
| 8 | Scoring and Impact | Opportunity scoring, workload reduction, impact | Gated on Phases 5–7 |
| 9 | AI Provider Adapter and recommendations | Redacted, reviewable AI recommendations | Gated on Q-T2 |
| 10 | Analytics, Reporting, UI | Workforce analytics, reports, frontend polish | Gated on Phase 8 |

## Design gate register (single list; Proposed)

A gate is an open decision with an owner. It blocks only the work named. Question IDs: `0003-open-questions.md`, `REQUIREMENTS_RECONCILIATION_Q1_Q51.md` §7, `0006` §D.

Gate states: **Approved** = decided by the owner and recorded in `DECISIONS/0007`; **Open** = not yet decided.

| Gate | Decision needed | State | Blocks | Does not block |
|---|---|---|---|---|
| GT-1 | Adopt the stack (`0005`) | **Approved** (`0007`) | | Documentation |
| GT-2 | Q-T8: how the local database is provisioned | **Approved in principle** (`0007`). **Provisioning not authorized**; the owner reviews the PostgreSQL exposure finding first. **Still blocks** | Phase 3 raw store and integration tests | |
| GT-3 | Q-T7: minimal authentication and capability model (`ARCHITECTURE.md` §6) | **Approved** (`0007`) | | Role naming (Q-R12) |
| GT-4 | Q-D1 (AL:BI), Q-D2 (source file delivery) | **Approved** (`0007`): manifest-only; configured path; file stays in place | | |
| GT-5 | Development harness: P8–P10, P12, P13 and Q-H4, Q-H6, Q-H7, Q-H8 | **Approved** (`0007`). Follow-up edits (`AGENTS.md`, `.gitignore`, harness doc) pending your go-ahead | | Runtime harness |
| GT-6 | Q-T10: pinned versions | Open; decided in the Phase 3 plan | Decided in the Phase 3 plan | Approval of Phase 3 |
| GT-7 | Q-R1: confirm the Q3 grain and the Reference answers used by mapping v1; approve mapping v1; Q-D3, Q-D4 | Open | Phase 4 sign-off | Phase 3 |
| GT-8 | L1 layer content: Q-R4, Q-R5, Q-R7, Q-R9 (catalogs, states), Q-R8 (fields) | Open | Detailed design and build of the L1 layer | Phases 3, 4 |
| GT-9 | L1 layer data policy: Q-R13 (system of record), Q-R24 (identity across versions), Q-R25 (effective view), Q-R23 (placement) | Open | Build of the L1 layer; any re-import after L1 edits exist | Phases 3, 4 |
| GT-10 | Q-R12 (roles), Q-R11 (Management comments) | Open | Role configuration, comments | Capability-based build |
| GT-11 | Q-R14, Q-R15 (export and report contents), Q-R16 (MVP sequencing), Q-R17 (dashboard counts) | Open | Exports, reports, dashboard build; re-sequencing of Phases 8–10 | Phases 3, 4 |
| GT-12 | Metrics: Q-R2, Q-R3, Q-B7, Q-B8, Q-B12, Q-B10 | Open | Phase 5 approvals; Phases 6–8 | Phases 3, 4 |
| GT-13 | Runtime agents: Q-H1, Q-H2, Q-H3, Q-H5, Q-H9, Q-H10, Q-T2 | Open | Track H2/H3 | Phases 3, 4 |
| GT-14 | Q-T4 (deadline), Q-T9 (hosting) | Open | Sequencing; any non-local run | Local build |

## Requirements alignment, Q1–Q51 (reference-stated; phases NOT changed)

Source: `REQUIREMENTS_RECONCILIATION_Q1_Q51.md`. The six MVP capabilities (Q50) do not line up with the phase order above, and the phase order is left as approved:

| MVP capability | Closest phase today | Tension |
|---|---|---|
| Assessment Workspace (L1), Quality Review, Follow-up Management | None. Phase 3 is ingestion; Phase 4 normalization; no phase covers editable L1 data. Designed in `DOMAIN_MODEL.md` §6 and `ARCHITECTURE.md` §3.3 as proposals | Needs a phase and the GT-8/GT-9 decisions |
| Monitoring Dashboard | Phase 10 (Analytics, Reporting, UI) | Late relative to MVP; counts on business fields may need approved definitions (Q-R17) |
| Download Enriched CSV, Generate Assessment Report | Phase 10 | Late relative to MVP (Q-R14–R16) |
| Scoring, prioritization, impact, AI recommendations (brief, Phases 8–9) | Phases 8–9 | Not among the six capabilities (Q-R16) |

Re-sequencing is an owner decision (Q-R16). No phase is moved by this note.

## Track H — Agent harnesses (Proposed; added before Phase 3)

Design is complete in `AGENT_HARNESS_ARCHITECTURE.md` and the three detail documents. Implementation steps, each needing owner approval:

| Step | Content | Timing | Gate |
|---|---|---|---|
| H0 | Harness design and decision record `0006` | Done, awaiting owner review | Owner review; Q-H1 to Q-H10 |
| H1 | Development harness setup: evidence template, `.agents/tasks/` convention, git pre-commit sensitive-data and spreadsheet guard, path-guard script, optional workspace steering | Start of Phase 3, inside the Phase 3 plan | G1; Q-H4, Q-H6, Q-H8 |
| H2 | Runtime orchestrator core: task contract, sync and async paths, task store, review states; deterministic Data Quality Review and report skeleton | After Phase 4 (needs domain data) | Q-H2, Q-H3, Q-T7 |
| H3 | AI-backed runtime agents through the AI Provider Adapter | After Phase 9; needs Q-T2 and approved definitions (Phase 5) for assessment, recommendation, and impact agents | Q-T2, Phase 5 approvals |

Phase 3 itself builds no runtime agents. Its audit events are designed to allow agent actors later.

## Proposed Phase 3 exit criteria

- Import of the approved workbook reproduces the golden manifest (3,495 data rows; 3,489 activity-structured; 252 unreviewed; 6 link-only; 232 error cells in 108 rows).
- Re-import creates no duplicates. A wrong hash or changed header is refused.
- Raw tables reject UPDATE and DELETE for the app role.
- No source values in logs. API documentation published. Tests, lint and type checks pass.

## Hackathon delivery note (Proposed)

If time is short, sequence for the demo: Phase 3 (trustworthy ingestion and inspection) first, then Phase 5 decisions, then the smallest approved metric set. The UI can fall back to server-rendered pages without changing the API or database (`0005`).

## Deferred

AutoRunner V2; Notification Interface; dynamic plugin loading; cross-version workbook comparison; AI recommendations (until Phase 9).
