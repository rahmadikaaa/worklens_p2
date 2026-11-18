import { describe, expect, it } from "vitest";
import { getVerified } from "@/lib/facts";
import { ACTIVITY_ROWS, LINK_ONLY_ROWS, buildActivityRows } from "@/lib/rows";

describe("activity rows", () => {
  it("covers every verified row with no gap and no duplicate", () => {
    const rows = buildActivityRows();
    expect(rows.length).toBe(getVerified("src.total_rows").value);
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    expect(new Set(rows.map((r) => r.sourceRow)).size).toBe(rows.length);
  });
  it("matches the verified class and review counts", () => {
    const n = (f: (r: (typeof ACTIVITY_ROWS)[number]) => boolean) => ACTIVITY_ROWS.filter(f).length;
    expect(n((r) => r.rowClass === "activity_structured")).toBe(getVerified("src.activity_rows").value);
    expect(n((r) => r.rowClass === "link_only")).toBe(getVerified("src.link_only_rows").value);
    expect(n((r) => r.reviewState === "unreviewed")).toBe(getVerified("src.unreviewed_rows").value);
  });
  it("places link-only rows at the documented row numbers", () => {
    expect(ACTIVITY_ROWS.filter((r) => r.rowClass === "link_only").map((r) => r.sourceRow)).toEqual([...LINK_ONLY_ROWS]);
  });
  it("carries identity and no cell values", () => {
    for (const r of ACTIVITY_ROWS) expect(Object.keys(r).sort()).toEqual(["classFactId", "id", "reviewFactId", "reviewState", "rowClass", "sourceRow"]);
  });
});
