"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/app-state";
import {
  ERROR_COLUMN_FACTS,
  REGIONS,
  WORKBOOK,
  buildInsightText,
  formatValue,
  getFact,
  getVerified,
  type Region,
} from "@/lib/facts";
import { Card, KindBadge, Notice, StatusBadge } from "./ui";

/** Static example insight. Built only from verified facts. Not AI output. */
export function InsightBlock() {
  return (
    <div className="insight" data-testid="insight-block">
      <div className="row">
        <strong>Insight</strong>
        <KindBadge kind="Future" />
        <span className="badge neutral">Static example text, not AI output</span>
      </div>
      <p data-testid="insight-text">{buildInsightText()}</p>
      <span className="small muted">
        A scheduled, AI-assisted insight belongs to Phase 9 (Q-T2) and is not built. This text is composed from verified
        counts only and contains no workload or business metric.
      </span>
    </div>
  );
}

/** Horizontal bars of error cells per column. Each bar opens the audit drawer. */
export function ErrorDistribution({
  selected,
  onSelect,
}: {
  selected?: string | null;
  onSelect?: (col: string) => void;
}) {
  const { openAudit } = useApp();
  const max = Math.max(...ERROR_COLUMN_FACTS.map((e) => e.value));
  const sorted = [...ERROR_COLUMN_FACTS].sort((a, b) => b.value - a.value);
  return (
    <div className="stack" style={{ gap: 2 }} data-testid="error-distribution">
      {sorted.map((e) => (
        <button
          key={e.id}
          type="button"
          className={`bar-row${selected === e.col ? " selected" : ""}`}
          data-testid={`errbar-${e.col}`}
          onClick={() => (onSelect ? onSelect(e.col) : openAudit(e.id))}
          aria-label={`Column ${e.col} ${e.header}: ${e.value} error cells`}
        >
          <span>
            <span className="mono">{e.col}</span> <span className="muted">{e.header}</span>
          </span>
          <span className="bar-track"><span className="bar-fill warn" style={{ display: "block", width: `${(e.value / max) * 100}%` }} /></span>
          <span className="num" style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{e.value}</span>
        </button>
      ))}
      <span className="small muted" style={{ paddingTop: 6 }}>
        Bar length is relative to the largest column. Counts are error cells (#N/A) per source column.
      </span>
    </div>
  );
}

/** Stacked composition of source rows, using verified counts only. */
export function RowComposition() {
  const { openAudit } = useApp();
  const total = getVerified("src.total_rows").value;
  const unreviewed = getVerified("src.unreviewed_rows").value;
  const activity = getVerified("src.activity_rows").value;
  const link = getVerified("src.link_only_rows").value;
  const rest = activity - unreviewed;
  const parts = [
    { id: "src.activity_rows", label: "Activity-structured, not in unreviewed block", n: rest, color: "#2b59d6" },
    { id: "src.unreviewed_rows", label: "Unreviewed block", n: unreviewed, color: "#c2570c" },
    { id: "src.link_only_rows", label: "Link-only", n: link, color: "#8a93a2" },
  ];
  return (
    <div className="stack" data-testid="row-composition">
      <div className="stacked" role="img" aria-label="Composition of source rows">
        {parts.map((p) => (
          <div key={p.id} style={{ width: `${(p.n / total) * 100}%`, background: p.color, minWidth: p.n > 0 ? 3 : 0 }} title={`${p.label}: ${p.n}`} />
        ))}
      </div>
      <div className="legend">
        {parts.map((p) => (
          <button key={p.id} className="link-btn" style={{ textDecoration: "none", color: "inherit" }} onClick={() => openAudit(p.id)}>
            <span className="swatch" style={{ background: p.color }} />
            {p.label}: <strong>{p.n.toLocaleString("en-US")}</strong>
          </button>
        ))}
      </div>
      <span className="small muted">
        The first segment is arithmetic on verified counts ({activity.toLocaleString("en-US")} − {unreviewed}). It is shown
        only to size the bar and is not a reviewed-activity metric.
      </span>
    </div>
  );
}

/** Arithmetic consistency checks between verified counts. */
export function IntegrityChecks() {
  const { openAudit } = useApp();
  const t = getVerified("src.total_rows").value;
  const a = getVerified("src.activity_rows").value;
  const l = getVerified("src.link_only_rows").value;
  const u = getVerified("src.unreviewed_rows").value;
  const errSum = ERROR_COLUMN_FACTS.reduce((s, e) => s + e.value, 0);
  const errTotal = getVerified("src.error_cells").value;
  const checks = [
    { id: "chk.rows", text: `${a.toLocaleString("en-US")} + ${l} = ${(a + l).toLocaleString("en-US")}`, ok: a + l === t, label: "Activity + link-only equals total rows", fact: "src.total_rows" },
    { id: "chk.errs", text: `Sum of 8 columns = ${errSum}`, ok: errSum === errTotal, label: "Per-column errors equal total error cells", fact: "src.error_cells" },
    { id: "chk.unrev", text: `${u} ≤ ${a.toLocaleString("en-US")}`, ok: u <= a, label: "Unreviewed block is within activity rows", fact: "src.unreviewed_rows" },
  ];
  return (
    <table data-testid="integrity-checks">
      <tbody>
        {checks.map((c) => (
          <tr key={c.id} className="clickable" onClick={() => openAudit(c.fact)}>
            <td>{c.label}</td>
            <td className="mono">{c.text}</td>
            <td><span className={`badge ${c.ok ? "verified" : "danger"}`}>{c.ok ? "Consistent" : "Mismatch"}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SourceIntegrityCard() {
  return (
    <Card title="Source workbook integrity" hint="Identity of the approved baseline" testId="source-integrity" right={<StatusBadge status="verified" />}>
      <dl className="kv">
        <dt>Workbook</dt><dd>{WORKBOOK.fileName}</dd>
        <dt>SHA-256</dt><dd className="mono" style={{ fontSize: 11.5 }} data-testid="integrity-sha">{WORKBOOK.sha256}</dd>
        <dt>Approval</dt><dd className="mono" style={{ fontSize: 12 }}>{WORKBOOK.approvalRef}</dd>
        <dt>Data sheet</dt><dd>{WORKBOOK.sheet}</dd>
        <dt>Header</dt><dd>Row {WORKBOOK.headerRow}, columns {WORKBOOK.columnRange}</dd>
        <dt>Excluded range</dt><dd>{WORKBOOK.excludedRange}</dd>
        <dt>Mutability</dt><dd>Immutable. This mockup never opens the file.</dd>
      </dl>
    </Card>
  );
}

type RegionFilter = "all" | "activity_structured" | "link_only";

/** Structural table of row regions. It lists row ranges and counts only, never cell values. */
export function RegionTable({
  regionIds,
  title = "Activity data table",
  hint = "Structural view of the source rows. No cell values.",
  selectedRegion,
  onSelect,
  testId = "region-table",
}: {
  regionIds?: string[];
  title?: string;
  hint?: string;
  selectedRegion?: string | null;
  onSelect?: (r: Region) => void;
  testId?: string;
}) {
  const { openAudit } = useApp();
  const [filter, setFilter] = useState<RegionFilter>("all");
  const [q, setQ] = useState("");
  const rows = useMemo(
    () =>
      REGIONS.filter((r) => !regionIds || regionIds.includes(r.id))
        .filter((r) => filter === "all" || r.rowClass === filter)
        .filter((r) => `${r.label} ${r.excelRows} ${r.state}`.toLowerCase().includes(q.trim().toLowerCase())),
    [regionIds, filter, q],
  );
  return (
    <Card
      title={title}
      hint={hint}
      testId={testId}
      right={
        <div className="row">
          <input type="search" placeholder="Filter regions" aria-label="Filter regions" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Row class" value={filter} onChange={(e) => setFilter(e.target.value as RegionFilter)}>
            <option value="all">All classes</option>
            <option value="activity_structured">Activity-structured</option>
            <option value="link_only">Link-only</option>
          </select>
        </div>
      }
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Region</th><th>Excel rows</th><th className="num">Rows</th><th>State</th><th>Note</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const f = getFact(r.factId);
              return (
                <tr
                  key={r.id}
                  className={`clickable${selectedRegion === r.id ? " selected" : ""}`}
                  data-testid={`region-${r.id}`}
                  onClick={() => (onSelect ? onSelect(r) : openAudit(r.factId))}
                >
                  <td>{r.label}</td>
                  <td className="mono">{r.excelRows}</td>
                  <td className="num">{formatValue(f)}</td>
                  <td><span className="badge neutral">{r.state}</span></td>
                  <td className="muted">{r.note}</td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="muted">No region matches the filter.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function PendingNote({ children }: { children?: React.ReactNode }) {
  return (
    <Notice tone="warn">
      {children ?? "These metrics have no approved definition. They show no value until the owner approves one."}
    </Notice>
  );
}
