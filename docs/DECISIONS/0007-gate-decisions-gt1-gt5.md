# 0007 — Gate decisions GT-1 to GT-5

Recorded: 2026-11-17. Status: **Confirmed by the project owner**, with one condition on GT-2 (below). Documentation only: no database was created or touched, no data was imported, no code was written, and Phase 3 has not started.

## Basis of this record

The owner instructed that the approved GT-1 to GT-5 decisions be recorded, following the decision sheet that listed options and a recommendation for each gate. The owner's instruction did not restate individual choices, so **each decision below is the recommended option from that sheet**. Any choice the owner intended differently must be corrected in this record. Option sources: `0005`, `0006`, the design proposals, and (where marked) the earlier review.

## Summary

| Gate | Decision | State |
|---|---|---|
| GT-1 | Adopt stack Option A (`0005`) with the listed libraries | **Approved** |
| GT-2 | Dedicated databases and roles on the existing local PostgreSQL 17 service | **Approved in principle; provisioning not authorized; exposure finding to be reviewed** |
| GT-3 | Localhost, per-role bearer tokens, capability checks | **Approved** |
| GT-4 | AL:BI manifest-only; configured local path; file stays in place | **Approved** |
| GT-5 | Development harness: P8 (revised), P9, P10, P12, P13; Q-H4 (a), Q-H6 (a), Q-H7 (c), Q-H8 (a) | **Approved**; follow-up edits pending (section GT-5) |

## GT-1 — Technology stack (Q-T1)

- **Adopted:** Option A of `0005`: Python 3.12, FastAPI, Next.js, React, TypeScript, PostgreSQL.
- **Libraries:** the list in `0005` (SQLAlchemy 2 with Alembic, psycopg 3, Pydantic v2, openpyxl, pytest and pytest-cov, ruff, mypy, Uvicorn, and the frontend tooling) is approved as the written justification required by `AGENTS.md`. Any dependency not on that list still needs approval (G3).
- **Sub-choices left open in `0005`:** structured logging uses the standard-library JSON formatter (no structlog). The import-boundary check is a pytest test (no `import-linter`).
- **Not decided here:** hosting (GT-14); version pins (GT-6, decided in the Phase 3 plan).
- **Conditions kept from `0005`:** the first slice is backend-only; no frontend work in Phase 3. The server-rendered fallback (Option B) for the UI remains available without changing the API or database design.

## GT-2 — Database provisioning (Q-T8)

- **Approved in principle:** Option 1, dedicated databases and roles on the existing local PostgreSQL 17 service. Scope when later authorized: databases `worklens_dev` and `worklens_test`; roles `worklens_owner` and `worklens_app`; no instance-level configuration changes; a backup before any migration run on a database holding imported data; the administrative credential supplied by the owner through environment configuration, never stored in the repo. The database names are proposals from the decision sheet; the role names come from `DATABASE_SCHEMA_PROPOSAL.md`.
- **Not authorized:** creating any database, role or object. That needs a separate, explicit owner go-ahead (G4). The existing service has not been connected to.
- **Condition:** the owner reviews the exposure finding below before authorizing provisioning.

### Exposure finding (Verified read-only, 2026-11-17; no connection, no configuration change)

| Check | Result |
|---|---|
| Service | `postgresql-x64-17`, running, automatic start, account NetworkService |
| Data directory | `C:\Program Files\PostgreSQL\17\data` (not in OneDrive) |
| Socket binding | `listen_addresses = '*'`, port 5432. Listening on `0.0.0.0` and `::` (all interfaces, IPv4 and IPv6) |
| Overrides | `postgresql.auto.conf` has no settings; the service command line sets only the data directory |
| `pg_hba.conf` (active rules) | Only `local` and `host` rules for `127.0.0.1/32` and `::1/128`, method `scram-sha-256`, including replication. **No rule for any non-loopback address**, so a non-loopback client has no matching entry and is refused |
| Windows Firewall | Enabled on Domain, Private and Public profiles; default inbound action "not configured" (Windows default blocks unsolicited inbound traffic). Of 371 inbound rules, none mention PostgreSQL or port 5432, and none is a broad allow-all rule |

**Conclusion: effectively local-only, but not local-only at the socket.** Remote access is blocked by two independent layers (`pg_hba.conf` and the firewall), and neither was changed. The listener itself is bound to all interfaces. This is **not confirmed local-only** in the strict sense, because protection depends on those two layers staying as they are.

Not verified: reachability from another host (no remote test was made); virtual adapters; third-party firewall or security software; group policy that could change rules; whether the running server's settings differ from the files (no connection was made). Any later edit to `pg_hba.conf` or a firewall rule would silently expose the instance.

