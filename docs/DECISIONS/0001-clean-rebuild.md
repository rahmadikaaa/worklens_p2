# 0001 — Clean rebuild, legacy rejected

Status: **Confirmed** (mission brief)

## Decision

WorkLens is rebuilt from scratch. The previous implementation is legacy.

## Rejected legacy elements

- Backend and frontend code.
- Database schemas and migrations.
- Ingestion pipelines.
- Workload calculation logic and derived metrics (including any `Duration × Event Per Month` result).
- Assumptions from the old `Daily Activity` sheet.
- Automatic import of legacy calculation results.

## Allowed

Reading legacy repositories and documents as reference for requirements and history only. They are never modified. Reuse requires a new decision record.

Legacy locations noted (not examined in this phase): `Documents\worklens`, `Documents\dashboard ao`, `Documents\workload_enrichment`, `Documents\p2_worklens`.
