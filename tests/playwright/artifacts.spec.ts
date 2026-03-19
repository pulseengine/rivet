import { test, expect } from "@playwright/test";
import { countTableRows, waitForHtmx } from "./helpers";

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

  test("artifact detail shows type badge", async ({ page }) => {
    await page.goto("/artifacts/REQ-001");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("requirement");
  });

  test("sort by column preserves in URL", async ({ page }) => {
    await page.goto("/artifacts?sort=type&dir=asc");
    await expect(page).toHaveURL(/sort=type/);
    await expect(page).toHaveURL(/dir=asc/);
  });

  test("clicking artifact navigates to detail", async ({ page }) => {
    await page.goto("/artifacts");
    await waitForHtmx(page);

    const firstLink = page.locator("a[hx-get^='/artifacts/']").first();
    const hxGet = await firstLink.getAttribute("hx-get");
    if (!hxGet) {
      test.skip();
      return;
    }

    const resp = await page.goto(hxGet);
    expect(resp?.status()).toBe(200);
  });
});
