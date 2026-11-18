"use client";

import { useState } from "react";
import { WORKBOOK, getVerified } from "@/lib/facts";
import { Card, KindBadge, Notice } from "../ui";

type ShareMode = "live" | "snapshot";
type Viewer = "with" | "without";

const SNAPSHOT_IDS = ["src.total_rows", "src.activity_rows", "src.link_only_rows", "src.unreviewed_rows", "src.error_cells"];

/** Simulated sharing and caching. Creates no link and stores nothing. */
export function Share() {
  const [mode, setMode] = useState<ShareMode>("live");
  const [viewer, setViewer] = useState<Viewer>("without");
  const [created, setCreated] = useState(false);
  const [snapAt, setSnapAt] = useState<string | null>(null);

  const locked = mode === "live" && viewer === "without";

  return (
    <div className="stack" style={{ gap: 16 }} data-testid="view-share">
      <Notice tone="info">
        <strong>Simulated.</strong> No real link is created. A snapshot is not saved to any database, and nobody else can
        see it. Hosting, sharing and roles are unresolved (GT-14, GT-3, Q-R12).
      </Notice>

      <div className="grid cols-2">
        <Card title="Share this dashboard" right={<KindBadge kind="Simulated" />} testId="share-card">
          <div className="stack">
            <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
              <label className="row">
                <input type="radio" name="mode" checked={mode === "live"} onChange={() => { setMode("live"); setCreated(false); }} data-testid="share-live" />
                <span><strong>Live</strong>: numbers use the connector access of whoever opens the link.</span>
              </label>
              <label className="row">
                <input type="radio" name="mode" checked={mode === "snapshot"} onChange={() => { setMode("snapshot"); setCreated(false); }} data-testid="share-snapshot" />
                <span><strong>Snapshot</strong>: a frozen copy, so teammates without access see the same numbers.</span>
              </label>
            </fieldset>

            <div className="row">
              <button
                className="btn primary"
                data-testid="share-create"
                onClick={() => {
                  setCreated(true);
                  if (mode === "snapshot") setSnapAt(new Date().toLocaleString("en-GB"));
                }}
              >
                {mode === "snapshot" ? "Save snapshot (simulated)" : "Create link (simulated)"}
              </button>
            </div>

            {created ? (
              <div className="notice" data-testid="share-result">
                <div className="mono">mockup://not-a-real-link/{mode}</div>
                <div className="small" style={{ marginTop: 4 }}>
                  {mode === "snapshot"
                    ? `Snapshot of ${WORKBOOK.fileName} (SHA-256 ${WORKBOOK.sha256.slice(0, 8)}…${WORKBOOK.sha256.slice(-4)}) frozen at ${snapAt}. Not stored.`
                    : "Nothing was created. This text is a placeholder."}
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="What a teammate sees" hint="Preview" right={<KindBadge kind="Simulated" />} testId="share-preview">
          <div className="stack">
            <div className="segmented" role="group" aria-label="Teammate access">
              <button aria-pressed={viewer === "with"} onClick={() => setViewer("with")} data-testid="viewer-with">With connector access</button>
              <button aria-pressed={viewer === "without"} onClick={() => setViewer("without")} data-testid="viewer-without">Without access</button>
            </div>
            {locked ? (
              <Notice tone="warn"><span data-testid="share-locked">Connector permission required. This teammate cannot see live numbers.</span></Notice>
            ) : (
              <table data-testid="share-numbers">
                <tbody>
                  {SNAPSHOT_IDS.map((id) => {
                    const f = getVerified(id);
                    return (
                      <tr key={id}>
                        <td>{f.label}</td>
                        <td className="num">{f.value.toLocaleString("en-US")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
