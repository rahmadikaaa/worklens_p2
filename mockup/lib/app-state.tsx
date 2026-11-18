"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type Mode = "audit" | "workspace" | "quality";
export type View = "dashboard" | "compare" | "sources" | "share" | "routines";
export type Consent = "pending" | "granted" | "denied";
export type Role = "L1" | "Management";
export type RefreshState = { status: "idle" | "running" | "done"; step: number; lastAt: string | null };

export const MODES: { id: Mode; label: string; short: string; purpose: string }[] = [
  { id: "audit", label: "Audit-first", short: "A", purpose: "Data transparency and provenance" },
  { id: "workspace", label: "Activity Workspace", short: "B", purpose: "Explore every activity row, with assessment and monitoring sections" },
  { id: "quality", label: "Quality Investigation", short: "C", purpose: "Data quality and structural issues" },
];

export const REFRESH_STEPS = [
  "Check configured source path (simulated, no file is opened)",
  "Verify workbook SHA-256 against the approved hash (simulated)",
  "Check header: 36 columns A–AJ (simulated)",
  "Reconcile counts with the Phase 1 manifest (simulated)",
];

interface AppState {
  mode: Mode;
  setMode: (m: Mode) => void;
  view: View;
  setView: (v: View) => void;
  role: Role;
  setRole: (r: Role) => void;
  auditId: string | null;
  openAudit: (factId: string) => void;
  closeAudit: () => void;
  consent: Consent;
  setConsent: (c: Consent) => void;
  refresh: RefreshState;
  startRefresh: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("workspace");
  const [view, setView] = useState<View>("dashboard");
  const [role, setRole] = useState<Role>("L1");
  const [auditId, setAuditId] = useState<string | null>(null);
  const [consent, setConsent] = useState<Consent>("pending");
  const [refresh, setRefresh] = useState<RefreshState>({ status: "idle", step: 0, lastAt: null });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read ?mode= once so each mode can be opened directly (used for review and screenshots).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const m = p.get("mode");
    if (m === "audit" || m === "workspace" || m === "quality") setModeState(m);
    const v = p.get("view");
    if (v === "dashboard" || v === "compare" || v === "sources" || v === "share" || v === "routines") setView(v);
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    setAuditId(null);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", m);
    window.history.replaceState(null, "", url);
  }, []);

  const startRefresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setRefresh((r) => ({ ...r, status: "running", step: 0 }));
    const tick = (step: number) => {
      timer.current = setTimeout(() => {
        if (step >= REFRESH_STEPS.length) {
          setRefresh({ status: "done", step: REFRESH_STEPS.length, lastAt: new Date().toLocaleTimeString("en-GB") });
          return;
        }
        setRefresh((r) => ({ ...r, status: "running", step: step + 1 }));
        tick(step + 1);
      }, 450);
    };
    tick(0);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo<AppState>(
    () => ({
      mode,
      setMode,
      view,
      setView,
      role,
      setRole,
      auditId,
      openAudit: setAuditId,
      closeAudit: () => setAuditId(null),
      consent,
      setConsent,
      refresh,
      startRefresh,
    }),
    [mode, setMode, view, role, auditId, consent, refresh, startRefresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
