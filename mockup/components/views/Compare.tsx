"use client";

import { useEffect, useState } from "react";
import { MODES, useApp, type Mode } from "@/lib/app-state";
import { AuditFirst } from "../modes/AuditFirst";
import { QualityInvestigation } from "../modes/QualityInvestigation";
import { WorkspaceMonitoring } from "../modes/WorkspaceMonitoring";
import { KindBadge, Notice } from "../ui";

const STORAGE_KEY = "worklens-mockup-comments";

const PARTS = ["Insight block", "KPI summary", "Charts and distribution", "Tables", "Navigation and layout"] as const;

interface Comment {
  id: string;
  mode: Mode;
  part: (typeof PARTS)[number];
  text: string;
  resolved: boolean;
}

function load(): Comment[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

const PREVIEW: Record<Mode, () => React.JSX.Element> = {
  audit: () => <AuditFirst />,
  workspace: () => <WorkspaceMonitoring />,
  quality: () => <QualityInvestigation />,
};

/** Side-by-side comparison of the three modes of the same application, with mockup-only comments. */
export function Compare() {
  const { setMode, setView } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setCommentMode] = useState<Mode>("audit");
  const [part, setPart] = useState<(typeof PARTS)[number]>("KPI summary");
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    setComments(load());
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }, [comments, loaded]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    if (editing) {
      setComments((cs) => cs.map((c) => (c.id === editing ? { ...c, mode, part, text: t } : c)));
      setEditing(null);
    } else {
      setComments((cs) => [...cs, { id: `${Date.now()}-${cs.length}`, mode, part, text: t, resolved: false }]);
    }
    setText("");
  };

  return (
    <div className="stack" style={{ gap: 16 }} data-testid="view-compare">
      <Notice tone="info">
        <strong>Same application, same data.</strong> The three previews are the same components reading the same verified
        facts. Comments are <strong>Simulated</strong>: they stay in this browser, are not shared, and revise nothing.
      </Notice>

      <div className="grid cols-3" data-testid="compare-grid">
        {MODES.map((m) => {
          const Preview = PREVIEW[m.id];
          return (
            <div key={m.id} className="stack" data-testid={`compare-${m.id}`}>
              <div className="row">
                <strong>{m.short}. {m.label}</strong>
                <span className="spacer" />
                <button className="btn small" onClick={() => { setMode(m.id); setView("dashboard"); }} data-testid={`open-${m.id}`}>Open</button>
              </div>
              <span className="small muted">{m.purpose}</span>
              <div className="preview-frame" aria-hidden="true">
                <div className="preview-inner"><Preview /></div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="card" data-testid="comments">
        <div className="card-head">
          <div className="stack" style={{ gap: 2 }}>
            <h2>Comments</h2>
            <span className="hint">Mockup-only. Stored in this browser (localStorage). Do not enter source data.</span>
          </div>
          <KindBadge kind="Simulated" />
        </div>
        <div className="card-body stack">
          <div className="row">
            <select aria-label="Mode" value={mode} onChange={(e) => setCommentMode(e.target.value as Mode)} data-testid="comment-mode">
              {MODES.map((m) => <option key={m.id} value={m.id}>{m.short}. {m.label}</option>)}
            </select>
            <select aria-label="Part of the canvas" value={part} onChange={(e) => setPart(e.target.value as (typeof PARTS)[number])} data-testid="comment-part">
              {PARTS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe the change you want (simulated)" aria-label="Comment text" data-testid="comment-text" />
          <div className="row">
            <button className="btn primary" onClick={submit} data-testid="comment-submit">{editing ? "Save comment" : "Add comment"}</button>
            {editing ? <button className="btn" onClick={() => { setEditing(null); setText(""); }}>Cancel</button> : null}
          </div>

          <div className="stack" data-testid="comment-list">
            {comments.length === 0 ? <span className="muted">No comments yet.</span> : null}
            {comments.map((c) => (
              <div className="comment" key={c.id} data-testid="comment-item">
                <div className="row">
                  <span className="badge neutral">{MODES.find((m) => m.id === c.mode)?.short}. {MODES.find((m) => m.id === c.mode)?.label}</span>
                  <span className="badge neutral">{c.part}</span>
                  {c.resolved ? <span className="badge simulated">Revision applied (simulated)</span> : null}
                  <span className="spacer" />
                  <button className="btn small" onClick={() => setComments((cs) => cs.map((x) => (x.id === c.id ? { ...x, resolved: true } : x)))} disabled={c.resolved}>Apply revision (simulated)</button>
                  <button className="btn small" onClick={() => { setEditing(c.id); setCommentMode(c.mode); setPart(c.part); setText(c.text); }}>Edit</button>
                  <button className="btn small" onClick={() => setComments((cs) => cs.filter((x) => x.id !== c.id))} data-testid="comment-delete">Delete</button>
                </div>
                <p style={{ marginTop: 6 }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
