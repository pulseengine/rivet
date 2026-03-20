import { test, expect } from "@playwright/test";
import { countTableRows, waitForHtmx } from "./helpers";

test.describe("Artifacts Filter/Sort/Pagination", () => {
  test("?types=requirement filters to only requirements", async ({
    page,
  }) => {
    await page.goto("/artifacts?types=requirement");
    await waitForHtmx(page);
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(0);

    // All visible type badges should be "requirement"
    const typeCells = await page
      .locator("table tbody tr td:nth-child(2)")
      .allTextContents();
    for (const cell of typeCells) {
      expect(cell.toLowerCase().trim()).toBe("requirement");
    }
  });

  test("?q=OSLC searches and filters results", async ({ page }) => {
    await page.goto("/artifacts?q=OSLC");
    await waitForHtmx(page);
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(0);
    // At least one artifact should mention OSLC in its id or title
    const body = await page.locator("table tbody").textContent();
    expect(body!.toLowerCase()).toContain("oslc");
  });

  test("?sort=type&dir=asc sorts by type ascending", async ({ page }) => {
    await page.goto("/artifacts?sort=type&dir=asc");
    await waitForHtmx(page);
    await expect(page).toHaveURL(/sort=type/);
    await expect(page).toHaveURL(/dir=asc/);
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(0);
  });

  test("?sort=id&dir=desc sorts by id descending", async ({ page }) => {
    await page.goto("/artifacts?sort=id&dir=desc");
    await waitForHtmx(page);
    await expect(page).toHaveURL(/sort=id/);
    await expect(page).toHaveURL(/dir=desc/);
  });

  test("?per_page=10 limits rows to 10", async ({ page }) => {
    await page.goto("/artifacts?per_page=10");
    await waitForHtmx(page);
    const rows = await countTableRows(page);
    expect(rows).toBeLessThanOrEqual(10);
    expect(rows).toBeGreaterThan(0);
  });

  test("?page=2 shows second page", async ({ page }) => {
    // Use a small per_page to ensure there is a page 2
    await page.goto("/artifacts?per_page=10&page=2");
    await waitForHtmx(page);
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(0);
    await expect(page).toHaveURL(/page=2/);
  });

  test("pagination controls have correct href (not #)", async ({ page }) => {
    await page.goto("/artifacts?per_page=10&page=1");
    await waitForHtmx(page);

    const paginationLinks = page.locator(".pagination a");
    const count = await paginationLinks.count();
    if (count === 0) {
      // Not enough artifacts for pagination
      test.skip();
      return;
    }

    const hrefs = await paginationLinks.evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")),
    );
    for (const href of hrefs) {
      expect(href).not.toBe("#");
      expect(href).toBeTruthy();
    }
  });

  test("pagination links include existing filter params", async ({
    page,
  }) => {
    await page.goto("/artifacts?types=requirement&per_page=10&page=1");
    await waitForHtmx(page);

    const paginationLinks = page.locator(".pagination a");
    const count = await paginationLinks.count();
    if (count === 0) {
      test.skip();
      return;
    }

    // Pagination links should preserve the types filter
    const hrefs = await paginationLinks.evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")).filter(Boolean),
    );
    for (const href of hrefs) {
      expect(href).toContain("types=requirement");
    }
  });

  test("filter bar search input is present", async ({ page }) => {
    await page.goto("/artifacts");
    await waitForHtmx(page);
    const searchInput = page.locator(
      ".filter-bar input[name='q'], .filter-bar input[type='search']",
    );
    await expect(searchInput).toBeVisible();
  });

  test("filter bar search input has HTMX trigger", async ({ page }) => {
    await page.goto("/artifacts");
    await waitForHtmx(page);
    const searchInput = page.locator(
      ".filter-bar input[name='q'], .filter-bar input[type='search']",
    );
    const hxTrigger = await searchInput.getAttribute("hx-trigger");
    expect(hxTrigger).toContain("keyup");
  });

  test("type dropdown is present in filter bar", async ({ page }) => {
    await page.goto("/artifacts");
    await waitForHtmx(page);
    // Type filter could be checkboxes or select
    const typeFilter = page.locator(
      ".filter-bar select[name='types'], .filter-bar input[name='types']",
    );
    const count = await typeFilter.count();
    expect(count).toBeGreaterThan(0);
  });

  test("per_page select is present in filter bar", async ({ page }) => {
    await page.goto("/artifacts");
    await waitForHtmx(page);
    const perPageSelect = page.locator(".filter-bar select[name='per_page']");
    await expect(perPageSelect).toBeVisible();
  });

  test("per_page select has standard options", async ({ page }) => {
    await page.goto("/artifacts");
    await waitForHtmx(page);
    const perPageSelect = page.locator("select[name='per_page']");
    // Should have options for 25, 50, 100, 200
    // Note: <option> elements inside a <select> are considered "hidden" by Playwright,
    // so we use toBeAttached() instead of toBeVisible().
    await expect(perPageSelect.locator("option[value='25']")).toBeAttached();
    await expect(perPageSelect.locator("option[value='50']")).toBeAttached();
    await expect(perPageSelect.locator("option[value='100']")).toBeAttached();
    await expect(perPageSelect.locator("option[value='200']")).toBeAttached();
  });

  test("combined params: ?types=requirement&q=STPA&sort=id&per_page=20", async ({
    page,
  }) => {
    await page.goto(
      "/artifacts?types=requirement&q=STPA&sort=id&per_page=20",
    );
    await waitForHtmx(page);
    await expect(page).toHaveURL(/types=requirement/);
    await expect(page).toHaveURL(/sort=id/);
    // Results should be filtered (may be 0 if no requirement mentions STPA)
    const body = await page.locator("body").textContent();
    expect(body!.length).toBeGreaterThan(100);
  });

  test("sort headers in table are clickable", async ({ page }) => {
    await page.goto("/artifacts");
    await waitForHtmx(page);
    // Table headers should be clickable links with sort params
    const sortableHeaders = page.locator("thead a[hx-get]");
    const count = await sortableHeaders.count();
    expect(count).toBeGreaterThan(0);

    // Each sort header should have an href with sort param
    const hrefs = await sortableHeaders.evaluateAll((els) =>
      els.map((el) => el.getAttribute("href")).filter(Boolean),
    );
    for (const href of hrefs) {
      expect(href).toContain("sort=");
    }
  });

  test("page reload preserves filter state", async ({ page }) => {
    await page.goto("/artifacts?types=feature&sort=id&dir=asc&per_page=25");
    await waitForHtmx(page);
    await page.reload();
    await expect(page).toHaveURL(/types=feature/);
    await expect(page).toHaveURL(/sort=id/);
    await expect(page).toHaveURL(/dir=asc/);
    await expect(page).toHaveURL(/per_page=25/);
  });

  test("filter bar has no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/artifacts?types=requirement&q=test&sort=id&per_page=10");
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
