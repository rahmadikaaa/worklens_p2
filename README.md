# WorkLens

Workforce & Automation Intelligence. Part of Kiroween 2026 — Skeleton Crew ("One Skeleton. Two Applications."). This repository covers WorkLens only.

Business question: **"What should we automate, and how much impact can we achieve?"**

## Status

The Phase 2 design baseline (data dictionary, domain model, architecture) is ready for owner review; open decisions are gates in `docs/ROADMAP.md`. There is no application code, database, API, or UI yet. This is a clean rebuild; the previous implementation is legacy and not used.

## Start here

| Doc | Purpose |
|---|---|
| `AGENTS.md` | Engineering and agent rules |
| `docs/PROJECT_VISION.md` | Goals and scope |
| `docs/ARCHITECTURE.md` | Proposed module architecture |
| `docs/DOMAIN_MODEL.md` | Proposed domain concepts |
| `docs/SOURCE_OF_TRUTH.md` | Source workbook verification status |
| `docs/DATA_DICTIONARY.md` | Field definitions from source inspection |
| `docs/ROADMAP.md` | Proposed phases |
| `docs/DECISIONS/` | Decision records and open questions |
| `docs/IMPLEMENTATION_STATUS.md` | What exists vs. what does not |
| `docs/PHASE1_ACCEPTANCE_REPORT.md` | Phase 1 results and acceptance checklist |
| `docs/PHASE2_PROPOSAL.md` | Original Phase 2 proposal (approved; superseded by the deliverables below) |
| `docs/DECISIONS/0005-technology-stack.md` | Stack evaluation and hosting trade-offs |
| `docs/design/` | Mapping, provenance, row classification, module contracts, API, schema, security, testing |
| `docs/REQUIREMENTS_RECONCILIATION_Q1_Q51.md` | Business requirements reference (Q1–Q51) reconciled with the design; unresolved questions |
| `docs/AGENT_HARNESS_ARCHITECTURE.md` | Development vs. runtime agent harness (design only) |
| `docs/DEVELOPMENT_AGENT_HARNESS.md` | Governance of coding agents: roles, gates, evidence |
| `docs/RUNTIME_AGENT_HARNESS.md` | Hybrid orchestrator and candidate business agents |
| `docs/AGENT_GOVERNANCE_AND_SECURITY.md` | Permissions, audit, failure handling, versioning |
| `docs/METRIC_DEFINITION_WORKSHOP.md` | Candidate metrics and approval template (nothing approved) |

The source workbook is sensitive internal data. It is excluded by `.gitignore` and must not be committed to a public repository.

## Setup

Not applicable yet. Candidate stack: Python 3.12, FastAPI, Next.js, React, TypeScript, PostgreSQL (see `docs/DECISIONS/0005-technology-stack.md`). Hosting is open.
