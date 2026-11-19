import type {
  Activity,
  AutomationManual,
  CategoryNotes,
  Division,
  EventType,
  Finding,
  FindingType,
  FollowUp,
  ImprovementCategory,
} from "./types";

// SYNTHETIC DATA ONLY. Generated deterministically from a fixed seed.
// Nothing here is read from, or derived from, the real workbook.

/** Fixed "now" for the mockup so rendering is deterministic (no hydration drift). */
export const MOCK_NOW = "2026-11-17T09:00:00";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261117);
const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
const chance = (p: number) => rand() < p;
function weighted<T>(entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of entries) {
    r -= w;
    if (r <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

const APPS = [
  "Core Ledger Service",
  "Payment Switch",
  "Card Authorization Gateway",
  "ATM Network Monitor",
  "Mobile Banking API",
  "Internet Banking Portal",
  "Treasury Reporting",
  "Customer Onboarding",
  "Batch Scheduler",
  "Regulatory Reporting Feed",
  "Fraud Alert Console",
  "Reconciliation Engine",
  "Branch Teller App",
  "Loan Origination",
  "Data Warehouse Loader",
] as const;

const TYPES = ["Monitoring check", "Report generation", "Data correction", "Batch run", "Housekeeping"] as const;

const ACTIVITY_TEMPLATES: Record<(typeof TYPES)[number], string[]> = {
  "Monitoring check": [
    "Check queue depth and clear stuck messages",
    "Verify end-of-day interface file arrival",
    "Review error log for failed requests",
    "Check connection pool saturation",
  ],
  "Report generation": [
    "Prepare daily transaction summary report",
    "Extract monthly volume statistics for management",
    "Generate exception list for review",
  ],
  "Data correction": [
    "Correct rejected records and resubmit",
    "Fix mismatched reference codes",
    "Reprocess failed settlement entries",
  ],
  "Batch run": [
    "Trigger and verify nightly batch chain",
    "Restart failed batch step after dependency check",
    "Validate batch completion counters",
  ],
  Housekeeping: [
    "Archive old log files",
    "Purge expired temporary data",
    "Rotate service certificates checklist",
  ],
};

const TOOLS = ["Shell script", "Grafana", "Scheduler job", "API call", "SQL script", "Not Automate"] as const;
const L1_USERS = ["L1 Analyst A", "L1 Analyst B", "L1 Analyst C", "L1 Analyst D"] as const;

const FINDING_TYPES: readonly FindingType[] = [
  "Lookup error (#N/A)",
  "Text in numeric field",
  "Category / notes mismatch",
  "Category notes spelling variant",
  "Improvement Category blank",
];

const FOLLOWUP_TEXT = [
  "Confirm script ownership with L2",
  "Provide access for scheduler change",
  "Clarify frequency with L0 team",
  "Document manual steps before handover",
  "Validate tooling option with L2",
];

function isoMinus(daysBack: number, hour: number, minute: number): string {
  // Plain arithmetic on a fixed date keeps output deterministic across locales/timezones.
  const base = Date.UTC(2026, 10, 17);
  const d = new Date(base - daysBack * 86400000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(hour)}:${p(minute)}:00`;
}

function buildActivity(i: number): Activity {
  const division: Division = weighted([["IT CFB", 54], ["IT BDC", 43], ["IT BITE", 3]] as const);
  const typeActivity = pick(TYPES);
  const apps = pick(APPS);
  const unreviewed = chance(0.08);

  let automationManual: AutomationManual | null = null;
  let improvementCategory: ImprovementCategory | null = null;
  let categoryNotes: CategoryNotes | null = null;
  let assessmentStatusDone = false;
  let toolsAutomation = "";

  if (!unreviewed) {
    automationManual = weighted([["Manual", 52], ["AO", 48]] as const);
    if (automationManual === "AO") {
      improvementCategory = weighted([["Automation", 80], ["As Is", 14], ["Dismantled", 6]] as const);
    } else {
      improvementCategory = weighted([["Automation", 26], ["As Is", 52], ["Dismantled", 22]] as const);
    }
    if (chance(0.03)) improvementCategory = null;
    if (improvementCategory === "Automation") categoryNotes = "Already Automation";
    else if (improvementCategory === "Dismantled") categoryNotes = "Dismantled";
    else if (improvementCategory === "As Is")
      categoryNotes = weighted([
        ["Not Possible Automate", 52],
        ["Not Yet Solution", 28],
        ["To Be Automated", 20],
      ] as const);
    else categoryNotes = chance(0.5) ? pick(["Not Yet Solution", "To Be Automated"] as const) : null;
    assessmentStatusDone = chance(0.76);
    toolsAutomation =
      improvementCategory === "Automation" ? pick(TOOLS.slice(0, 5)) : improvementCategory === "As Is" ? "Not Automate" : "";
  }

  const findings: Finding[] = [];
  const addFinding = (type: FindingType, p: number) => {
    if (chance(p)) findings.push({ type, dispositioned: chance(0.38) });
  };
  addFinding("Lookup error (#N/A)", 0.07);
  addFinding("Text in numeric field", 0.05);
  addFinding("Category notes spelling variant", 0.04);
  if (!unreviewed && improvementCategory === null) findings.push({ type: "Improvement Category blank", dispositioned: chance(0.2) });
  if (automationManual === "Manual" && improvementCategory === "Automation" && chance(0.12))
    findings.push({ type: "Category / notes mismatch", dispositioned: chance(0.4) });

  let followUp: FollowUp | null = null;
  if (!unreviewed && chance(0.22)) {
    followUp = {
      actionBy: weighted([["L1", 92], ["Part of L2", 8]] as const),
      closed: chance(0.35),
      description: pick(FOLLOWUP_TEXT),
    };
  }

  const eventPool: EventType[] = ["L1 edit: Improvement Category", "L1 edit: Category Notes", "L1 edit: Assessment Status"];
  if (findings.length) eventPool.push("Quality review disposition");
  if (followUp) eventPool.push(followUp.closed ? "Follow-up closed" : "Follow-up added");
  const lastEvent = {
    type: pick(eventPool),
    at: isoMinus(1 + Math.floor(rand() * 14), 8 + Math.floor(rand() * 10), Math.floor(rand() * 60)),
    by: pick(L1_USERS),
  };

  const names = ACTIVITY_TEMPLATES[typeActivity];
  return {
    id: `SYN-${String(i + 1).padStart(4, "0")}`,
    apps,
    activityName: pick(names),
    division,
    typeActivity,
    automationManual,
    improvementCategory,
    categoryNotes,
    toolsAutomation,
    assessmentStatusDone,
    unreviewed,
    findings,
    followUp,
    lastEvent,
  };
}

export const ACTIVITIES: Activity[] = Array.from({ length: 480 }, (_, i) => buildActivity(i));
export const FINDING_ORDER = FINDING_TYPES;
