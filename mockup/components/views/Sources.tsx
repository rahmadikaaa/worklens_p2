"use client";

import { Card, KindBadge, Notice } from "../ui";

const CONNECTORS = [
  { name: "Snowflake", blocker: "GT-4, GT-14, new decision" },
  { name: "BigQuery", blocker: "GT-4, GT-14, new decision" },
  { name: "Databricks", blocker: "GT-4, GT-14, new decision" },
  { name: "Redshift", blocker: "GT-4, GT-14, new decision" },
  { name: "ClickHouse", blocker: "GT-4, GT-14, new decision" },
];

const SQL_EXAMPLE = `-- Proposed — Not Executed. No connector exists.
SELECT count(*)
FROM domain.row_classification
WHERE row_class = 'link_only';`;

/** Future panels for internal storage, file support, and warehouse connectors. Everything is disabled. */
export function Sources() {
  return (
    <div className="stack" style={{ gap: 16 }} data-testid="view-sources">
      <Notice tone="warn">
        Everything on this page is <strong>Future</strong>. The approved source is the configured Excel workbook (GT-4).
        Other sources need a new owner decision, and no control here does anything.
      </Notice>

      <div className="grid cols-2">
        <Card title="Internal database" hint="Stores data between refreshes" right={<KindBadge kind="Future" />} testId="storage-db">
          <div className="stack">
            <p>Intended store: PostgreSQL on the local machine, with append-only raw tables.</p>
            <dl className="kv">
              <dt>State</dt><dd>Not provisioned</dd>
              <dt>Blocked by</dt><dd>GT-2: approved in principle, provisioning not authorized</dd>
              <dt>Capacity</dt><dd>Not specified. Figures from other products are not WorkLens requirements.</dd>
            </dl>
            <div><button className="btn" disabled>Provision database</button></div>
          </div>
        </Card>
        <Card title="File storage (CSV, JSON)" hint="Imported files kept for later syncs" right={<KindBadge kind="Future" />} testId="storage-files">
          <div className="stack">
            <p>Upload of CSV or JSON files as extra sources.</p>
            <dl className="kv">
              <dt>State</dt><dd>Not available</dd>
              <dt>Conflict</dt><dd>GT-4 states that no endpoint accepts a path or an upload</dd>
              <dt>Capacity</dt><dd>Not specified</dd>
            </dl>
            <div><button className="btn" disabled>Upload file</button></div>
          </div>
        </Card>
      </div>

      <Card title="Connector catalog" hint="Data warehouse connectors" right={<KindBadge kind="Future" />} testId="connector-catalog">
        <table>
          <thead><tr><th>Connector</th><th>State</th><th>Blocked by</th><th /></tr></thead>
          <tbody>
            <tr>
              <td>Excel workbook (configured path)</td>
              <td><span className="badge simulated">Simulated</span> in this mockup</td>
              <td className="muted">Approved source (GT-4). Refresh is simulated.</td>
              <td />
            </tr>
            {CONNECTORS.map((c) => (
              <tr key={c.name} data-testid={`connector-${c.name}`}>
                <td>{c.name}</td>
                <td><KindBadge kind="Future" /></td>
                <td className="muted">{c.blocker}</td>
                <td><button className="btn small" disabled>Connect</button></td>
              </tr>
            ))}
            <tr>
              <td>CSV upload</td>
              <td><KindBadge kind="Future" /></td>
              <td className="muted">GT-4 conflict</td>
              <td><button className="btn small" disabled>Upload</button></td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card title="SQL editor" hint="Queries against a connected source" right={<KindBadge kind="Future" />} testId="sql-editor">
        <div className="stack">
          <span className="badge danger" style={{ alignSelf: "flex-start" }}>Proposed — Not Executed</span>
          <textarea className="mono disabled-box" rows={5} value={SQL_EXAMPLE} readOnly disabled aria-label="Example SQL, disabled" />
          <div><button className="btn" disabled>Run query</button></div>
        </div>
      </Card>
    </div>
  );
}
