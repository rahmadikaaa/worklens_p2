"use client";

import { useEffect } from "react";
import type { Activity, ValueKind } from "@/lib/types";

const KIND_LABEL: Record<ValueKind, string> = {
  entered: "entered",
  workbook_derived_cached: "workbook-derived (cached)",
  l1_authored: "L1-authored",
  worklens_derived: "WorkLens-derived",
  ai_generated: "AI-generated",
};

export function KindBadge({ kind }: { kind: ValueKind }) {
  return <span className={`kind kind-${kind}`}>{KIND_LABEL[kind]}</span>;
}

function Row({ label, value, kind }: { label: string; value: string | null; kind: ValueKind }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{value ? value : <span className="blank">blank</span>}</td>
      <td>
        <KindBadge kind={kind} />
      </td>
    </tr>
  );
}

export default function RecordDrawer({ activity, onClose }: { activity: Activity | null; onClose: () => void }) {
  useEffect(() => {
    if (!activity) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activity, onClose]);

  if (!activity) return null;
  const a = activity;
  return (
    <>
      <div className="scrim show" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Activity ${a.id} details`}>
        <header>
          <div>
            <p className="eyebrow">Drill-down · read-only · synthetic record</p>
            <h2>{a.activityName}</h2>
            <p className="muted">
              {a.id} · {a.apps}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close details">
            ✕
          </button>
        </header>

        {a.unreviewed && (
          <p className="callout">
            Row class <code>unreviewed</code>. Preserved and inspectable; not invalid. Excluded from assessment counts until eligibility rules
            exist (Q-B12).
          </p>
        )}

        <h3>Activity fields</h3>
        <table className="kv">
          <tbody>
            <Row label="DIV" value={a.division} kind="workbook_derived_cached" />
            <Row label="APPS" value={a.apps} kind="entered" />
            <Row label="TYPE ACTIVITY" value={a.typeActivity} kind="entered" />
            <Row label="Automation/Manual" value={a.automationManual} kind="entered" />
            <Row label="Improvement Category" value={a.improvementCategory} kind="entered" />
            <Row label="Category Notes" value={a.categoryNotes} kind="entered" />
            <Row label="Tools Automation" value={a.toolsAutomation || null} kind="entered" />
            <Row label="Assessment Status" value={a.assessmentStatusDone ? "Done" : null} kind="entered" />
          </tbody>
        </table>
        <p className="muted tiny">
          <code>Done</code> is a status flag. It does not prove data completeness or L2 validation (Q8, Q9).
        </p>

        <h3>Quality review findings</h3>
        {a.findings.length === 0 ? (
          <p className="muted">No findings on this record.</p>
        ) : (
          <ul className="plain">
            {a.findings.map((f, i) => (
              <li key={i}>
                <span className={`pill ${f.dispositioned ? "pill-ok" : "pill-warn"}`}>{f.dispositioned ? "Dispositioned" : "Open"}</span> {f.type}
              </li>
            ))}
          </ul>
        )}

        <h3>Follow-up</h3>
        {a.followUp ? (
          <p>
            <span className={`pill ${a.followUp.closed ? "pill-ok" : "pill-warn"}`}>{a.followUp.closed ? "Closed" : "Open"}</span> {a.followUp.description}{" "}
            <span className="muted">· Action by {a.followUp.actionBy}</span>
          </p>
        ) : (
          <p className="muted">No follow-up item.</p>
        )}

        <h3>Last change</h3>
        <p>
          {a.lastEvent.type} · {a.lastEvent.by} · {a.lastEvent.at.replace("T", " ").slice(0, 16)} <KindBadge kind="l1_authored" />
        </p>

        <p className="callout muted">
          Workload, impact and AI-generated values are not shown. No approved metric definition exists, and no AI output exists in this mockup.
        </p>
      </aside>
    </>
  );
}
