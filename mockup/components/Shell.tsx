"use client";

import { MODES, useApp, type View } from "@/lib/app-state";
import { CAPABILITIES } from "@/lib/capabilities";
import { AuditDrawer } from "./AuditDrawer";
import { ConsentModal, RefreshStatus } from "./ConsentModal";
import { AuditFirst } from "./modes/AuditFirst";
import { QualityInvestigation } from "./modes/QualityInvestigation";
import { WorkspaceMonitoring } from "./modes/WorkspaceMonitoring";
import { Compare } from "./views/Compare";
import { Routines } from "./views/Routines";
import { Share } from "./views/Share";
import { Sources } from "./views/Sources";
import { Card, KindBadge, Legend } from "./ui";

const NAV: { view: View; label: string; capId?: string }[] = [
  { view: "dashboard", label: "Dashboard" },
  { view: "compare", label: "Compare modes", capId: "cap.canvas" },
  { view: "sources", label: "Data sources", capId: "cap.storage" },
  { view: "share", label: "Sharing", capId: "cap.share" },
  { view: "routines", label: "Routines", capId: "cap.routines" },
];

const TITLES: Record<View, string> = {
  dashboard: "Dashboard",
  compare: "Compare dashboard modes",
  sources: "Data sources",
  share: "Sharing and snapshots",
  routines: "Scheduled routines",
};

function CapabilityOverview() {
  const { setView } = useApp();
  return (
    <Card title="Capabilities in this mockup" hint="Seven capabilities, each labeled Demo, Simulated or Future" testId="capability-overview">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Capability</th><th>Label</th><th>Mockup behavior</th><th>Does not do</th><th>Gates</th><th /></tr></thead>
          <tbody>
            {CAPABILITIES.map((c) => (
              <tr key={c.id} data-testid={`cap-${c.id}`}>
                <td><strong>{c.name}</strong></td>
                <td><KindBadge kind={c.kind} /></td>
                <td>{c.behavior}</td>
                <td className="muted">{c.limits}</td>
                <td className="muted">{c.gates}</td>
                <td><button className="btn small" onClick={() => setView(c.view)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function Shell() {
  const { mode, setMode, view, setView } = useApp();
  const current = MODES.find((m) => m.id === mode) ?? MODES[0]!;

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="WorkLens navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">W</div>
          <div>
            <div className="brand-name">WorkLens</div>
            <div className="brand-sub">Workforce &amp; Automation Intelligence</div>
          </div>
        </div>
        <div className="nav-label">Workspace</div>
        {NAV.map((n) => {
          const cap = CAPABILITIES.find((c) => c.id === n.capId);
          return (
            <button
              key={n.view}
              className="nav-item"
              aria-current={view === n.view ? "page" : undefined}
              data-testid={`nav-${n.view}`}
              onClick={() => setView(n.view)}
            >
              <span>{n.label}</span>
              {cap ? <KindBadge kind={cap.kind} /> : null}
            </button>
          );
        })}
        <div className="sidebar-foot">
          Mockup build. Source: <span className="mono">SOP L1 AGIT.xlsx</span> (not opened). Phase 3 has not started.
        </div>
      </aside>

      <div className="main">
        <div className="banner" role="note" data-testid="mockup-banner">
          <strong>MOCKUP</strong>
          <span>Verified Phase 1 structural counts only. No backend, no network, no workbook access. Nothing is saved.</span>
        </div>
        <header className="header">
          <div className="title">
            <h1 data-testid="page-title">{view === "dashboard" ? current.label : TITLES[view]}</h1>
            <span className="subtitle">
              {view === "dashboard" ? current.purpose : "Part of the same WorkLens application"}
            </span>
          </div>
          {view === "dashboard" ? (
            <div className="segmented" role="group" aria-label="Dashboard mode" data-testid="mode-selector">
              {MODES.map((m) => (
                <button key={m.id} aria-pressed={mode === m.id} onClick={() => setMode(m.id)} data-testid={`mode-${m.id}-btn`}>
                  <span className="letter">{m.short}</span>
                  {m.label}
                </button>
              ))}
            </div>
          ) : null}
          <RefreshStatus />
        </header>

        <main className="content" data-testid="content" data-mode={mode} data-view={view}>
          <Legend />
          {view === "dashboard" ? (
            <>
              {mode === "audit" ? <AuditFirst /> : null}
              {mode === "workspace" ? <WorkspaceMonitoring /> : null}
              {mode === "quality" ? <QualityInvestigation /> : null}
              <CapabilityOverview />
            </>
          ) : null}
          {view === "compare" ? <Compare /> : null}
          {view === "sources" ? <Sources /> : null}
          {view === "share" ? <Share /> : null}
          {view === "routines" ? <Routines /> : null}
        </main>
      </div>

      <AuditDrawer />
      <ConsentModal />
    </div>
  );
}
