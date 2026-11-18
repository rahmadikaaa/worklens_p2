# Development Agent Harness

Status: **Proposed.** Design only. Nothing in `.kiro/`, `.agents/`, or hooks is created by this document. Items marked **Confirmed** come from the owner's controls list and `AGENTS.md`.

**Decisions (`DECISIONS/0007`, GT-5):** P8 (with the manual two-session workflow, section 2), P9, P10, P12, P13, Q-H4, Q-H6, Q-H7 (reviewer policy C, sections 2.3 and 4) and Q-H8 are approved. The harness itself is **not implemented**: no hooks, scripts, workflows or steering files exist.

Purpose: govern AI coding agents while WorkLens is built, so changes are scoped, tested, reviewed, evidenced, and approved by a human.

## 1. Fit with Kiro (practical mapping)

| Harness element | Kiro mechanism available in this environment | Proposed use |
|---|---|---|
| Global rules | `AGENTS.md` (workspace rules, already loaded into every session); steering files in `~/.kiro/steering/` and `<workspace>/.kiro/steering/` | `AGENTS.md` stays the single rulebook. One short workspace steering file may restate the gates; created only after approval |
| Role agents | Workflow agents in the catalog: `wf-planner`, `wf-design`, `wf-design-reviewer`, `wf-coder`, `wf-code-reviewer`, `semantic_reviewer`, `wf-review-aggregator`, `wf-pr-submitter`, `wf-pr-responder` | Map roles below to these agents; workflow definitions are generated per task |
| Orchestration | Workflows (`run_workflow`), including bundled recipes such as `feature-pipeline` (plan, implement-and-review loop, validation gate), `semantic-review-multi-model`, `investigate` | Used only when the owner asks. Current setting: **"Workflow launch setting: When asked"**. The harness never auto-launches workflows |
| Automated checks | Hooks in `.kiro/hooks` (events such as message sent, tool call, file save) and ordinary git hooks | Hooks may run the sensitive-data scan and path guard. Hook output is advisory to the agent; git hooks are the enforcing layer |
| Evidence storage | Task folders under `<repo>/.agents/tasks/` (the convention already used for reports) | One folder per task; see section 6 |
| Human gates | Normal conversation approval | Gates G1 to G10 below |

Design stance: no new tooling for the first use. Rules and evidence rules are documents plus a small number of scripts added during Phase 3 (Track H1, Proposed). The harness is judged practical if a single developer can follow it without ceremony for small tasks.

## 2. Roles

Roles are responsibilities, not necessarily separate processes. A small task may run planner and implementer in one session, but **review, testing and verification must be done by a different session than the one that wrote the code** (independence rule).

**Manual two-session workflow (P8, approved; required for T2 and T3 tasks):** one session implements. A separate session, which does not carry the implementer's conversation, does the review, testing and verification. This applies whether or not a Kiro workflow is launched. Launching workflows remains the owner's choice (setting "when asked"); a workflow that runs these roles as separate steps satisfies the requirement. The requirement does not change the gates, the evidence requirements or the tier rules.

### 2.1 Planning Agent
- **Responsibility:** turn an approved request into a scoped plan.
- **Input:** task statement, `AGENTS.md`, current docs and decision records, repo state (`git status`, HEAD sha).
- **Output:** `plan.md`: goal, in-scope and out-of-scope, file allow-list (paths it may touch), dependencies on decisions (with record ids), gated areas touched, tests to add or run, risks, tier (section 4), approval gates required, evidence required.
- **Allowed:** read repo and docs, read decision records, run read-only git and test-discovery commands, ask the human questions.
- **Prohibited:** editing files except the plan, reading source workbook values, inventing requirements, proposing business definitions as decisions, expanding scope.
- **Required evidence:** list of docs and decision ids consulted, HEAD sha.
- **Handoff:** plan approved at G1 (for tier 1 and above). Docs-only tier 0 tasks need approval only if the owner asked for it.
- **Failure/retry:** if a required decision is unresolved, the plan ends with status `blocked` and names the question (for example Q-B2). It does not guess. One revision cycle after human feedback, then escalate.

### 2.2 Implementation / Execution Agent
- **Responsibility:** make exactly the planned changes.
- **Input:** approved plan, allow-list, tier.
- **Output:** working-tree changes only within the allow-list; `execution-log.md`: commands run, files changed, deviations.
- **Allowed:** edit allow-listed files; run formatters, linters, type checks, and tests; add synthetic fixtures.
- **Prohibited:** touching files outside the allow-list; modifying `docs/DECISIONS/*` approvals, `SOURCE_OF_TRUTH.md` decisions, or metric definitions (they change only by human-authorized decision records); weakening, skipping, or deleting tests to pass; adding dependencies without a gate; committing, pushing, deploying; destructive commands; reading real source values; writing source values to logs, fixtures, or docs; modifying the workbook or the legacy repository.
- **Required evidence:** diff, execution log, raw output of the commands it ran.
- **Handoff:** to Testing and Review when the plan's checklist is complete. A stop-and-ask is required if the work needs anything outside the allow-list.
- **Failure/retry:** at most 2 fix cycles for a failing check. The third failure stops the task and reports. It never hides or reduces a failure.

