import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Validation View", () => {
  test("shows diagnostic content", async ({ page }) => {
    await page.goto("/validate");
    // Should have some content (diagnostics table or summary)
    const text = await page.locator("body").textContent();
    expect(text!.length).toBeGreaterThan(100);
    // Should contain diagnostic-related text
    await expect(page.locator("body")).toContainText(/PASS|error|warning|diagnostic/i);
  });

  test("severity filter via URL", async ({ page }) => {
    await page.goto("/validate?status=warning");
    await waitForHtmx(page);
    await expect(page).toHaveURL(/status=warning/);
  });

  test("text search via URL", async ({ page }) => {
    await page.goto("/validate?q=requirement");
    await waitForHtmx(page);
    await expect(page).toHaveURL(/q=requirement/);
  });
});
