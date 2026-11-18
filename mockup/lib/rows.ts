/**
 * Structural record for every source data row. Derived only from verified row ranges in
 * `facts.ts` (docs/SOURCE_OF_TRUTH.md). The workbook is not opened, so a record carries
 * identity and classification only. No cell values exist here (gate G10).
 */
import { getVerified } from "./facts";

export type RowClass = "activity_structured" | "link_only";
export type ReviewState = "unreviewed" | "outside_unreviewed_block" | "not_applicable";

export interface ActivityRow {
  /** Stable row identity: sheet slug plus Excel row number. */
  id: string;
  /** Excel row number in the source sheet. */
  sourceRow: number;
  rowClass: RowClass;
  reviewState: ReviewState;
  /** Fact that audits the row class count. */
  classFactId: string;
  /** Fact that audits the review state count. */
  reviewFactId: string;
}

/** Row numbers from `src.link_only_rows` (SOURCE_OF_TRUTH §3). */
export const LINK_ONLY_ROWS = [3526, 3535, 3537, 3538, 3539, 3540] as const;
const ACTIVITY_FIRST = 2;
const ACTIVITY_LAST = 3490;
const UNREVIEWED_FIRST = 3239;

export function buildActivityRows(): ActivityRow[] {
  const rows: ActivityRow[] = [];
  for (let n = ACTIVITY_FIRST; n <= ACTIVITY_LAST; n++) {
    const unreviewed = n >= UNREVIEWED_FIRST;
    rows.push({
      id: `breakdown-activity:r${n}`,
      sourceRow: n,
      rowClass: "activity_structured",
      reviewState: unreviewed ? "unreviewed" : "outside_unreviewed_block",
      classFactId: "src.activity_rows",
      reviewFactId: unreviewed ? "src.unreviewed_rows" : "src.activity_rows",
    });
  }
  for (const n of LINK_ONLY_ROWS) {
    rows.push({
      id: `breakdown-activity:r${n}`,
      sourceRow: n,
      rowClass: "link_only",
      reviewState: "not_applicable",
      classFactId: "src.link_only_rows",
      reviewFactId: "src.link_only_rows",
    });
  }
  return rows;
}

export const ACTIVITY_ROWS: ActivityRow[] = buildActivityRows();

// Fail loudly if the ranges above drift from the verified counts.
if (ACTIVITY_ROWS.length !== getVerified("src.total_rows").value) throw new Error("Derived rows disagree with src.total_rows");
