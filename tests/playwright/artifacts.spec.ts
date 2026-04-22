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

  // Regression: mermaid diagrams embedded in an artifact description must
  // render as SVG — not as raw markdown source.  The fixture artifact
  // ARCH-CORE-001 (artifacts/architecture.yaml) has a fenced ```mermaid
  // block in its description.  If render_markdown ever regresses to emitting
  // `<pre><code class="language-mermaid">` the .mermaid selector will miss
  // the block, mermaid.js will not run, and no SVG will appear.
  test("mermaid diagrams in artifact descriptions render as SVG", async ({
    page,
  }) => {
    await page.goto("/artifacts/ARCH-CORE-001");
    await waitForHtmx(page);

    // The markdown renderer must emit a `<pre class="mermaid">` wrapper
    // (not the pulldown-cmark default `<pre><code class="language-mermaid">`).
    const mermaidPre = page.locator("pre.mermaid");
    await expect(mermaidPre).toHaveCount(1);

    // The source content must be there before mermaid.js runs.
    await expect(mermaidPre).toContainText("flowchart LR");

    // mermaid.js replaces the block's contents with an <svg> on success.
    // Give it a moment to run — it's triggered by DOMContentLoaded and
    // htmx:afterSwap.  If rendering fails the pre block keeps its source.
    await expect(mermaidPre.locator("svg")).toBeVisible({ timeout: 5_000 });
  });
});
