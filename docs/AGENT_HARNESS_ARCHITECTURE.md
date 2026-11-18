# Agent Harness Architecture

Status: **Proposed** unless marked **Confirmed**. Design only. No agent, schema, endpoint, or job runner exists. Source of the confirmed items: the owner's pre-Phase 3 design task and `DECISIONS/0006-agent-harness-architecture.md`.

Detail documents: `DEVELOPMENT_AGENT_HARNESS.md`, `RUNTIME_AGENT_HARNESS.md`, `AGENT_GOVERNANCE_AND_SECURITY.md`.

## 1. Two harnesses, one rule

WorkLens needs two separate agent systems. They are named alike but have different users, tools, authority, and evidence.

| Aspect | Development Harness | Runtime Harness |
|---|---|---|
| Operates during | Software development | WorkLens application usage |
| Controls | Coding agents (plan, implement, review, test, verify) | Business AI agents (assess, review quality, recommend, report) |
| Main objective | Safe and verified engineering | Controlled business intelligence |
| Approval authority | Human developer / project owner | Authorized WorkLens user; business definitions only by the project owner |
| Evidence | Code, tests, diffs, command logs, review verdicts | Source provenance, assessments, audit records, AI output records |
| Lives in | Kiro configuration, docs, local scripts, `.agents/` task folders | `worklens/backend` application code (Phase H2 onward) |
| Data it may touch | Repository files; source data only by explicit task authorization | Domain views through allow-listed tools, as the invoking user's role permits |
| Failure effect | A task stops and is reported; no product impact | A task fails in isolation; deterministic pipeline keeps working |
| Identity in audit | `actor_type = dev_agent` (task evidence files) | `actor_type = agent` in `audit.audit_event` |

Rule (Confirmed): AI agents never approve business formulas, workload definitions, eligibility rules, or KPI definitions, in either harness. Only the project owner approves them, through decision records.

## 2. What can be shared and what must stay independent

| Capability | Shared? | How | Justification |
|---|---|---|---|
| Redaction and sensitivity policy | **Shared policy** | One written policy (`SECURITY_AND_SENSITIVITY.md`) applied in both; each harness implements its own enforcement | Same data, same rules; code is not shareable (different runtimes) |
| Prompt/config versioning convention | **Shared convention** | Same naming and hashing rule (`<name>@<version>+<hash>`) | Cheap, avoids two schemes |
| Approval record format | **Shared convention** | Decision-record style: who, what, when, reference | Owner reads one format |
| Audit vocabulary | **Shared vocabulary** | Common action names and fields; separate stores | Dev evidence is files; runtime audit is a database table |
| AI Provider Adapter | **Runtime only (foundation module)** | Dev agents use Kiro's own models; they never call the WorkLens adapter | Different trust and billing boundaries |
| Evidence bundle idea (claims point to artifacts) | **Shared principle** | Dev: files in `.agents/tasks/`; Runtime: `AiOutput` + `audit_event` rows | Same principle, different storage |
| Task envelope fields (id, version, inputs by reference, budget) | **Independent, similar shape** | Each defines its own | Reuse only after a second consumer exists |
| Orchestration code | **Independent** | Dev orchestration is Kiro workflows and human gates; runtime orchestration is application code | No code overlap |
| Tool permissions | **Independent** | Separate allow-lists | A coding agent must never inherit business-data tools, and vice versa |
| Identities and credentials | **Independent** | No shared secrets or service accounts | Blast-radius isolation |

No shared library is justified now. If AutoRunner V2 later needs an agent runtime, the runtime harness contracts are written to be extractable, but extraction waits for a real second consumer (YAGNI; Confirmed owner direction: shared capabilities must be justified by actual reuse).

## 3. How the harnesses interact without coupling

```
Developer/Owner ──> Development Harness ──> repo changes ──> (tests, review, approval)
                                                    │
                           prompts, agent configs, tool allow-lists live in the repo
                                                    ▼
                                      WorkLens application build
                                                    │
User ──> WorkLens UI/API ──> Runtime Harness ──> AI Provider Adapter ──> provider
```

- The only link is the repository: runtime agent definitions (configs, prompt templates, tool allow-lists, output schemas) are code artifacts. They change only through the Development Harness, with review and evaluation evidence.
- The runtime harness never invokes a coding agent and never edits the repository.
- The development harness never calls runtime agents and has no runtime credentials.
- Neither reads the other's stores. Dev evidence stays in task folders; runtime audit stays in the database.

## 4. Where the runtime harness fits in the locked architecture

