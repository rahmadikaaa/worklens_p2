/**
 * Single typed data foundation for all three dashboard modes.
 *
 * Every figure here is a verified Phase 1 structural count copied from the repository
 * documents named in `sourceDoc`. Nothing is read from the workbook. Unapproved business
 * metrics are declared with `status: "pending-approval"` and a `null` value, which the
 * type system enforces.
 */

export const WORKBOOK = {
  fileName: "SOP L1 AGIT.xlsx",
  sha256: "AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092",
  sheet: "Breakdown Activity",
  approvalRef: "docs/DECISIONS/0004-source-of-truth-decisions.md",
  headerRow: 1,
  columnRange: "A–AJ",
  excludedRange: "AL:BI (rows 2–149), manifest-only (GT-4)",
} as const;

export type FactStatus = "verified" | "pending-approval";

interface FactBase {
  /** Stable identifier. */
  id: string;
  label: string;
  unit?: string;
  /** Repository document the figure comes from. */
  sourceDoc: string;
  /** Section or reference inside that document. */
  sourceRef: string;
  /** Counting or calculation definition, in words. */
  definition: string;
  /** Source row range, where applicable. */
  rowRange?: string;
  /** Transformation information, where applicable. */
  transformation?: string;
  /** Illustrative proposed SQL. Never executed. Table names follow DATABASE_SCHEMA_PROPOSAL.md. */
  proposedSql?: string;
}

export interface VerifiedFact extends FactBase {
  status: "verified";
  value: number;
}

export interface PendingFact extends FactBase {
  status: "pending-approval";
  value: null;
  /** Decision or question that blocks approval. */
  blockedBy: string;
}

export type Fact = VerifiedFact | PendingFact;

const SOT = "docs/SOURCE_OF_TRUTH.md";
const SHEET_FILTER = `s.sheet_name = '${WORKBOOK.sheet}'`;

export const VERIFIED_FACTS: VerifiedFact[] = [
  {
    id: "src.total_rows",
    label: "Total source rows",
    value: 3495,
    unit: "rows",
    status: "verified",
    sourceDoc: SOT,
    sourceRef: "§4 Row and column counts",
    definition: "Rows with any value in the sheet, excluding the header row.",
    rowRange: "2–3540 (44 row numbers are absent)",
    transformation: "None. Count of rows as read in Phase 1; raw values are not altered.",
    proposedSql: `SELECT count(*)
FROM raw.raw_row r
JOIN raw.source_sheet s ON s.id = r.source_sheet_id
WHERE ${SHEET_FILTER} AND NOT r.is_header;`,
  },
  {
    id: "src.activity_rows",
    label: "Structured activity rows",
    value: 3489,
    unit: "rows",
    status: "verified",
    sourceDoc: SOT,
    sourceRef: "§7 Row classes (Q-S3)",
    definition: "Rows with the activity structure. Excludes the 6 link-only rows.",
    rowRange: "2–3490",
    transformation: "Row classification rule `activity_structured` (proposed, Phase 3).",
    proposedSql: `SELECT count(*)
FROM domain.row_classification c
WHERE c.row_class = 'activity_structured'
  AND c.classification_run_id = :run_id;`,
  },
  {
    id: "src.link_only_rows",
    label: "Link-only rows",
    value: 6,
    unit: "rows",
    status: "verified",
    sourceDoc: SOT,
    sourceRef: "§3 and §7 (Q-S3)",
    definition: "Rows whose only value is in column I (Link Confluence). Not activity records.",
    rowRange: "3526, 3535, 3537–3540",
    transformation: "Row classification rule `link_only` (proposed, Phase 3).",
    proposedSql: `SELECT count(*)
FROM domain.row_classification c
WHERE c.row_class = 'link_only'
  AND c.classification_run_id = :run_id;`,
  },
  {
    id: "src.unreviewed_rows",
    label: "Unreviewed rows",
    value: 252,
    unit: "rows",
    status: "verified",
    sourceDoc: SOT,
    sourceRef: "§5 finding 1 (Q-S4)",
    definition:
      "Rows with no value in Automation/Manual (P) and Status (T). Preserved, marked unreviewed, and kept out of approved business assessments.",
    rowRange: "3239–3490",
    transformation: "Review state `unreviewed` (proposed, Phase 3).",
    proposedSql: `SELECT count(*)
FROM domain.row_classification c
WHERE c.review_state = 'unreviewed'
  AND c.classification_run_id = :run_id;`,
  },
  {
    id: "src.error_cells",
    label: "Error cells",
    value: 232,
    unit: "cells",
    status: "verified",
    sourceDoc: "docs/DECISIONS/0005-technology-stack.md",
    sourceRef: "Spike result, error cells by column",
    definition: "Cells whose type is error (#N/A). They count as non-blank and stay inspectable.",
    rowRange: "Spread across columns A, C, E, Q, R, S, T, U",
    transformation: "None. Error cells are exposed with cell type `e` and kept as read.",
    proposedSql: `SELECT count(*)
FROM raw.raw_cell c
JOIN raw.raw_row r ON r.id = c.raw_row_id
WHERE c.cell_type = 'error' AND NOT r.is_header;`,
  },
  {
    id: "src.error_rows",
    label: "Rows containing errors",
    value: 108,
    unit: "rows",
    status: "verified",
    sourceDoc: "docs/PHASE2_PROPOSAL.md",
    sourceRef: "Test strategy, golden checks (108 #N/A rows)",
    definition: "Distinct rows with at least one error cell.",
    rowRange: "Not contiguous. Row numbers are not listed in this mockup.",
    transformation: "None.",
    proposedSql: `SELECT count(DISTINCT c.raw_row_id)
FROM raw.raw_cell c
JOIN raw.raw_row r ON r.id = c.raw_row_id
WHERE c.cell_type = 'error' AND NOT r.is_header;`,
  },
  {
    id: "src.columns",
    label: "Source columns",
    value: 36,
    unit: "columns",
    status: "verified",
    sourceDoc: SOT,
    sourceRef: "§4 Header columns",
    definition: "Header columns A–AJ, no duplicate names and no blank header.",
    rowRange: "Header row 1",
    transformation: "None.",
    proposedSql: `SELECT count(DISTINCT c.col_index)
FROM raw.raw_cell c
JOIN raw.raw_row r ON r.id = c.raw_row_id
WHERE r.is_header;`,
  },
  {
    id: "src.sheets",
    label: "Workbook sheets",
    value: 21,
    unit: "sheets",
    status: "verified",
    sourceDoc: "docs/PHASE1_ACCEPTANCE_REPORT.md",
    sourceRef: "Integrity and sheets",
    definition:
      "Sheets in the workbook. Only `Breakdown Activity` is the data baseline; the other sheets are not ingested.",
    transformation: "None. Workbook structure metadata from Phase 1 verification. No SQL is proposed.",
  },
];

