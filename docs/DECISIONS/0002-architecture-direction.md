# 0002 — Architecture direction

Status: **Confirmed** (mission brief). Detail in `docs/ARCHITECTURE.md` is **Proposed**.

## Decision

- Shared Modular Foundation with 10 modules; 4 WorkLens-specific modules.
- Shared modules are reusable only; WorkLens logic stays in WorkLens.
- No generic framework beyond actual requirements. Standardized interfaces and clear boundaries.
- WorkLens can consume a future shared foundation. AutoRunner V2 is not implemented.
- AI via the provider-independent AI Provider Adapter; AI never replaces deterministic rules.
- Workload Calculation Engine is gated on approved definitions (see `AGENTS.md`).
