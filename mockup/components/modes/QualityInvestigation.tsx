"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-state";
import { ERROR_COLUMN_FACTS, formatValue, getFact, getVerified, WORKBOOK } from "@/lib/facts";
import { Card, MetricCard, StatusBadge } from "../ui";
import { ErrorDistribution, InsightBlock, IntegrityChecks } from "../shared";

const SCALE_MAX = 3540;
const pct = (row: number) => `${(row / SCALE_MAX) * 100}%`;

function RowStrip() {
  const { openAudit } = useApp();
  return (
    <div data-testid="row-strip">
      <div className="strip" role="img" aria-label="Excel row positions 1 to 3540">
        <div className="seg" style={{ left: pct(2), width: `calc(${pct(3238)} - ${pct(2)})`, background: "#cddafa" }} title="Rows 2–3238" />
        <button
          className="seg"
          style={{ left: pct(3239), width: `calc(${pct(3490)} - ${pct(3239)})`, background: "#c2570c", border: 0, padding: 0 }}
          title="Unreviewed block, rows 3239–3490"
          aria-label="Unreviewed block, rows 3239 to 3490. Open audit."
          data-testid="strip-unreviewed"
          onClick={() => openAudit("src.unreviewed_rows")}
        />
        {[3526, 3535, 3537, 3538, 3539, 3540].map((r) => (
          <button
            key={r}
            className="tick"
            style={{ left: pct(r), border: 0, padding: 0, width: 3 }}
            title={`Link-only row ${r}`}
            aria-label={`Link-only row ${r}. Open audit.`}
            onClick={() => openAudit("src.link_only_rows")}
          />
        ))}
      </div>
      <div className="axis"><span>Row 1</span><span>3238</span><span>3490</span><span>3540</span></div>
      <div className="legend" style={{ marginTop: 6 }}>
        <span><span className="swatch" style={{ background: "#cddafa" }} />Rows 2–3238, before the unreviewed block</span>
        <span><span className="swatch" style={{ background: "#c2570c" }} />Unreviewed 3239–3490</span>
        <span><span className="swatch" style={{ background: "var(--danger)" }} />Link-only rows</span>
        <span><span className="swatch" style={{ background: "#edf0f4", border: "1px solid var(--border)" }} />Absent rows 3491–3540 (other than link-only)</span>
      </div>
    </div>
  );
}

const INVESTIGATION = ["src.unreviewed_rows", "src.link_only_rows", "src.error_cells", "src.error_rows"] as const;

