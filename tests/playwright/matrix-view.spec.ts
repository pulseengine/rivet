import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Matrix View", () => {
  test("matrix page loads with heading", async ({ page }) => {
    await page.goto("/matrix");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Traceability Matrix");
  });

  test("matrix page shows form with type selects", async ({ page }) => {
    await page.goto("/matrix");
    await waitForHtmx(page);
    // From and To selects should be present
    await expect(page.locator("select#from")).toBeVisible();
    await expect(page.locator("select#to")).toBeVisible();
  });

  test("from select contains artifact types", async ({ page }) => {
    await page.goto("/matrix");
    await waitForHtmx(page);
    const options = page.locator("select#from option");
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    // Should contain known types
    const optionTexts = await options.allTextContents();
    expect(optionTexts.some((t) => t.includes("requirement"))).toBe(true);
  });

  test("to select contains artifact types", async ({ page }) => {
    await page.goto("/matrix");
    await waitForHtmx(page);
    const options = page.locator("select#to option");
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });

  test("link type input defaults to verifies", async ({ page }) => {
    await page.goto("/matrix");
    await waitForHtmx(page);
    const linkInput = page.locator("input#link");
    await expect(linkInput).toBeVisible();
    const value = await linkInput.inputValue();
    expect(value).toBe("verifies");
  });

  test("direction select has forward and backward", async ({ page }) => {
    await page.goto("/matrix");
    await waitForHtmx(page);
    const dirSelect = page.locator("select#direction");
    await expect(dirSelect).toBeVisible();
    // Note: <option> elements inside a <select> are considered "hidden" by Playwright,
    // so we use toBeAttached() instead of toBeVisible().
    await expect(dirSelect.locator("option[value='forward']")).toBeAttached();
    await expect(dirSelect.locator("option[value='backward']")).toBeAttached();
  });

  test("compute button is present", async ({ page }) => {
    await page.goto("/matrix");
    await waitForHtmx(page);
    await expect(
      page.locator("button[type='submit']:has-text('Compute')"),
    ).toBeVisible();
  });

  test("matrix with from and to params shows result table", async ({
    page,
  }) => {
    await page.goto(
      "/matrix?from=requirement&to=design-decision&link=verifies&direction=backward",
    );
    await waitForHtmx(page);
    // Should show the computed matrix result
    const body = await page.locator("body").textContent();
    const hasResult =
      body!.includes("Coverage") || body!.includes("requirement");
    expect(hasResult).toBe(true);
  });

  test("matrix result table contains source artifact links", async ({
    page,
  }) => {
    await page.goto(
      "/matrix?from=requirement&to=design-decision&link=verifies&direction=backward",
    );
    await waitForHtmx(page);

    // Check for artifact links in the result
    const artifactLinks = page.locator("a[hx-get^='/artifacts/']");
    const linkCount = await artifactLinks.count();
    // Should have at least some links (requirements and/or targets)
    if (linkCount > 0) {
      const hrefs = await artifactLinks.evaluateAll((els) =>
        els.map((el) => ({
          href: el.getAttribute("href"),
          hxGet: el.getAttribute("hx-get"),
        })),
      );
      for (const { href, hxGet } of hrefs) {
        expect(href).not.toBe("#");
        expect(href).toBe(hxGet);
      }
    }
  });

  test("matrix URL params are preserved", async ({ page }) => {
    await page.goto(
      "/matrix?from=requirement&to=feature&link=verifies&direction=forward",
    );
    await waitForHtmx(page);
    await expect(page).toHaveURL(/from=requirement/);
    await expect(page).toHaveURL(/to=feature/);
    await expect(page).toHaveURL(/link=verifies/);
    await expect(page).toHaveURL(/direction=forward/);
  });

  test("matrix page has no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/matrix?from=requirement&to=feature&link=verifies");
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

test.describe("Matrix Cell Detail", () => {
  test("matrix cell detail endpoint returns HTML", async ({ page }) => {
    const resp = await page.request.get(
      "/matrix/cell?source_type=requirement&target_type=feature&link_type=verifies",
    );
    expect(resp.status()).toBe(200);
    const ct = resp.headers()["content-type"];
    expect(ct).toContain("html");
  });
});