### 2.3 Architecture / Code Reviewer Agent
- **Responsibility:** independent review of the diff against the plan, `AGENTS.md`, contracts in `docs/design/`, and security rules.
- **Input:** plan, diff, execution log, relevant docs. Not the implementer's conversation.
- **Output:** `review.md` with verdict `approve | changes-requested | reject`, findings by severity, each tied to a file and line or a rule.
- **Allowed:** read, run read-only commands, run tests.
- **Prohibited:** editing code; approving its own earlier work; approving when evidence is missing.
- **Checks:** scope (diff within allow-list), contract conformance, module boundary (foundation never imports worklens), data-integrity rules, no business formulas introduced, no gated module code, logging of values, dependency additions, test quality (assertions present, no skipped tests added).
- **Handoff:** `approve` goes to Verification. `changes-requested` returns to the implementer (counts as a fix cycle).
- **Failure/retry:** a review that cannot run (missing artifacts) is reported as `incomplete`, never as approval. 
- **Reviewer policy (Q-H7, option C, approved in `0007`):** one reviewer for T1. Two independent reviewers for T3 and for T2 tasks that touch raw data, security or migrations. Independent means neither wrote the code, each works in its own session, and they run on different models (the `semantic-review-multi-model` recipe is one way to do this). A T2 task outside those three areas has one reviewer, as `0007` says "one reviewer by default". T0 follows the tier table (self-check and human review of the diff).

### 2.4 Testing Agent
- **Responsibility:** run the specified checks and capture raw results.
- **Input:** plan's test list, repo at the reviewed state.
- **Output:** `test-report.md` plus raw output files: command, exit code, duration, counts (passed, failed, skipped, errors), coverage if configured, lint and type-check results.
- **Allowed:** run tests and checks, create synthetic fixtures in the allow-list, run local-only tests against the real workbook **only if the task authorizes it**, and only assert counts and hashes.
- **Prohibited:** editing production code; changing tests to make them pass (it may propose fixes in the report); reporting a result it did not run.
- **Required evidence:** the exact command line, exit code, and captured output. Skipped tests are listed with the reason.
- **Failure/retry:** failures are reported verbatim. A flaky test is reported as flaky with run counts; "rerun until green" without disclosure is prohibited. Maximum 1 rerun for diagnosis, disclosed.

### 2.5 Evidence / Verification Agent
- **Responsibility:** independently verify claims against artifacts and produce the final evidence bundle.
- **Input:** plan, diff, logs, test report, review.
- **Output:** `evidence.md` with a pass/fail line per check and a manifest of artifacts with hashes.
- **Checks (recomputed, not trusted):**
  1. Changed files are within the plan allow-list.
  2. Source workbook SHA-256 equals the approved value and its modified time is unchanged.
  3. No change under legacy paths; no workbook or spreadsheet staged; `.gitignore` intact.
  4. No protected file changed without an authorizing decision (decision records, source-of-truth approvals, metric definitions).
  5. Sensitive-string scan of the diff and new files (patterns from `SECURITY_AND_SENSITIVITY.md`) is clean.
  6. Re-run the key tests (at least the fast suite) and compare to the Testing Agent's numbers.
  7. Every claim in the final report maps to an artifact. Claims with no artifact are listed as unverified.
  8. No commit, push, or deploy happened without a recorded authorization (G5, G6). Compare `git log` and remote state to the base.
- **Prohibited:** editing code; waiving a failed check; summarizing failures as minor.
- **Handoff:** to the human with the full report.
- **Failure/retry:** a failed check ends the cycle with `verification-failed`; the task returns to the implementer (fix cycle) or to the human.

### 2.6 Human Approval Gates
The human developer or project owner. Gates are in section 5. The harness never treats silence as approval.

## 3. Controlled lifecycle (10 steps)

| # | Step | Owner role | Output / evidence |
|---|---|---|---|
| 1 | Read project instructions and current state | Planning | `AGENTS.md`, status docs, decisions read; HEAD sha, `git status` |
| 2 | Analyze task and dependencies | Planning | Dependencies on decisions and open questions; blocked items listed |
| 3 | Produce implementation plan | Planning | `plan.md` with allow-list, tier, evidence list |
| 4 | Check scope and approval requirements | Planning, then human | Gate list; **G1** approval for tier 1 and above |
| 5 | Execute only authorized work | Implementation | Diff within allow-list; execution log |
| 6 | Run relevant tests and quality checks | Testing | `test-report.md`, raw outputs |
| 7 | Independently review the changes | Reviewer | `review.md` |
| 8 | Collect verifiable evidence | Verification | `evidence.md`, artifact manifest |
| 9 | Report results and unresolved issues | Verification/Planning | Final report: done, not done, failed, unverified, open questions |
| 10 | Wait for human approval when required | Human | Decision recorded (accept, change, reject); commit only if authorized (**G5**) |

