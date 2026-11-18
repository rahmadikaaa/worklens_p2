# Implementation Status

| Area | Status |
|---|---|
| Application code | None |
| Database / migrations | None. Schema is a proposal only |
| API / frontend | None. API is a proposal only |
| Ingestion | Not implemented |
| Workload calculation | Not implemented, not authorized |
| AI adapter | Not implemented |
| Documentation structure | **Implemented** |
| Source verification (Phase 1) | **Done and accepted** |
| Source decisions Q-S1 to Q-S6 | **Confirmed** (`DECISIONS/0004`); hash confirmed |
| Data dictionary | **Implemented** (structure and observed values). Meanings **Unresolved** |
| `.gitignore` for sensitive files | **Implemented** |
| Git repository (workspace only) | **Initialized** (see change log) |
| Gate decisions GT-1 to GT-5 | **Recorded** in `DECISIONS/0007`: GT-1, GT-3, GT-4, GT-5 approved; GT-2 approved in principle, **provisioning not authorized**, exposure finding pending owner review. No database created, no data imported |
| PostgreSQL 17 service (local, existing) | **Not provisioned, not connected to.** Inspected read-only on 2026-11-17: all-interface listener, loopback-only `pg_hba.conf`, no firewall allow rule. Configuration unchanged |
| Pending follow-up edits (GT-5) | `AGENTS.md` amendment, `.gitignore` line for `.agents/tasks/`, `DEVELOPMENT_AGENT_HARNESS.md` update for P8 and Q-H7: **not made**, awaiting go-ahead |
| Phase 3 | **Not started.** Remaining before start: GT-2 authorization, GT-6 pins in the plan, the pending edits, owner approval |
| Phase 2 design baseline | **Prepared, awaiting owner review.** `DATA_DICTIONARY`, `DOMAIN_MODEL`, `ARCHITECTURE` consolidated and consistent with `design/*`, `DECISIONS/0005`, `METRIC_DEFINITION_WORKSHOP`. Open items are listed as gates GT-1 to GT-14 in `ROADMAP.md`. Phase 2 is not approved until the owner reviews it |
| Design status by area | Source structure and data dictionary: Verified (Phase 1, locked). Domain model, architecture, mapping, contracts, schema, API: Proposed. Q1–Q51 answers: Reference. Business meanings: none Confirmed |
| Metric definitions | None approved |
| Requirements reconciliation, Q1–Q51 | **Prepared, awaiting owner review**: `REQUIREMENTS_RECONCILIATION_Q1_Q51.md`; related docs annotated as reference-stated or Proposed. No answer is yet a Confirmed decision (Q-R1) |
| L1 assessment layer, Quality Review dispositions, Follow-up items | Proposed concepts only; not designed in detail, not implemented |
| Agent harness design (development and runtime) | **Prepared, awaiting owner review**: `AGENT_HARNESS_ARCHITECTURE`, `DEVELOPMENT_AGENT_HARNESS`, `RUNTIME_AGENT_HARNESS`, `AGENT_GOVERNANCE_AND_SECURITY`, `DECISIONS/0006` |
| Development harness (scripts, hooks, steering, evidence folders) | Not implemented |
| Runtime harness (orchestrator, agents, task store, worker) | Not implemented |
| AI agents of any kind | Not implemented |
| Dashboard UI mockup (`mockup/`) | **Implemented as a mockup only** (tier T1). Next.js static export, no backend, no network, no workbook access. Shows verified Phase 1 structural counts; workload and other business metrics are marked pending approval. Layout B is now the primary Activity Workspace and lists all 3,495 source rows (structural records only, no cell values) with search, filters, sorting and a provenance inspector. Not the Phase 10 dashboard and not production code. Independent review not yet done. See `DECISIONS/0008` and `mockup/README.md` |

## Change log

- Initialization: `AGENTS.md`, `README.md`, `docs/`.
- Phase 1: read-only inspection; `SOURCE_OF_TRUTH.md`, `DATA_DICTIONARY.md`.
- Decision update: Q-S1 to Q-S6 recorded; `.gitignore`; sensitive values removed from docs.
- Phase 2 (design only): stack record with a throwaway openpyxl spike (run in a temporary environment outside the repo; no code kept); domain model and ERD; source-to-domain mapping for 36 columns; raw/provenance, row classification and validation models; module contracts; API and database proposals; security and testing designs; metric workshop template; roadmap update; git init. Workbook unchanged.
- Gate decisions (documentation only): recorded GT-1 to GT-5 in `DECISIONS/0007`; updated the gate register in `ROADMAP.md` (new State column) and `0003`, `0005`, `0006` (status note), `ARCHITECTURE.md`, `DATABASE_SCHEMA_PROPOSAL.md`, `API_CONTRACT_PROPOSAL.md`, `RAW_DATA_AND_PROVENANCE.md`, `SECURITY_AND_SENSITIVITY.md`. Read-only PostgreSQL exposure checks (service metadata, listeners, config files, firewall rules); no connection, no configuration change, no database created. Not committed.
- Phase 2 finalization (documentation only): rewrote `DATA_DICTIONARY.md`, `DOMAIN_MODEL.md` and `ARCHITECTURE.md` as one consistent baseline; aligned `SOURCE_TO_DOMAIN_MAPPING.md`, `MODULE_CONTRACTS.md`, `ROADMAP.md` (design gate register), `REQUIREMENTS_RECONCILIATION_Q1_Q51.md` (section 9), and for consistency `DATABASE_SCHEMA_PROPOSAL.md`, `API_CONTRACT_PROPOSAL.md`, `RAW_DATA_AND_PROVENANCE.md`, `0003`, `0006` (wording fixes), `DEVELOPMENT_AGENT_HARNESS.md`, `RUNTIME_AGENT_HARNESS.md`, `AGENT_GOVERNANCE_AND_SECURITY.md`. Phase 1 results were not re-derived; the workbook was not read. Not committed.
- Requirements reconciliation (documentation only): added `REQUIREMENTS_RECONCILIATION_Q1_Q51.md` and annotations in `0003`, `DATA_DICTIONARY`, `DOMAIN_MODEL`, `ARCHITECTURE`, `MODULE_CONTRACTS`, `API_CONTRACT_PROPOSAL`, `METRIC_DEFINITION_WORKSHOP`, `RUNTIME_AGENT_HARNESS`, `ROADMAP`, `SOURCE_OF_TRUTH`, `README`. Read-only label counts were taken from the pinned workbook; it is unchanged. Not committed.
- Pre-Phase 3 harness design (design only): four harness documents, decision record `0006`, updates to `ARCHITECTURE.md`, `ROADMAP.md` (Track H), `README.md`, and `0003`. Not committed. No code, schema, agent, hook, or `.kiro` file created. Workbook and legacy repository untouched.
- Dashboard UI mockup: added `mockup/` (one application, three modes: Audit-first, Workspace & Monitoring, Quality Investigation; seven capabilities labeled Demo, Simulated or Future) and `DECISIONS/0008`. Frontend dependencies pinned locally in `mockup/package.json`. The workbook was not read, no database was touched, Phase 3 did not start. Not committed. Activity Workspace update: added mockup/lib/rows.ts, mockup/components/ActivityTable.tsx and a unit test; Layout B opens by default; Layouts A and C unchanged. Still no workbook read, no backend, not committed. Verified in the working tree: `rows.ts` and `ActivityTable.tsx` had been missing and were written; typecheck, 36 unit tests and 25 e2e tests pass.
