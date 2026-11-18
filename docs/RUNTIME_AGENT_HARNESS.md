# Runtime Agent Harness

Status: **Proposed.** Design only. No agent, orchestrator, job store, or schema exists. The six agents are **candidates, not approved agents**. Confirmed: the Hybrid Orchestrator (synchronous plus asynchronous) and the rule that AI never invents or approves business definitions.

Purpose: coordinate specialized AI-assisted agents inside WorkLens, while deterministic logic and approved definitions stay in charge.

## 1. Principles

1. **Deterministic first.** Anything that can be a deterministic rule or an approved calculation is one. AI is used where language understanding or narrative adds value.
2. **AI interprets; it does not decide.** AI output is a proposal, a classification suggestion, or text. It never sets eligibility, formulas, workload definitions, KPI definitions, or approval status.
3. **No definitions from AI.** Agents may draft questions or candidate wording for the owner. Draft status is stored separately and can only become a definition through the owner's decision record.
4. **Separation of numbers and prose.** Every number in an output comes from a deterministic source (a metric run or a count) and carries its id. AI text may not introduce numbers.
5. **Provenance in, provenance out.** Inputs are references to source-traceable records; outputs cite those references.
6. **Authorization by role.** An agent task runs with the permissions of the invoking user, capped by the agent's own allow-list.
7. **Gated by approvals.** Agents that depend on undefined business rules are `blocked` until the owner approves the definitions (Phase 5).

## 2. Hybrid Orchestrator

### 2.1 Components (all inside the WorkLens backend, Proposed)

| Component | Responsibility |
|---|---|
| Orchestrator | Validates a request, checks permissions and prerequisites, selects the mode, creates `AgentTask`s, and assembles pipeline results |
| Agent registry | Maps `agent_id@version` to its config, prompt template, tool allow-list, and output schema. Only `active` versions are runnable |
| Context builder | Builds the minimal, redacted, size-capped context from references |
| Executor | Runs one task: deterministic steps, then (if needed) an AI call through the AI Provider Adapter, then output validation |
| Task store | Task and result records in the application database |
| Worker | A second process of the same codebase that claims queued tasks |
| Review service | Records human review decisions on outputs |

### 2.2 Mode selection

| Condition | Mode |
|---|---|
| Agent declares `sync` only | Synchronous |
| Agent declares `async` only | Asynchronous |
| Agent declares both, input within the sync budget (rows, tokens, estimated time) | Synchronous |
| Agent declares both, input over budget, or a batch of records | Asynchronous |
| AI provider unavailable or circuit open | Async tasks wait or fail per policy; sync AI tasks fail fast with a clear error; deterministic steps still run |

The caller may request a mode. Policy can override; a caller cannot force sync on an over-budget input.

### 2.3 Synchronous path
- Runs in the request. Hard deadline from configuration (default proposal: 15 s end to end, 10 s for an AI call). No hidden retries for AI calls; one retry for transient read errors.
- Returns the validated output or a typed error. Results are still stored as tasks, so even sync outputs are auditable.
- Good for: single-row or small-selection explanations, deterministic validation summaries, short report sections.

### 2.4 Asynchronous path
- The request returns `202` with a task id. The worker claims the task from the database with row-level locking (one claim per task), executes it, and writes results.
- Per-task timeout (proposal: 10 min; all timings in this document are unmeasured placeholders to be set by configuration and tuned), up to 3 attempts with backoff for transient errors, then `failed`. Tasks are idempotent by `idempotency_key`, so retries cannot duplicate outputs.
- Progress and state are polled via the API; push (server-sent events) is optional later.
- Good for: batch review across all rows, long reports, multi-step pipelines.

### 2.5 Pipeline example (illustrative; steps depend on approved definitions)

```
[sync]  deterministic validation summary (counts from findings)
[async] AI triage of finding groups (batched, redacted, reviewable)
[sync]  merge: counts (deterministic) + triage text (AI, labeled) 
[human] reviewer accepts or rejects the triage text
```

Deterministic steps never wait for AI steps. A failed AI step leaves the deterministic output intact.

