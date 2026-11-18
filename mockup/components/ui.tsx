"use client";

import type { ReactNode } from "react";
import { useApp } from "@/lib/app-state";
import { KIND_MEANING, type CapabilityKind } from "@/lib/capabilities";
import { formatValue, getFact, type Fact } from "@/lib/facts";

export function KindBadge({ kind }: { kind: CapabilityKind }) {
  return (
    <span className={`badge ${kind.toLowerCase()}`} title={KIND_MEANING[kind]} data-kind={kind}>
      {kind}
    </span>
  );
}

export function StatusBadge({ status }: { status: Fact["status"] }) {
  return status === "verified" ? (
    <span className="badge verified" data-status="verified" title="Verified in Phase 1 and recorded in the repository documents">
      Verified
    </span>
  ) : (
    <span className="badge pending" data-status="pending-approval" title="No approved definition. No value is shown.">
      Pending approval
    </span>
  );
}

export function Card({
  title,
  hint,
  right,
  children,
  testId,
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section className="card" data-testid={testId}>
      <div className="card-head">
        <div className="stack" style={{ gap: 2 }}>
          <h2>{title}</h2>
          {hint ? <span className="hint">{hint}</span> : null}
        </div>
        {right}
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}

/** Clickable metric. Opens the shared audit drawer. Pending metrics never show a number. */
export function MetricCard({ factId, compact = false, label }: { factId: string; compact?: boolean; label?: string }) {
  const { openAudit } = useApp();
  const f = getFact(factId);
  const pending = f.status === "pending-approval";
  return (
    <button
      type="button"
      className={`metric${pending ? " pending" : ""}${compact ? " compact" : ""}`}
      data-testid={`metric-${f.id}`}
      data-fact-id={f.id}
      onClick={() => openAudit(f.id)}
      aria-label={`${label ?? f.label}: ${formatValue(f)}. Open audit.`}
    >
      <span className="m-label">{label ?? f.label}</span>
      <span className={`m-value${pending ? " pending" : ""}`}>
        {formatValue(f)}
        {!pending && f.unit ? <span className="faint small" style={{ fontWeight: 400 }}> {f.unit}</span> : null}
      </span>
      <span className="m-foot">
        <StatusBadge status={f.status} />
        <span>Audit ›</span>
      </span>
    </button>
  );
}

export function Legend() {
  return (
    <div className="legend-bar" data-testid="legend" aria-label="Capability legend">
      <strong style={{ color: "var(--text)" }}>Legend</strong>
      <span><KindBadge kind="Demo" /> works on verified counts</span>
      <span><KindBadge kind="Simulated" /> faked in the browser</span>
      <span><KindBadge kind="Future" /> not built, not approved</span>
      <span><StatusBadge status="verified" /> <StatusBadge status="pending-approval" /> metric state</span>
    </div>
  );
}

export function Notice({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "warn" | "info" }) {
  return <div className={`notice${tone === "plain" ? "" : ` ${tone}`}`}>{children}</div>;
}
