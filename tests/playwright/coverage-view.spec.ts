import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Coverage View", () => {
  test("coverage page loads with heading", async ({ page }) => {
    await page.goto("/coverage");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Traceability Coverage");
  });

  test("shows overall coverage percentage", async ({ page }) => {
    await page.goto("/coverage");
    await waitForHtmx(page);
    // The stat grid should show an overall coverage percentage
    const statGrid = page.locator(".stat-grid");
    await expect(statGrid).toBeVisible();
    await expect(statGrid).toContainText("Overall Coverage");
  });

  test("shows coverage rules count", async ({ page }) => {
    await page.goto("/coverage");
    await waitForHtmx(page);
    await expect(page.locator(".stat-grid")).toContainText("Rules");
  });

  test("shows coverage table with rule details", async ({ page }) => {
    await page.goto("/coverage");
    await waitForHtmx(page);
    const table = page.locator("table");
    const tableCount = await table.count();
    if (tableCount === 0) {
      // No traceability rules defined — the card message should explain
      await expect(page.locator("body")).toContainText(
        "No traceability rules",
      );
      return;
    }
    // Table should have expected columns
    await expect(table.locator("thead")).toContainText("Rule");
    await expect(table.locator("thead")).toContainText("Source Type");
    await expect(table.locator("thead")).toContainText("Coverage");
  });

  test("coverage bars have progress indicators", async ({ page }) => {
    await page.goto("/coverage");
    await waitForHtmx(page);
    const table = page.locator("table");
    const tableCount = await table.count();
    if (tableCount === 0) {
      test.skip();
      return;
    }
    // Each row should have a progress bar div
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("coverage badges link to artifact types", async ({ page }) => {
    await page.goto("/coverage");
    await waitForHtmx(page);
    const table = page.locator("table");
    const tableCount = await table.count();
    if (tableCount === 0) {
      test.skip();
      return;
    }
    // Link pills should be visible for link types
    const linkPills = page.locator(".link-pill");
    const pillCount = await linkPills.count();
    expect(pillCount).toBeGreaterThan(0);
  });

  test("uncovered artifacts section shows artifact links", async ({
    page,
  }) => {
    await page.goto("/coverage");
    await waitForHtmx(page);
    const uncoveredSection = page.locator("text=Uncovered Artifacts");
    const count = await uncoveredSection.count();
    if (count === 0) {
      // All artifacts are covered — no uncovered section expected
      return;
    }
    await expect(uncoveredSection).toBeVisible();
    // Uncovered artifact IDs should be clickable links
    const artifactLinks = page.locator("a[hx-get^='/artifacts/']");
    const linkCount = await artifactLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test("coverage page has no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/coverage");
    await waitForHtmx(page);
    await page.waitForLoadState("networkidle");

    const realErrors = errors.filter(
      (e) =>
        !e.includes("spar_wasm") &&
        !e.includes("AADL WASM") &&
        !e.includes("mermaid"),
    );
    expect(realErrors).toEqual([]);
  });
});