### 2.6 Why no queue infrastructure
| Option | Decision |
|---|---|
| PostgreSQL task table + same-codebase worker | **Proposed.** Meets the hybrid requirement with the database already in the stack; transactional with results and audit |
| In-process background tasks only | Rejected: tasks lost on restart; no worker isolation |
| Redis/Celery, RabbitMQ, cloud queues | Rejected for now: a new service to run, secure, and reproduce locally, with no demonstrated volume. Revisit if concurrent load or task count proves PostgreSQL insufficient |
| Vector database / memory store | Rejected: no retrieval requirement exists |

Phase 3 does not need the orchestrator. Its ingestion runs complete in seconds and stay synchronous.

## 3. Contracts

### 3.1 AgentTask (input envelope)

| Field | Meaning |
|---|---|
| `task_id`, `parent_task_id` | Identity; pipeline linkage |
| `agent_id`, `agent_version`, `prompt_version` | Exact versions to run (null prompt for deterministic agents) |
| `requested_by`, `requester_role` | Authenticated user and role |
| `mode_requested`, `mode_selected` | Caller choice and orchestrator decision |
| `input_refs` | References: import run id, classification run id, row ids, metric run ids. **No values** |
| `scope` | Filters (class, review state, row range); size estimate |
| `budget` | Deadline, max attempts, token cap |
| `policy_snapshot` | Hash of the permission and redaction policy applied |
| `idempotency_key` | Prevents duplicate execution |
| `created_at` | Timestamp |

### 3.2 AgentResult (output envelope)

| Field | Meaning |
|---|---|
| `task_id`, `status` | Lifecycle state |
| `output` | Typed payload validated against the agent's schema |
| `evidence_refs` | Row ids, finding ids, metric run ids that support each item in the output |
| `determinism` | `deterministic`, `ai_assisted`, or `ai_generated`, per output element |
| `ai_call_refs` | Request hash, provider, model, usage; no stored prompt text unless approved (Q-H5) |
| `review` | Required flag, state, reviewer, reason, time |
| `errors` | Error class and code, no source values |
| `versions` | Agent, prompt, mapping, classification, and metric definition versions used |

### 3.3 Message rules
- Typed and schema-validated at every boundary. Output that fails validation is discarded (kept as a failed attempt record), never repaired silently.
- Free text appears only in fields declared as `narrative`, which are labeled AI-generated in the UI.
- Task payloads reference data; the context builder resolves references at run time under the invoker's permissions.

## 4. Candidate agents

Common to all: runs under the invoker's role; reads only through allow-listed domain views; writes only its own task and output records; cannot write raw or domain source data; every output carries evidence references and is stored with versions.

### 4.1 Data Understanding / Classification Agent
| Item | Proposal |
|---|---|
| Business responsibility | Help the owner understand column and category semantics (Q-B3 to Q-B6) and surface candidate groupings of category spellings |
| Deterministic part | **Row classification (RC/RU rules) is deterministic and is not an agent.** It stays in the Rules Engine |
| AI part | Suggest candidate glossary entries and category groupings from distinct values and notes, as questions for the owner |
| Input | Distinct-value statistics and sampled text for a column, with redaction policy applied |
| Output | `proposals[]`: `{field, observation, candidate_interpretation, evidence_refs}`, status `proposed` |
| Required source data | Domain records, validation findings |
| Human review | **Required**; accepted proposals become input to an owner decision, never a definition |
| Mode | Async (column-wide scans); sync for a single column |
| Failure | Fail isolated; no effect on classification or ingestion |
| Audit | Task, versions, evidence refs, reviewer decision |
| Assessment | Narrow value; mainly useful during the workshop. Candidate for deferral |
| Blocked by | Q-T2 (AI egress), since it reads source text |

### 4.2 Data Quality Review Agent
| Item | Proposal |
|---|---|
| Business responsibility | Explain data quality findings and group them for the owner, with questions for source owners |
| Deterministic part | All findings (V-codes), counts, severity, affected rows |
| AI part | Optional: group related findings, draft human-readable explanations and remediation questions |
| Input | Finding references and counts; no raw values by default |
| Output | Finding groups with explanations (labeled AI) plus deterministic counts |
| Required source data | `validation_finding`, `row_classification` |
| Human review | Required for AI text before it is shared externally; not needed for deterministic counts |
| Mode | Sync for summaries; async for full-run triage |
| Failure | AI step fails: deterministic summary still returned |
| Audit | Task, evidence refs, versions |
| Assessment | **Best first candidate**: valuable, deterministic core, low risk; AI part optional and value-free (finding codes need no source text) |
| Constraint | Cannot change eligibility or findings, and cannot mark rows valid or invalid |

