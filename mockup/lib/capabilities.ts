export type CapabilityKind = "Demo" | "Simulated" | "Future";

export const KIND_MEANING: Record<CapabilityKind, string> = {
  Demo: "Works in this mockup on the verified structural counts.",
  Simulated: "The interaction is faked in the browser. Nothing real happens.",
  Future: "Not built and not approved. Shown only to indicate direction.",
};

export interface Capability {
  id: string;
  name: string;
  kind: CapabilityKind;
  /** What the mockup does. */
  behavior: string;
  /** What it does not do. */
  limits: string;
  /** Gates or decisions that apply. */
  gates: string;
  view: "dashboard" | "compare" | "sources" | "share" | "routines";
}

export const CAPABILITIES: Capability[] = [
  {
    id: "cap.refresh",
    name: "Live Data Refresh & Connector Permission",
    kind: "Simulated",
    behavior: "A consent popup opens with the dashboard. Approving runs a simulated refresh.",
    limits: "No network call, no data pulled. Consent does not authorize any real access.",
    gates: "GT-4 (configured local path only), GT-3, GT-14",
    view: "dashboard",
  },
  {
    id: "cap.audit",
    name: "Click-to-Audit",
    kind: "Demo",
    behavior: "Metrics open a provenance drawer with source, rows, definition and proposed SQL.",
    limits: "SQL is illustrative and never executed. No workbook cell values are shown.",
    gates: "G10 (no real values), design in RAW_DATA_AND_PROVENANCE.md",
    view: "dashboard",
  },
  {
    id: "cap.storage",
    name: "Internal Database & File Storage",
    kind: "Future",
    behavior: "A panel shows the intended internal store and file support as disabled.",
    limits: "No database is provisioned. No file upload exists. Capacity figures are not WorkLens requirements.",
    gates: "GT-2 (provisioning not authorized), GT-4 (no upload endpoint)",
    view: "sources",
  },
  {
    id: "cap.connectors",
    name: "Data Warehouse & SQL Connectors",
    kind: "Future",
    behavior: "A catalog lists warehouse connectors, CSV upload and a SQL editor, all disabled.",
    limits: "No connector exists. The configured Excel path is the only approved source.",
    gates: "GT-4, GT-14, new decision required",
    view: "sources",
  },
  {
    id: "cap.canvas",
    name: "Live Artifact Canvas & Comment Revision",
    kind: "Simulated",
    behavior: "Compare the three modes side by side and add comments to a part of the canvas.",
    limits: "Comparison works. Comments are mockup-only, kept in this browser, and revise nothing.",
    gates: "Q-R11 (Management comments undecided)",
    view: "compare",
  },
  {
    id: "cap.share",
    name: "Team Sharing & Data Caching",
    kind: "Simulated",
    behavior: "Choose live or snapshot mode and preview what a teammate would see.",
    limits: "No real link is created. A snapshot is not stored anywhere.",
    gates: "GT-3, GT-14, Q-R12",
    view: "share",
  },
  {
    id: "cap.routines",
    name: "Scheduled Cloud Routines",
    kind: "Future",
    behavior: "A disabled schedule panel and a static example insight built from verified counts.",
    limits: "Nothing is scheduled or executed. The insight is static text, not AI output.",
    gates: "Phase 9, GT-13, Q-T2, GT-14",
    view: "routines",
  },
];
