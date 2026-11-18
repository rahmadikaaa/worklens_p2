import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  ALL_FACTS,
  ERROR_COLUMN_FACTS,
  PENDING_FACTS,
  REGIONS,
  VERIFIED_FACTS,
  WORKBOOK,
  buildInsightText,
  getFact,
  getVerified,
} from "@/lib/facts";

const repoRoot = path.resolve(__dirname, "..", "..", "..");

describe("verified Phase 1 structural counts", () => {
  const expected: Record<string, number> = {
    "src.total_rows": 3495,
    "src.activity_rows": 3489,
    "src.link_only_rows": 6,
    "src.unreviewed_rows": 252,
    "src.error_cells": 232,
    "src.error_rows": 108,
    "src.columns": 36,
    "src.sheets": 21,
  };

  it.each(Object.entries(expected))("%s equals %d", (id, value) => {
    expect(getVerified(id).value).toBe(value);
  });

  it("contains exactly the approved verified structural facts", () => {
    expect(VERIFIED_FACTS.map((f) => f.id).sort()).toEqual(Object.keys(expected).sort());
  });

  it("is internally consistent", () => {
    expect(getVerified("src.activity_rows").value + getVerified("src.link_only_rows").value).toBe(
      getVerified("src.total_rows").value,
    );
    expect(ERROR_COLUMN_FACTS.reduce((s, f) => s + f.value, 0)).toBe(getVerified("src.error_cells").value);
    expect(getVerified("src.unreviewed_rows").value).toBeLessThanOrEqual(getVerified("src.activity_rows").value);
  });
});

describe("fact metadata", () => {
  it("has unique stable ids", () => {
    const ids = ALL_FACTS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every fact a label, source, definition and status", () => {
    for (const f of ALL_FACTS) {
      expect(f.label.length).toBeGreaterThan(0);
      expect(f.sourceDoc.length).toBeGreaterThan(0);
      expect(f.sourceRef.length).toBeGreaterThan(0);
      expect(f.definition.length).toBeGreaterThan(0);
      expect(["verified", "pending-approval"]).toContain(f.status);
    }
  });

  it("points every sourceDoc at a file that exists in the repository", () => {
    for (const f of ALL_FACTS) {
      expect(fs.existsSync(path.join(repoRoot, f.sourceDoc)), `${f.id} -> ${f.sourceDoc}`).toBe(true);
    }
  });

  it("has units on verified counts", () => {
    for (const f of VERIFIED_FACTS) expect(f.unit, f.id).toBeTruthy();
  });

  it("records the approved workbook hash", () => {
    expect(WORKBOOK.sha256).toBe("AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092");
    const decision = fs.readFileSync(path.join(repoRoot, "docs/DECISIONS/0004-source-of-truth-decisions.md"), "utf8");
    expect(decision).toContain(WORKBOOK.sha256);
  });
});

describe("pending metrics never carry a value", () => {
  it("has a null value, a pending status and a blocker", () => {
    expect(PENDING_FACTS.length).toBeGreaterThan(0);
    for (const f of PENDING_FACTS) {
      expect(f.value, f.id).toBeNull();
      expect(f.status).toBe("pending-approval");
      expect(f.blockedBy.length).toBeGreaterThan(0);
      expect(f.proposedSql, f.id).toBeUndefined();
    }
  });

  it("covers workload and workload saving", () => {
    expect(getFact("wl.workload").status).toBe("pending-approval");
    expect(getFact("wl.saving").status).toBe("pending-approval");
  });
});

describe("proposed SQL", () => {
  it("is only attached to verified facts and never claims execution", () => {
    for (const f of VERIFIED_FACTS) {
      if (f.proposedSql) expect(f.proposedSql).not.toMatch(/executed|result/i);
    }
  });
});

describe("regions", () => {
  it("reference existing verified facts", () => {
    for (const r of REGIONS) expect(getFact(r.factId).status).toBe("verified");
  });
});

describe("static insight text", () => {
  it("uses only numbers present in the verified facts", () => {
    const allowed = new Set<number>(
      [...VERIFIED_FACTS, ...ERROR_COLUMN_FACTS].map((f) => f.value),
    );
    const nums = (buildInsightText().match(/\d[\d,]*/g) ?? []).map((s) => Number(s.replace(/,/g, "")));
    expect(nums.length).toBeGreaterThan(0);
    for (const n of nums) expect(allowed.has(n), `unexpected number ${n}`).toBe(true);
  });

  it("mentions no workload or business metric", () => {
    expect(buildInsightText()).not.toMatch(/workload|saving|automation|improvement/i);
  });
});
