// Types for the Dashboard mockup. Field names follow docs/DATA_DICTIONARY.md and
// docs/DOMAIN_MODEL.md. Everything here describes SYNTHETIC data only.

export type Division = "IT CFB" | "IT BDC" | "IT BITE";
export type AutomationManual = "Manual" | "AO";
export type ImprovementCategory = "Automation" | "As Is" | "Dismantled";
export type CategoryNotes =
  | "Already Automation"
  | "To Be Automated"
  | "Not Yet Solution"
  | "Not Possible Automate"
  | "Dismantled";

/** Value kinds from DOMAIN_MODEL.md section 4. */
export type ValueKind =
  | "entered"
  | "workbook_derived_cached"
  | "l1_authored"
  | "worklens_derived"
  | "ai_generated";

export type FindingType =
  | "Lookup error (#N/A)"
  | "Text in numeric field"
  | "Category / notes mismatch"
  | "Category notes spelling variant"
  | "Improvement Category blank";

export interface Finding {
  type: FindingType;
  /** The disposition state catalog is Unresolved (Q-R9 family); only open vs dispositioned is shown. */
  dispositioned: boolean;
}

export interface FollowUp {
  actionBy: "L1" | "Part of L2";
  /** Status catalog is Unresolved (Q-R18); only open vs closed is shown. */
  closed: boolean;
  description: string;
}

export type EventType =
  | "L1 edit: Improvement Category"
  | "L1 edit: Category Notes"
  | "L1 edit: Assessment Status"
  | "Quality review disposition"
  | "Follow-up added"
  | "Follow-up closed";

export interface Activity {
  /** Synthetic id. Not a workbook row number. */
  id: string;
  apps: string;
  activityName: string;
  division: Division;
  typeActivity: string;
  automationManual: AutomationManual | null;
  improvementCategory: ImprovementCategory | null;
  categoryNotes: CategoryNotes | null;
  toolsAutomation: string;
  assessmentStatusDone: boolean;
  /** Row class flag (Confirmed Q-S4). A property of classification, not a validity flag. */
  unreviewed: boolean;
  findings: Finding[];
  followUp: FollowUp | null;
  lastEvent: { type: EventType; at: string; by: string };
}

export interface Filters {
  division: Division | "All";
  automationManual: AutomationManual | "All" | "Blank";
  category: ImprovementCategory | "All" | "Blank";
  status: "All" | "Done" | "Not marked Done";
  includeUnreviewed: boolean;
  query: string;
}
