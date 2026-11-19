import { FINDING_ORDER } from "./mockData";
import type { Activity, CategoryNotes, Division, Filters, ImprovementCategory } from "./types";

// Plain counts over the synthetic activities. No workload or business metric is computed.
// Which counts are approved for the real dashboard is Unresolved (Q-R17).

export const DEFAULT_FILTERS: Filters = {
  division: "All",
  automationManual: "All",
  category: "All",
  status: "All",
  includeUnreviewed: true,
  query: "",
};

export function applyFilters(rows: Activity[], f: Filters): Activity[] {
  const q = f.query.trim().toLowerCase();
  return rows.filter((a) => {
    if (f.division !== "All" && a.division !== f.division) return false;
    if (!f.includeUnreviewed && a.unreviewed) return false;
    if (f.automationManual === "Blank" ? a.automationManual !== null : f.automationManual !== "All" && a.automationManual !== f.automationManual)
      return false;
    if (f.category === "Blank" ? a.improvementCategory !== null : f.category !== "All" && a.improvementCategory !== f.category) return false;
    if (f.status === "Done" && !a.assessmentStatusDone) return false;
    if (f.status === "Not marked Done" && a.assessmentStatusDone) return false;
    if (q && !`${a.id} ${a.apps} ${a.activityName}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

const openFindings = (a: Activity) => a.findings.filter((x) => !x.dispositioned).length;

export function kpis(rows: Activity[]) {
  const done = rows.filter((a) => a.assessmentStatusDone);
  return {
    total: rows.length,
    done: done.length,
    doneWithOpenFindings: done.filter((a) => openFindings(a) > 0).length,
    unreviewed: rows.filter((a) => a.unreviewed).length,
    openFindings: rows.reduce((s, a) => s + openFindings(a), 0),
    openFollowUps: rows.filter((a) => a.followUp && !a.followUp.closed).length,
  };
}

export const DIVISIONS: Division[] = ["IT CFB", "IT BDC", "IT BITE"];

/** Mutually exclusive progress segments per division. "Done" is a flag, not proof of completeness. */
export function progressByDivision(rows: Activity[]) {
  return DIVISIONS.map((d) => {
    const r = rows.filter((a) => a.division === d);
    const unreviewed = r.filter((a) => a.unreviewed).length;
    const reviewed = r.filter((a) => !a.unreviewed);
    const doneOpen = reviewed.filter((a) => a.assessmentStatusDone && openFindings(a) > 0).length;
    const doneClean = reviewed.filter((a) => a.assessmentStatusDone && openFindings(a) === 0).length;
    const notDone = reviewed.filter((a) => !a.assessmentStatusDone).length;
    return { label: d, total: r.length, segments: { doneClean, doneOpen, notDone, unreviewed } };
  });
}

export const CATEGORIES: ImprovementCategory[] = ["Automation", "As Is", "Dismantled"];
export const NOTES: CategoryNotes[] = [
  "Already Automation",
  "To Be Automated",
  "Not Yet Solution",
  "Not Possible Automate",
  "Dismantled",
];

export function categoryDistribution(rows: Activity[]) {
  const scored = rows.filter((a) => !a.unreviewed);
  const out = CATEGORIES.map((c) => {
    const r = scored.filter((a) => a.improvementCategory === c);
    return {
      label: c as string,
      total: r.length,
      parts: NOTES.map((n) => ({ key: n as string, value: r.filter((a) => a.categoryNotes === n).length })).concat([
        { key: "Notes blank", value: r.filter((a) => a.categoryNotes === null).length },
      ]),
    };
  });
  const blank = scored.filter((a) => a.improvementCategory === null);
  out.push({
    label: "Blank (not yet categorized)",
    total: blank.length,
    parts: [{ key: "Blank", value: blank.length }],
  });
  return { rows: out, scoredTotal: scored.length };
}

export function automationOverview(rows: Activity[]) {
  const scored = rows.filter((a) => !a.unreviewed);
  const manual = scored.filter((a) => a.automationManual === "Manual");
  const ao = scored.filter((a) => a.automationManual === "AO");
  const matrix = (["Manual", "AO"] as const).map((am) => ({
    label: am,
    cells: [...CATEGORIES, null].map((c) => scored.filter((a) => a.automationManual === am && a.improvementCategory === c).length),
  }));
  return { manual: manual.length, ao: ao.length, matrix, total: scored.length };
}

export function qualitySummary(rows: Activity[]) {
  const all = rows.flatMap((a) => a.findings);
  return FINDING_ORDER.map((t) => {
    const f = all.filter((x) => x.type === t);
    return { type: t, open: f.filter((x) => !x.dispositioned).length, dispositioned: f.filter((x) => x.dispositioned).length };
  });
}

export function followUpSummary(rows: Activity[]) {
  const items = rows.filter((a) => a.followUp).map((a) => a.followUp!);
  const by = (who: "L1" | "Part of L2") => ({
    label: who,
    open: items.filter((x) => x.actionBy === who && !x.closed).length,
    closed: items.filter((x) => x.actionBy === who && x.closed).length,
  });
  const byDivision = DIVISIONS.map((d) => ({
    label: d as string,
    open: rows.filter((a) => a.division === d && a.followUp && !a.followUp.closed).length,
    closed: rows.filter((a) => a.division === d && a.followUp && a.followUp.closed).length,
  }));
  return { byOwner: [by("L1"), by("Part of L2")], byDivision, total: items.length };
}

export function recentActivity(rows: Activity[], n: number) {
  return [...rows].sort((a, b) => (a.lastEvent.at < b.lastEvent.at ? 1 : a.lastEvent.at > b.lastEvent.at ? -1 : a.id.localeCompare(b.id))).slice(0, n);
}

export const pct = (part: number, whole: number) => (whole === 0 ? "0%" : `${Math.round((part / whole) * 100)}%`);
