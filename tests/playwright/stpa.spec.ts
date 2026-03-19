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

  test("STPA-Sec section is visible", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("STPA-Sec");
    await expect(page.locator("body")).toContainText("Security Analysis");
  });

  test("security losses show CIA badges", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("SL-1");
    await expect(page.locator("body")).toContainText("confidentiality");
  });

  test("security UCA table is present", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    await expect(
      page.locator("text=Security Unsafe Control Actions"),
    ).toBeVisible();
    await expect(page.locator("body")).toContainText("SUCA-CLI-1");
  });
});