**Conflict noted, not silently resolved.** The Kiroween brief locks 10 shared modules and 4 WorkLens modules. An "Agent Orchestration" capability is not on that list.

**Proposal:** do not add an 11th shared module. The runtime harness is a **WorkLens application component** (`worklens/backend/agents/`) that composes existing modules:

| Foundation module | Role for the runtime harness |
|---|---|
| Configuration Engine | Agent settings, timeouts, provider selection |
| Rules Engine / Assessment Engine | Deterministic logic that agents wrap or consult |
| AI Provider Adapter | The only path to a language model |
| Logging & Audit | Task transitions, AI output records |
| Notification Interface | Optional: tell a user a task awaits review (Deferred) |
| Plugin / Adapter System | Registers the AI provider kind (already scoped) |

If the owner wants the orchestrator shared, the module list needs an explicit amendment (Q-H2).

## 5. Agent lifecycle (runtime tasks, Proposed)

```
created ──> queued ──> running ──> awaiting_review ──> accepted
   │ (sync skips queued)   │             │──> rejected
   │                       ├──> failed ──> (retry) queued
   │                       ├──> timed_out
   └──> cancelled          └──> blocked (policy or missing approved definition)
```

| Transition | Trigger | Recorded |
|---|---|---|
| created | User or system request validated against role and policy | audit event, task row |
| queued | Orchestrator selects async mode | audit event |
| running | Worker (or request thread for sync) starts | audit event, versions of agent config and prompt |
| awaiting_review | Output validated against its schema and requires review | audit event |
| accepted / rejected | Authorized reviewer decides | audit event with reviewer and reason |
| failed / timed_out | Error or deadline | audit event with error class (no source values) |
| blocked | Required approved definition or permission missing | audit event with the missing prerequisite |

A completed task with no review requirement goes `running -> completed` (a terminal state, shown as `accepted` for system-accepted deterministic outputs).

Agent definition lifecycle: `draft -> evaluated -> approved -> active -> deprecated`. Only `active` versions can run. Approval of an agent version is a development-harness gate (human), recorded in the repo.

## 6. Orchestration model: Hybrid Orchestrator (Confirmed name; mechanics Proposed)

**Confirmed (owner-stated Iteration 2 decision):** Hybrid Orchestrator, synchronous plus asynchronous execution. This is not replaced by a fully sequential or fully asynchronous design.

**Note:** the original Iteration 2 record is not in this workspace or the legacy documents searched, so the mechanics below are my proposal. If the original record says something different, it takes precedence (Q-H1).

- One orchestrator component, one `AgentTask` contract, two execution paths:
  - **Synchronous path:** bounded, interactive work. Runs inside the request, with a hard deadline, and returns the result inline. Used for small selections and deterministic steps.
  - **Asynchronous path:** long or large work. The request returns a task id immediately; a worker executes it; the client polls the task (server-sent events optional later).
- The orchestrator selects the path from the agent's declared modes, the input size, and a policy table. The caller can request a mode but cannot exceed policy.
- A pipeline mixes both: deterministic steps run synchronously first (cheap, reproducible); AI steps over many records run asynchronously; results merge through the same task contract.
- Async uses the existing PostgreSQL database as the job store (a task table claimed with row locking) and a worker that is a second process of the same application. **No broker, cache, vector store, or extra service.** Justification and rejected alternatives are in `RUNTIME_AGENT_HARNESS.md` section 2.6. This is the minimum that meets the confirmed hybrid requirement; owner approval is requested (Q-H3).
- The same agent code runs in both modes. Mode changes timing and delivery only, never the result definition.

## 7. Context, memory and state boundaries (Proposed)

| Concern | Rule |
|---|---|
| Context | Built per task by a context builder from references (run ids, row ids); minimal, redacted, size-capped; contains provenance ids |
| Conversation memory | None across tasks in v1. Each task is stateless apart from its inputs |
| Long-term memory | None. No vector database, no embeddings store |
| Persisted state | Task records, outputs, review decisions, AI call records (hash of request, model, version, usage). Never raw prompts containing source values unless approved (Q-H5) |
| Dev harness state | Task folders under `.agents/tasks/`; not application data |

## 8. Unnecessary infrastructure (Confirmed constraint)

Not introduced: message brokers, vector databases, distributed workers, extra services, autonomous planners. Each would need a demonstrated requirement and a written justification before adoption.

## 9. Status

Both harnesses are **design only**. See `IMPLEMENTATION_STATUS.md` and the Track H rows in `ROADMAP.md`.
