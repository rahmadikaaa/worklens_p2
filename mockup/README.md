# WorkLens dashboard mockup

UI mockup only. One application with three dashboard modes. It shows verified Phase 1 structural counts and marks every unapproved metric as pending. It does not open the workbook, call a network, or save data. See `docs/DECISIONS/0008-dashboard-mockup.md`.

Modes: **A Audit-first**, **B Activity Workspace** (primary, opens by default; lists every source row), **C Quality Investigation**. Capability labels: **Demo** works on verified counts, **Simulated** is faked in the browser, **Future** is not built or approved.

## Run locally

Requires Node 24 and npm 11.

```powershell
cd mockup
npm install
npm run dev        # http://localhost:3100  (open /?mode=workspace or /?mode=quality directly)
```

Static build and preview (what the e2e tests use):

```powershell
npm run build
npm run serve      # http://127.0.0.1:3100, loopback only
```

## Checks

```powershell
npm run typecheck
npm test           # Vitest: facts, guards (no network, no workbook access), labels
npx playwright install chromium   # once
npm run build
npm run e2e        # Playwright; also writes screenshots/
```

## Layout

- `lib/facts.ts`: the single typed data module (id, label, value, unit, source document, status).
- `lib/rows.ts`: structural records for all 3,495 data rows, derived from verified row ranges. No cell values.
- `components/ActivityTable.tsx`: Layout B activity table with search, filters, sorting and row inspector.
- `lib/capabilities.ts`: the seven capabilities and their labels.
- `components/modes/`: the three layouts. They contain no count literals.
- `components/AuditDrawer.tsx`: shared Click-to-Audit.
- `components/views/`: compare, sources, sharing, routines.
