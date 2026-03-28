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

  test("graph SVG contains custom polygon shapes", async ({ page }) => {
    await page.goto("/graph?types=requirement,design-decision&depth=2");
    await waitForHtmx(page);
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 15_000 });
    // Custom shapes render as polygon elements (diamonds, hexagons, etc.)
    const polygons = page.locator("svg polygon");
    const count = await polygons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("graph SVG contains rounded rect shapes", async ({ page }) => {
    await page.goto("/graph?types=requirement&depth=2");
    await waitForHtmx(page);
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 15_000 });
    // Requirement type renders as rounded rect (rx attribute)
    const roundedRects = page.locator("svg rect[rx]");
    const count = await roundedRects.count();
    expect(count).toBeGreaterThan(0);
  });
});
