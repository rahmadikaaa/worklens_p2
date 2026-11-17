# Testing Strategy

Status: **Proposed.**

## 1. Principles

- Correctness of data comes first: the most important tests protect provenance, idempotency, and counts.
- Tests never contain real source values. Fixtures are synthetic and structural; they are test inputs, not business data for analysis.
- Real-workbook tests run only on a machine that has the approved file, are marked `local_only`, skip cleanly when it is absent, and assert counts and hashes only.

## 2. Test layers

| Layer | Scope | Tools |
|---|---|---|
| Unit | Pure functions: mapping, type handling, row-class rules, validation rules, hash gate | pytest |
| Contract | Each foundation interface has a reusable suite that every implementation must pass; WorkLens tests run against fakes | pytest |
| Integration | Ingestion into a real PostgreSQL test database (separate database/role), migrations up/down, privileges, triggers | pytest, a disposable test DB |
| API | Endpoints, error format, auth roles, pagination, redaction, OpenAPI drift | pytest + httpx; schemathesis optional (justify if added) |
| Frontend | Components and flows | Vitest, Testing Library, Playwright for a few end-to-end flows |
| Architecture | Import boundaries (foundation never imports worklens); no source values in logs | pytest |
| Security | Secret scan, dependency audit, `.gitignore` checks | pre-commit, `pip-audit`, `npm audit` |

## 3. Synthetic fixture builder

A test helper generates small workbooks programmatically, covering: header row, normal cell, formula with cached value, array formula, shared formula, `#N/A` cell, numeric-as-text, text-in-numeric column, whitespace, blank rows and gaps, link-only row, pivot-style cells in AL:BI, extra sheet with a large declared range, a hidden sheet, and a header with one name changed. Fixtures contain placeholder strings (`row-17-col-D`), not realistic business content.

## 4. Golden manifest

A committed file holds structure facts only (no values), taken from Phase 1:

| Fact | Value |
|---|---|
| SHA-256 | `AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092` |
| Sheet count / target sheet | 21 / `Breakdown Activity` (exactly one) |
| Header count | 36 (names in approved order) |
| Data rows | 3,495 (3,489 activity-structured, 6 link-only) |
| Unreviewed rows | 252 (3239–3490) |
| Formula cells per column | A 3,489; B 3,489; C 3,449; E 3,489; L 44; M 3,080; N 3,061; O 3,080; Q 3,012; R 3,249; S 241; T 3,232; V (array) 3,237 |
| Error cells | 232 (A 5, C 5, E 48, Q 7, R 5, S 31, T 62, U 69); rows with at least one error: 108 |
| Type facts | K numeric 3,165, text 80; L numeric 3,167, text 75; X numeric 76; AD numeric 203 |
| Findings | counts per code from `ROW_CLASSIFICATION_AND_VALIDATION.md` |

The local-only test compares a fresh extraction against this manifest. Any difference fails the test, which prompts re-verification, not a manifest edit.

## 5. Critical test cases

1. Re-import of the same file creates zero new raw rows and returns the existing run.
2. Failed import (forced exception mid-run) leaves no raw data.
3. Unknown hash and changed header are refused with the right error code.
4. UPDATE and DELETE on `raw` tables are rejected for the app role and by triggers.
5. Link-only rows are kept, classified separately, and absent from activity records; row numbers preserved.
6. Unreviewed rows appear in raw and domain, flagged, and are never marked invalid.
7. Excluded range AL:BI is never written to activity records; the manifest lists it.
8. Error cells produce NULL typed fields plus `source_error_codes`; nothing replaced.
9. Mixed-type columns split to `_num`/`_text` without parsing (`30 menit` stays text).
10. Formula-origin cells are labeled `workbook_derived_cached`; formula text preserved.
11. The external link is never opened (no network/file access in a sandboxed test).
12. Logs and error messages contain no source values (assertion over captured logs).
13. A MetricRun cannot reference a non-approved definition (DB trigger and service check).
14. The import boundary test passes.

## 6. Quality gates (Proposed)

`ruff`, `mypy --strict` on foundation and WorkLens backend, `tsc --noEmit`, and ESLint pass; tests pass; coverage target 90% on ingestion, normalization, rules and integrity code (target to confirm). A single local command runs the full suite. CI hosting is open (Q-T9); until then the same command runs locally and in a pre-push hook.

## 7. Unresolved

Real-file test policy on shared machines; whether to add schemathesis or Playwright in the first slice (hackathon time).
