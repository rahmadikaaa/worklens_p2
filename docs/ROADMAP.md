# Roadmap

Status: **Proposed**, updated after Phase 2 design. Each phase starts only on explicit owner approval.

| Phase | Name | Outcome | Status |
|---|---|---|---|
| 0 | Initialization | Docs, rules, decisions | Done |
| 1 | Source verification | Workbook identity, structure, quality findings; owner decisions Q-S1 to Q-S6 | Done and accepted |
| 2 | Domain model and architecture design | Stack record, domain model, ERD, mapping, provenance, row classes, contracts, API, schema, security, testing, metric workshop template | **Deliverables prepared; awaiting owner review** |
| 3 | Foundation slice and ingestion | Repo scaffolding; Configuration, Logging & Audit; Excel adapter; raw store; row classification; validation; idempotent re-import; import and inspection API; tests against the golden manifest | Not started |
| 4 | Normalization | Typed domain records from raw using mapping v1; API for activities | Not started |
| 5 | Metric definition workshop | Approved definitions per `METRIC_DEFINITION_WORKSHOP.md`, recorded as decisions | Not started; can run in parallel as discussion from now |
| 6 | Workload Calculation Engine | Versioned, tested calculations for approved workload definitions only | Gated on Phase 5 |
| 7 | Rules and Assessment | Deterministic assessment and eligibility per approved rules | Gated on Q-B3, Q-B12 |
| 8 | Scoring and Impact | Opportunity scoring, workload reduction, impact | Gated on Phases 5–7 |
| 9 | AI Provider Adapter and recommendations | Redacted, reviewable AI recommendations | Gated on Q-T2 |
| 10 | Analytics, Reporting, UI | Workforce analytics, reports, frontend polish | Gated on Phase 8 |

## Proposed Phase 3 exit criteria

- Import of the approved workbook reproduces the golden manifest (3,495 data rows; 3,489 activity-structured; 252 unreviewed; 6 link-only; 232 error cells in 108 rows).
- Re-import creates no duplicates. A wrong hash or changed header is refused.
- Raw tables reject UPDATE and DELETE for the app role.
- No source values in logs. API documentation published. Tests, lint and type checks pass.

## Hackathon delivery note (Proposed)

If time is short, sequence for the demo: Phase 3 (trustworthy ingestion and inspection) first, then Phase 5 decisions, then the smallest approved metric set. The UI can fall back to server-rendered pages without changing the API or database (`0005`).

## Deferred

AutoRunner V2; Notification Interface; dynamic plugin loading; cross-version workbook comparison; AI recommendations (until Phase 9).
