"use client";

import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import RecordDrawer, { KindBadge } from "./RecordDrawer";
import { Card, Donut, Legend, StackedBars, type Series } from "./Charts";
import { ACTIVITIES } from "@/lib/mockData";
import {
  DEFAULT_FILTERS,
  applyFilters,
  automationOverview,
  categoryDistribution,
  followUpSummary,
  kpis,
  pct,
  progressByDivision,
  qualitySummary,
  recentActivity,
} from "@/lib/aggregate";
import type { Activity, Filters } from "@/lib/types";

const PROGRESS_SERIES: Series[] = [
  { key: "doneClean", label: "Marked Done, no open findings", color: "#0f766e" },
  { key: "doneOpen", label: "Marked Done, open findings", color: "#d97706" },
  { key: "notDone", label: "Not marked Done", color: "#94a3b8" },
  { key: "unreviewed", label: "Unreviewed row class", color: "#cbd5e1" },
];

const NOTE_SERIES: Series[] = [
  { key: "Already Automation", label: "Already Automation", color: "#0f766e" },
  { key: "To Be Automated", label: "To Be Automated", color: "#2563eb" },
  { key: "Not Yet Solution", label: "Not Yet Solution", color: "#d97706" },
  { key: "Not Possible Automate", label: "Not Possible Automate", color: "#7c3aed" },
  { key: "Dismantled", label: "Dismantled", color: "#be185d" },
  { key: "Notes blank", label: "Notes blank", color: "#cbd5e1" },
  { key: "Blank", label: "Category blank", color: "#e2e8f0" },
];

const OPEN_DONE: Series[] = [
  { key: "open", label: "Open", color: "#d97706" },
  { key: "closed", label: "Dispositioned / closed", color: "#0f766e" },
];

function fmtWhen(iso: string) {
  return `${iso.slice(5, 10).replace("-", "/")} ${iso.slice(11, 16)}`;
}