**Owner choice before provisioning (open):** (a) accept the current state as sufficient, relying on the two layers; (b) have `listen_addresses` restricted to loopback first (an instance change that requires the owner's explicit approval and was not made here). Until chosen, provisioning stays unauthorized.

## GT-3 — Minimal authentication (Q-T7)

- **Approved for Phase 3:** the API binds to localhost; requests carry a bearer token; access is checked as capabilities (`ARCHITECTURE.md` §6).
- **Token model:** one token per role (the decision sheet's interpretation (i)), so capability denials can be tested. Tokens come from environment configuration, never from the repo, and are compared in constant time. `/health` is unauthenticated and returns no data.
- **Phase 3 capabilities:** `source.import`, `source.inspect_meta`, `activity.read_detail`. Role names (`viewer`, `inspector`, `admin`) stay provisional and are configuration.
- **Not decided:** the mapping of L1 and Management to roles (Q-R12); per-user identities needed to attribute L1 edits; transport security for any non-local run (GT-14).

## GT-4 — AL:BI and source delivery (Q-D1, Q-D2)

- **Q-D1:** manifest-only. Each import run records the excluded range, the populated-cell count and a region hash. The AL:BI cells are not stored in `raw`. The workbook keeps them.
- **Q-D2:** the source is read from a configured local path (`WORKLENS_SOURCE_FILE`). No endpoint accepts a path or an upload. A new workbook version enters through configuration and re-verification (Q-S1).
- **File location:** the workbook stays where it is (the repo root, git-ignored). It is not moved, renamed or copied. The "outside the repo" wording in earlier documents is superseded by this decision; those documents were updated to point here (`RAW_DATA_AND_PROVENANCE.md`, `SECURITY_AND_SENSITIVITY.md`, `API_CONTRACT_PROPOSAL.md`).
- **Residual risk accepted:** the file sits inside a OneDrive-synced folder, and a forced `git add -f` would bypass `.gitignore`. The pre-commit guard (GT-5) covers the second.

## GT-5 — Development Agent Harness (`0006`, Q-H4, Q-H6, Q-H7, Q-H8)

| Item | Decision |
|---|---|
| P8 | Approved **as revised**: roles map to the Kiro workflow agents, and the independence rule keeps a **manual minimum** for work not run through a workflow (implementation, and review with testing and verification, in separate sessions). Requesting a workflow for T2+ work stays the owner's option; changing the "launch when asked" setting stays the owner's choice |
| P9 | Approved: tiers T0–T3 and gates G1–G10 |
| P10 | Approved: per-task evidence bundles in `.agents/tasks/`; per-tier requirements as in the harness document |
| P12 | Approved: Track H order (H1 at Phase 3 start, H2 after Phase 4, H3 after Phase 9) |
| P13 | Approved: audit events carry `actor_type` and `task_id` (already in `DATABASE_SCHEMA_PROPOSAL.md`) |
| Q-H4 | Option (a): amend `AGENTS.md`, written as a short section that points to `DEVELOPMENT_AGENT_HARNESS.md` so gate text exists once. It covers the evidence pointer, gate numbers and the independence rule, the honest-test rule (no lowering of test strictness without G1), and G10 for real-source-value access |
| Q-H6 | Option (a): evidence stays local and git-ignored; approved summaries go into `IMPLEMENTATION_STATUS.md` |
| Q-H7 | Option (c): one reviewer by default; two reviewers on different models for T3 and for T2 work that touches raw data, security or migrations |
| Q-H8 | Option (a): git hooks enforce; Kiro hooks advise; the Verifier re-checks the same conditions because `--no-verify` bypasses git hooks |

**Pending follow-up edits (not made in this step; they need your go-ahead):**
1. Amend `AGENTS.md` per Q-H4 (it loads into every session, so it takes effect immediately).
2. Add `.agents/tasks/` to `.gitignore` (Q-H6).
3. Update `DEVELOPMENT_AGENT_HARNESS.md` for the P8 manual minimum and the Q-H7 option (c).
4. Create the H1 items (evidence template, pre-commit guard, path guard) inside the Phase 3 plan, under G1, including where the tracked hook scripts live.

## Unchanged by this record

Hybrid Orchestrator and runtime harness decisions (Q-H1 to Q-H3, Q-H5, Q-H9, Q-H10); Q-S1 to Q-S6; the locked 10 + 4 modules; the calculation gate; business definitions Q-B1 to Q-B12; Q-R1 to Q-R25; GT-6 to GT-14.

## Remaining before Phase 3 can start

1. **GT-2:** the owner's choice on the exposure finding, then an explicit go-ahead to provision. Without it the raw store and integration tests cannot run.
2. **GT-6:** version pins, decided inside the Phase 3 plan.
3. The Phase 3 plan itself and the owner's explicit approval to start Phase 3 (`AGENTS.md`: starting a new roadmap phase).
4. The pending follow-up edits above, which should be applied at or before the start of Phase 3 so they govern its work.
