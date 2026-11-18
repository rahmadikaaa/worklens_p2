# 0008 — Dashboard UI mockup

Status: **Proposed**, recorded with the mockup delivery. Needs the owner's confirmation of the points under "Owner confirmation". Documentation of a design artifact only: it does not start Phase 3 or Phase 10.

## Decision recorded

- A UI mockup lives in `mockup/`. It is a design artifact for review, not the Monitoring Dashboard build (Phase 10, GT-11) and not production code.
- It uses the GT-1 frontend stack: Next.js, React, TypeScript, Vitest, Playwright. No other dependency was added (`0007` GT-1, `AGENTS.md`).
- Version pins are exact and local to `mockup/package.json`. They do not decide GT-6.
- Tier T1 (UI layout, no gated area). G1 and G3 are taken from the owner's mockup brief. G5 (commit) is not given: nothing was committed.

## Boundaries kept

- No backend, API, database, authentication or network call. Static export, loopback preview server.
- The workbook was not opened. Only counts already recorded in repository documents are shown (`SOURCE_OF_TRUTH`, `PHASE1_ACCEPTANCE_REPORT`, `0005`, `PHASE2_PROPOSAL`).
- Workload, workload saving and other business metrics carry no value and show "Pending approval". No definition was approved.
- Illustrative SQL is labeled "Proposed — Not Executed". Table names follow `DATABASE_SCHEMA_PROPOSAL.md`.
- Six MVP capabilities, the locked 10+4 module architecture and the phase order are unchanged.
- The existing untracked `worklens/frontend/` folder was not used, modified or copied.

## Conflicts shown in the mockup, not resolved

| Reference feature | Conflict | Treatment |
|---|---|---|
| Warehouse connectors, CSV/JSON upload | GT-4: configured local path only, no upload | Future, disabled |
| Internal database | GT-2: provisioning not authorized | Future |
| Scheduled routines, AI insight | Phase 9, Q-T2, GT-13 | Future, static text |
| Team sharing, snapshots | GT-14 hosting, GT-3 localhost, Q-R12 roles | Simulated |
| Comments on the canvas | Q-R11 Management comments undecided | Simulated, browser-only |

## Owner confirmation needed

1. That building this mockup before Phase 3 is acceptable, and that `mockup/` may stay in the repository.
2. That the row-composition bar showing 3,237 (3,489 − 252) is acceptable as labeled arithmetic, or should be removed.
3. Review of the three modes. No production implementation starts without explicit approval.

## Amendment: Activity Workspace as primary view (Proposed)
Direction approved by the owner in the task brief. Recorded here; not a new roadmap phase.
- Layout B, renamed **Activity Workspace**, is the primary experience and opens by default. Its first section, "Activity rows", shows every source data row (3,495 = 3,489 activity-structured + 6 link-only). Nothing is truncated or paged out. Existing sections (Summary, Assessment, Quality, Automation, Follow-up) follow it, unchanged.
- The table supports search (row number, class, state), filters (row class, review state), sorting (source row, class, review state), and a row inspector showing workbook, SHA-256, sheet, source row, row identity, class, review state, region range and the source document the rule comes from.
- Layouts A (Audit-first) and C (Quality Investigation) are unchanged. Compare modes still serves as the Layout Reference. The seven capabilities are unchanged.
- Reused: Card, Notice, the shared Click-to-Audit drawer (count audit from the inspector), `WORKBOOK` and the verified facts. No component was duplicated and Layout C was not moved.
- **Data limit, stated plainly.** The mockup holds no cell values (workbook not opened; gate G10 not given). Rows are therefore structural records derived by `mockup/lib/rows.ts` from verified row ranges (2–3490 activity, 3239–3490 unreviewed, link-only 3526, 3535, 3537–3540). They carry identity and provenance only. A unit test fails if the derived rows disagree with the verified counts. Error rows (108) cannot be flagged per row, because their row numbers are not recorded. Activity names, categories, status and other business fields are not shown.
- Row class and review state are the proposed Phase 3 rules (Q-S3, Q-S4), shown as such. "Outside unreviewed block" is not a reviewed state; no reviewed count exists.
- No dependency added. No backend, network, database or workbook access. Not committed.
- **Implemented in this pass (Proposed, not committed).** `mockup/lib/rows.ts` and `mockup/components/ActivityTable.tsx` were referenced by this amendment but absent from the working tree; both are now written. The "Activity rows" panel opens with four compact metric cards (total, activity, link-only, unreviewed; each opens the audit drawer), then the table (all 3,495 rows, scrollable in place), the inspector, and a note that error rows cannot be flagged per row. The default mode is Layout B, so the e2e test "render and switch" now starts there. Layout C components were not reused: the Quality section already holds the quality cards.
### Owner decision needed
1. Show real cell values in the workspace (requires gate G10 and an approved source of values), or keep the structural view for the mockup.
