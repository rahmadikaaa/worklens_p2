# 0006 — Agent Harness architecture

Status: design record. Section A is **Confirmed** (stated by the project owner). Sections B and C are **Proposed** or **Unresolved** and need the owner's review. Design only; nothing is implemented.

Documents: `AGENT_HARNESS_ARCHITECTURE.md`, `DEVELOPMENT_AGENT_HARNESS.md`, `RUNTIME_AGENT_HARNESS.md`, `AGENT_GOVERNANCE_AND_SECURITY.md`.

## A. Confirmed (from the owner's pre-Phase 3 design task and earlier records)

1. Two distinct harnesses with explicit boundaries: a Development Agent Harness (governs coding agents) and a Runtime Agent Harness (coordinates business AI agents).
2. The Runtime Harness keeps the **Hybrid Orchestrator, synchronous plus asynchronous execution** (the owner's Iteration 2 decision). It is not replaced by a fully sequential or fully asynchronous design.
3. The six runtime agent types are candidates, not approved agents.
4. AI agents never invent or independently approve business formulas, workload definitions, eligibility rules, or KPI definitions. Deterministic calculation stays separate from AI interpretation.
5. Development controls: no silent scope expansion; no automatic change to approved business definitions or source-of-truth decisions; no commit, push, deploy or destructive operation without explicit authorization; no claim of passing tests without evidence; failures reported honestly; source immutability; no sensitive source data in logs or repository artifacts.
6. No unnecessary infrastructure (no message broker, vector database, distributed workers, or extra services without a demonstrated requirement and written justification).
7. WorkLens is the only application in scope. AutoRunner V2 is not implemented. Shared capabilities must be justified by actual reuse.
8. Existing approved decisions are preserved: `0001` to `0004`, the locked 10 + 4 module architecture, the calculation gate, Q-S1 to Q-S6. (`0005` confirms the stack candidates as a design baseline; final stack adoption is still awaiting approval.)

## B. Proposed (need owner approval)

**Update 2026-11-17 (`0007`, GT-5):** P8 (as revised with a manual two-session minimum), P9, P10, P12 and P13 are **approved**. Q-H4 (a), Q-H6 (a), Q-H7 (c) and Q-H8 (a) are **decided**. P1 to P7 and P11 (runtime harness items) remain Proposed. The table below is kept as originally written.

| ID | Proposal | Where |
|---|---|---|
| P1 | The harnesses share policy, naming, and format conventions only. No shared code, tools, identities, or stores | Architecture §2 |
| P2 | The runtime harness is a WorkLens application component (`worklens/backend/agents/`), not an 11th shared module | Architecture §4 |
| P3 | Hybrid mechanics: one orchestrator, one task contract, sync and async paths, mode chosen by policy; async via a PostgreSQL task table and a same-codebase worker; no broker | Runtime §2 |
| P4 | Tasks pass references, not values; no cross-task memory; no vector store | Architecture §7 |
| P5 | Runtime agents run under the invoker's role capped by an allow-list; agents have no raw-table, shell, or file access | Governance §2 |
| P6 | AI output is labeled `ai_generated`, schema-validated, evidence-linked, and review-gated; narratives pass a numeric grounding check | Runtime §3, §4.6 |
| P7 | First-wave runtime agent: Data Quality Review (deterministic core); others gated on definitions and Q-T2 | Runtime §4.7 |
| P8 | Development roles map to the Kiro workflow agents; independence rule (review, testing and verification by a different session than the implementer) | Development §1, §2 |
| P9 | Task tiers T0 to T3 and gates G1 to G10 | Development §4, §5 |
| P10 | Evidence bundles per task under `.agents/tasks/`, claims linked to raw artifacts, recomputed by a verifier | Development §6 |
| P11 | Prompts and agent configs are versioned artifacts (`agent_id@semver+hash`) in the repo, treated as gated (T3) changes, with synthetic evaluation evidence | Governance §6 |
| P12 | Track H in the roadmap: H1 (dev harness setup at Phase 3 start), H2 (orchestrator core, deterministic agents, after Phase 4), H3 (AI-backed agents, after Phase 9 and Q-T2) | Roadmap |
| P13 | Phase 3 builds no runtime agent code, but its audit design allows `actor_type = agent` and a task reference | Runtime §9 |

## C. Conflicts and tensions found (documented, not silently overridden)

| # | Tension | Handling |
|---|---|---|
| X1 | The Kiroween brief locks 10 shared modules; an orchestration capability is not among them | Proposed as an application component using existing modules (P2). Needs owner confirmation (Q-H2) |
| X2 | The roadmap defers the AI Provider Adapter and recommendations to Phase 9, while some runtime agents are useful earlier | Phased in Track H: deterministic agents first, AI-backed agents after Phase 9 (P12) |
| X3 | Q-T2 (no source values to external AI until approved) limits any agent that reads source text | Those agents are marked blocked on Q-T2. Value-free agents (finding codes, counts) are not |
| X4 | "No unnecessary infrastructure" versus "asynchronous execution" | A database-backed task table and a second process of the same codebase, with alternatives rejected (P3). Needs approval (Q-H3) |
| X5 | The original Iteration 2 decision record is not in this workspace, the legacy documents searched, or the repo history | The mechanics in P3 are my proposal. The owner's statement of the decision (name and sync plus async intent) is treated as authoritative. If the original text differs, it prevails (Q-H1) |
| X6 | The current Kiro setting is "workflows launch only when asked" | The development harness uses workflows only on request. It does not auto-launch (Development §1) |
| X7 | `AGENTS.md` is an approved rulebook, and the harness wants new rules | Not edited. Amendments are proposed in `DEVELOPMENT_AGENT_HARNESS.md` §8 (Q-H4) |

No existing approved decision is changed by this record.

## D. Unresolved questions

| ID | Question |
|---|---|
| Q-H1 | Please provide or restate the original Iteration 2 record for the Hybrid Orchestrator so the mechanics can be checked against it |
| Q-H2 | Is the runtime harness an application component (proposed) or an amendment to the shared module list? |
| Q-H3 | Approve a PostgreSQL-backed task table with a same-codebase worker for the async path? |
| Q-H4 | Approve the proposed `AGENTS.md` amendments (gates, independence rule, evidence section)? |
| Q-H5 | May prompts and AI outputs that contain source text be stored? Default proposed: store hashes only |
| Q-H6 | Evidence storage: keep `.agents/tasks/` local and git-ignored (proposed), or commit sanitized evidence? |
| Q-H7 | Number of reviewers per tier (single reviewer for T1, two for T2/T3 proposed) |
| Q-H8 | Enforcement layer: git hooks (proposed as enforcing) versus Kiro hooks (advisory)? |
| Q-H9 | Keep six candidate runtime agents or collapse to three? |
| Q-H10 | Who owns and maintains the synthetic evaluation sets for agent changes? |
| Q-T2, Q-T7, Q-T8, Q-T9 | Carried over from `0003` (AI egress, roles, database provisioning, hosting) |

## E. Phase 3 readiness

The harness design does not block Phase 3 ingestion. Phase 3 would add only Track H1 items (evidence template, pre-commit sensitive scan, path guard) and an audit event shape that allows agent actors. Owner decisions still needed before Phase 3 are in the gate register in `ROADMAP.md` (GT-1 to GT-6; the harness items are GT-5).
