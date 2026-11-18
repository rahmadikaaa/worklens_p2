# 0005 — Technology stack

Status: stack candidates **Confirmed as design baseline** by the owner. **Adoption approved on 2026-11-17 (`0007`, GT-1):** Option A, the library list below, stdlib JSON logging and a pytest-based import-boundary check. Hosting is **Unresolved**. Version pins are decided in the Phase 3 plan (GT-6). No implementation is authorized until Phase 3 is approved. The evaluation text below is unchanged.

## Baseline candidates (owner-approved for evaluation)

Python 3.12, FastAPI, Next.js, React, TypeScript, PostgreSQL.

## Evaluation

Ratings are a judgment against each criterion: **Strong**, **Adequate**, **Risk**.

| Criterion | Assessment | Basis |
|---|---|---|
| Modular architecture | Strong | Python packages give clean boundaries for the shared foundation vs. WorkLens modules; FastAPI dependency injection suits explicit contracts. Boundaries need an automated import check, since Python does not enforce them. |
| Maintainability | Strong | Typed Python (mypy strict) plus Pydantic v2 models and TypeScript strict mode give typed contracts at both ends. Two languages add cost. |
| Data integrity | Strong | PostgreSQL gives constraints, transactions, schema separation, role-level privileges, and triggers to block UPDATE/DELETE on raw tables. |
| Excel ingestion and formula preservation | Strong (verified by spike) | See below. |
| Automated testing | Strong | pytest for backend, Vitest and Playwright for frontend, OpenAPI-driven contract tests. |
| Local reproducibility | Adequate, with a gap | Node 24.18, npm 11, Python 3.12.10, and Git are installed locally. Docker is not installed. A PostgreSQL 17 Windows service is running locally; it was not accessed. A reproducible DB setup needs an owner decision (Q-T8). |
| Hackathon MVP delivery | Adequate | Two runtimes plus a database raise setup and integration cost. Mitigation: a thin first vertical slice (ingest, inspect) before analytics. A Next.js UI is the largest schedule risk. |

### Spike result: Excel reading with openpyxl (Verified)

A throwaway spike ran in a temporary virtual environment outside the repo, read-only, against the approved workbook. No code was kept in the repo. openpyxl 3.1.5, `read_only=True`, `keep_links=False`:

- Opens the 43.7 MB workbook in about 0.3 s. Reading the target sheet's 36 columns took about 1.3 s for formulas and 1.6 s for cached values. Only the `Breakdown Activity` sheet was read; the 1M-row `All SOP` sheet was untouched.
- Two passes (`data_only=False` for formula text, `data_only=True` for cached values) reproduce the Phase 1 counts exactly: 3,496 non-empty rows including header, last row 3540, the 6 link-only rows, formula cells per column (A 3,489; B 3,489; C 3,449; E 3,489; L 44; M 3,080; N 3,061; O 3,080; Q 3,012; R 3,249; S 241; T 3,232), 3,237 array formulas in column V, 232 error cells by column (A 5, C 5, E 48, Q 7, R 5, S 31, T 62, U 69), and K/L numeric counts (3,165 and 3,167).
- Error cells are exposed with cell type `e`, so `#N/A` stays distinguishable from text.

**Limits (Verified or known):**
1. Shared formulas: dependents are returned as translated formula text, so the `shared` origin flag from the XML is not visible. Array formulas are visible as a distinct type. If shared-vs-individual metadata is needed, a small direct XML read is required. Proposed: not needed for v1; record `formula_kind` as `normal | array`, and note shared formulas as an expanded form.
2. Numbers are returned as Python floats, not the original XML text. Round-trip of the shortest float representation is exact for IEEE doubles, but the literal original string is not retained.
3. Cached values depend on how Excel last saved the file (stale-cache conditions in `SOURCE_OF_TRUTH.md` section 7). The library cannot detect staleness.
4. The external link is not followed (`keep_links=False`), as required by Q-S2.

**Verdict:** openpyxl meets v1 ingestion needs. Add a contract test that cross-checks it against the verified Phase 1 manifest. A direct XML reader stays an escape hatch if limit 1 or 2 turns out to matter.

## Alternatives considered

| Option | Result |
|---|---|
| A. FastAPI + Next.js/React/TS + PostgreSQL (baseline) | **Recommended**, conditional on the mitigations below |
| B. FastAPI + server-rendered templates (Jinja/HTMX) + PostgreSQL | Lower setup cost and one runtime. Weaker fit for the interactive analytics UI expected later. Fallback if time runs short |
| C. Django full-stack + PostgreSQL | Mature admin and migrations. Heavier framework, less natural for the module-contract style. Not preferred |
| D. SQLite instead of PostgreSQL | Simplest local setup. Weaker role-level immutability, schemas, and concurrency. Not recommended for the integrity requirements |

## Proposed supporting libraries (each needs a justification; none installed)

| Library | Purpose | Justification |
|---|---|---|
| SQLAlchemy 2.x + Alembic | ORM/Core and migrations | Migration discipline requirement |
| psycopg 3 | PostgreSQL driver | Standard for SQLAlchemy 2 |
| Pydantic v2 | Schema validation | Bundled with FastAPI; typed contracts |
| openpyxl | Excel reading | Verified by spike |
| pytest, pytest-cov | Testing | Standard |
| ruff, mypy | Lint and strict typing | Engineering standards |
| structlog (or stdlib logging with JSON formatter) | Structured logging | Choose one at implementation; prefer stdlib to avoid a dependency |
| Uvicorn | ASGI server | FastAPI runtime |
| Node: Next.js, React, TypeScript, Vitest, Playwright, an OpenAPI type generator | Frontend | Owner-approved stack; generator keeps types in sync with the API |

An import-boundary check (a pytest test scanning imports, or `import-linter`) is proposed to enforce that shared modules never import WorkLens code.

## Conditions and mitigations

1. Pin Python 3.12 and dependency versions; provide one documented bootstrap.
2. Choose the database provisioning approach (Q-T8) before Phase 3.
3. Build the first vertical slice as backend-only (ingest and inspect) with API docs, then a thin UI.
4. If the schedule slips, fall back to option B for the UI. The API and database design do not change.

## Hosting (Unresolved, not selected)

| Option | Pros | Cons / risks |
|---|---|---|
| Local only (developer machine) | Zero exposure of sensitive data; cheapest; fits a demo | Not shareable; demo depends on one machine |
| Internal server or private VM | Keeps data inside the organization; shareable | Needs access, operations, and approval |
| Public cloud (container or PaaS) | Fast to share; managed Postgres | Sensitive operational data leaves the local environment; needs data-handling approval (Q-S6) |
| Frontend on a public host plus private API | Easy UI deployment | Splits trust; API still needs private data access; CORS and auth complexity |

Recommendation for planning only: develop and demo locally. Decide hosting after the owner states data-residency rules and the demo format (Q-T9).
