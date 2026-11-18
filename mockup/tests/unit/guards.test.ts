import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CAPABILITIES } from "@/lib/capabilities";

const root = path.resolve(__dirname, "..", "..");

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...sourceFiles(rel));
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(rel);
  }
  return out;
}

const appFiles = ["app", "components", "lib"].flatMap(sourceFiles);
const read = (f: string) => fs.readFileSync(path.join(root, f), "utf8");

describe("no network and no workbook access in application code", () => {
  it("finds application files to scan", () => {
    expect(appFiles.length).toBeGreaterThan(10);
  });

  it("makes no network calls", () => {
    const banned = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/;
    for (const f of appFiles) expect(read(f), f).not.toMatch(banned);
  });

  it("contains no http(s) URLs", () => {
    for (const f of appFiles) expect(read(f), f).not.toMatch(/https?:\/\//);
  });

  it("imports no filesystem, spreadsheet or parsing library", () => {
    const banned = /from\s+["'](node:fs|fs|node:child_process|child_process|xlsx|exceljs|papaparse|csv-parse|sheetjs)["']/;
    for (const f of appFiles) expect(read(f), f).not.toMatch(banned);
  });

  it("never reads or opens an .xlsx file", () => {
    for (const f of appFiles) {
      expect(read(f), f).not.toMatch(/(readFile|readFileSync|createReadStream|open)\([^)]*\.xlsx/);
    }
  });

  it("has no API routes, server actions or database access", () => {
    expect(fs.existsSync(path.join(root, "app", "api"))).toBe(false);
    for (const f of appFiles) {
      expect(read(f), f).not.toMatch(/["']use server["']/);
      expect(read(f), f).not.toMatch(/\b(pg|psycopg|postgres|sqlite|prisma)\b/i);
    }
  });
});

describe("one data foundation", () => {
  it("keeps verified count literals out of mode components", () => {
    const literal = /\b(3,?495|3,?489|232|108)\b|\b252\b/;
    for (const f of appFiles.filter((x) => x.includes(path.join("components", "modes")))) {
      expect(read(f), f).not.toMatch(literal);
    }
  });

  it("has every mode import from the shared fact module or shared components", () => {
    for (const f of appFiles.filter((x) => x.includes(path.join("components", "modes")))) {
      expect(read(f), f).toMatch(/@\/lib\/facts|\.\.\/shared|\.\.\/ui/);
    }
  });
});

describe("capability labels", () => {
  it("lists exactly the seven capabilities, each with a valid label", () => {
    expect(CAPABILITIES).toHaveLength(7);
    for (const c of CAPABILITIES) expect(["Demo", "Simulated", "Future"]).toContain(c.kind);
  });

  it("labels the required capabilities as specified", () => {
    const kind = (id: string) => CAPABILITIES.find((c) => c.id === id)?.kind;
    expect(kind("cap.refresh")).toBe("Simulated");
    expect(kind("cap.audit")).toBe("Demo");
    expect(kind("cap.storage")).toBe("Future");
    expect(kind("cap.connectors")).toBe("Future");
    expect(kind("cap.share")).toBe("Simulated");
    expect(kind("cap.routines")).toBe("Future");
  });
});

describe("dependency isolation", () => {
  it("keeps dependencies local to mockup/ and exactly pinned", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string>; devDependencies: Record<string, string> };
    for (const [name, v] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
      expect(v, name).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});
