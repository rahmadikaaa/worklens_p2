import { expect, test, type Page } from "@playwright/test";

const BASE = "http://127.0.0.1:3101";

async function open(page: Page, query = "") {
  await page.goto(`/${query}`);
  await expect(page.getByTestId("consent-modal")).toBeVisible();
}
async function approve(page: Page) {
  await page.getByTestId("consent-approve").click();
  await expect(page.getByTestId("consent-modal")).toBeHidden();
}
async function openApproved(page: Page, query = "") {
  await open(page, query);
  await approve(page);
}
const value = async (page: Page, id: string) => (await page.getByTestId(`metric-${id}`).first().locator(".m-value").innerText()).replace(/\s+/g, " ").trim();

test.describe("all three modes", () => {
  test("render and switch inside one application", async ({ page }) => {
    await openApproved(page);
    // Activity Workspace (Layout B) is the default.
    await expect(page.getByTestId("mode-workspace")).toBeVisible();
    await expect(page.getByTestId("page-title")).toHaveText("Activity Workspace");

    await page.getByTestId("mode-audit-btn").click();
    await expect(page.getByTestId("mode-audit")).toBeVisible();
    await expect(page.getByTestId("mode-workspace")).toHaveCount(0);
    await expect(page.getByTestId("page-title")).toHaveText("Audit-first");

    await page.getByTestId("mode-quality-btn").click();
    await expect(page.getByTestId("mode-quality")).toBeVisible();
    await expect(page.getByTestId("page-title")).toHaveText("Quality Investigation");

    await page.getByTestId("mode-workspace-btn").click();
    await expect(page.getByTestId("mode-workspace")).toBeVisible();
    // Same shell throughout.
    await expect(page.getByTestId("mockup-banner")).toBeVisible();
    await expect(page.getByLabel("WorkLens navigation")).toBeVisible();
  });

  test("show identical verified facts in every mode", async ({ page }) => {
    await openApproved(page);
    const expected: Record<string, string> = {
      "src.total_rows": "3,495 rows",
      "src.activity_rows": "3,489 rows",
      "src.link_only_rows": "6 rows",
      "src.unreviewed_rows": "252 rows",
      "src.error_cells": "232 cells",
      "src.error_rows": "108 rows",
    };
    const seen: Record<string, Set<string>> = {};
    for (const mode of ["audit", "workspace", "quality"]) {
      await page.getByTestId(`mode-${mode}-btn`).click();
      if (mode === "workspace") {
        // Walk the sections so every metric that appears is collected.
        for (const s of ["activity", "summary", "assessment", "quality", "automation", "followup"]) {
          await page.getByTestId(`section-${s}`).click();
          for (const id of Object.keys(expected)) {
            if (await page.getByTestId(`metric-${id}`).count()) (seen[id] ??= new Set()).add(await value(page, id));
          }
        }
      } else {
        for (const id of Object.keys(expected)) {
          if (await page.getByTestId(`metric-${id}`).count()) (seen[id] ??= new Set()).add(await value(page, id));
        }
      }
    }
    for (const [id, v] of Object.entries(expected)) {
      expect([...(seen[id] ?? [])], id).toEqual([v]);
    }
    // Every verified fact shows in at least two modes.
    expect(Object.keys(seen).length).toBe(6);
  });

  test("opens each mode directly by URL", async ({ page }) => {
    await openApproved(page, "?mode=quality");
    await expect(page.getByTestId("mode-quality")).toBeVisible();
  });
});

