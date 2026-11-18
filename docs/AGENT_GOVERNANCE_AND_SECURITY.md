# Agent Governance and Security

Status: **Proposed**, built on **Confirmed** rules: data immutability, sensitive-data handling (Q-S6), no AI-approved business definitions, human approval boundaries. Design only.

Applies to both harnesses. Specifics: `DEVELOPMENT_AGENT_HARNESS.md`, `RUNTIME_AGENT_HARNESS.md`. Data rules: `design/SECURITY_AND_SENSITIVITY.md`.

## 1. Governing rules (Confirmed)

1. No AI agent is assumed authorized for any data or action. Permissions are granted explicitly, per agent and per task.
2. Source records are immutable. No agent can write, update, or delete `raw` data or the workbook.
3. Raw source values, workbook-derived values (formulas and cached values), and WorkLens-derived values stay labeled and separate. L1-authored values (`l1_authored`) and agent output (`ai_generated`) are separate kinds, never mixed into the others (`DOMAIN_MODEL.md` §4).
4. No sensitive source values in application logs, evidence files, prompts stored in the repo, or public artifacts.
5. Agents never approve or alter business definitions, workload definitions, eligibility rules, or KPIs.
6. No commit, push, deploy, or destructive operation without explicit human authorization.

## 2. Permission model

### 2.1 Development agents (by role; "G" = gate needed)

| Action | Planner | Implementer | Reviewer | Tester | Verifier |
|---|---|---|---|---|---|
| Read repo and docs | yes | yes | yes | yes | yes |
| Write plan file | yes | no | no | no | no |
| Edit allow-listed code/docs | no | yes | no | no | no |
| Write review/test/evidence files | no | log only | review | test report | evidence |
| Run lint, type check, tests | no | yes | yes | yes | yes |
| Run local-only tests on the real workbook (counts/hashes only) | no | no | no | G10 | G10 |
| Read real source values | no | no | no | G10 | G10 |
| Add dependency | no | G3 | flags | no | flags |
| Create/run migrations, touch any database | no | G4 | no | G4 | no |
| Git add/commit | no | G5 | no | no | no |
| Push, merge, deploy | no | G6 | no | no | no |
| Destructive commands | no | G7 | no | no | no |
| Edit decision records, source-of-truth decisions, metric definitions | no | no (drafts in a separate file) | no | no | no (G2/G8 by owner) |
| Touch legacy repo or modify the workbook | never | never | never | never | never |
| Network access | docs lookup only if asked | package install only under G3 | no | no | no |

### 2.2 Runtime agents

| Resource | Allowed to agents | Notes |
|---|---|---|
| Domain views (read) | Yes, per agent allow-list and invoker's role | Views expose only needed columns; values included only when the agent needs them and policy allows |
| `raw` tables | No direct access | Provenance is resolved through references the API already authorizes |
| `derived` (approved metric runs) | Read | Agents cannot write metric values |
| Own task, output, review records | Read/write own tasks | Role-limited |
| Source file system or workbook | **Never** | |
| Shell, arbitrary HTTP, other tools | **Never** | The AI adapter is the only outbound path |
| AI provider | Via the adapter, with redaction and egress policy | Default deny for source values (Q-T2) |

Effective permission = invoker's role ∩ agent allow-list ∩ policy snapshot. An agent that needs more fails with `blocked`, not an elevated retry.

### 2.3 Human roles (Proposed; Q-T7, Q-R12)

The business roles in the Reference are **L1** (edits) and **Management** (read-only). The role names below are technical and Unresolved. The application design uses capabilities (`ARCHITECTURE.md` §6) so role naming is configuration. Proposed: L1 holds `agent.review`; Management does not.


| Role | Can |
|---|---|
| viewer | See counts and metadata |
| inspector | See source values in inspection views |
| reviewer | Accept or reject agent outputs |
| admin | Run imports, publish reports, manage agent versions' activation |
| project owner | Approve definitions, source decisions, gates G2, G4, G8, G9, G10 (outside the app, through decision records) |

## 3. Auditability

### 3.1 Development
Per task: plan, execution log, raw command output, review, test report, evidence manifest with hashes, gate approvals (who, when, scope). Retained locally under `.agents/tasks/`; a summary goes to `IMPLEMENTATION_STATUS.md`.

