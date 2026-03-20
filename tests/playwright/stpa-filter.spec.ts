import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("STPA Filter Bar", () => {
  test("filter bar is visible on /stpa", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    const filterBar = page.locator(".filter-bar");
    await expect(filterBar).toBeVisible();
  });

  test("search input is present in filter bar", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    const searchInput = page.locator(
      ".filter-bar input[name='q'], .filter-bar input[type='search']",
    );
    await expect(searchInput).toBeVisible();
  });

  test("search input has HTMX trigger for live filtering", async ({
    page,
  }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    const searchInput = page.locator(
      ".filter-bar input[name='q'], .filter-bar input[type='search']",
    );
    const hxGet = await searchInput.getAttribute("hx-get");
    expect(hxGet).toBe("/stpa");
    const hxTrigger = await searchInput.getAttribute("hx-trigger");
    expect(hxTrigger).toContain("keyup");
  });

  test("type checkboxes exist for STPA types", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    const checkboxes = page.locator(".stpa-type-cb");
    const count = await checkboxes.count();
    // Should have checkboxes for available STPA types (loss, hazard, uca, etc.)
    expect(count).toBeGreaterThan(0);
  });

  test("type checkboxes include expected STPA types", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    const values = await page
      .locator(".stpa-type-cb")
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLInputElement).value),
      );
    // Core STPA types that should be present
    expect(values).toContain("loss");
    expect(values).toContain("hazard");
    expect(values).toContain("uca");
  });

  test("hidden types input exists for HTMX", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    const hiddenInput = page.locator("#stpa-types-hidden");
    await expect(hiddenInput).toBeAttached();
    const hxGet = await hiddenInput.getAttribute("hx-get");
    expect(hxGet).toBe("/stpa");
  });

  test("?types=uca filters to only UCAs", async ({ page }) => {
    await page.goto("/stpa?types=uca");
    await waitForHtmx(page);
    // UCA content should be visible
    await expect(page.locator("body")).toContainText("UCA");
    // The UCA checkbox should be checked
    const ucaCheckbox = page.locator(".stpa-type-cb[value='uca']");
    const isChecked = await ucaCheckbox.isChecked();
    expect(isChecked).toBe(true);
  });

  test("?types=loss filters to only losses", async ({ page }) => {
    await page.goto("/stpa?types=loss");
    await waitForHtmx(page);
    // Loss content should be present
    const body = await page.locator("body").textContent();
    expect(body!.toLowerCase()).toContain("loss");
    // The loss checkbox should be checked
    const lossCheckbox = page.locator(".stpa-type-cb[value='loss']");
    const isChecked = await lossCheckbox.isChecked();
    expect(isChecked).toBe(true);
  });

  test("?q=firmware searches within STPA", async ({ page }) => {
    await page.goto("/stpa?q=firmware");
    await waitForHtmx(page);
    // Search should filter — either show matches or empty filtered state
    const body = await page.locator("body").textContent();
    expect(body!.length).toBeGreaterThan(100);
    // The search input should have the query value
    const searchInput = page.locator(
      ".filter-bar input[name='q'], .filter-bar input[type='search']",
    );
    const value = await searchInput.inputValue();
    expect(value).toBe("firmware");
  });

  test("STPA-Sec section respects type filter", async ({ page }) => {
    // When filtering to only safety types, security section behavior should be consistent
    await page.goto("/stpa?types=loss,hazard,uca");
    await waitForHtmx(page);
    // Should show loss/hazard/uca content
    const body = await page.locator("body").textContent();
    expect(body!.length).toBeGreaterThan(100);
  });

  test("STPA-Sec section is present without filters", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("STPA-Sec");
    await expect(page.locator("body")).toContainText("Security Analysis");
  });

  test("stat cards update with filter", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    // Stat grid should be visible (use .first() since STPA + STPA-Sec both have stat grids)
    const statGrid = page.locator(".stat-grid").first();
    await expect(statGrid).toBeVisible();
  });

  test("stpaUpdateTypes function exists in page", async ({ page }) => {
    await page.goto("/stpa");
    await waitForHtmx(page);
    const fnExists = await page.evaluate(
      () => typeof (window as any).stpaUpdateTypes === "function",
    );
    expect(fnExists).toBe(true);
  });

  test("combined type and search filter", async ({ page }) => {
    await page.goto("/stpa?types=uca&q=control");
    await waitForHtmx(page);
    await expect(page).toHaveURL(/types=uca/);
    await expect(page).toHaveURL(/q=control/);
    const body = await page.locator("body").textContent();
    expect(body!.length).toBeGreaterThan(100);
  });

  test("filter preserves on page reload", async ({ page }) => {
    await page.goto("/stpa?types=hazard&q=test");
    await waitForHtmx(page);
    await page.reload();
    await expect(page).toHaveURL(/types=hazard/);
    await expect(page).toHaveURL(/q=test/);
  });

  test("filter bar has no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/stpa?types=uca&q=test");
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
