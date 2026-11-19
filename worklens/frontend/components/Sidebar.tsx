"use client";

const NAV: { label: string; icon: string; active?: boolean; note?: string }[] = [
  { label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z", active: true },
  { label: "Assessment Workspace", icon: "M4 4h16v4H4zM4 10h16v4H4zM4 16h10v4H4z", note: "L1 edits" },
  { label: "Quality Review", icon: "M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6z" },
  { label: "Follow-up", icon: "M5 3h14v2H5zM5 7h14v2H5zM5 11h9v2H5zM5 15h14v2H5zM5 19h9v2H5z" },
  { label: "Enriched CSV", icon: "M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z", note: "Gated" },
  { label: "Assessment Report", icon: "M6 2h9l5 5v15H6V2zm8 1.5V8h4.5L14 3.5zM8 12h8v1.5H8V12zm0 3h8v1.5H8V15z", note: "Gated" },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div className={`scrim ${open ? "show" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Application navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            W
          </div>
          <div>
            <strong>WorkLens</strong>
            <small>Workforce &amp; Automation Intelligence</small>
          </div>
        </div>
        <nav>
          <p className="nav-section">Management view</p>
          <ul>
            {NAV.map((n) => (
              <li key={n.label}>
                <a
                  href="#"
                  className={n.active ? "active" : "disabled"}
                  aria-current={n.active ? "page" : undefined}
                  aria-disabled={n.active ? undefined : true}
                  onClick={(e) => e.preventDefault()}
                  title={n.active ? undefined : "Not part of this mockup"}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={n.icon} />
                  </svg>
                  <span>{n.label}</span>
                  {n.note && <em>{n.note}</em>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-foot">
          <div className="user">
            <div className="avatar" aria-hidden="true">
              M
            </div>
            <div>
              <strong>Management user</strong>
              <small>Read-only: summary and drill-down</small>
            </div>
          </div>
          <p className="muted tiny">Only the Dashboard exists in this mockup. Other items are placeholders for later review.</p>
        </div>
      </aside>
    </>
  );
}
