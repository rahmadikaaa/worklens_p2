"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/app-state";
import { WORKBOOK, formatValue, getFact } from "@/lib/facts";
import { Notice, StatusBadge } from "./ui";

const APPROVAL_CHECKLIST = [
  "Definition",
  "Source fields",
  "Unit",
  "Formula",
  "Missing and invalid handling",
  "Aggregation rules",
  "Versioning",
  "Acceptance criteria",
];

/** Shared Click-to-Audit drawer. Shows provenance, never workbook cell values. */
export function AuditDrawer() {
  const { auditId, closeAudit } = useApp();

  useEffect(() => {
    if (!auditId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAudit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [auditId, closeAudit]);

  if (!auditId) return null;
  const f = getFact(auditId);
  const pending = f.status === "pending-approval";

  return (
    <>
      <div className="scrim" onClick={closeAudit} data-testid="audit-scrim" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Click-to-Audit" data-testid="audit-drawer">
        <div className="drawer-head">
          <div className="stack" style={{ gap: 4 }}>
            <span className="small muted">Click-to-Audit</span>
            <h2 style={{ fontSize: 17 }} data-testid="audit-name">{f.label}</h2>
            <div className="row">
              <span style={{ fontSize: 24, fontWeight: 650 }} data-testid="audit-value">{formatValue(f)}</span>
              {!pending && f.unit ? <span className="muted">{f.unit}</span> : null}
              <StatusBadge status={f.status} />
            </div>
          </div>
          <button className="btn small" onClick={closeAudit} aria-label="Close audit drawer">Close</button>
        </div>
        <div className="drawer-body">
          {pending ? (
            <Notice tone="warn">
              <strong>No value is shown.</strong> No definition has been approved for this metric, so WorkLens does not
              calculate it. Blocked by: {f.blockedBy}.
            </Notice>
          ) : null}

          <dl className="kv" data-testid="audit-provenance">
            <dt>Fact ID</dt><dd className="mono">{f.id}</dd>
            <dt>Source document</dt><dd className="mono" data-testid="audit-source-doc">{f.sourceDoc}</dd>
            <dt>Reference in document</dt><dd>{f.sourceRef}</dd>
            <dt>Workbook SHA-256</dt><dd className="mono" data-testid="audit-sha">{WORKBOOK.sha256}</dd>
            <dt>Workbook</dt><dd>{WORKBOOK.fileName} (not opened by this mockup)</dd>
            <dt>Sheet</dt><dd data-testid="audit-sheet">{WORKBOOK.sheet}</dd>
            <dt>Source row range</dt><dd data-testid="audit-rows">{f.rowRange ?? "Not applicable"}</dd>
            <dt>Definition</dt><dd data-testid="audit-definition">{f.definition}</dd>
            <dt>Transformation</dt><dd>{f.transformation ?? "Not applicable"}</dd>
          </dl>

          {pending ? (
            <div className="stack">
              <h3>Approval checklist (AGENTS.md calculation gate)</h3>
              <table>
                <tbody>
                  {APPROVAL_CHECKLIST.map((item) => (
                    <tr key={item}>
                      <td>{item}</td>
                      <td><span className="badge pending">Not approved</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="stack">
              <div className="row">
                <h3>Illustrative SQL</h3>
                <span className="badge danger" data-testid="sql-label">Proposed — Not Executed</span>
              </div>
              {f.proposedSql ? (
                <pre className="sql" data-testid="audit-sql">{f.proposedSql}</pre>
              ) : (
                <Notice>No SQL is proposed for this fact.</Notice>
              )}
              <Notice>
                Table names follow <span className="mono">docs/design/DATABASE_SCHEMA_PROPOSAL.md</span>. No database
                exists, so this query has not been run and no result comes from it.
              </Notice>
            </div>
          )}

          <div className="stack">
            <h3>Underlying raw data</h3>
            <Notice tone="info">
              Cell values are not shown. This mockup does not read the workbook, and agent access to real source values
              requires gate G10. A production audit would list the raw rows by Excel row number for authorized roles.
            </Notice>
          </div>
        </div>
      </aside>
    </>
  );
}