/** Error cells per source column, from the Phase 1 spike (0005). Header names from DATA_DICTIONARY.md. */
const ERROR_COLUMNS = [
  { col: "A", header: "DIV", cells: 5 },
  { col: "C", header: "DEPT", cells: 5 },
  { col: "E", header: "APP PRIORITY", cells: 48 },
  { col: "Q", header: "FMC/Mobile", cells: 7 },
  { col: "R", header: "Team QC", cells: 5 },
  { col: "S", header: "SOP Name", cells: 31 },
  { col: "T", header: "Status", cells: 62 },
  { col: "U", header: "Status (Old)", cells: 69 },
] as const;

export const ERROR_COLUMN_FACTS: (VerifiedFact & { col: string; header: string })[] = ERROR_COLUMNS.map(
  (e) => ({
    id: `err.col.${e.col}`,
    col: e.col,
    header: e.header,
    label: `Error cells in column ${e.col} (${e.header})`,
    value: e.cells,
    unit: "cells",
    status: "verified" as const,
    sourceDoc: "docs/DECISIONS/0005-technology-stack.md",
    sourceRef: "Spike result, error cells by column; header from docs/DATA_DICTIONARY.md §4",
    definition: `Error cells (#N/A) in column ${e.col}, header "${e.header}".`,
    rowRange: "Not listed. Row numbers require reading source cells (gate G10).",
    transformation: "None.",
    proposedSql: `SELECT count(*)
FROM raw.raw_cell c
JOIN raw.raw_row r ON r.id = c.raw_row_id
WHERE c.cell_type = 'error' AND c.col_letter = '${e.col}' AND NOT r.is_header;`,
  }),
);

const PENDING = (
  id: string,
  label: string,
  blockedBy: string,
  sourceDoc: string,
  sourceRef: string,
  definition: string,
): PendingFact => ({
  id,
  label,
  value: null,
  status: "pending-approval",
  blockedBy,
  sourceDoc,
  sourceRef,
  definition,
  transformation: "Not defined. No calculation exists until the owner approves a definition.",
});