function Kpi({ label, value, hint, tone = "" }: { label: string; value: string; hint: string; tone?: string }) {
  return (
    <div className={`kpi ${tone}`}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      <p className="kpi-hint">{hint}</p>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [navOpen, setNavOpen] = useState(false);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [rowsShown, setRowsShown] = useState(10);

  const rows = useMemo(() => applyFilters(ACTIVITIES, filters), [filters]);
  const k = useMemo(() => kpis(rows), [rows]);
  const progress = useMemo(() => progressByDivision(rows), [rows]);
  const cats = useMemo(() => categoryDistribution(rows), [rows]);
  const auto = useMemo(() => automationOverview(rows), [rows]);
  const quality = useMemo(() => qualitySummary(rows), [rows]);
  const follow = useMemo(() => followUpSummary(rows), [rows]);
  const recent = useMemo(() => recentActivity(rows, rowsShown), [rows, rowsShown]);

  const set = <K extends keyof Filters>(key: K, v: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: v }));
    setRowsShown(10);
  };
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const reviewed = k.total - k.unreviewed;
  const maxProgress = Math.max(1, ...progress.map((p) => p.total));
  const maxCat = Math.max(1, ...cats.rows.map((r) => r.total));
  const maxQuality = Math.max(1, ...quality.map((q) => q.open + q.dispositioned));
  const maxFollow = Math.max(1, ...follow.byDivision.map((d) => d.open + d.closed));

  return (
    <div className="shell">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="main">
        <div className="mock-banner" role="note">
          <strong>MOCKUP / DEMO</strong> · Synthetic dummy data only. No workbook data, no backend. Every figure is illustrative; count definitions are
          pending owner approval (Q-R17).
        </div>

        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            ☰
          </button>
          <div className="titles">
            <p className="crumbs">WorkLens / Management</p>
            <h1>Dashboard</h1>
            <p className="muted">Assessment progress, quality and follow-up across activities</p>
          </div>
          <div className="topbar-meta">
            <span className="pill pill-neutral">Management · read-only</span>
            <span className="pill pill-demo">Demo data · {ACTIVITIES.length} synthetic activities</span>
          </div>
        </header>

        <main className="content">
          <section className="filters" aria-label="Dashboard filters">
            <Select label="Division" value={filters.division} options={["All", "IT CFB", "IT BDC", "IT BITE"]} onChange={(v) => set("division", v)} />
            <Select
              label="Automation / Manual"
              value={filters.automationManual}
              options={["All", "Manual", "AO", "Blank"]}
              onChange={(v) => set("automationManual", v)}
            />
            <Select
              label="Improvement Category"
              value={filters.category}
              options={["All", "Automation", "As Is", "Dismantled", "Blank"]}
              onChange={(v) => set("category", v)}
            />
            <Select label="Assessment Status" value={filters.status} options={["All", "Done", "Not marked Done"]} onChange={(v) => set("status", v)} />
            <label className="field grow">
              <span>Search activity or app</span>
              <input type="search" value={filters.query} placeholder="e.g. batch, Payment Switch" onChange={(e) => set("query", e.target.value)} />
            </label>
            <label className="check">
              <input type="checkbox" checked={filters.includeUnreviewed} onChange={(e) => set("includeUnreviewed", e.target.checked)} />
              Include unreviewed rows
            </label>
            <button className="btn" disabled={!isFiltered} onClick={() => (setFilters(DEFAULT_FILTERS), setRowsShown(10))}>
              Reset
            </button>
          </section>

          <p className="result-line" aria-live="polite">
            Showing <strong>{k.total}</strong> of {ACTIVITIES.length} synthetic activities
          </p>

          {k.total === 0 ? (
            <div className="empty">No activities match the current filters.</div>
          ) : (
            <>
              <section className="kpis" aria-label="Summary KPIs">
                <Kpi label="Activities in view" value={String(k.total)} hint={`${reviewed} reviewed · ${k.unreviewed} unreviewed class`} />
                <Kpi
                  label="Assessment Status = Done"
                  value={String(k.done)}
                  hint={`${pct(k.done, k.total)} of view. Flag only, not proof of completeness`}
                />
                <Kpi
                  label="Done with open findings"
                  value={String(k.doneWithOpenFindings)}
                  hint="Marked Done but still has an open quality finding"
                  tone="warn"
                />
                <Kpi label="Unreviewed rows" value={String(k.unreviewed)} hint="Row class. Preserved, not invalid" />
                <Kpi label="Open quality findings" value={String(k.openFindings)} hint="Awaiting L1 disposition" tone="warn" />
                <Kpi label="Open follow-ups" value={String(k.openFollowUps)} hint="Coordination items not yet closed" />
              </section>

              <div className="grid">
                <Card
                  className="span-7"
                  title="Assessment progress by division"
                  subtitle="Status flag split by whether open quality findings remain"
                  basis="Assessment Status (entered) and open validation findings. Illustrative; not a completeness measure."
                >
                  <StackedBars
                    ariaLabel="Assessment progress by division"
                    rows={progress.map((p) => ({ label: p.label, sub: `${p.total} activities`, values: p.segments }))}
                    series={PROGRESS_SERIES}
                    scaleMax={maxProgress}
                  />
                  <Legend series={PROGRESS_SERIES} />
                </Card>

                <Card
                  className="span-5"
                  title="Automation vs Manual"
                  subtitle="Current condition at assessment time, not an improvement decision"
                  basis="Automation/Manual (entered). The AO label may not cover all automation (Q-R6)."
                >
                  <Donut
                    ariaLabel="Automation versus manual"
                    centerValue={String(auto.total)}
                    centerLabel="reviewed rows"
                    parts={[
                      { label: "Manual", value: auto.manual, color: "#475569" },
                      { label: "Automation (AO label)", value: auto.ao, color: "#0f766e" },
                      { label: "Blank", value: auto.total - auto.manual - auto.ao, color: "#cbd5e1" },
                    ]}
                  />
                  <table className="matrix" aria-label="Automation or Manual by Improvement Category">
                    <thead>
                      <tr>
                        <th scope="col">Condition → Decision</th>
                        <th scope="col">Automation</th>
                        <th scope="col">As Is</th>
                        <th scope="col">Dismantled</th>
                        <th scope="col">Blank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auto.matrix.map((r) => {
                        const rowMax = Math.max(1, ...auto.matrix.flatMap((m) => m.cells));
                        return (
                          <tr key={r.label}>
                            <th scope="row">{r.label === "AO" ? "Automation (AO)" : "Manual"}</th>
                            {r.cells.map((c, i) => (
                              <td key={i} style={{ background: `rgba(15,118,110,${0.06 + (c / rowMax) * 0.34})` }}>
                                {c}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>

                <Card
                  className="span-7"
                  title="Improvement category distribution"
                  subtitle="L1 decision per activity, split by Category Notes"
                  basis={`Improvement Category and Category Notes (entered). ${cats.scoredTotal} reviewed rows; unreviewed rows excluded.`}
                >
                  <StackedBars
                    ariaLabel="Improvement category distribution"
                    rows={cats.rows.map((r) => ({
                      label: r.label,
                      sub: pct(r.total, cats.scoredTotal),
                      values: Object.fromEntries(r.parts.map((p) => [p.key, p.value])),
                    }))}
                    series={NOTE_SERIES}
                    scaleMax={maxCat}
                  />
                  <Legend series={NOTE_SERIES} />
                </Card>

                <Card
                  className="span-5"
                  title="Quality review summary"
                  subtitle="Validation findings by type and L1 disposition"
                  basis="Validation findings and review dispositions. Disposition states are not yet defined; only open vs dispositioned is shown."
                >
                  <StackedBars
                    ariaLabel="Quality findings by type"
                    rows={quality.map((q) => ({ label: q.type, values: { open: q.open, closed: q.dispositioned } }))}
                    series={OPEN_DONE}
                    scaleMax={maxQuality}
                  />
                  <Legend series={OPEN_DONE} />
                </Card>

                <Card
                  className="span-12"
                  title="Follow-up summary"
                  subtitle="Follow-up items by responsible party and by division"
                  basis="Follow-up items and Action by (L1, Part of L2). Status states are not yet defined (Q-R18); only open vs closed is shown."
                >
                  <div className="two-col">
                    <div>
                      <h3 className="mini-title">By Action by</h3>
                      <StackedBars
                        ariaLabel="Follow-ups by owner"
                        rows={follow.byOwner.map((r) => ({ label: r.label, values: { open: r.open, closed: r.closed } }))}
                        series={OPEN_DONE}
                        scaleMax={maxFollow}
                      />
                    </div>
                    <div>
                      <h3 className="mini-title">By division</h3>
                      <StackedBars
                        ariaLabel="Follow-ups by division"
                        rows={follow.byDivision.map((r) => ({ label: r.label, values: { open: r.open, closed: r.closed } }))}
                        series={OPEN_DONE}
                        scaleMax={maxFollow}
                      />
                    </div>
                  </div>
                  <Legend series={OPEN_DONE} />
                </Card>
              </div>

              <Card
                className="table-card"
                title="Recent activity"
                subtitle="Latest L1 edits, reviews and follow-ups. Select a row for read-only detail."
                basis="Last change per activity. Changes are L1-authored values; source fields stay unchanged."
                right={<KindBadge kind="l1_authored" />}
              >
                <div className="table-wrap">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>When</th>
                        <th>Activity</th>
                        <th>Division</th>
                        <th>Change</th>
                        <th>Category</th>
                        <th>Auto / Manual</th>
                        <th>Status</th>
                        <th>Open findings</th>
                        <th>By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((a) => {
                        const open = a.findings.filter((f) => !f.dispositioned).length;
                        return (
                          <tr key={a.id} tabIndex={0} onClick={() => setSelected(a)} onKeyDown={(e) => e.key === "Enter" && setSelected(a)}>
                            <td className="nowrap">{fmtWhen(a.lastEvent.at)}</td>
                            <td>
                              <strong>{a.activityName}</strong>
                              <small>
                                {a.id} · {a.apps}
                                {a.unreviewed && <span className="pill pill-neutral inline">unreviewed</span>}
                              </small>
                            </td>
                            <td className="nowrap">{a.division}</td>
                            <td>{a.lastEvent.type}</td>
                            <td>{a.improvementCategory ?? <span className="blank">blank</span>}</td>
                            <td>{a.automationManual ?? <span className="blank">blank</span>}</td>
                            <td>{a.assessmentStatusDone ? "Done" : <span className="blank">not marked</span>}</td>
                            <td>{open > 0 ? <span className="pill pill-warn">{open}</span> : <span className="blank">0</span>}</td>
                            <td className="nowrap">{a.lastEvent.by}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {rowsShown < rows.length && (
                  <button className="btn more" onClick={() => setRowsShown((n) => n + 10)}>
                    Show 10 more
                  </button>
                )}
              </Card>
            </>
          )}

          <footer className="page-foot">
            <h3>Value kinds</h3>
            <p className="kind-row">
              <KindBadge kind="entered" /> <KindBadge kind="workbook_derived_cached" /> <KindBadge kind="l1_authored" />{" "}
              <KindBadge kind="worklens_derived" /> <KindBadge kind="ai_generated" />
            </p>
            <p className="muted">
              Not shown on purpose: workload before and after, workload saving, impact, and scoring. No metric definition is approved, and the 10% Workload
              After figure is a workbook assumption, not measured impact. No WorkLens-derived or AI-generated values exist in this mockup.
            </p>
          </footer>
        </main>
      </div>
      <RecordDrawer activity={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