Stop conditions at any step: unresolved prerequisite decision, need for out-of-scope change, failed verification after 2 fix cycles, suspected sensitive-data exposure, or an unexpected state (for example, the HEAD or workbook hash differs from the plan). The agent stops and reports. It does not work around.

## 4. Task tiers

| Tier | Typical change | Required |
|---|---|---|
| T0 | Docs only, no decision change | Plan optional; self-check; sensitive scan; human review of diff |
| T1 | Code in non-gated, non-integrity areas (e.g. UI layout) | Plan, G1; tests; one reviewer; evidence |
| T2 | Ingestion, raw store, provenance, security, auth, migrations, dependencies | T1 plus design review against `docs/design/`, the manual two-session workflow (P8), local real-file check if authorized, G4 for schema. Reviewers: two independent when the task touches raw data, security or migrations; otherwise one (Q-H7 policy C) |
| T3 | Anything touching gated areas: workload formulas, eligibility, scoring, impact, KPI definitions; AI prompts or agent configs | Blocked until an approved decision exists. Then T2 plus evaluation evidence, the manual two-session workflow (P8), and two independent reviewers (Q-H7 policy C) |

The tier is proposed by the planner and can only be raised by the reviewer, never lowered after G1.

## 5. Human approval gates

| Gate | When | Authority | Notes |
|---|---|---|---|
| G1 | Plan approval (tier 1+) | Developer/owner | Confirms scope and allow-list |
| G2 | Any change to an approved business definition, metric, eligibility rule | **Project owner only** | Agents may draft proposals in a separate file; they never edit approved records |
| G3 | Add or upgrade a dependency | Developer/owner | Justification required (`AGENTS.md`) |
| G4 | Database schema, migration creation or execution, touching any database | Project owner | Backup before running migrations on data |
| G5 | Commit | Developer/owner | One explicit authorization per commit or per defined batch |
| G6 | Push, merge, release, deploy | Developer/owner | Not authorized by G5 |
| G7 | Destructive or irreversible operation (delete, reset, force, drop) | Developer/owner | Names the exact target |
| G8 | Change to a source-of-truth decision, approved hash, row classes | Project owner | New workbook hash requires re-verification first |
| G9 | Phase transition | Project owner | As in `AGENTS.md` |
| G10 | Real-source-value access by an agent | Project owner | Task-scoped; default is no access |

An approval covers the stated scope only. Changing the scope reopens the gate.

## 6. Evidence requirements

Folder per task: `.agents/tasks/<yyyy-mm-dd>-<slug>/` containing `plan.md`, `execution-log.md`, `test-report.md`, `review.md`, `evidence.md`, and raw outputs under `raw/`.

Rules (Confirmed from the owner's controls):
- No claim that tests passed without the command, exit code, and captured output.
- Failed tests and checks are reported honestly and prominently. A report with failures never begins with a success statement.
- Evidence files contain no source values. Allowed: counts, row numbers, column letters, hashes, command output that is value-free. Evidence is scanned before it is shared.
- The verification step recomputes hashes and counts instead of copying numbers from other agents.
- Evidence folders are local and git-ignored (`.agents/tasks/` is in `.gitignore`; Q-H6 approved in `0007`). A short approved summary goes into `IMPLEMENTATION_STATUS.md`.

Final report structure: outcome; changed files; checks and results (with failures first); review verdict; unverified claims; deviations from plan; open questions; what needs human approval.

## 7. Failure and retry summary

| Situation | Behavior |
|---|---|
| Test or lint fails | Reported verbatim; up to 2 fix cycles; then stop |
| Review requests changes | Counts as a fix cycle |
| Verification check fails | Task `verification-failed`; no merge/commit proposal |
| Tool or network error | One retry, disclosed; then stop |
| Agent context overflow or confusion | Stop, summarize state in `execution-log.md`, ask the human |
| Scope drift detected | Stop; the plan is amended and re-approved (G1) |
| Sensitive value detected in an artifact | Stop; remove from the working tree; report path and rule (not the value); the human decides on cleanup, and history rewrites need G7 |

## 8. Amendments to `AGENTS.md` (applied; Q-H4 approved in `0007`)

`AGENTS.md` now has a short "Development agent harness" section that points to this document and does not repeat its rules. It carries four points: the pointer (including local evidence in `.agents/tasks/`), the independence rule with the manual two-session workflow for T2 and T3, the honest-test rule (never lower test strictness without G1), and G10 for any agent access to real source values. Gate definitions exist only here.

## 9. Minimal set to set up at the start of Phase 3 (Track H1, Proposed)

1. Evidence template files and `.agents/tasks/` convention.
2. A git pre-commit hook script that blocks spreadsheet files and runs the sensitive-string scan.
3. A workspace steering file that points agents to `AGENTS.md` and this document (optional).
4. A path guard check (diff within allow-list) as a script run by the Verification role.

Each is a small script or text file; each needs G1 as part of the Phase 3 plan.

## 10. Unresolved

Q-H4, Q-H6, Q-H7 and Q-H8 are decided (`DECISIONS/0007`). Open detail, not yet defined: how a disagreement between two independent reviewers is resolved (for example when one approves and the other requests changes).
