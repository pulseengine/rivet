import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Graph View", () => {
  test("graph with type filter renders SVG", async ({ page }) => {
    await page.goto("/graph?types=requirement&depth=2");
    await waitForHtmx(page);
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 15_000 });
  });

  test("focus on specific artifact", async ({ page }) => {
    await page.goto("/graph?focus=REQ-001&depth=2");
    await waitForHtmx(page);
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 15_000 });
  });

  test("node budget prevents crash on full graph", async ({ page }) => {
    await page.goto("/graph");
    await waitForHtmx(page);
    // Should render without timeout — either SVG or budget message
    const content = page.locator("svg, :text('budget')");
    await expect(content.first()).toBeVisible({ timeout: 30_000 });
  });

  test("graph controls are visible", async ({ page }) => {
    await page.goto("/graph?types=requirement");
    await waitForHtmx(page);
    // Type filter checkboxes should be present
    await expect(page.locator("input[type='checkbox']").first()).toBeVisible();
  });
});
