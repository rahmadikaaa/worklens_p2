"use client";

import { Card, KindBadge, Notice } from "../ui";
import { InsightBlock } from "../shared";

/** Future routine panel. Nothing is scheduled or executed. */
export function Routines() {
  return (
    <div className="stack" style={{ gap: 16 }} data-testid="view-routines">
      <Notice tone="warn">
        <strong>Future.</strong> No routine runs, and nothing is scheduled. Business AI agents belong to Phase 9 and need
        Q-T2, GT-13 and approved definitions first.
      </Notice>

      <Card title="Daily refresh routine" hint="Example of the intended behavior" right={<KindBadge kind="Future" />} testId="routine-card">
        <div className="stack">
          <dl className="kv">
            <dt>Schedule</dt><dd><input type="text" value="Every day at 07:00" readOnly disabled aria-label="Schedule (disabled)" /></dd>
            <dt>Step 1</dt><dd>Refresh the internal store from the configured source</dd>
            <dt>Step 2</dt><dd>Analyze the previous day and update the insight block</dd>
            <dt>State</dt><dd><span className="badge future">Not scheduled</span></dd>
            <dt>Where it would run</dt><dd>Unresolved. Hosting is not selected (GT-14).</dd>
          </dl>
          <div className="row">
            <button className="btn" disabled>Schedule routine</button>
            <button className="btn" disabled>Run now</button>
          </div>
        </div>
      </Card>

      <div className="stack">
        <h3>Example insight block</h3>
        <InsightBlock />
      </div>
    </div>
  );
}