test.describe("Click-to-Audit", () => {
  for (const mode of ["audit", "workspace", "quality"] as const) {
    test(`shared drawer from mode ${mode}`, async ({ page }) => {
      await openApproved(page, `?mode=${mode}`);
      const id = mode === "workspace" ? "src.total_rows" : "src.unreviewed_rows";
      await page.getByTestId(`metric-${id}`).first().click();
      const d = page.getByTestId("audit-drawer");
      await expect(d).toBeVisible();
      await expect(page.getByTestId("audit-sha")).toHaveText("AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092");
      await expect(page.getByTestId("audit-sheet")).toHaveText("Breakdown Activity");
      await expect(page.getByTestId("audit-source-doc")).toContainText("docs/");
      await expect(page.getByTestId("audit-definition")).not.toBeEmpty();
      await expect(page.getByTestId("sql-label")).toHaveText("Proposed — Not Executed");
      await expect(page.getByTestId("audit-sql")).toContainText("SELECT");
      if (id === "src.unreviewed_rows") await expect(page.getByTestId("audit-rows")).toHaveText("3239–3490");
      await page.keyboard.press("Escape");
      await expect(d).toBeHidden();
    });
  }

  test("pending metrics never show a value", async ({ page }) => {
    await openApproved(page, "?mode=audit");
    for (const id of ["wl.workload", "wl.saving", "rv.reviewed"]) {
      const card = page.getByTestId(`metric-${id}`);
      await expect(card.locator(".m-value")).toHaveText("Pending approval");
      await expect(card.locator(".m-value")).not.toHaveText(/\d/);
    }
    await page.getByTestId("metric-wl.workload").click();
    await expect(page.getByTestId("audit-value")).toHaveText("Pending approval");
    await expect(page.getByTestId("audit-sql")).toHaveCount(0);
    await expect(page.getByTestId("audit-drawer")).toContainText("No value is shown");
    await expect(page.getByTestId("audit-drawer")).toContainText("Not approved");
  });

  test("error-bar audit shows the column reference and no cell values", async ({ page }) => {
    await openApproved(page, "?mode=audit");
    await page.getByTestId("errbar-U").click();
    await expect(page.getByTestId("audit-name")).toContainText("column U");
    await expect(page.getByTestId("audit-value")).toHaveText("69");
    await expect(page.getByTestId("audit-drawer")).toContainText("Cell values are not shown");
  });
});

test.describe("Activity Workspace", () => {
  test("has the five sections and respects role", async ({ page }) => {
    await openApproved(page, "?mode=workspace");
    for (const s of ["activity", "summary", "assessment", "quality", "automation", "followup"]) {
      await page.getByTestId(`section-${s}`).click();
      await expect(page.getByTestId(`panel-${s}`)).toBeVisible();
    }
    await page.getByTestId("section-assessment").click();
    await page.getByTestId("edit-simulated").click();
    await expect(page.getByTestId("toast")).toContainText("nothing was saved");

    await page.getByTestId("role-Management").click();
    await expect(page.getByTestId("edit-simulated")).toHaveCount(0);
    await expect(page.getByTestId("readonly-chip")).toBeVisible();
    await expect(page.getByTestId("role-note")).toContainText("read-only");
  });

  test("assessment, automation and follow-up show only pending metrics", async ({ page }) => {
    await openApproved(page, "?mode=workspace");
    for (const [s, id] of [["assessment", "as.completion"], ["automation", "au.overview"], ["followup", "fu.overview"]] as const) {
      await page.getByTestId(`section-${s}`).click();
      await expect(page.getByTestId(`metric-${id}`).locator(".m-value")).toHaveText("Pending approval");
    }
  });
});

