# Security and Data Sensitivity Design

Status: sensitivity rules from Q-S6 are **Confirmed**. Everything else is **Proposed**.

## 1. Data classification

| Class | Examples | Rules |
|---|---|---|
| Internal-sensitive | The workbook, raw and domain tables, activity names, app names, links, notes | Local or approved storage only; not in git, logs, test fixtures, public docs, or external AI calls without approval |
| Internal-metadata | Hashes, row numbers, column letters, counts, run ids, finding codes | May appear in logs, docs, audit events, and tickets |
| Public | Architecture docs without source values, code | Normal repository handling |

## 2. Controls

| Area | Control |
|---|---|
| Repository | `.gitignore` excludes spreadsheets, CSV, `data/`, `source/`, `uploads/`, `.env`. A pre-commit check blocks staged files with those extensions and scans staged text for known workbook identifiers such as file paths and link host names. Repo stays private until the owner decides otherwise |
| Source file | Configured path (`WORKLENS_SOURCE_FILE`); per `0007` (GT-4) the file stays in place (git-ignored, in the repo root) and is never moved, copied or uploaded; read-only open; hash verified before any read; unknown hash refused |
| Secrets | Environment variables or local secret store; `.env.example` has keys only; no secrets in logs or images |
| Logging | Structured JSON; a redaction filter drops fields named like values; allow-list approach (row, column, count, code). Exceptions are wrapped so messages carry no cell values |
| Database | Separate owner and app roles; app role no UPDATE/DELETE on `raw`; TLS if the DB is remote; backups encrypted and kept local |
| API | Source-value endpoints require `inspector` role; default responses are metadata/counts; rate limiting and request size limits; CORS restricted to the frontend origin; no endpoint accepts file paths |
| Frontend | Source values shown only in inspection views; no values in URLs or client logs; strict CSP; no third-party analytics |
| AI | No source values sent to external providers without approval (Q-T2). Redaction hook is mandatory. A local or offline mode is proposed for development. Outputs stored with request hash and flagged as AI-generated |
| Dependencies | Pinned versions with lockfiles; justified additions; periodic vulnerability audit (`pip-audit`, `npm audit`) |
| Tests | Synthetic fixtures only; real-file tests are local-only and never commit extracted values |
| Audit | Imports, approvals, forced re-runs, and role actions are logged as audit events |

## 3. Threats considered (Proposed)

| Threat | Mitigation |
|---|---|
| Workbook committed to git | `.gitignore`, pre-commit check, repository stays private |
| Source values in logs or error messages | Redaction filter, allow-list logging, tests that assert absence |
| Arbitrary file read via API | Path from configuration only; no path input |
| Tampered or swapped workbook | Hash gate; header guard; reconciliation against golden manifest |
| Silent change of raw data | Role privileges, triggers, row hashes |
| Source values leaking to an AI provider | Redaction, approval gate, provider config off by default |
| Prompt injection from cell text (future AI) | Treat cell text as data; AI outputs are advisory and reviewed |
| SQL injection | Parameterized queries via SQLAlchemy; no string-built SQL |
| Stale cache mistaken for fact | `workbook_derived_cached` label, stale-cache finding per run |
| Excessive local exposure (server on all interfaces) | Bind to localhost by default |

## 4. Hosting implications

Hosting is open. Any non-local option moves internal-sensitive data off the machine and needs owner approval of data residency, access control, and backups (see `0005`). Local-only operation needs none of these approvals.

## 5. Unresolved

Q-T7 users and authentication; Q-T2 AI egress; Q-T9 hosting; whether the repo may ever become public (current rule: no source data, private by default).
