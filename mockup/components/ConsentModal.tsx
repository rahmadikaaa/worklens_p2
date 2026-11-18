"use client";

import { REFRESH_STEPS, useApp } from "@/lib/app-state";
import { WORKBOOK } from "@/lib/facts";
import { KindBadge, Notice } from "./ui";

/** Simulated connector consent. Opens with the dashboard. Grants no access and makes no network call. */
export function ConsentModal() {
  const { consent, setConsent, startRefresh } = useApp();
  if (consent !== "pending") return null;
  return (
    <>
      <div className="scrim" style={{ zIndex: 65 }} />
      <div className="modal" role="dialog" aria-modal="true" aria-label="Connector permission" data-testid="consent-modal">
        <div className="modal-head stack" style={{ gap: 6 }}>
          <div className="row">
            <h2 style={{ fontSize: 17 }}>Connector permission</h2>
            <KindBadge kind="Simulated" />
          </div>
          <span className="muted">WorkLens would like to refresh this dashboard from its configured source.</span>
        </div>
        <div className="modal-body">
          <table>
            <thead><tr><th>Connector</th><th>Access</th><th>State</th></tr></thead>
            <tbody>
              <tr>
                <td>
                  Excel workbook
                  <div className="small muted mono">{WORKBOOK.fileName}</div>
                </td>
                <td>Read-only, configured local path (GT-4)</td>
                <td><span className="badge simulated">Simulated</span></td>
              </tr>
              <tr>
                <td>Data warehouses and SQL</td>
                <td>Not offered</td>
                <td><span className="badge future">Future</span></td>
              </tr>
            </tbody>
          </table>
          <div className="stack" style={{ gap: 2 }}>
            {REFRESH_STEPS.map((s) => (
              <div className="step" key={s}><span className="dot" />{s}</div>
            ))}
          </div>
          <Notice tone="info">
            This is a mockup. Approving does not open a file, contact a service, or authorize any real access.
          </Notice>
        </div>
        <div className="modal-foot">
          <button className="btn" data-testid="consent-deny" onClick={() => setConsent("denied")}>Deny</button>
          <button
            className="btn primary"
            data-testid="consent-approve"
            onClick={() => {
              setConsent("granted");
              startRefresh();
            }}
          >
            Approve and refresh (simulated)
          </button>
        </div>
      </div>
    </>
  );
}

/** Header strip showing the simulated refresh state. */
export function RefreshStatus() {
  const { consent, setConsent, refresh, startRefresh } = useApp();
  if (consent === "pending") return null;
  return (
    <div className="row" data-testid="refresh-status">
      {consent === "denied" ? (
        <>
          <span className="badge danger">Connector access denied (simulated)</span>
          <button className="btn small" onClick={() => setConsent("pending")}>Review permission</button>
        </>
      ) : (
        <>
          <span className="badge simulated">
            {refresh.status === "running"
              ? `Refreshing… step ${refresh.step}/${REFRESH_STEPS.length}`
              : refresh.lastAt
                ? `Refreshed ${refresh.lastAt} (simulated)`
                : "Granted (simulated)"}
          </span>
          <button className="btn small" data-testid="refresh-btn" disabled={refresh.status === "running"} onClick={startRefresh}>
            Refresh
          </button>
        </>
      )}
    </div>
  );
}