### 4.3 Automation Assessment Agent
| Item | Proposal |
|---|---|
| Business responsibility | Offer an advisory, evidence-linked reading of whether an activity looks automatable, from text columns |
| Deterministic part | Approved assessment criteria and eligibility, once they exist (Q-B3, Q-B10, Q-B12) |
| AI part | Qualitative interpretation of notes, tools, and category text against approved criteria |
| Input | Row references; context of relevant text fields under the redaction policy |
| Output | `{record_ref, advisory_assessment, rationale, evidence_refs, criteria_version}`; never an approved assessment |
| Human review | **Required** before any assessment is accepted into reports |
| Mode | Async (batch) |
| Failure | Isolated; deterministic criteria results unaffected |
| Audit | Full: inputs by reference, model, prompt version, reviewer decision |
| Blocked by | Q-B3, Q-B10, Q-B12, Q-T2. **Cannot run until the criteria are approved** |

### 4.4 Recommendation / Prioritization Agent
| Item | Proposal |
|---|---|
| Business responsibility | Present prioritized automation recommendations with explanations |
| Deterministic part | **Ranking and scores come only from an approved scoring definition** (Q-B10) |
| AI part | Narrative rationale and caveats around the deterministic ranking |
| Input | Scoring run id, record references |
| Output | Ranked list copied from the scoring run (read-only) plus narrative per item |
| Human review | Required for narrative; ranking changes require a new approved definition or scoring run, never an agent edit |
| Mode | Sync for one item; async for the full portfolio |
| Failure | Narrative failure leaves the ranking available |
| Blocked by | Phase 5 and Phase 8 outputs |

### 4.5 Impact Analysis Agent
| Item | Proposal |
|---|---|
| Business responsibility | Explain approved impact and workload-reduction results and flag anomalies for review |
| Deterministic part | All computed values (approved metrics only) and anomaly thresholds, if approved |
| AI part | Plain-language interpretation and questions |
| Input | Metric run ids |
| Output | Interpretation tied to metric values by id; anomalies flagged deterministically |
| Human review | Required before use in decisions |
| Mode | Async for portfolio; sync for single metrics |
| Blocked by | Approved definitions (Q-B2, Q-B10); post-automation measurement data may not exist (workshop C-11) |

### 4.6 Report Generation Agent
| Item | Proposal |
|---|---|
| Business responsibility | Assemble reports from approved outputs |
| Deterministic part | Report templates, tables, charts, all numbers (from metric runs and counts) |
| AI part | Optional narrative sections, marked AI-generated, reviewed before publishing |
| Input | Report definition id and version; run ids |
| Output | Report document with a manifest listing every number's source id |
| Grounding check (deterministic) | Each number in AI text must match a number supplied in the input facts; otherwise the narrative is rejected |
| Human review | Required before a report leaves WorkLens |
| Mode | Async for full reports; sync for short summaries |
| Failure | Fall back to the deterministic report without narrative |
| Note | Could be absorbed by the Reporting Engine (Deferred) plus an optional narrative step |

### 4.7 Summary

| Agent | AI needed? | Review | Mode | Gate | First-wave? |
|---|---|---|---|---|---|
| Data Understanding / Classification | Optional (rules are deterministic) | Required | async / sync | Q-T2 | No |
| Data Quality Review | Optional | Required for AI text | sync / async | Q-T2 for AI part only | **Yes** (deterministic core) |
| Automation Assessment | Yes (interpretation) | Required | async | Q-B3, Q-B10, Q-B12, Q-T2 | No |
| Recommendation / Prioritization | Narrative only | Required for narrative | sync / async | Q-B10 | No |
| Impact Analysis | Narrative only | Required | sync / async | Q-B2, Q-B10 | No |
| Report Generation | Narrative optional | Required | async / sync | Approved metrics | After first wave |

Possible simplification for the owner to decide (Q-H9): collapse to three agents (Quality Review, Assessment & Recommendation, Reporting & Impact narration) if six are too many for the hackathon scope.

## 4a. Requirements alignment, Q1–Q51 (reference-stated; Proposed)

