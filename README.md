# WorkLens

Workforce & Automation Intelligence. Part of Kiroween 2026 — Skeleton Crew ("One Skeleton. Two Applications."). This repository covers WorkLens only.

Business question: **"What should we automate, and how much impact can we achieve?"**

## Status

Phase 2 (design only) deliverables are ready for owner review. There is no application code, database, API, or UI yet. This is a clean rebuild; the previous implementation is legacy and not used.

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
| `docs/METRIC_DEFINITION_WORKSHOP.md` | Candidate metrics and approval template (nothing approved) |

The source workbook is sensitive internal data. It is excluded by `.gitignore` and must not be committed to a public repository.

## Setup

Not applicable yet. Candidate stack: Python 3.12, FastAPI, Next.js, React, TypeScript, PostgreSQL (see `docs/DECISIONS/0005-technology-stack.md`). Hosting is open.