export const PENDING_FACTS: PendingFact[] = [
  PENDING(
    "wl.workload",
    "Workload",
    "Calculation gate (AGENTS.md), GT-12, Q-B7, Q-B8, Q-R3",
    "docs/METRIC_DEFINITION_WORKSHOP.md",
    "Workload definition checklist",
    "Reference statement only: Durasi (Menit) × Event Per Month. Not approved. No value is shown.",
  ),
  PENDING(
    "wl.saving",
    "Workload saving",
    "GT-12, Q-R2 (the saving formula is outside this repository)",
    "docs/REQUIREMENTS_RECONCILIATION_Q1_Q51.md",
    "Q39–Q41, C-04 to C-07",
    "No approved definition. The static 10% assumption is not a measured saving.",
  ),
  PENDING(
    "as.completion",
    "Assessment completion",
    "GT-11, Q-R9, Q-R17 (state list and criteria)",
    "docs/DATA_DICTIONARY.md",
    "§4.4 column Y, Assessment Status",
    "Column exists in the source. Its meaning and completion criteria are not approved.",
  ),
  PENDING(
    "as.categories",
    "Improvement category overview",
    "GT-8, GT-11, Q-R5, Q-R17",
    "docs/DATA_DICTIONARY.md",
    "§4.4 columns W, Z, AD",
    "Counts on business fields may need approved definitions (Q-R17).",
  ),
  PENDING(
    "au.overview",
    "Automation overview",
    "GT-11, Q-R6, Q-R17",
    "docs/DATA_DICTIONARY.md",
    "§4.3 column P, Automation/Manual",
    "Whether the label covers non-AO automation is unresolved (Q-R6).",
  ),
  PENDING(
    "fu.overview",
    "Follow-up overview",
    "GT-8, Q-R18 (follow-up data model deferred)",
    "docs/REQUIREMENTS_RECONCILIATION_Q1_Q51.md",
    "Q42–Q44, deferred G.3",
    "The follow-up data model is not designed. No value is shown.",
  ),
  PENDING(
    "rv.reviewed",
    "Reviewed activity count",
    "GT-11, Q-R17; eligibility rules do not exist yet",
    "docs/DECISIONS/0004-source-of-truth-decisions.md",
    "Q-S4",
    "Only the unreviewed block is verified. A reviewed count needs an approved eligibility rule.",
  ),
];

export const ALL_FACTS: Fact[] = [...VERIFIED_FACTS, ...ERROR_COLUMN_FACTS, ...PENDING_FACTS];

const BY_ID = new Map<string, Fact>(ALL_FACTS.map((f) => [f.id, f]));

export function getFact(id: string): Fact {
  const f = BY_ID.get(id);
  if (!f) throw new Error(`Unknown fact id: ${id}`);
  return f;
}

export function getVerified(id: string): VerifiedFact {
  const f = getFact(id);
  if (f.status !== "verified") throw new Error(`Fact ${id} is not verified`);
  return f;
}

export function formatValue(f: Fact): string {
  return f.value === null ? "Pending approval" : f.value.toLocaleString("en-US");
}

/** Structural row regions used by the activity and investigation tables. */
export interface Region {
  id: string;
  label: string;
  excelRows: string;
  factId: string;
  rowClass: "activity_structured" | "link_only" | "any";
  state: string;
  note: string;
}

export const REGIONS: Region[] = [
  {
    id: "reg.activity",
    label: "Activity-structured rows",
    excelRows: "2–3490",
    factId: "src.activity_rows",
    rowClass: "activity_structured",
    state: "Included",
    note: "Rows with the activity structure.",
  },
  {
    id: "reg.unreviewed",
    label: "Unreviewed block",
    excelRows: "3239–3490",
    factId: "src.unreviewed_rows",
    rowClass: "activity_structured",
    state: "Unreviewed",
    note: "Subset of the activity-structured rows (Q-S4). Kept out of approved assessments.",
  },
  {
    id: "reg.linkonly",
    label: "Link-only rows",
    excelRows: "3526, 3535, 3537–3540",
    factId: "src.link_only_rows",
    rowClass: "link_only",
    state: "Not an activity record",
    note: "Only column I (Link Confluence) has a value (Q-S3).",
  },
  {
    id: "reg.errors",
    label: "Rows containing error cells",
    excelRows: "Not contiguous",
    factId: "src.error_rows",
    rowClass: "any",
    state: "Contains #N/A",
    note: "Row numbers are not listed here (gate G10).",
  },
  {
    id: "reg.total",
    label: "All data rows",
    excelRows: "2–3540",
    factId: "src.total_rows",
    rowClass: "any",
    state: "Source total",
    note: "Activity-structured plus link-only.",
  },
];

/** Static, illustrative insight text built only from verified facts. Not AI output. */
export function buildInsightText(): string {
  const v = (id: string) => getVerified(id).value.toLocaleString("en-US");
  const worst = [...ERROR_COLUMN_FACTS].sort((a, b) => b.value - a.value)[0];
  if (!worst) throw new Error("No error columns");
  return (
    `The sheet holds ${v("src.total_rows")} data rows: ${v("src.activity_rows")} activity-structured and ` +
    `${v("src.link_only_rows")} link-only. ${v("src.unreviewed_rows")} rows are unreviewed. ` +
    `${v("src.error_cells")} error cells sit in ${v("src.error_rows")} rows; column ${worst.col} ` +
    `(${worst.header}) has the most, ${worst.value}.`
  );
}
