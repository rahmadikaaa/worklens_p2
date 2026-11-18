"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/app-state";
import { WORKBOOK, getFact } from "@/lib/facts";
import { ACTIVITY_ROWS, type ActivityRow, type ReviewState, type RowClass } from "@/lib/rows";
import { Card, MetricCard, Notice } from "./ui";

const CLASS_LABEL: Record<RowClass, string> = { activity_structured: "Activity-structured", link_only: "Link-only" };
const REVIEW_LABEL: Record<ReviewState, string> = {
  unreviewed: "Unreviewed",
  outside_unreviewed_block: "Outside unreviewed block",
  not_applicable: "Not applicable",
};
type SortKey = "sourceRow" | "rowClass" | "reviewState";

const label = (r: ActivityRow) => `${r.sourceRow} ${CLASS_LABEL[r.rowClass]} ${REVIEW_LABEL[r.reviewState]}`.toLowerCase();

/** Layout B primary content: every source row, searchable, filterable, sortable, inspectable. Structural only, no cell values. */
export function ActivityTable() {
  const { openAudit } = useApp();
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<RowClass | "all">("all");
  const [review, setReview] = useState<ReviewState | "all">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "sourceRow", dir: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = ACTIVITY_ROWS.filter(
      (r) => (cls === "all" || r.rowClass === cls) && (review === "all" || r.reviewState === review) && (!needle || label(r).includes(needle)),
    );
    const { key, dir } = sort;
    // Ties fall back to source row so the order is stable.
    return out.sort((a, b) => {
      const av = key === "sourceRow" ? a.sourceRow : a[key];
      const bv = key === "sourceRow" ? b.sourceRow : b[key];
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return c ? c * dir : a.sourceRow - b.sourceRow;
    });
  }, [q, cls, review, sort]);

  const selected = ACTIVITY_ROWS.find((r) => r.id === selectedId) ?? null;
  const total = ACTIVITY_ROWS.length;
  const th = (key: SortKey, text: string) => (
    <th aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        className="link-btn"
        style={{ textDecoration: "none", color: "inherit", font: "inherit", fontWeight: 600 }}
        data-testid={`sort-${key}`}
        onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === 1 ? -1 : 1 }))}
      >
        {text}{sort.key === key ? (sort.dir === 1 ? " ▲" : " ▼") : ""}
      </button>
    </th>
  );

  return (
    <>
      <div className="grid cols-4">
        <MetricCard factId="src.total_rows" compact />
        <MetricCard factId="src.activity_rows" compact />
        <MetricCard factId="src.link_only_rows" compact />
        <MetricCard factId="src.unreviewed_rows" compact />
      </div>

      <div className="grid split">
        <Card
          title="Activity rows"
          hint="Structural records: identity and classification only. No cell values."
          testId="activity-table"
          right={
            <div className="row">
              <input type="search" placeholder="Search row, class, state" aria-label="Search rows" data-testid="activity-search" value={q} onChange={(e) => setQ(e.target.value)} />
              <select aria-label="Row class" data-testid="filter-class" value={cls} onChange={(e) => setCls(e.target.value as RowClass | "all")}>
                <option value="all">All classes</option>
                <option value="activity_structured">Activity-structured</option>
                <option value="link_only">Link-only</option>
              </select>
              <select aria-label="Review state" data-testid="filter-review" value={review} onChange={(e) => setReview(e.target.value as ReviewState | "all")}>
                <option value="all">All review states</option>
                <option value="unreviewed">Unreviewed</option>
                <option value="outside_unreviewed_block">Outside unreviewed block</option>
                <option value="not_applicable">Not applicable</option>
              </select>
              <button type="button" className="btn small" data-testid="filter-reset" onClick={() => { setQ(""); setCls("all"); setReview("all"); }}>Reset</button>
            </div>
          }
        >
          <div className="stack">
            <span className="small muted" data-testid="row-count" role="status">
              Showing {rows.length.toLocaleString("en-US")} of {total.toLocaleString("en-US")} rows
            </span>
            <div className="table-wrap activity-scroll">
              <table>
                <thead>
                  <tr>{th("sourceRow", "Source row")}{th("rowClass", "Row class")}{th("reviewState", "Review state")}</tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className={`clickable${r.id === selectedId ? " selected" : ""}`}
                      data-testid="activity-row"
                      data-row={r.sourceRow}
                      tabIndex={0}
                      aria-selected={r.id === selectedId}
                      onClick={() => setSelectedId(r.id)}
                      onKeyDown={(e) => { if (e.key === "Enter") setSelectedId(r.id); }}
                    >
                      <td className="mono">{r.sourceRow}</td>
                      <td>{CLASS_LABEL[r.rowClass]}</td>
                      <td><span className="badge neutral">{REVIEW_LABEL[r.reviewState]}</span></td>
                    </tr>
                  ))}
                  {rows.length === 0 ? <tr><td colSpan={3} className="muted">No row matches the search and filters.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card title="Row inspector" hint="Provenance of the selected row" testId="row-inspector">
          {selected ? (
            <div className="stack">
              <dl className="kv">
                <dt>Source row</dt><dd className="mono" data-testid="insp-row">{selected.sourceRow}</dd>
                <dt>Row identity</dt><dd className="mono" data-testid="insp-id">{selected.id}</dd>
                <dt>Workbook</dt><dd>{WORKBOOK.fileName} (not opened by this mockup)</dd>
                <dt>SHA-256</dt><dd className="mono" style={{ fontSize: 11.5 }} data-testid="insp-sha">{WORKBOOK.sha256}</dd>
                <dt>Sheet</dt><dd data-testid="insp-sheet">{WORKBOOK.sheet}</dd>
                <dt>Row class</dt><dd>{CLASS_LABEL[selected.rowClass]} <span className="faint small">(proposed rule, Q-S3)</span></dd>
                <dt>Review state</dt><dd>{REVIEW_LABEL[selected.reviewState]} <span className="faint small">(proposed rule, Q-S4)</span></dd>
                <dt>Rule source</dt><dd className="mono" style={{ fontSize: 12 }}>{getFact(selected.classFactId).sourceDoc}</dd>
                <dt>Cell values</dt><dd data-testid="insp-values">Not available. The workbook is not read (gate G10).</dd>
              </dl>
              <div className="row">
                <button type="button" className="btn small" data-testid="insp-audit-class" onClick={() => openAudit(selected.classFactId)}>Audit row class count</button>
                <button type="button" className="btn small" data-testid="insp-audit-review" onClick={() => openAudit(selected.reviewFactId)}>Audit review state count</button>
              </div>
            </div>
          ) : (
            <Notice>Select a row to see its identity and source reference.</Notice>
          )}
        </Card>
      </div>

      <Notice tone="info">
        Rows containing error cells (108) cannot be flagged here: their row numbers are not recorded and need gate G10. See
        the Quality section for the verified error counts.
      </Notice>
    </>
  );
}