test.describe("Activity rows", () => {
  test("lists every row, searches, filters, sorts and inspects", async ({ page }) => {
    await openApproved(page);
    await expect(page.getByTestId("panel-activity")).toBeVisible();
    await expect(page.getByTestId("row-count")).toHaveText("Showing 3,495 of 3,495 rows");
    await expect(page.getByTestId("activity-row")).toHaveCount(3495);
    await page.getByTestId("filter-class").selectOption("link_only");
    await expect(page.getByTestId("activity-row")).toHaveCount(6);
    await page.getByTestId("filter-class").selectOption("all");
    await page.getByTestId("filter-review").selectOption("unreviewed");
    await expect(page.getByTestId("activity-row")).toHaveCount(252);
    await page.getByTestId("filter-reset").click();
    await page.getByTestId("activity-search").fill("3526");
    await expect(page.getByTestId("activity-row")).toHaveCount(1);
    await page.getByTestId("activity-search").fill("");
    await page.getByTestId("sort-sourceRow").click();
    await expect(page.getByTestId("activity-row").first()).toHaveAttribute("data-row", "3540");
    await page.getByTestId("activity-search").fill("3526");
    await page.getByTestId("activity-row").first().click();
    await expect(page.getByTestId("insp-row")).toHaveText("3526");
    await expect(page.getByTestId("insp-sheet")).toHaveText("Breakdown Activity");
    await expect(page.getByTestId("insp-sha")).toHaveText("AA7B8166DEB3CC5944C40793101282F8CE37325E2662CD5B46FAB4E7DA7D0092");
    await expect(page.getByTestId("insp-values")).toContainText("Not available");
    await page.getByTestId("insp-audit-class").click();
    await expect(page.getByTestId("audit-value")).toHaveText("6");
  });
});
test.describe("Quality Investigation", () => {
  test("links an indicator to its source reference", async ({ page }) => {
    await openApproved(page, "?mode=quality");
    await page.getByTestId("errbar-E").click();
    await expect(page.getByTestId("ref-label")).toContainText("column E");
    await expect(page.getByTestId("ref-value")).toHaveText("48 cells");
    await page.getByTestId("ref-open-audit").click();
    await expect(page.getByTestId("audit-value")).toHaveText("48");
    await page.keyboard.press("Escape");

    await page.getByTestId("strip-unreviewed").click();
    await expect(page.getByTestId("audit-rows")).toHaveText("3239–3490");
    await page.keyboard.press("Escape");

    await page.getByTestId("inv-src.link_only_rows").click();
    await expect(page.getByTestId("inv-selected")).toContainText("Link-only rows");
    await expect(page.getByTestId("linkonly-card")).toContainText("3526, 3535, 3537, 3538, 3539, 3540");
  });
});