Source: `REQUIREMENTS_RECONCILIATION_Q1_Q51.md`. No existing decision changes.

- **L1 owns assessment decisions** (Q4, Q12, Q20): category, notes, status. Agents cannot set `Improvement Category`, `Category Notes`, `New Improvement Category Fixed`, or `Assessment Status`, and cannot mark an assessment `Done`. The Automation Assessment agent remains advisory.
- **Reviewer role:** Management is read-only (Q51), so it cannot accept or reject agent outputs. L1 is the natural reviewer of assessment-related AI output. This is a proposal, not stated by the reference (Q-R12).
- **Quality Review (Q18, Q50):** the Data Quality Review agent supports the Quality Review capability. It may group and explain findings. It must not correct source values or mark rows valid or invalid. L1 dispositions are separate records.
- **Corrections** live in the L1 assessment layer, never in `raw` or the workbook.
- **Out of scope for agents:** Monitoring of automation (Q36) and the 10% workload assumption as impact (Q39). The Impact Analysis agent must not present the 10% assumption as measured impact. The workload-saving formula (Q41) is not reconstructed by any agent.
- **Q-H2/Q-H9 unaffected.** The MVP six capabilities do not include AI recommendation, so first-wave agents stay as proposed. Whether AI recommendations are MVP is Q-R16.

## 5. Deterministic vs AI boundary (Confirmed principle)

| Work | Owner of the logic |
|---|---|
| Import, hashing, row classification, validation findings | Deterministic modules (never an agent) |
| Normalization, eligibility (once defined), workload, scoring, impact, KPIs | Deterministic, from approved definitions |
| Explaining, grouping, summarizing, drafting questions, narrative | AI, labeled, reviewed |
| Deciding definitions, approvals, formulas | **Project owner only** |

Enforcement ideas (Proposed): output schemas separate `computed` from `narrative`; AI cannot write to `derived` tables (no database privilege); the grounding check; metric runs refuse non-approved definitions.

## 6. Human review

- Review states: `proposed → under_review → accepted | rejected | superseded`.
- Reviewer: a user with the `reviewer` role (assessments, narratives); `admin` (approver) for report publication; **definitions only by the project owner outside the application** (decision records).
- Reviewer sees: output, evidence references (clickable to source rows through authorized views), versions, and the deterministic facts next to the narrative.
- Rejection reasons are stored and available for later prompt evaluation.
- Nothing downstream consumes an AI output unless it is `accepted` or flagged as a draft in the UI.

## 7. Failure handling and isolation

| Failure | Behavior |
|---|---|
| AI provider error or timeout | Task `failed` or `timed_out`; deterministic outputs remain; retry per policy |
| Output fails schema or grounding check | Discarded, recorded; at most one regeneration attempt; then `failed` |
| Missing approved definition | Task `blocked` with the missing prerequisite named |
| Permission denied | Task not created; audit event |
| Worker crash | Claim expires; task becomes claimable again (idempotent) |
| Repeated provider failures | Simple circuit breaker (counter and cool-down) prevents flooding |
| Agent bug | Contained to the task; no write access beyond its own records |

## 8. Auditability and traceability

Every task writes: request, versions, mode, inputs by reference, tool calls (names and counts), AI call record (hash, model, usage), validation result, review decisions, and terminal state. Any displayed AI statement can be traced to: task, prompt and agent version, evidence refs, and through them to workbook hash, sheet, row, and column.

## 9. Planned placement and phasing (Proposed)

| Track H step | Content | After |
|---|---|---|
| H1 | Development harness setup (see `DEVELOPMENT_AGENT_HARNESS.md` section 9) | Phase 3 start |
| H2 | Orchestrator core and task store; deterministic Data Quality Review; deterministic report skeleton | Phase 4 |
| H3 | AI-backed agents using the AI Provider Adapter | Phase 9, plus Q-T2 and approved definitions |

Phase 3 preparation only: the audit event design allows an `actor_type` of `agent` and a `task_id` reference. No agent work in Phase 3.

## 10. Unresolved

Q-H1 original Iteration 2 record; Q-H2 shared or application component; Q-H3 DB-backed worker approval; Q-H5 whether prompts and AI outputs containing source text may be stored; Q-H9 number of agents; Q-T2 AI egress; Q-T7 roles.
