import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("URL State Persistence", () => {
  test("filter state survives page reload", async ({ page }) => {
    await page.goto("/artifacts?types=requirement&status=approved");
    await waitForHtmx(page);
    await page.reload();
    await expect(page).toHaveURL(/types=requirement/);
    await expect(page).toHaveURL(/status=approved/);
  });

  test("sort state survives page reload", async ({ page }) => {
    await page.goto("/artifacts?sort=id&dir=desc");
    await page.reload();
    await expect(page).toHaveURL(/sort=id/);
    await expect(page).toHaveURL(/dir=desc/);
  });

  test("pagination state survives reload", async ({ page }) => {
    await page.goto("/artifacts?page=2&per_page=20");
    await page.reload();
    await expect(page).toHaveURL(/page=2/);
  });

  test("combined filter+sort+page in URL", async ({ page }) => {
    await page.goto(
      "/artifacts?types=feature&sort=id&dir=asc&page=1&per_page=10",
    );
    await waitForHtmx(page);
    await expect(page).toHaveURL(/types=feature/);
    await expect(page).toHaveURL(/sort=id/);
    await expect(page).toHaveURL(/page=1/);
  });
});
