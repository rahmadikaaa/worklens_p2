import type { ReactNode } from "react";

export interface Series {
  key: string;
  label: string;
  color: string;
}

export function Legend({ series }: { series: Series[] }) {
  return (
    <ul className="legend">
      {series.map((s) => (
        <li key={s.key}>
          <span className="swatch" style={{ background: s.color }} />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

export interface BarRow {
  label: string;
  sub?: string;
  values: Record<string, number>;
}

/** Horizontal stacked bars. `scaleMax` shares one scale across rows; 0 means each row fills 100%. */
export function StackedBars({
  rows,
  series,
  scaleMax,
  ariaLabel,
}: {
  rows: BarRow[];
  series: Series[];
  scaleMax?: number;
  ariaLabel: string;
}) {
  return (
    <div className="sbars" role="img" aria-label={ariaLabel}>
      {rows.map((r) => {
        const total = series.reduce((s, x) => s + (r.values[x.key] ?? 0), 0);
        const denom = scaleMax && scaleMax > 0 ? scaleMax : total || 1;
        return (
          <div className="sbar-row" key={r.label}>
            <div className="sbar-label">
              <span>{r.label}</span>
              {r.sub && <small>{r.sub}</small>}
            </div>
            <div className="sbar-track">
              {series.map((s) => {
                const v = r.values[s.key] ?? 0;
                if (v === 0) return null;
                return (
                  <div
                    key={s.key}
                    className="sbar-seg"
                    style={{ width: `${(v / denom) * 100}%`, background: s.color }}
                    title={`${r.label} · ${s.label}: ${v}`}
                  >
                    {(v / denom) * 100 > 9 ? v : ""}
                  </div>
                );
              })}
            </div>
            <div className="sbar-total">{total}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Donut({
  parts,
  centerValue,
  centerLabel,
  ariaLabel,
}: {
  parts: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
  ariaLabel: string;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" className="donut" role="img" aria-label={ariaLabel}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--track)" strokeWidth="18" />
        {total > 0 &&
          parts.map((p) => {
            const len = (p.value / total) * c;
            const el = (
              <circle
                key={p.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={p.color}
                strokeWidth="18"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              >
                <title>{`${p.label}: ${p.value}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        <text x="70" y="68" textAnchor="middle" className="donut-value">
          {centerValue}
        </text>
        <text x="70" y="86" textAnchor="middle" className="donut-label">
          {centerLabel}
        </text>
      </svg>
      <ul className="donut-legend">
        {parts.map((p) => (
          <li key={p.label}>
            <span className="swatch" style={{ background: p.color }} />
            <span className="dl-name">{p.label}</span>
            <span className="dl-val">
              {p.value} <small>{total ? Math.round((p.value / total) * 100) : 0}%</small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Card({
  title,
  subtitle,
  basis,
  children,
  className = "",
  right,
}: {
  title: string;
  subtitle?: string;
  /** Which source fields / value kinds the card's counts are based on. */
  basis?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <section className={`card ${className}`}>
      <header className="card-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        {right}
      </header>
      <div className="card-body">{children}</div>
      {basis && (
        <footer className="card-foot">
          <span className="dummy-tag">Dummy data</span> {basis}
        </footer>
      )}
    </section>
  );
}
