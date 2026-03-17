import { test, expect } from "@playwright/test";
import { countTableRows } from "./helpers";

test.describe("Artifacts", () => {
  test("artifact list shows artifacts", async ({ page }) => {
    await page.goto("/artifacts");
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(10);
  });

  test("artifact detail shows links", async ({ page }) => {
    await page.goto("/artifacts/REQ-001");
    await expect(page.locator("body")).toContainText("REQ-001");
  });

  test("filter by type via URL", async ({ page }) => {
    await page.goto("/artifacts?types=requirement");
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(10);
    expect(rows).toBeLessThan(100);
  });

  test("sort by column preserves in URL", async ({ page }) => {
    await page.goto("/artifacts?sort=type&dir=asc");
    await expect(page).toHaveURL(/sort=type/);
    await expect(page).toHaveURL(/dir=asc/);
  });

  test("pagination limits rows", async ({ page }) => {
    await page.goto("/artifacts?per_page=20");
    const rows = await countTableRows(page);
    expect(rows).toBeLessThanOrEqual(20);
    // Should mention page count
    const text = await page.locator("body").textContent();
    expect(text).toContain("page");
  });

  test("text search filters results", async ({ page }) => {
    await page.goto("/artifacts?q=OSLC");
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(0);
    expect(rows).toBeLessThan(50);
  });
});
