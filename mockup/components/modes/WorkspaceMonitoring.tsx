"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-state";
import { Card, KindBadge, MetricCard, Notice } from "../ui";
import { ActivityTable } from "../ActivityTable";
import { ErrorDistribution, InsightBlock, PendingNote, RegionTable } from "../shared";

type Section = "activity" | "summary" | "assessment" | "quality" | "automation" | "followup";

const SECTIONS: { id: Section; label: string; blurb: string }[] = [
  { id: "activity", label: "Activity rows", blurb: "Every source row: search, filter, sort, inspect" },
  { id: "summary", label: "Summary", blurb: "Verified structure of the source sheet" },
  { id: "assessment", label: "Assessment", blurb: "L1 assessment of each activity" },
  { id: "quality", label: "Quality", blurb: "Review state and data errors" },
  { id: "automation", label: "Automation", blurb: "Automation status of activities" },
  { id: "followup", label: "Follow-up", blurb: "Actions after assessment" },
];

function SourceColumns({ cols }: { cols: { col: string; header: string }[] }) {
  return (
    <table data-testid="source-columns">
      <thead><tr><th>Column</th><th>Header</th><th>Status</th></tr></thead>
      <tbody>
        {cols.map((c) => (
          <tr key={c.col}>
            <td className="mono">{c.col}</td>
            <td>{c.header}</td>
            <td className="muted">Exists in the source. Meaning not approved, so no figure is derived.</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Layout B, the primary Activity Workspace. The activity table comes first, then five approved sections, role-aware, with no invented metrics. */
export function WorkspaceMonitoring() {
  const { role, setRole, setMode } = useApp();
  const [section, setSection] = useState<Section>("activity");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const current = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0]!;

  return (
    <div className="stack" style={{ gap: 16 }} data-testid="mode-workspace">
      {section === "activity" ? null : <InsightBlock />}

      <div className="card" style={{ padding: "10px 14px" }}>
        <div className="row">
          <strong>Viewing as</strong>
          <div className="segmented" role="group" aria-label="Role preview">
            {(["L1", "Management"] as const).map((r) => (
              <button key={r} aria-pressed={role === r} onClick={() => setRole(r)} data-testid={`role-${r}`}>{r}</button>
            ))}
          </div>
          <KindBadge kind="Simulated" />
          <span className="small muted" data-testid="role-note">
            {role === "L1"
              ? "L1 can edit assessment fields in the real product. Here nothing is saved."
              : "Management sees summary and drill-down, read-only."}
          </span>
          <span className="spacer" />
          <span className="small faint">Role names and mapping are unresolved (Q-R12).</span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "210px 1fr", alignItems: "start" }}>
        <nav className="card" aria-label="Workspace sections" style={{ padding: 8 }} data-testid="section-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className="nav-item"
              style={{ color: "var(--text)", flexDirection: "column", alignItems: "flex-start", gap: 0, background: section === s.id ? "var(--accent-soft)" : "transparent" }}
              aria-current={section === s.id ? "page" : undefined}
              data-testid={`section-${s.id}`}
              onClick={() => setSection(s.id)}
            >
              <span style={{ fontWeight: 600 }}>{s.label}</span>
              <span className="small muted">{s.blurb}</span>
            </button>
          ))}
        </nav>

        <div className="stack" style={{ gap: 14 }} data-testid={`panel-${section}`}>
          <div className="row">
            <h1>{current.label}</h1>
            <span className="muted">{current.blurb}</span>
            <span className="spacer" />
            {role === "L1" && (section === "assessment" || section === "followup") ? (
              <button
                className="btn"
                data-testid="edit-simulated"
                onClick={() => setToast("Simulated: nothing was saved. Persistence is not implemented.")}
              >
                Edit {section === "assessment" ? "assessment" : "follow-up"} (simulated)
              </button>
            ) : null}
            {role === "Management" ? <span className="badge neutral" data-testid="readonly-chip">Read-only</span> : null}
          </div>

          {section === "activity" && <ActivityTable />}
          {section === "summary" && (
            <>
              <div className="grid cols-4">
                <MetricCard factId="src.total_rows" />
                <MetricCard factId="src.activity_rows" />
                <MetricCard factId="src.unreviewed_rows" />
                <MetricCard factId="src.error_rows" />
              </div>
              <RegionTable title="Relevant activity table" hint="Structural regions. Click a row to audit its count." testId="relevant-table" />
              <Card title="Not yet available" hint="Needs approved definitions">
                <div className="stack">
                  <div className="grid cols-3">
                    <MetricCard factId="wl.workload" compact />
                    <MetricCard factId="wl.saving" compact />
                    <MetricCard factId="as.completion" compact />
                  </div>
                  <PendingNote />
                </div>
              </Card>
            </>
          )}

          {section === "assessment" && (
            <>
              <div className="grid cols-3">
                <MetricCard factId="as.completion" />
                <MetricCard factId="as.categories" />
                <MetricCard factId="src.unreviewed_rows" label="Activity review status: unreviewed" />
              </div>
              <Card title="Assessment fields in the source" hint="Names only">
                <SourceColumns cols={[
                  { col: "W", header: "Improvement Category" },
                  { col: "Y", header: "Assessment Status" },
                  { col: "Z", header: "Category Notes" },
                  { col: "AD", header: "New Improvement Category Fixed" },
                ]} />
              </Card>
              <RegionTable regionIds={["reg.activity", "reg.unreviewed"]} title="Relevant activity table" hint="Activity-structured rows and the unreviewed block." testId="relevant-table" />
              <PendingNote>No assessment rule is approved, and the reviewed count needs an eligibility rule that does not exist yet (Q-S4, Q-R9, Q-R17).</PendingNote>
            </>
          )}

          {section === "quality" && (
            <>
              <div className="grid cols-4">
                <MetricCard factId="src.error_cells" />
                <MetricCard factId="src.error_rows" />
                <MetricCard factId="src.unreviewed_rows" />
                <MetricCard factId="src.link_only_rows" />
              </div>
              <div className="grid split">
                <Card title="Quality review summary" hint="Errors by source column">
                  <ErrorDistribution />
                </Card>
                <Card title="Quality review items" hint="Design only">
                  <Notice>
                    Quality Review is an MVP capability. Its items and workflow are unresolved (Q-R8, Q-R9), so this
                    mockup lists none. Use the Quality Investigation mode to examine the verified counts.
                  </Notice>
                  <div style={{ marginTop: 10 }}>
                    <button className="btn" data-testid="goto-quality" onClick={() => setMode("quality")}>Open Quality Investigation</button>
                  </div>
                </Card>
              </div>
              <RegionTable regionIds={["reg.unreviewed", "reg.linkonly", "reg.errors"]} title="Relevant activity table" testId="relevant-table" />
            </>
          )}

          {section === "automation" && (
            <>
              <div className="grid cols-3">
                <MetricCard factId="au.overview" />
                <MetricCard factId="wl.saving" />
              </div>
              <Card title="Automation fields in the source" hint="Names only">
                <SourceColumns cols={[
                  { col: "P", header: "Automation/Manual" },
                  { col: "AA", header: "Tools" },
                  { col: "AI", header: "Tools Automation" },
                ]} />
              </Card>
              <PendingNote>Whether the Automation/Manual label covers non-AO automation is unresolved (Q-R6). AI never sets categories.</PendingNote>
            </>
          )}

          {section === "followup" && (
            <>
              <div className="grid cols-3">
                <MetricCard factId="fu.overview" />
              </div>
              <Card title="Follow-up fields in the source" hint="Names only">
                <SourceColumns cols={[
                  { col: "AB", header: "Action by" },
                  { col: "AC", header: "Category Action" },
                ]} />
              </Card>
              <PendingNote>The follow-up data model is deferred. Follow-up Management is an MVP capability with no design yet (Q-R18).</PendingNote>
            </>
          )}
        </div>
      </div>
      {toast ? <div className="toast" role="status" data-testid="toast">{toast}</div> : null}
    </div>
  );
}
