"use client";

import { Card, MetricCard } from "../ui";
import {
  ErrorDistribution,
  InsightBlock,
  IntegrityChecks,
  PendingNote,
  RegionTable,
  RowComposition,
  SourceIntegrityCard,
} from "../shared";

/** Layout A. Traceability first: counts, integrity checks, source identity, then rows. */
export function AuditFirst() {
  return (
    <div className="stack" style={{ gap: 16 }} data-testid="mode-audit">
      <InsightBlock />

      <div className="grid cols-4" data-testid="kpi-summary">
        <MetricCard factId="src.total_rows" />
        <MetricCard factId="src.activity_rows" />
        <MetricCard factId="src.link_only_rows" />
        <MetricCard factId="src.unreviewed_rows" />
        <MetricCard factId="src.error_cells" />
        <MetricCard factId="src.error_rows" />
        <MetricCard factId="src.columns" />
        <MetricCard factId="src.sheets" />
      </div>

      <div className="grid split">
        <Card title="Data integrity overview" hint="How the verified counts relate. Click any item to audit it." testId="integrity-overview">
          <div className="stack" style={{ gap: 16 }}>
            <RowComposition />
            <IntegrityChecks />
          </div>
        </Card>
        <SourceIntegrityCard />
      </div>

      <Card title="Error distribution" hint="Error cells (#N/A) by source column. Click a bar to audit the count.">
        <ErrorDistribution />
      </Card>

      <RegionTable />

      <Card title="Metrics pending approval" hint="Shown so the gap is visible. No value exists.">
        <div className="stack">
          <div className="grid cols-3">
            <MetricCard factId="wl.workload" compact />
            <MetricCard factId="wl.saving" compact />
            <MetricCard factId="rv.reviewed" compact />
          </div>
          <PendingNote />
        </div>
      </Card>
    </div>
  );
}