test.describe("seven capabilities", () => {
  test("every capability is labeled", async ({ page }) => {
    await openApproved(page);
    const rows = page.getByTestId("capability-overview").locator("tbody tr");
    await expect(rows).toHaveCount(7);
    const labels = await rows.locator("[data-kind]").evaluateAll((els) => els.map((e) => e.getAttribute("data-kind")));
    expect(labels).toEqual(["Simulated", "Demo", "Future", "Future", "Simulated", "Simulated", "Future"]);
  });

  test("consent: deny, review, approve and simulated refresh", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("consent-modal")).toContainText("Simulated");
    await page.getByTestId("consent-deny").click();
    await expect(page.getByTestId("refresh-status")).toContainText("denied (simulated)");
    await page.getByRole("button", { name: "Review permission" }).click();
    await approve(page);
    await expect(page.getByTestId("refresh-status")).toContainText("Refreshed", { timeout: 6000 });
    await page.getByTestId("refresh-btn").click();
    await expect(page.getByTestId("refresh-status")).toContainText("Refreshing");
    await expect(page.getByTestId("refresh-status")).toContainText("Refreshed", { timeout: 6000 });
  });

  test("sources: every connector, storage and SQL control is disabled and Future", async ({ page }) => {
    await openApproved(page);
    await page.getByTestId("nav-sources").click();
    const view = page.getByTestId("view-sources");
    for (const name of ["Snowflake", "BigQuery", "Databricks", "Redshift", "ClickHouse"]) {
      await expect(page.getByTestId(`connector-${name}`)).toContainText("Future");
      await expect(page.getByTestId(`connector-${name}`).getByRole("button")).toBeDisabled();
    }
    for (const b of await view.getByRole("button").all()) await expect(b).toBeDisabled();
    await expect(page.getByTestId("sql-editor")).toContainText("Proposed — Not Executed");
    await expect(page.getByTestId("storage-db")).toContainText("Future");
    await expect(page.getByTestId("storage-files")).toContainText("GT-4");
  });

  test("compare: three modes, comments add, edit, persist and delete", async ({ page }) => {
    await openApproved(page);
    await page.getByTestId("nav-compare").click();
    for (const m of ["audit", "workspace", "quality"]) await expect(page.getByTestId(`compare-${m}`)).toBeVisible();
    await expect(page.getByTestId("view-compare")).toContainText("Same application, same data");

    await page.getByTestId("comment-text").fill("Make the KPI row denser");
    await page.getByTestId("comment-submit").click();
    await expect(page.getByTestId("comment-item")).toHaveCount(1);
    await page.reload();
    await page.getByTestId("consent-approve").click();
    await page.getByTestId("nav-compare").click();
    await expect(page.getByTestId("comment-item")).toContainText("Make the KPI row denser");
    await page.getByRole("button", { name: "Apply revision (simulated)" }).click();
    await expect(page.getByTestId("comment-item")).toContainText("Revision applied (simulated)");
    await page.getByTestId("comment-delete").click();
    await expect(page.getByTestId("comment-item")).toHaveCount(0);
  });

  test("compare: Open returns to the chosen mode", async ({ page }) => {
    await openApproved(page);
    await page.getByTestId("nav-compare").click();
    await page.getByTestId("open-quality").click();
    await expect(page.getByTestId("mode-quality")).toBeVisible();
  });

  test("sharing: live vs snapshot preview creates no real link", async ({ page }) => {
    await openApproved(page);
    await page.getByTestId("nav-share").click();
    await expect(page.getByTestId("share-locked")).toBeVisible(); // live + no access
    await page.getByTestId("share-snapshot").check();
    await expect(page.getByTestId("share-numbers")).toContainText("3,495");
    await page.getByTestId("share-create").click();
    await expect(page.getByTestId("share-result")).toContainText("mockup://not-a-real-link/snapshot");
    await expect(page.getByTestId("share-result")).toContainText("Not stored");
  });

  test("routines: nothing can be scheduled", async ({ page }) => {
    await openApproved(page);
    await page.getByTestId("nav-routines").click();
    await expect(page.getByTestId("routine-card")).toContainText("Not scheduled");
    for (const b of await page.getByTestId("routine-card").getByRole("button").all()) await expect(b).toBeDisabled();
    await expect(page.getByTestId("view-routines").getByTestId("insight-block")).toContainText("not AI output");
  });
});

test.describe("isolation", () => {
  test("makes no request outside localhost and no API or file request", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (r) => requests.push(r.url()));
    await openApproved(page);
    for (const m of ["workspace", "quality", "audit"]) await page.getByTestId(`mode-${m}-btn`).click();
    for (const v of ["compare", "sources", "share", "routines"]) await page.getByTestId(`nav-${v}`).click();
    expect(requests.length).toBeGreaterThan(0);
    for (const u of requests) {
      expect(u.startsWith(BASE), u).toBe(true);
      expect(u).not.toMatch(/\/api\/|\.xlsx|\.csv|\.json$/);
    }
  });

  test("labels itself as a mockup and never implies persistence", async ({ page }) => {
    await openApproved(page);
    await expect(page.getByTestId("mockup-banner")).toContainText("Nothing is saved");
    await expect(page.getByTestId("legend")).toContainText("faked in the browser");
  });
});

test.describe("screenshots", () => {
  for (const mode of ["audit", "workspace", "quality"]) {
    test(`capture ${mode}`, async ({ page }) => {
      await openApproved(page, `?mode=${mode}`);
      await page.screenshot({ path: `screenshots/${mode}.png`, fullPage: true });
    });
  }
  test("capture drawer, compare and consent", async ({ page }) => {
    await open(page);
    await page.screenshot({ path: "screenshots/consent.png" });
    await approve(page);
    await page.getByTestId("metric-src.unreviewed_rows").click();
    await page.screenshot({ path: "screenshots/audit-drawer.png" });
    await page.keyboard.press("Escape");
    await page.getByTestId("nav-compare").click();
    await page.screenshot({ path: "screenshots/compare.png", fullPage: true });
    await page.getByTestId("nav-sources").click();
    await page.screenshot({ path: "screenshots/sources.png", fullPage: true });
  });
});