### 3.2 Runtime
Append-only `audit` events (design uses existing `audit.audit_event`; no new schema is proposed here). Event kinds:

| Event | Contains |
|---|---|
| `agent.task.created/queued/started/completed/failed/timed_out/blocked/cancelled` | task id, agent and prompt version, mode, requester, role, error class |
| `agent.output.validated/rejected` | schema/grounding result |
| `agent.review.accepted/rejected` | reviewer, reason |
| `agent.config.activated/deprecated` | version, approver |
| `agent.ai_call` | provider, model, request hash, usage, redaction policy id |
| `agent.policy.denied` | what was denied, never the data |

Events carry ids, versions, counts, and hashes. No source values.

## 4. Failure handling (common taxonomy)

| Class | Examples | Response |
|---|---|---|
| Prerequisite | Missing approved definition, missing permission, wrong hash | Stop in `blocked`; name the prerequisite |
| Transient | Network, provider 5xx, DB deadlock | Bounded retry with backoff |
| Validation | Schema fail, grounding fail, scope violation | No silent repair; discard or fail |
| Integrity | Hash mismatch, counts differ from golden, unexpected write | Abort, alert, no partial results |
| Safety | Suspected sensitive-data leak, prompt-injection indicator | Stop, quarantine artifacts, report to the owner |
| Agent defect | Crash, loop | Task fails in isolation; kill after timeout |

Timeouts are mandatory on every agent task and external call. Retry counts are bounded and recorded. Failures are shown as failures in reports and UIs.

## 5. Data governance for agents

| Data class | Dev agents | Runtime agents |
|---|---|---|
| Internal-metadata (hashes, counts, codes, row numbers) | Yes | Yes |
| Internal-sensitive source values | Only under G10, never in artifacts | Only as the invoker's role and the redaction policy permit; external AI only after approval (Q-T2) |
| Secrets | Never visible to agents; none in the repo | Server-side only; never in prompts |

Additional rules:
- **Redaction before the model.** The context builder removes or tokenizes identifiers and links unless the agent's approved purpose requires them. Redaction policy is versioned and recorded per call.
- **Untrusted text.** Cell content is data, not instructions. Prompts delimit it; outputs are schema-validated; no agent output is executed; agents have no tools that act on external systems.
- **Local-first option.** For development, a stub or local model avoids sending data externally. Whether a local model is acceptable is open (Q-T2).
- **Prompts in the repo hold templates only**, no source values. Stored AI call records keep a request hash by default; storing prompt text with source values needs approval (Q-H5).
- **OneDrive caution.** The repo and workbook live in a synced folder. Evidence and logs should avoid values so cloud sync does not widen exposure.

## 6. Versioning of prompts and agent configurations

| Item | Rule |
|---|---|
| Identifier | `agent_id@semver+hash` (hash of config + prompt template + output schema + tool allow-list) |
| Storage | Files in the repo under `worklens/backend/agents/configs/` (future path); history through git |
| Change control | Any change goes through the Development Harness, tier T3 (agent configs and prompts are gated areas) |
| Evaluation | Each change carries evaluation evidence: a fixed synthetic test set with expected structural properties (schema valid, grounding pass, refusal on out-of-scope requests, no invented numbers). Results stored with the change; no real source values in evaluation sets |
| Activation | `draft -> evaluated -> approved -> active -> deprecated`; approval by a human, recorded; only `active` runs |
| Traceability | Every task and AI output records the exact version identifier |
| Rollback | Re-activate a previous version; old outputs keep their original version labels |
| Model change | A provider or model change counts as a version change and re-triggers evaluation |

## 7. Human-in-the-loop (summary)

- Development: gates G1 to G10 (`DEVELOPMENT_AGENT_HARNESS.md` section 5).
- Runtime: review states on every AI-assisted output; publication and sharing gated by role; definitions only by the project owner.
- Silence is never approval. Approvals are scoped and recorded.

## 8. Incident handling (Proposed)

If a sensitive value reaches a log, evidence file, prompt store, or commit: stop work, do not copy the value into the report, identify the location by path and rule, remove it from the working tree, tell the owner. Rewriting git history or contacting external providers needs the owner's decision (G7).

## 9. Unresolved

Q-T2 (AI egress and local model), Q-T7 (roles), Q-H5 (storing prompts/outputs with source text), Q-H6 (evidence retention), Q-H10 (evaluation set ownership and size).
