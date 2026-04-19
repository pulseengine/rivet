import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

/**
 * Verify the dashboard makes no external CDN requests and all assets load
 * from the bundled binary.  This test guards against regressions where
 * HTMX, Mermaid, or fonts are accidentally pointed back at a CDN.
 */
test.describe("Self-contained assets (no CDN)", () => {
  test("no requests to external CDNs", async ({ page }) => {
    const externalRequests: string[] = [];

    page.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("unpkg.com") ||
        url.includes("cdn.jsdelivr.net") ||
        url.includes("fonts.googleapis.com") ||
        url.includes("fonts.gstatic.com")
      ) {
        externalRequests.push(url);
      }
    });

    await page.goto("/");
    // Wait for all network activity to settle
    await page.waitForLoadState("networkidle");

    expect(externalRequests).toEqual([]);
  });

  test("HTMX loads from local asset route", async ({ page }) => {
    const responses: { url: string; status: number }[] = [];

    page.on("response", (res) => {
      if (res.url().includes("htmx")) {
        responses.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const htmxResp = responses.find((r) => r.url.includes("/assets/htmx.js"));
    expect(htmxResp).toBeDefined();
    expect(htmxResp?.status).toBe(200);
  });

  test("Mermaid loads from local asset route", async ({ page }) => {
    const responses: { url: string; status: number }[] = [];

    page.on("response", (res) => {
      if (res.url().includes("mermaid")) {
        responses.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mermaidResp = responses.find((r) =>
      r.url.includes("/assets/mermaid.js"),
    );
    expect(mermaidResp).toBeDefined();
    expect(mermaidResp?.status).toBe(200);
  });

  test("nav links have real href paths, not bare #", async ({ page }) => {
    await page.goto("/");
    await waitForHtmx(page);

    // Every nav anchor with hx-get should have a matching href (not "#")
    const anchors = await page.locator("nav a[hx-get]").all();
    expect(anchors.length).toBeGreaterThan(0);

    for (const anchor of anchors) {
      const href = await anchor.getAttribute("href");
      const hxGet = await anchor.getAttribute("hx-get");
      expect(href).not.toBe("#");
      expect(href).toBe(hxGet);
    }
  });

  test("clicking a nav link navigates via HTMX (URL changes, not #)", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHtmx(page);

    // Click Artifacts nav link
    await page.click('nav a[hx-get="/artifacts"]');
    await waitForHtmx(page);

    // URL must have changed to /artifacts, not /#
    const url = new URL(page.url());
    expect(url.pathname).toBe("/artifacts");
    expect(url.hash).toBe("");
  });

  test("clicking multiple nav links navigates correctly", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/");
    await waitForHtmx(page);

    const routes = [
      { selector: 'nav a[hx-get="/validate"]', path: "/validate" },
      { selector: 'nav a[hx-get="/graph"]', path: "/graph" },
      { selector: 'nav a[hx-get="/stats"]', path: "/stats" },
    ];

    for (const { selector, path } of routes) {
      await page.click(selector);
      await waitForHtmx(page, 60_000);
      const url = new URL(page.url());
      expect(url.pathname).toBe(path);
      expect(url.hash).toBe("");
    }
  });
});
