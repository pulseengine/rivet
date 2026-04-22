import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

// These tests rely on the test fixtures shipped in the main project:
//   artifacts/feature-model.yaml
//   artifacts/bindings.yaml
//   artifacts/variants/minimal-ci.yaml
//   artifacts/variants/dashboard-only.yaml
//
// `minimal-ci` binds exactly one artifact (REQ-001); `dashboard-only`
// binds three. The unscoped total is the full project store (>5).

test.describe("Variant selection in rivet serve", () => {
  test("dropdown lists declared variants plus Unscoped", async ({ page }) => {
    await page.goto("/");
    const selector = page.locator("#variant-selector");
    await expect(selector).toBeVisible();
    const options = await selector.locator("option").allTextContents();
    // Order is: Unscoped first, then sorted variants.
    expect(options[0]).toMatch(/Unscoped/i);
    expect(options.some((o) => o.includes("minimal-ci"))).toBe(true);
    expect(options.some((o) => o.includes("dashboard-only"))).toBe(true);
  });

  test("selecting a variant sets ?variant and shows the banner", async ({
    page,
  }) => {
    await page.goto("/stats");
    await page.selectOption("#variant-selector", "minimal-ci");
    // The selector handler reloads the page with ?variant=...
    await page.waitForURL(/variant=minimal-ci/);
    await expect(page).toHaveURL(/\?variant=minimal-ci/);
    const banner = page.locator(".variant-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Filtered to variant");
    await expect(banner).toContainText("minimal-ci");
    await expect(banner).toContainText("Clear filter");
  });

  test("Clear filter link removes the variant scope", async ({ page }) => {
    await page.goto("/stats?variant=minimal-ci");
    const clear = page.locator("#variant-clear");
    await expect(clear).toBeVisible();
    await clear.click();
    await page.waitForURL((u) => !u.searchParams.has("variant"));
    await expect(page.locator(".variant-banner")).toHaveCount(0);
  });

  test("reloading a scoped URL preserves the filter", async ({ page }) => {
    await page.goto("/stats?variant=minimal-ci");
    await expect(page.locator(".variant-banner")).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(/\?variant=minimal-ci/);
    await expect(page.locator(".variant-banner")).toBeVisible();
  });

  test("/variants overview lists every declared variant", async ({ page }) => {
    await page.goto("/variants");
    await expect(page.locator("h2")).toContainText("Variants");
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("tbody")).toContainText("minimal-ci");
    await expect(page.locator("tbody")).toContainText("dashboard-only");
    // Both declared variants solve successfully against the test model.
    await expect(page.locator("tbody")).toContainText("PASS");
  });

  test("unknown variant name renders a 400-style error page", async ({
    page,
  }) => {
    // The HTML route returns 400 for unknown variants; Playwright still
    // renders the body. Assert the user-facing message is present.
    const response = await page.goto("/artifacts?variant=does-not-exist");
    expect(response?.status()).toBe(400);
    await expect(page.locator("body")).toContainText("Invalid variant scope");
  });

  test("coverage page is variant-scoped", async ({ page }) => {
    await page.goto("/coverage?variant=minimal-ci");
    await expect(page).toHaveURL(/variant=minimal-ci/);
    await expect(page.locator(".variant-banner")).toBeVisible();
  });

  test("HTMX navigation across pages keeps the variant dropdown in sync", async ({
    page,
  }) => {
    // Land on the scoped stats page so the dropdown starts selected.
    await page.goto("/stats?variant=minimal-ci");
    await expect(page.locator("#variant-selector")).toHaveValue("minimal-ci");
    // Click Artifacts nav — HTMX swaps #content but keeps the page.
    await page.click('a[href="/artifacts"]');
    await waitForHtmx(page);
    // Variant param is not propagated through nav links, so the URL
    // drops it; the sync script should reload to refresh the banner.
    await page.waitForFunction(
      () => !new URL(window.location.href).searchParams.has("variant"),
    );
  });
});