/** Layout C. Investigate quality indicators and see where each count comes from. */
export function QualityInvestigation() {
  const { openAudit } = useApp();
  const [selectedCol, setSelectedCol] = useState<string>("U");
  const [selectedRow, setSelectedRow] = useState<string>("src.unreviewed_rows");
  const col = ERROR_COLUMN_FACTS.find((c) => c.col === selectedCol) ?? ERROR_COLUMN_FACTS[0]!;
  const sel = getFact(selectedRow);

  return (
    <div className="stack" style={{ gap: 16 }} data-testid="mode-quality">
      <InsightBlock />

      <Card title="Data integrity indicators" hint="Consistency between verified counts" testId="integrity-indicators">
        <div className="stack" style={{ gap: 12 }}>
          <div className="row">
            <span className="badge verified">Hash approved (0004)</span>
            <span className="badge verified">Header: 36 columns {WORKBOOK.columnRange}</span>
            <span className="badge verified">Sheet: {WORKBOOK.sheet}</span>
            <span className="badge neutral">Pivot area excluded</span>
          </div>
          <IntegrityChecks />
        </div>
      </Card>

      <div className="grid split-r">
        <div className="stack" style={{ gap: 14 }}>
          <MetricCard factId="src.error_rows" />
          <MetricCard factId="src.error_cells" />
          <MetricCard factId="src.link_only_rows" />
          <MetricCard factId="src.unreviewed_rows" />
        </div>
        <Card title="Error distribution by column" hint="Select a column to see its source reference" testId="error-by-column">
          <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", alignItems: "start" }}>
            <ErrorDistribution selected={selectedCol} onSelect={setSelectedCol} />
            <div className="card" style={{ background: "var(--surface-2)" }} data-testid="source-reference">
              <div className="card-body stack">
                <span className="small muted">Selected indicator</span>
                <strong data-testid="ref-label">{col.label}</strong>
                <span style={{ fontSize: 24, fontWeight: 650 }} data-testid="ref-value">{col.value} cells</span>
                <dl className="kv" style={{ gridTemplateColumns: "100px 1fr" }}>
                  <dt>Sheet</dt><dd>{WORKBOOK.sheet}</dd>
                  <dt>Column</dt><dd className="mono">{col.col} ({col.header})</dd>
                  <dt>Rows</dt><dd>{col.rowRange}</dd>
                  <dt>Source</dt><dd className="mono" style={{ fontSize: 12 }}>{col.sourceDoc}</dd>
                </dl>
                <button className="btn" data-testid="ref-open-audit" onClick={() => openAudit(col.id)}>Open Click-to-Audit</button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Unreviewed row range and link-only rows" hint="Where the structural counts sit on the sheet (Excel row numbers)" testId="range-card">
        <RowStrip />
      </Card>

      <div className="grid cols-2">
        <Card title="Link-only row classification" hint="Q-S3" testId="linkonly-card" right={<StatusBadge status="verified" />}>
          <div className="stack">
            <p>
              <strong>{getVerified("src.link_only_rows").value} rows</strong> hold a value only in column I
              (Link Confluence). They look like orphan link entries, so they are classified as <span className="mono">link_only</span> and
              are not activity records. They stay in the raw store and remain inspectable.
            </p>
            <dl className="kv">
              <dt>Excel rows</dt><dd className="mono">3526, 3535, 3537, 3538, 3539, 3540</dd>
              <dt>Rule</dt><dd>Only column I populated</dd>
              <dt>Decision</dt><dd className="mono">docs/DECISIONS/0004 (Q-S3)</dd>
            </dl>
            <div><button className="btn small" onClick={() => openAudit("src.link_only_rows")}>Audit this count</button></div>
          </div>
        </Card>
        <Card title="Rows containing errors" hint="Row numbers are not listed" testId="errorrows-card" right={<StatusBadge status="verified" />}>
          <div className="stack">
            <p>
              <strong>{getVerified("src.error_rows").value} rows</strong> contain at least one error cell, in
              {" "}<strong>{getVerified("src.error_cells").value}</strong> error cells in total. Error cells are kept as read and stay
              distinguishable from text.
            </p>
            <p className="muted small">
              Listing the affected row numbers needs a read of the source cells. This mockup does not read the workbook,
              and agent access to real values needs gate G10.
            </p>
            <div><button className="btn small" onClick={() => openAudit("src.error_rows")}>Audit this count</button></div>
          </div>
        </Card>
      </div>

      <Card title="Investigation table" hint="Each indicator with its source reference. Select a row, then audit." testId="investigation-table">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Indicator</th><th className="num">Count</th><th>Excel rows</th><th>Source document</th><th /></tr>
            </thead>
            <tbody>
              {INVESTIGATION.map((id) => {
                const f = getFact(id);
                return (
                  <tr
                    key={id}
                    className={`clickable${selectedRow === id ? " selected" : ""}`}
                    data-testid={`inv-${id}`}
                    onClick={() => setSelectedRow(id)}
                  >
                    <td>{f.label}</td>
                    <td className="num">{formatValue(f)}</td>
                    <td className="mono">{f.rowRange}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{f.sourceDoc}</td>
                    <td><button className="btn small" onClick={(e) => { e.stopPropagation(); openAudit(id); }}>Audit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="notice" style={{ marginTop: 10 }} data-testid="inv-selected">
          Selected: <strong>{sel.label}</strong>. {sel.definition}
        </div>
      </Card>
    </div>
  );
}
