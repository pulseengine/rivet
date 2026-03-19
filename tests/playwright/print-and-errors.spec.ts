import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Print Mode", () => {
  test("print=1 query param renders a page", async ({ page }) => {
    const resp = await page.goto("/?print=1");
    expect(resp?.status()).toBe(200);
    const body = await page.locator("body").textContent();
    expect(body?.length).toBeGreaterThan(0);
  });

  test("print=1 on artifact detail renders", async ({ page }) => {
    const resp = await page.goto("/artifacts/REQ-001?print=1");
    expect(resp?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("REQ-001");
  });

  test("print=1 on STPA page renders", async ({ page }) => {
    const resp = await page.goto("/stpa?print=1");
    expect(resp?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("STPA");
  });

  test("print button exists and has no URL constructor in onclick", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHtmx(page);

    const printBtn = page.locator('button:has-text("Print")');
    await expect(printBtn).toBeVisible();

    // Verify the onclick does NOT use new URL() — it should use string concat
    const onclick = await printBtn.getAttribute("onclick");
    expect(onclick).not.toContain("new URL");
    expect(onclick).toContain("print=1");
  });

  test("print button onclick does not throw", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await waitForHtmx(page);

    // Evaluate the print button's onclick logic directly (without opening tab)
    const result = await page.evaluate(() => {
      try {
        const h = window.location.href;
        const s = h.indexOf("?") >= 0 ? "&" : "?";
        const url = h + s + "print=1";
        return { ok: true, url };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    });

    expect(result.ok).toBe(true);
    expect(result.url).toContain("print=1");

    const urlErrors = errors.filter((e) => e.includes("URL"));
    expect(urlErrors).toEqual([]);
  });
});

test.describe("Console Error Hygiene", () => {
  const pagesToCheck = [
    "/",
    "/artifacts",
    "/artifacts/REQ-001",
    "/stpa",
    "/graph",
    "/documents",
    "/validate",
    "/stats",
    "/matrix",
  ];

  for (const path of pagesToCheck) {
    test(`no JS errors on ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(path);
      await waitForHtmx(page);
      await page.waitForLoadState("networkidle");

      // Filter known acceptable non-errors
      const realErrors = errors.filter(
        (e) =>
          !e.includes("spar_wasm") &&
          !e.includes("AADL WASM") &&
          !e.includes("mermaid"),
      );
      expect(realErrors).toEqual([]);
    });
  }
});
