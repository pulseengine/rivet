import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("STPA View", () => {
  test("shows artifact type counts", async ({ page }) => {
    await page.goto("/stpa");
    await expect(page.locator("body")).toContainText("loss");
    await expect(page.locator("body")).toContainText("hazard");
    await expect(page.locator("body")).toContainText("uca");
  });

  test("hierarchical tree is expandable", async ({ page }) => {
    await page.goto("/stpa");
    const details = page.locator("details").first();
    await expect(details).toBeVisible();
    await details.locator("summary").click();
  });

  test("H-13 scalability hazard is present", async ({ page }) => {
    await page.goto("/stpa");
    await expect(page.locator("body")).toContainText("H-13");
  });

  test("filter by type via URL preserves on reload", async ({ page }) => {
    await page.goto("/stpa?types=uca");
    await waitForHtmx(page);
    await page.reload();
    await expect(page).toHaveURL(/types=uca/);
  });

  test("text search filters", async ({ page }) => {
    await page.goto("/stpa?q=firmware");
    await waitForHtmx(page);
    await expect(page).toHaveURL(/q=firmware/);
  });

  test("filter bar is present", async ({ page }) => {
    await page.goto("/stpa");
    // Filter bar has class "filter-bar card"
    await expect(page.locator(".filter-bar").first()).toBeVisible();
  });
});
